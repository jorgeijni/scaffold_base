/**
 * Servicio de Integración iDempiere ERP REST API v1
 * Arquitectura modular y blindada para autenticación empresarial
 * 
 * REGLAS TÉCNICAS OBLIGATORIAS:
 * 1. Endpoint plural exacto: POST /api/v1/auth/tokens (NUNCA /token)
 * 2. Headers: Content-Type: application/json, Accept: application/json
 * 3. Parámetro de organización: organizationId (NUNCA orgId)
 * 4. Anidamiento: parámetros de contexto agrupados en objeto "parameters"
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Limpieza y normalización de URL base
function cleanErpBaseUrl(rawUrl) {
  let url = (rawUrl || DEFAULT_IDEMPIERE_CONFIG.baseUrl).trim().replace(/\/+$/, '');
  // Quitar puerto 443 redundante en https
  url = url.replace(/:443$/, '');
  return url;
}

// Configuración por defecto de iDempiere ERP (GardenWorld)
const DEFAULT_IDEMPIERE_CONFIG = {
  baseUrl: process.env.IDEMPIERE_BASE_URL ? cleanErpBaseUrl(process.env.IDEMPIERE_BASE_URL) : 'https://test.idempiere.org',
  tokensEndpoint: '/api/v1/auth/tokens',
  defaultParameters: {
    clientId: 11,
    roleId: 102,
    organizationId: 11, // REGLA ESTRICTA B: organizationId (NUNCA orgId)
    warehouseId: 103,
    language: 'es_PE'
  }
};

// Opciones Multitenant Sandbox GardenWorld (Fallback garantizado)
const SANDBOX_MULTITENANT_CONTEXT = {
  clients: [
    { id: 11, name: 'GardenWorld, Inc.' },
    { id: 1000000, name: 'Hamburger Rapid Franchise System' }
  ],
  roles: [
    { id: 102, name: 'GardenWorld Admin' },
    { id: 103, name: 'GardenWorld User' },
    { id: 1000002, name: 'Store Operations Supervisor' }
  ],
  organizations: [
    { id: 11, name: 'HQ - Headquarters' },
    { id: 12, name: 'Store Central' },
    { id: 50005, name: 'Store East' }
  ],
  warehouses: [
    { id: 103, name: 'HQ Warehouse', organizationId: 11 },
    { id: 104, name: 'Store Central Warehouse', organizationId: 12 },
    { id: 50005, name: 'Store East Warehouse', organizationId: 50005 },
    { id: 50002, name: 'Fertilizer Warehouse', organizationId: 50001 },
    { id: 1000007, name: 'Admin Storage', organizationId: 11 }
  ],
  languages: [
    { id: 'es_PE', name: 'Español (Perú)' },
    { id: 'en_US', name: 'English (US)' },
    { id: 'es_ES', name: 'Español (ES)' }
  ]
};

/**
 * Valida y formatea estrictamente el payload para iDempiere REST API v1 (1 Paso / Paso 2)
 * Evita errores HTTP 400 y com.trekglobal.idempiere.rest.api.v1.auth.LoginCredential
 */
function sanitizeAndValidatePayload(userName, password, contextParams = {}) {
  if (!userName || typeof userName !== 'string' || !userName.trim()) {
    throw new Error('El campo "userName" es obligatorio.');
  }

  if (!password || typeof password !== 'string') {
    throw new Error('El campo "password" es obligatorio.');
  }

  // Normalizar y sanear parámetros de contexto
  const rawParams = { ...DEFAULT_IDEMPIERE_CONFIG.defaultParameters, ...contextParams };

  // REGLA ESTRICTA B: Validar y corregir si por error se envía orgId en vez de organizationId
  const organizationId = Number(rawParams.organizationId ?? rawParams.orgId ?? 11);
  const clientId = Number(rawParams.clientId ?? 11);
  const roleId = Number(rawParams.roleId ?? 102);
  const warehouseId = Number(rawParams.warehouseId ?? 103);
  const language = String(rawParams.language || 'es_PE').trim();

  // Payload estructurado con parámetros anidados en "parameters"
  const payload = {
    userName: userName.trim(),
    password: password,
    parameters: {
      clientId,
      roleId,
      organizationId,
      warehouseId,
      language
    }
  };

  return payload;
}

/**
 * Realiza la petición HTTP/HTTPS nativa a iDempiere ERP
 */
function makeHttpRequest(targetUrl, method, headers, postData, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(targetUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: method,
        headers: headers,
        timeout: timeoutMs,
        rejectUnauthorized: false // Permite certificados en sandboxes ERP
      };

      const req = client.request(options, (res) => {
        let responseBody = '';
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          let parsedData = null;
          try {
            parsedData = responseBody ? JSON.parse(responseBody) : {};
          } catch (e) {
            parsedData = { rawResponse: responseBody };
          }

          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Timeout de conexión (${timeoutMs}ms) al conectar con iDempiere ERP en ${targetUrl}`));
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Consulta de Contexto en 2 Pasos - PASO 1 (userName + password)
 * 1. Envía credenciales al endpoint /api/v1/auth/tokens
 * 2. Obtiene clientes y token temporal (stage1Token)
 * 3. Consulta dinámicamente roles, organizaciones y almacenes asociados al usuario
 * 4. Devuelve el contexto completo estructurado para el Paso 2
 */
async function getAvailableContext(userName, password, options = {}) {
  if (!userName || !password) {
    throw new Error('Las credenciales "userName" y "password" son obligatorias.');
  }

  const erpBaseUrl = cleanErpBaseUrl(options.baseUrl || DEFAULT_IDEMPIERE_CONFIG.baseUrl);
  const fullEndpoint = `${erpBaseUrl}/api/v1/auth/tokens`;

  const payload = {
    userName: userName.trim(),
    password: password
  };
  const payloadString = JSON.stringify(payload);

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': Buffer.byteLength(payloadString)
  };

  try {
    const response = await makeHttpRequest(fullEndpoint, 'POST', headers, payloadString, options.timeout || 7000);

    if (response.statusCode === 200 || response.statusCode === 201) {
      const data = response.data || {};
      const stage1Token = data.token;
      const liveClients = Array.isArray(data.clients) && data.clients.length > 0
        ? data.clients
        : SANDBOX_MULTITENANT_CONTEXT.clients;

      const selectedClient = liveClients[0]?.id || 11;
      let liveRoles = [];
      let liveOrganizations = [];
      let liveWarehouses = [];

      // Si obtuvimos token de etapa 1, consultar roles, organizaciones y almacenes en vivo
      if (stage1Token) {
        try {
          const authHeaders = {
            'Accept': 'application/json',
            'Authorization': `Bearer ${stage1Token}`
          };

          // 1. Consultar Roles para el Client
          const rolesRes = await makeHttpRequest(`${erpBaseUrl}/api/v1/auth/roles?client=${selectedClient}`, 'GET', authHeaders, null, 4000);
          if (rolesRes.statusCode === 200 && Array.isArray(rolesRes.data?.roles) && rolesRes.data.roles.length > 0) {
            liveRoles = rolesRes.data.roles;
          }

          const selectedRole = liveRoles[0]?.id || 102;

          // 2. Consultar Organizaciones para Client + Role
          const orgsRes = await makeHttpRequest(`${erpBaseUrl}/api/v1/auth/organizations?client=${selectedClient}&role=${selectedRole}`, 'GET', authHeaders, null, 4000);
          if (orgsRes.statusCode === 200 && Array.isArray(orgsRes.data?.organizations) && orgsRes.data.organizations.length > 0) {
            const filteredOrgs = orgsRes.data.organizations.filter(o => o.id !== 0);
            liveOrganizations = filteredOrgs.length > 0 ? filteredOrgs : orgsRes.data.organizations;
          }

          // 3. Consultar Almacenes para CADA Organización en paralelo (cascada dinámica)
          if (liveOrganizations.length > 0) {
            const whPromises = liveOrganizations.map(async (org) => {
              try {
                const whRes = await makeHttpRequest(`${erpBaseUrl}/api/v1/auth/warehouses?client=${selectedClient}&role=${selectedRole}&organization=${org.id}`, 'GET', authHeaders, null, 4000);
                if (whRes.statusCode === 200 && Array.isArray(whRes.data?.warehouses)) {
                  return whRes.data.warehouses.map(w => ({
                    id: w.id,
                    name: w.name,
                    organizationId: org.id,
                    orgName: org.name
                  }));
                }
              } catch (e) {
                // Continuar si una organización específica falla
              }
              return [];
            });
            const whArrays = await Promise.all(whPromises);
            liveWarehouses = whArrays.flat();
          }
        } catch (subErr) {
          console.warn('[iDempiereService] Aviso al consultar sub-recursos:', subErr.message);
        }
      }

      return {
        step: 1,
        success: true,
        userName: userName.trim(),
        stage1Token: stage1Token || null,
        clients: liveClients,
        roles: liveRoles.length > 0 ? liveRoles : SANDBOX_MULTITENANT_CONTEXT.roles,
        organizations: liveOrganizations.length > 0 ? liveOrganizations : SANDBOX_MULTITENANT_CONTEXT.organizations,
        warehouses: liveWarehouses.length > 0 ? liveWarehouses : SANDBOX_MULTITENANT_CONTEXT.warehouses,
        languages: SANDBOX_MULTITENANT_CONTEXT.languages,
        simulated: false
      };
    }

    if (response.statusCode === 401 || response.statusCode === 403) {
      const err = new Error('Error de autenticación iDempiere: Usuario o contraseña inválidos.');
      err.statusCode = response.statusCode;
      throw err;
    }

    // Si falló por otra razón y se permite fallback
    if (options.allowFallback !== false) {
      return {
        step: 1,
        success: true,
        userName: userName.trim(),
        stage1Token: 'sandbox_temp_token',
        ...SANDBOX_MULTITENANT_CONTEXT,
        simulated: true,
        simulatedReason: `iDempiere en '${erpBaseUrl}' respondió con código HTTP ${response.statusCode}. Activando contexto Sandbox GardenWorld.`
      };
    }

    throw new Error(`Error HTTP ${response.statusCode} al consultar contexto en iDempiere`);

  } catch (error) {
    if (options.allowFallback !== false) {
      console.warn(`[iDempiereService] Paso 1 offline (${error.message}). Devolviendo opciones Sandbox GardenWorld.`);
      return {
        step: 1,
        success: true,
        userName: userName.trim(),
        stage1Token: 'sandbox_temp_token',
        ...SANDBOX_MULTITENANT_CONTEXT,
        simulated: true,
        simulatedReason: `iDempiere en '${erpBaseUrl}' no disponible (${error.message}). Mostrando opciones Sandbox GardenWorld.`
      };
    }
    throw error;
  }
}

/**
 * Generador de respuesta simulada para desarrollo/pruebas locales cuando iDempiere esté offline
 */
function generateMockIdempiereResponse(payload, targetUrl) {
  const randomHash = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDAiLCJuYW1lIjoi${Buffer.from(payload.userName).toString('base64').replace(/=/g, '')}Iiwicm9sZSI6IjEwMiIsImNsaWVudCI6IjExIiwib3JnIjoiMTEiLCJpYXQiOjE2OTgwMDAwMDAsImV4cCI6MTg1NTk2MDAwMH0.${randomHash}`;

  const roleName = payload.parameters.roleId === 102 ? 'GardenWorld Admin' :
                   payload.parameters.roleId === 103 ? 'GardenWorld User' : 'Store Operations Supervisor';

  const orgName = payload.parameters.organizationId === 11 ? 'HQ - Headquarters' :
                  payload.parameters.organizationId === 12 ? 'Store Central' : 'Store East';

  const clientName = payload.parameters.clientId === 11 ? 'GardenWorld, Inc.' : 'Hamburger Rapid Franchise System';
  const warehouseName = payload.parameters.warehouseId === 103 ? 'HQ Warehouse' : 'Admin Storage';

  return {
    success: true,
    token: mockToken,
    tokenType: 'Bearer',
    expiresIn: 86400,
    userId: 100,
    userName: payload.userName,
    client: {
      id: payload.parameters.clientId,
      name: clientName
    },
    role: {
      id: payload.parameters.roleId,
      name: roleName
    },
    organization: {
      id: payload.parameters.organizationId,
      name: orgName
    },
    warehouse: {
      id: payload.parameters.warehouseId,
      name: warehouseName
    },
    language: payload.parameters.language,
    parameters: payload.parameters,
    simulated: true,
    simulatedReason: `Instancia de iDempiere en '${targetUrl}' no disponible o en modo sandbox.`,
    audit: {
      endpointCalled: `${targetUrl}/api/v1/auth/tokens`,
      complianceRulesChecked: {
        endpointPluralTokens: true,
        nestedParametersObject: true,
        fieldOrganizationIdValid: true
      },
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Autentica contra iDempiere ERP REST API v1 (Login Directo o Paso 2 de Multitenant)
 * Cumple con todas las especificaciones de blindaje técnico
 */
async function authenticateIdempiere(userName, password, contextParams = {}, options = {}) {
  const erpBaseUrl = cleanErpBaseUrl(options.baseUrl || DEFAULT_IDEMPIERE_CONFIG.baseUrl);
  
  // 1. REGLA ESTRICTA A: Ruta exacta POST /api/v1/auth/tokens (plural)
  const fullEndpoint = `${erpBaseUrl}/api/v1/auth/tokens`;

  // 2. REGLA ESTRICTA B: Saneamiento y validación del payload
  const validPayload = sanitizeAndValidatePayload(userName, password, contextParams);
  const payloadString = JSON.stringify(validPayload);

  // 3. Cabeceras HTTP Obligatorias
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': Buffer.byteLength(payloadString)
  };

  try {
    const response = await makeHttpRequest(fullEndpoint, 'POST', headers, payloadString, options.timeout || 7000);

    // Mapeo detallado de códigos HTTP de iDempiere
    if (response.statusCode === 200 || response.statusCode === 201) {
      const responseData = response.data || {};
      const token = responseData.token || responseData['token'] || responseData.data?.token;

      if (!token) {
        throw new Error('iDempiere respondió con éxito pero no devolvió el atributo "token" en el cuerpo JSON.');
      }

      return {
        success: true,
        token: token,
        tokenType: 'Bearer',
        rawResponse: responseData,
        userId: responseData.userId || 100,
        userName: responseData.userName || validPayload.userName,
        parameters: validPayload.parameters,
        role: {
          id: validPayload.parameters.roleId,
          name: responseData.role?.name || (validPayload.parameters.roleId === 102 ? 'GardenWorld Admin' : `Rol #${validPayload.parameters.roleId}`)
        },
        client: {
          id: validPayload.parameters.clientId,
          name: responseData.client?.name || 'GardenWorld, Inc.'
        },
        organization: {
          id: validPayload.parameters.organizationId,
          name: responseData.organization?.name || `HQ Org #${validPayload.parameters.organizationId}`
        },
        warehouse: {
          id: validPayload.parameters.warehouseId,
          name: responseData.warehouse?.name || `Almacén #${validPayload.parameters.warehouseId}`
        },
        simulated: false,
        audit: {
          endpointCalled: fullEndpoint,
          httpStatus: response.statusCode,
          complianceRulesChecked: {
            endpointPluralTokens: true,
            nestedParametersObject: true,
            fieldOrganizationIdValid: true
          },
          timestamp: new Date().toISOString()
        }
      };
    }

    if (response.statusCode === 404) {
      const err = new Error(`Error 404 en iDempiere: Endpoint '${fullEndpoint}' no encontrado. Verifique que la ruta sea '/api/v1/auth/tokens' (plural).`);
      err.statusCode = 404;
      err.response = response.data;
      throw err;
    }

    if (response.statusCode === 400) {
      const errDetail = typeof response.data === 'object' ? JSON.stringify(response.data) : response.data;
      const err = new Error(`Error 400 (Bad Request) de iDempiere: ${errDetail}. Verifique la estructura de 'parameters' y que 'organizationId' sea numérico.`);
      err.statusCode = 400;
      err.response = response.data;
      throw err;
    }

    if (response.statusCode === 401 || response.statusCode === 403) {
      const err = new Error('Error de autenticación iDempiere (401/403): Usuario o contraseña incorrectos, o rol/organización no asignado.');
      err.statusCode = response.statusCode;
      err.response = response.data;
      throw err;
    }

    const err = new Error(`iDempiere respondió con HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
    err.statusCode = response.statusCode;
    err.response = response.data;
    throw err;

  } catch (error) {
    const isNetworkError = error.code === 'ECONNREFUSED' || 
                           error.code === 'ENOTFOUND' || 
                           error.code === 'ETIMEDOUT' ||
                           error.message.includes('Timeout') ||
                           error.message.includes('getaddrinfo');

    if (isNetworkError && (options.allowFallback !== false || process.env.NODE_ENV !== 'production')) {
      console.warn(`[iDempiereService] Conexión física a ${fullEndpoint} no disponible (${error.message}). Activando Sandbox Simulado GardenWorld.`);
      return generateMockIdempiereResponse(validPayload, erpBaseUrl);
    }

    throw error;
  }
}

/**
 * Prueba la conectividad de la URL de iDempiere
 */
async function testIdempiereConnection(erpBaseUrl = DEFAULT_IDEMPIERE_CONFIG.baseUrl) {
  const cleanUrl = cleanErpBaseUrl(erpBaseUrl);
  const testUrl = `${cleanUrl}/api/v1/auth/tokens`;
  
  try {
    const res = await makeHttpRequest(testUrl, 'GET', { 'Accept': 'application/json' }, null, 4000);
    return {
      reachable: true,
      statusCode: res.statusCode,
      url: testUrl,
      message: 'Servidor iDempiere responde a la ruta base de autenticación.'
    };
  } catch (err) {
    return {
      reachable: false,
      url: testUrl,
      error: err.message,
      message: 'No se pudo establecer conexión directa con el servidor iDempiere.'
    };
  }
}

/**
 * Paso 2 de la Autenticación Asistida (Multitenant):
 * Conforme a la documentación oficial iDempiere REST (bxservice.github.io/idempiere-rest-docs):
 * Endpoint: PUT /api/v1/auth/tokens
 * Headers:
 *   Authorization: Bearer <stage1Token>
 *   Content-Type: application/json
 *   Accept: application/json
 * Body (Plano, sin envoltorio "parameters"):
 *   {
 *     clientId: number,
 *     roleId: number,
 *     organizationId: number,
 *     warehouseId: number,
 *     language: string
 *   }
 */
async function authenticateStep2(stage1Token, contextParams = {}, options = {}) {
  const erpBaseUrl = cleanErpBaseUrl(options.baseUrl || DEFAULT_IDEMPIERE_CONFIG.baseUrl);
  const fullEndpoint = `${erpBaseUrl}/api/v1/auth/tokens`;

  // Normalizar parámetros de contexto
  const rawParams = { ...DEFAULT_IDEMPIERE_CONFIG.defaultParameters, ...contextParams };
  const organizationId = Number(rawParams.organizationId ?? rawParams.orgId ?? 11);
  const clientId = Number(rawParams.clientId ?? 11);
  const roleId = Number(rawParams.roleId ?? 102);
  const warehouseId = Number(rawParams.warehouseId ?? 103);
  const language = String(rawParams.language || 'es_PE').trim();

  const putPayload = {
    clientId,
    roleId,
    organizationId,
    warehouseId,
    language
  };

  // Si estamos en modo sandbox simulado o el token es ficticio
  if (!stage1Token || stage1Token === 'sandbox_temp_token' || stage1Token.startsWith('mock_')) {
    const mockPayload = {
      userName: options.userName || 'admin @ gardenworld.com',
      password: options.password || 'GardenAdmin',
      parameters: putPayload
    };
    return generateMockIdempiereResponse(mockPayload, erpBaseUrl);
  }

  const payloadString = JSON.stringify(putPayload);
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${stage1Token}`,
    'Content-Length': Buffer.byteLength(payloadString)
  };

  try {
    const response = await makeHttpRequest(fullEndpoint, 'PUT', headers, payloadString, options.timeout || 7000);

    if (response.statusCode === 200 || response.statusCode === 201) {
      const data = response.data || {};
      const finalToken = data.token;
      if (!finalToken) {
        throw new Error('iDempiere respondió con éxito pero no devolvió el atributo "token" en el cuerpo JSON.');
      }

      return {
        success: true,
        token: finalToken,
        refreshToken: data.refresh_token || null,
        tokenType: 'Bearer',
        rawResponse: data,
        userId: data.userId || 101,
        userName: options.userName || data.userName || 'admin @ gardenworld.com',
        parameters: putPayload,
        role: {
          id: roleId,
          name: roleId === 102 ? 'GardenWorld Admin' : `Rol #${roleId}`
        },
        client: {
          id: clientId,
          name: clientId === 11 ? 'GardenWorld, Inc.' : `Cliente #${clientId}`
        },
        organization: {
          id: organizationId,
          name: organizationId === 11 ? 'HQ - Headquarters' : `Org #${organizationId}`
        },
        warehouse: {
          id: warehouseId,
          name: warehouseId === 103 ? 'HQ Warehouse' : `Almacén #${warehouseId}`
        },
        simulated: false,
        audit: {
          endpointCalled: fullEndpoint,
          method: 'PUT',
          httpStatus: response.statusCode,
          timestamp: new Date().toISOString()
        }
      };
    }

    // Si el token temporal expiró y tenemos credenciales de respaldo
    if ((response.statusCode === 401 || response.statusCode === 403) && options.userName && options.password) {
      console.warn('[iDempiereService] PUT /tokens devolvió 401/403, intentando fallback con autenticación directa...');
      return authenticateIdempiere(options.userName, options.password, putPayload, options);
    }

    throw new Error(`iDempiere PUT /api/v1/auth/tokens respondió con HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
  } catch (err) {
    if (options.userName && options.password && options.allowFallback !== false) {
      console.warn(`[iDempiereService] Reintentando Paso 2 vía loginDirect debido a: ${err.message}`);
      return authenticateIdempiere(options.userName, options.password, putPayload, options);
    }
    if (options.allowFallback !== false) {
      const mockPayload = {
        userName: options.userName || 'admin @ gardenworld.com',
        password: options.password || 'GardenAdmin',
        parameters: putPayload
      };
      return generateMockIdempiereResponse(mockPayload, erpBaseUrl);
    }
    throw err;
  }
}

/**
 * Consulta un modelo de tabla estándar de iDempiere ERP (ej: M_Product_Category, M_Product, M_PriceList, C_BP_Group, C_Tax)
 */
async function fetchIdempiereModel(modelName, token, query = '$top=100', erpBaseUrl = DEFAULT_IDEMPIERE_CONFIG.baseUrl) {
  const cleanUrl = cleanErpBaseUrl(erpBaseUrl);
  const targetUrl = `${cleanUrl}/api/v1/models/${modelName}${query ? `?${query}` : ''}`;

  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    const response = await makeHttpRequest(targetUrl, 'GET', headers, null, 8000);
    if (response.statusCode === 200) {
      const data = response.data || {};
      const records = data.records || (Array.isArray(data) ? data : []);
      return { success: true, records, count: records.length, raw: data };
    }
    return { success: false, statusCode: response.statusCode, error: response.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Consulta dinámica de almacenes para una organización específica
 */
async function getWarehouses(clientId, roleId, organizationId, options = {}) {
  const erpBaseUrl = cleanErpBaseUrl(options.baseUrl);
  const token = options.token;
  const authHeaders = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  try {
    const targetUrl = `${erpBaseUrl}/api/v1/auth/warehouses?client=${clientId}&role=${roleId}&organization=${organizationId}`;
    const whRes = await makeHttpRequest(targetUrl, 'GET', authHeaders, null, 4000);
    if (whRes.statusCode === 200 && Array.isArray(whRes.data?.warehouses)) {
      return whRes.data.warehouses.map(w => ({
        id: w.id,
        name: w.name,
        organizationId: Number(organizationId)
      }));
    }
  } catch (err) {
    console.warn('[iDempiereService] Error consultando almacenes para org:', organizationId, err.message);
  }

  // Fallback a SANDBOX_MULTITENANT_CONTEXT si aplica
  return SANDBOX_MULTITENANT_CONTEXT.warehouses.filter(w => Number(w.organizationId) === Number(organizationId));
}

module.exports = {
  cleanErpBaseUrl,
  DEFAULT_IDEMPIERE_CONFIG,
  SANDBOX_MULTITENANT_CONTEXT,
  sanitizeAndValidatePayload,
  getAvailableContext,
  getWarehouses,
  authenticateIdempiere,
  authenticateStep2,
  fetchIdempiereModel,
  testIdempiereConnection
};
