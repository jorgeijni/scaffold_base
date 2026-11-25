/**
 * 🛡️ idempiereAuthService.js
 * Servicio de Cliente Modular para iDempiere ERP REST API v1
 * Replicado desde laboratorio1 con blindaje técnico total
 * 
 * Diseñado como biblioteca base reutilizable tanto para el Panel de Administración
 * como para la futura integración en la PWA Móvil de Pedidos.
 * 
 * CUMPLE CON LAS REGLAS ESTRICTAS DE BLINDAJE iDempiere v1:
 * 1. Endpoint en plural: POST /api/v1/auth/tokens (NUNCA /token)
 * 2. Headers: Content-Type: application/json, Accept: application/json
 * 3. Nombre de campo: "organizationId" (NUNCA "orgId")
 * 4. Contexto anidado en objeto "parameters" (NUNCA en la raíz)
 */

export const STORAGE_SESSION_KEY = 'hamburger_rapid_idempiere_auth_session';

export const DEFAULT_GARDENWORLD_PARAMS = {
  erpBaseUrl: 'https://test.idempiere.org',
  userName: 'admin @ gardenworld.com',
  password: 'GardenAdmin',
  parameters: {
    clientId: 11,
    roleId: 102,
    organizationId: 11, // REGLA ESTRICTA B: organizationId (NUNCA orgId)
    warehouseId: 103,
    language: 'es_PE'
  }
};

/**
 * Normaliza la URL base de iDempiere eliminando puertos redundantes (:443) y barras finales
 */
export function normalizeErpBaseUrl(rawUrl) {
  let url = (rawUrl || DEFAULT_GARDENWORLD_PARAMS.erpBaseUrl).trim().replace(/\/+$/, '');
  url = url.replace(/:443$/, '');
  return url;
}

/**
 * Resuelve la URL final para conexión directa
 */
export function buildEndpointUrl(baseUrl) {
  const cleanBase = normalizeErpBaseUrl(baseUrl);
  return `${cleanBase}/api/v1/auth/tokens`;
}

/**
 * Valida y formatea el payload cumpliendo estrictamente con la especificación iDempiere REST API v1
 */
export function formatIdempiereParameters(params = {}) {
  return {
    clientId: Number(params.clientId ?? params.client_id ?? 11),
    roleId: Number(params.roleId ?? params.role_id ?? 102),
    organizationId: Number(params.organizationId ?? params.orgId ?? params.org_id ?? 11), // OBLIGATORIO: organizationId
    warehouseId: Number(params.warehouseId ?? params.warehouse_id ?? 103),
    language: String(params.language || 'es_PE').trim()
  };
}

/**
 * Guarda la sesión de autenticación en localStorage y sessionStorage para persistencia y redundancia
 */
export function saveSession(sessionData) {
  if (!sessionData || !sessionData.token) return;

  const serialized = JSON.stringify({
    ...sessionData,
    savedAt: new Date().toISOString()
  });

  try {
    localStorage.setItem(STORAGE_SESSION_KEY, serialized);
    sessionStorage.setItem(STORAGE_SESSION_KEY, serialized);
  } catch (err) {
    console.warn('[AuthService] No se pudo escribir en almacenamiento local:', err);
  }
}

/**
 * Recupera la sesión persistida desde sessionStorage o localStorage
 */
export function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_SESSION_KEY) || localStorage.getItem(STORAGE_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[AuthService] Error al parsear sesión guardada:', err);
  }
  return null;
}

/**
 * Purga completamente las credenciales y tokens guardados
 */
export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    sessionStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (err) {
    console.warn('[AuthService] Error al limpiar almacenamiento:', err);
  }
}

// =======================================================================
// MODALIDAD 1: LOGIN DIRECTO / 1 PASO (Acceso Rápido)
// =======================================================================

/**
 * Autenticación en 1 Paso
 * Envía credenciales y parámetros de contexto fijos en una sola petición
 * Con tolerancia a fallos y auto-recuperación ante bloqueos de CORS en navegador
 */
export async function loginDirect(credentials, connectionMode = 'proxy') {
  const { userName, password, parameters, erpBaseUrl } = credentials;

  if (!userName || !password) {
    throw new Error('El usuario y la contraseña son requeridos.');
  }

  const cleanBase = normalizeErpBaseUrl(erpBaseUrl);
  const formattedParams = formatIdempiereParameters(parameters);

  // MODO DIRECTO: Intenta primero REST directo desde el navegador
  if (connectionMode === 'direct') {
    const targetEndpoint = `${cleanBase}/api/v1/auth/tokens`;
    const requestBody = {
      userName: userName.trim(),
      password: password,
      parameters: formattedParams
    };

    try {
      const response = await fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const resJson = await response.json().catch(() => ({}));

      if (response.ok) {
        const token = resJson.token || resJson.data?.token;
        if (token) {
          return {
            token,
            tokenType: 'Bearer',
            userId: resJson.userId || 100,
            userName: userName.trim(),
            password,
            parameters: formattedParams,
            role: { id: formattedParams.roleId, name: formattedParams.roleId === 102 ? 'GardenWorld Admin' : `Rol #${formattedParams.roleId}` },
            client: { id: formattedParams.clientId, name: 'GardenWorld, Inc.' },
            organization: { id: formattedParams.organizationId, name: `HQ Org #${formattedParams.organizationId}` },
            warehouse: { id: formattedParams.warehouseId, name: `Almacén #${formattedParams.warehouseId}` },
            simulated: false,
            audit: {
              endpointCalled: targetEndpoint,
              connectionMode: 'direct',
              complianceRulesChecked: {
                endpointPluralTokens: true,
                nestedParametersObject: true,
                fieldOrganizationIdValid: true
              },
              timestamp: new Date().toISOString()
            }
          };
        }
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error('Credenciales inválidas en iDempiere ERP.');
      }
    } catch (directErr) {
      console.warn('[AuthService] Conexión directa falló (' + directErr.message + '). Auto-recuperando vía Proxy Backend...');
      // Fallback transparente al proxy backend local
    }
  }

  // MODO PROXY (O FALLBACK AUTOMÁTICO SEGURO):
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      userName: userName.trim(),
      password,
      parameters: formattedParams,
      erpBaseUrl: cleanBase
    })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    const error = new Error(data.error || `Error HTTP ${response.status} en autenticación`);
    error.details = data;
    throw error;
  }
  return { ...data.data, password };
}

// =======================================================================
// MODALIDAD 2: LOGIN ASISTIDO EN 2 PASOS (Multitenant Dinámico)
// =======================================================================

/**
 * Paso 1: Enviar únicamente usuario y contraseña
 * Obtiene lista dinámica de Tenants (Clientes), Roles, Organizaciones y Almacenes asignados
 * Con auto-recuperación ante bloqueos de CORS
 */
export async function requestContextStep1(credentials, connectionMode = 'proxy') {
  const { userName, password, erpBaseUrl } = credentials;

  if (!userName || !password) {
    throw new Error('Debe ingresar usuario y contraseña para consultar las asignaciones.');
  }

  const cleanBase = normalizeErpBaseUrl(erpBaseUrl);

  // MODO DIRECTO: Probar directo si el usuario lo solicita
  if (connectionMode === 'direct') {
    const targetEndpoint = `${cleanBase}/api/v1/auth/tokens`;
    try {
      const response = await fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userName: userName.trim(),
          password: password
        })
      });

      const resJson = await response.json().catch(() => ({}));

      if (response.ok && Array.isArray(resJson.clients)) {
        return {
          step: 1,
          success: true,
          userName: userName.trim(),
          password,
          stage1Token: resJson.token || null,
          clients: resJson.clients,
          roles: resJson.roles || [{ id: 102, name: 'GardenWorld Admin' }],
          organizations: resJson.organizations || [{ id: 11, name: 'HQ - Headquarters' }],
          warehouses: resJson.warehouses || [{ id: 103, name: 'HQ Warehouse' }],
          languages: [{ id: 'es_PE', name: 'Español (Perú)' }, { id: 'en_US', name: 'English (US)' }, { id: 'es_ES', name: 'Español (ES)' }]
        };
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error('Usuario o contraseña incorrectos en iDempiere ERP.');
      }
    } catch (directErr) {
      console.warn('[AuthService] Paso 1 directo falló (' + directErr.message + '). Auto-recuperando vía Proxy Backend...');
      // Fallback transparente al proxy backend local
    }
  }

  // MODO PROXY BACKEND LOCAL (100% libre de restricciones CORS):
  const response = await fetch('/api/auth/context', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      userName: userName.trim(),
      password,
      erpBaseUrl: cleanBase
    })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Error al obtener contexto multitenant en iDempiere');
  }

  return { ...data.data, password };
}

/**
 * Paso 2: Enviar contexto elegido por el usuario para obtener el Token definitivo
 * Conforme a la documentación oficial iDempiere REST (bxservice.github.io/idempiere-rest-docs):
 * Ejecuta PUT /api/v1/auth/tokens con Authorization: Bearer <stage1Token>
 */
export async function completeLoginStep2(credentials, selectedContext, connectionMode = 'proxy') {
  const { userName, password, erpBaseUrl, stage1Token } = credentials;
  const cleanBase = normalizeErpBaseUrl(erpBaseUrl);

  const formattedParams = {
    clientId: Number(selectedContext.clientId ?? 11),
    roleId: Number(selectedContext.roleId ?? 102),
    organizationId: Number(selectedContext.organizationId ?? selectedContext.orgId ?? 11),
    warehouseId: Number(selectedContext.warehouseId ?? 103),
    language: selectedContext.language || 'es_PE'
  };

  // MODO DIRECTO: Probar PUT directo si se solicita y hay stage1Token
  if (connectionMode === 'direct' && stage1Token && stage1Token !== 'sandbox_temp_token') {
    const targetEndpoint = `${cleanBase}/api/v1/auth/tokens`;
    try {
      const response = await fetch(targetEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${stage1Token}`
        },
        body: JSON.stringify(formattedParams)
      });

      const resJson = await response.json().catch(() => ({}));
      if (response.ok && resJson.token) {
        return {
          token: resJson.token,
          tokenType: 'Bearer',
          refreshToken: resJson.refresh_token || null,
          userId: resJson.userId || 101,
          userName: userName || 'Usuario iDempiere',
          password,
          parameters: formattedParams,
          simulated: false,
          client: { id: formattedParams.clientId, name: 'GardenWorld, Inc.' },
          role: { id: formattedParams.roleId, name: formattedParams.roleId === 102 ? 'GardenWorld Admin' : `Rol #${formattedParams.roleId}` },
          organization: { id: formattedParams.organizationId, name: `HQ Org #${formattedParams.organizationId}` },
          warehouse: { id: formattedParams.warehouseId, name: `Almacén #${formattedParams.warehouseId}` },
          language: formattedParams.language
        };
      }
    } catch (directErr) {
      console.warn('[AuthService] Paso 2 directo falló (' + directErr.message + '). Auto-recuperando vía Proxy Backend...');
    }
  }

  // MODO PROXY BACKEND (100% seguro contra CORS y contingencias):
  const response = await fetch('/api/auth/step2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      stage1Token,
      parameters: formattedParams,
      erpBaseUrl: cleanBase,
      userName,
      password
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    const error = new Error(data.error || 'Error al completar el Paso 2 en iDempiere ERP');
    error.details = data;
    throw error;
  }

  return { ...data.data, password };
}

/**
 * Consulta dinámica de almacenes asignados a una organización
 */
export async function getWarehouses(erpBaseUrl, stage1Token, clientId, roleId, organizationId, connectionMode = 'proxy') {
  const cleanBase = normalizeErpBaseUrl(erpBaseUrl);

  if (connectionMode === 'direct' && stage1Token) {
    try {
      const response = await fetch(`${cleanBase}/api/v1/auth/warehouses?client=${clientId}&role=${roleId}&organization=${organizationId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${stage1Token}`
        }
      });
      if (response.ok) {
        const resJson = await response.json();
        if (Array.isArray(resJson.warehouses)) {
          return resJson.warehouses.map(w => ({
            id: w.id,
            name: w.name,
            organizationId: Number(organizationId)
          }));
        }
      }
    } catch (err) {
      console.warn('[AuthService] Fallo al consultar almacenes directos, recurriendo a proxy:', err.message);
    }
  }

  // Vía Proxy Backend
  try {
    const response = await fetch('/api/auth/warehouses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        erpBaseUrl: cleanBase,
        stage1Token,
        clientId: Number(clientId),
        roleId: Number(roleId),
        organizationId: Number(organizationId)
      })
    });
    const resJson = await response.json();
    if (resJson.success && Array.isArray(resJson.data)) {
      return resJson.data;
    }
  } catch (err) {
    console.warn('[AuthService] Error consultando almacenes vía proxy:', err.message);
  }

  return [];
}

/**
 * Verifica la validez de un token existente
 */
export async function verifyToken(token) {
  if (!token) return { valid: false };
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    });
    const data = await response.json();
    return { valid: Boolean(data.authenticated), data };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
