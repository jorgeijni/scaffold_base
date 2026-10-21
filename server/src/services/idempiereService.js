/**
 * iDempiere REST API v1 Authentication & Gateway Service
 * 
 * Reglas Estrictas de Integración iDempiere v1:
 * 1. Endpoint: POST /api/v1/auth/tokens (plural obligatorio)
 * 2. Headers: Content-Type: application/json, Accept: application/json
 * 3. Payload: parameters anidados, campo obligatorio 'organizationId' (no 'orgId')
 * 4. Autenticación en 2 Pasos: Paso 1 (Credenciales) -> Paso 2 (Seleccionar Perfil)
 * 5. Validación Estricta: Rechazo inmediato (HTTP 401) si las credenciales son incorrectas
 */

const DEFAULT_BASE_URL = process.env.IDEMPIERE_BASE_URL || 'http://localhost:8080';
const DEFAULT_TIMEOUT_MS = 6000;

// Directorio de Cuentas y Perfiles Autorizados para iDempiere
const MOCK_ACCOUNTS = [
  {
    userName: 'admin @ gardenworld.com',
    aliases: ['admin@gardenworld.com', 'admin'],
    password: 'GardenAdmin',
    name: 'GardenWorld Admin',
    clients: [
      { id: 11, name: 'GardenWorld' },
      { id: 0, name: 'System' }
    ],
    roles: [
      { id: 102, clientId: 11, name: 'GardenWorld Admin' },
      { id: 103, clientId: 11, name: 'GardenWorld User' },
      { id: 104, clientId: 11, name: 'GardenWorld Clerical' },
      { id: 0, clientId: 0, name: 'System Administrator' }
    ],
    organizations: [
      { id: 0, clientId: 11, name: '*' },
      { id: 11, clientId: 11, name: 'HQ' },
      { id: 12, clientId: 11, name: 'Store North' },
      { id: 13, clientId: 11, name: 'Store South' }
    ],
    warehouses: [
      { id: 103, orgId: 11, name: 'HQ Warehouse' },
      { id: 104, orgId: 12, name: 'North Warehouse' },
      { id: 105, orgId: 13, name: 'South Warehouse' },
      { id: 0, orgId: 0, name: '(Sin Almacén)' }
    ],
    languages: [
      { code: 'pt_BR', name: 'Portuguese (BR)' },
      { code: 'en_US', name: 'English (US)' },
      { code: 'es_ES', name: 'Spanish (ES)' }
    ],
    defaultParameters: {
      clientId: 11,
      roleId: 102,
      organizationId: 11,
      warehouseId: 103,
      language: 'pt_BR'
    }
  },
  {
    userName: 'SuperUser',
    aliases: ['superuser'],
    password: 'System',
    name: 'SuperUser',
    clients: [
      { id: 0, name: 'System' },
      { id: 11, name: 'GardenWorld' }
    ],
    roles: [
      { id: 0, clientId: 0, name: 'System Administrator' },
      { id: 102, clientId: 11, name: 'GardenWorld Admin' }
    ],
    organizations: [
      { id: 0, clientId: 0, name: '*' },
      { id: 11, clientId: 11, name: 'HQ' }
    ],
    warehouses: [
      { id: 0, orgId: 0, name: '(Sin Almacén)' },
      { id: 103, orgId: 11, name: 'HQ Warehouse' }
    ],
    languages: [
      { code: 'en_US', name: 'English (US)' },
      { code: 'es_ES', name: 'Spanish (ES)' },
      { code: 'pt_BR', name: 'Portuguese (BR)' }
    ],
    defaultParameters: {
      clientId: 0,
      roleId: 0,
      organizationId: 0,
      warehouseId: 0,
      language: 'en_US'
    }
  }
];

class IdempiereService {
  constructor() {
    this.defaultBaseUrl = DEFAULT_BASE_URL;
  }

  normalizeBaseUrl(url) {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return this.defaultBaseUrl;
    }
    return url.trim().replace(/\/+$/, '');
  }

  normalizeUser(str) {
    return (str || '').replace(/\s+/g, '').toLowerCase();
  }

  findAuthorizedMock(userName, password) {
    const norm = this.normalizeUser(userName);
    const account = MOCK_ACCOUNTS.find(acc => {
      if (this.normalizeUser(acc.userName) === norm) return true;
      if (acc.aliases && acc.aliases.some(a => this.normalizeUser(a) === norm)) return true;
      return false;
    });

    if (!account) return null;
    if (account.password !== password) return null;
    return account;
  }

  /**
   * Paso 1: Valida credenciales del usuario y obtiene las opciones de perfil disponibles
   * REGLA DE ORO: Si las credenciales son incorrectas, DEBE retornar 401 Unauthorized
   */
  async authenticate({ userName, password, baseUrl, allowFallback = true }) {
    if (!userName || !password) {
      return {
        success: false,
        status: 400,
        error: 'El nombre de usuario y la contraseña son obligatorios.'
      };
    }

    const targetBaseUrl = this.normalizeBaseUrl(baseUrl);
    const endpoint = `${targetBaseUrl}/api/v1/auth/tokens`;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log(`[iDempiere Gateway - Paso 1] Validando credenciales en: ${endpoint}`);

      // Intentar autenticación en vivo con iDempiere REST API v1
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userName: userName.trim(), password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const elapsedMs = Date.now() - startTime;

      let responseData = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        try { responseData = JSON.parse(text); } catch { responseData = { message: text }; }
      }

      // Si las credenciales son inválidas en el servidor real: NUNCA permitir acceso
      if (!response.ok) {
        console.warn(`[iDempiere Gateway] ❌ Servidor iDempiere rechazó credenciales (${response.status})`);
        return {
          success: false,
          status: response.status,
          error: response.status === 401 
            ? 'HTTP 401 Unauthorized: Usuario o contraseña incorrectos en iDempiere.'
            : (responseData.detail || responseData.message || 'Error de credenciales en iDempiere.'),
          detail: responseData.detail || responseData.message || 'Verifique su usuario y contraseña.',
          endpoint,
          latencyMs: elapsedMs
        };
      }

      // Éxito en iDempiere real: extraer opciones de perfil
      const clients = responseData.clients || [{ id: 11, name: 'GardenWorld' }];
      const roles = responseData.roles || [{ id: 102, clientId: 11, name: 'GardenWorld Admin' }];
      const organizations = responseData.organizations || [{ id: 11, name: 'HQ' }, { id: 0, name: '*' }];
      const warehouses = responseData.warehouses || [{ id: 103, name: 'HQ Warehouse' }];
      const languages = responseData.languages || [
        { code: 'pt_BR', name: 'Portuguese (BR)' },
        { code: 'en_US', name: 'English (US)' },
        { code: 'es_ES', name: 'Spanish (ES)' }
      ];

      return {
        success: true,
        mode: 'live',
        isMock: false,
        userName: userName.trim(),
        tempToken: responseData.token || null,
        clients,
        roles,
        organizations,
        warehouses,
        languages,
        defaultParameters: {
          clientId: clients[0]?.id || 11,
          roleId: roles[0]?.id || 102,
          organizationId: organizations[0]?.id || 11,
          warehouseId: warehouses[0]?.id || 103,
          language: 'pt_BR'
        },
        endpoint,
        latencyMs: elapsedMs
      };

    } catch (networkError) {
      const elapsedMs = Date.now() - startTime;
      console.warn(`[iDempiere Gateway] ⚠️ Servidor en ${targetBaseUrl} no alcanzable (${networkError.message})`);

      // SI EL ERP ESTÁ OFFLINE Y FALLBACK ESTÁ ACTIVADO:
      if (allowFallback) {
        // VALIDACIÓN CRUCIAL: Solo se permite si las credenciales coinciden con cuentas válidas
        const matchingAccount = this.findAuthorizedMock(userName, password);

        if (!matchingAccount) {
          console.warn(`[iDempiere Gateway] 🚫 Intento de login fallido con usuario/password incorrectos: "${userName}"`);
          return {
            success: false,
            status: 401,
            error: 'HTTP 401 Unauthorized: Usuario o contraseña incorrectos en iDempiere.',
            detail: 'Las credenciales ingresadas no corresponden a ningún usuario autorizado de iDempiere.',
            endpoint,
            latencyMs: elapsedMs
          };
        }

        console.log(`[iDempiere Gateway] 🛡️ Credenciales válidas para "${matchingAccount.userName}". Cargando perfiles en Modo Resiliente.`);
        return {
          success: true,
          mode: 'resilient_simulated',
          isMock: true,
          warning: `Servidor iDempiere en "${targetBaseUrl}" offline. Operando con catálogo de perfiles de contingencia.`,
          userName: matchingAccount.userName,
          name: matchingAccount.name,
          clients: matchingAccount.clients,
          roles: matchingAccount.roles,
          organizations: matchingAccount.organizations,
          warehouses: matchingAccount.warehouses,
          languages: matchingAccount.languages,
          defaultParameters: matchingAccount.defaultParameters,
          endpoint,
          latencyMs: elapsedMs
        };
      }

      return {
        success: false,
        status: 503,
        error: `No se pudo conectar al servidor iDempiere en "${targetBaseUrl}".`,
        detail: networkError.message,
        endpoint,
        latencyMs: elapsedMs
      };
    }
  }

  /**
   * Construye y valida el payload exacto para iDempiere REST API v1
   */
  buildLoginPayload({ userName, password, parameters = {} }) {
    if (!userName || typeof userName !== 'string') {
      throw new Error('El parámetro "userName" es obligatorio y debe ser una cadena válida.');
    }
    if (!password || typeof password !== 'string') {
      throw new Error('El parámetro "password" es obligatorio y debe ser una cadena válida.');
    }

    // Regla de Oro iDempiere: organizationId (NUNCA orgId)
    const organizationId = parameters.organizationId !== undefined 
      ? Number(parameters.organizationId)
      : (parameters.orgId !== undefined ? Number(parameters.orgId) : 11);

    const clientId = parameters.clientId !== undefined ? Number(parameters.clientId) : 11;
    const roleId = parameters.roleId !== undefined ? Number(parameters.roleId) : 102;
    const warehouseId = parameters.warehouseId !== undefined ? Number(parameters.warehouseId) : 103;
    const language = parameters.language || 'en_US';

    return {
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
  }

  /**
   * Paso 2: Ejecuta el login final con el perfil y parámetros de contexto seleccionados
   * Endpoint OBLIGATORIO: POST /api/v1/auth/tokens
   */
  async login({ userName, password, parameters = {}, baseUrl, allowFallback = true }) {
    // 1. Verificación previa de credenciales (evita bypass de seguridad)
    const targetBaseUrl = this.normalizeBaseUrl(baseUrl);
    const endpoint = `${targetBaseUrl}/api/v1/auth/tokens`;
    const payload = this.buildLoginPayload({ userName, password, parameters });
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log(`[iDempiere Gateway - Paso 2] Emitiendo login final a: ${endpoint}`);
      console.log(`[iDempiere Gateway - Paso 2] Payload:`, JSON.stringify(payload, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const elapsedMs = Date.now() - startTime;

      let responseData = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const textData = await response.text();
        try { responseData = JSON.parse(textData); } catch { responseData = { message: textData }; }
      }

      if (response.ok) {
        console.log(`[iDempiere Gateway] ✅ Login final exitoso en ${elapsedMs}ms`);
        return {
          success: true,
          mode: 'live',
          isMock: false,
          endpoint,
          latencyMs: elapsedMs,
          token: responseData.token || responseData.access_token || `idemp_live_${Date.now()}`,
          refreshToken: responseData.refreshToken || null,
          user: {
            userName: payload.userName,
            clientId: payload.parameters.clientId,
            roleId: payload.parameters.roleId,
            organizationId: payload.parameters.organizationId,
            warehouseId: payload.parameters.warehouseId,
            language: payload.parameters.language,
            clientName: payload.parameters.clientId === 11 ? 'GardenWorld' : (payload.parameters.clientId === 0 ? 'System' : `Client ${payload.parameters.clientId}`),
            roleName: payload.parameters.roleId === 102 ? 'GardenWorld Admin' : `Role ${payload.parameters.roleId}`,
            orgName: payload.parameters.organizationId === 11 ? 'HQ' : (payload.parameters.organizationId === 0 ? '*' : `Org ${payload.parameters.organizationId}`)
          },
          rawResponse: responseData
        };
      }

      // Si el servidor iDempiere rechazó las credenciales o el perfil
      console.warn(`[iDempiere Gateway] ⚠️ Respuesta HTTP ${response.status} de iDempiere:`, responseData);
      return {
        success: false,
        status: response.status,
        error: response.status === 401 
          ? 'HTTP 401 Unauthorized: Usuario o contraseña incorrectos en iDempiere.'
          : (response.status === 403 
              ? 'HTTP 403 Forbidden: El rol u organización no están asignados a este usuario.'
              : 'Error al iniciar sesión en iDempiere ERP.'),
        detail: responseData.detail || responseData.message || JSON.stringify(responseData),
        endpoint,
        latencyMs: elapsedMs
      };

    } catch (networkError) {
      const elapsedMs = Date.now() - startTime;
      console.warn(`[iDempiere Gateway] ❌ Error de red con ${endpoint}: ${networkError.message}`);

      // SI EL ERP ESTÁ OFFLINE:
      if (allowFallback) {
        // VALIDACIÓN CRUCIAL: Solo se permite si las credenciales son legítimas
        const matchingAccount = this.findAuthorizedMock(userName, password);
        if (!matchingAccount) {
          console.warn(`[iDempiere Gateway] 🚫 Intento de login bloqueado en modo resiliente: credenciales inválidas`);
          return {
            success: false,
            status: 401,
            error: 'HTTP 401 Unauthorized: Usuario o contraseña incorrectos en iDempiere.',
            detail: 'Las credenciales ingresadas no corresponden a un usuario válido en iDempiere.',
            endpoint,
            latencyMs: elapsedMs
          };
        }

        console.log(`[iDempiere Gateway] 🛡️ Generando token de sesión resiliente para "${matchingAccount.userName}"`);
        return this.generateResilientMockSession({
          payload,
          endpoint,
          targetBaseUrl,
          latencyMs: elapsedMs,
          networkError: networkError.message,
          accountName: matchingAccount.name
        });
      }

      return {
        success: false,
        status: 503,
        error: `No se pudo establecer conexión con el servidor iDempiere en "${targetBaseUrl}".`,
        detail: networkError.message,
        endpoint,
        latencyMs: elapsedMs
      };
    }
  }

  generateResilientMockSession({ payload, endpoint, targetBaseUrl, latencyMs, networkError, accountName }) {
    const mockHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const mockPayload = Buffer.from(JSON.stringify({
      sub: payload.userName,
      clientId: payload.parameters.clientId,
      roleId: payload.parameters.roleId,
      organizationId: payload.parameters.organizationId,
      warehouseId: payload.parameters.warehouseId,
      language: payload.parameters.language,
      iss: 'iDempiere-REST-v1-ResilientGateway',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400
    })).toString('base64url');
    const mockSignature = Buffer.from('idempiere_resilient_signature_hash').toString('base64url');
    const mockToken = `${mockHeader}.${mockPayload}.${mockSignature}`;

    // Obtener nombres amigables
    let clientName = payload.parameters.clientId === 11 ? 'GardenWorld' : (payload.parameters.clientId === 0 ? 'System' : `Empresa ${payload.parameters.clientId}`);
    let roleName = payload.parameters.roleId === 102 ? 'GardenWorld Admin' : (payload.parameters.roleId === 103 ? 'GardenWorld User' : (payload.parameters.roleId === 0 ? 'System Administrator' : `Perfil ${payload.parameters.roleId}`));
    let orgName = payload.parameters.organizationId === 11 ? 'HQ' : (payload.parameters.organizationId === 0 ? '*' : (payload.parameters.organizationId === 12 ? 'Store North' : `Org ${payload.parameters.organizationId}`));

    return {
      success: true,
      mode: 'resilient_simulated',
      isMock: true,
      endpoint,
      latencyMs: Math.max(latencyMs, 10),
      warning: `Conectado en Modo Resiliente. El servidor iDempiere en "${targetBaseUrl}" no respondió (${networkError}).`,
      token: mockToken,
      refreshToken: `mock_refresh_${Date.now()}`,
      user: {
        userName: payload.userName,
        accountName: accountName || payload.userName,
        clientId: payload.parameters.clientId,
        roleId: payload.parameters.roleId,
        organizationId: payload.parameters.organizationId,
        warehouseId: payload.parameters.warehouseId,
        language: payload.parameters.language,
        clientName,
        roleName,
        orgName
      },
      rawResponse: {
        status: 200,
        simulated: true,
        protocol: 'iDempiere REST API v1',
        endpoint: '/api/v1/auth/tokens'
      }
    };
  }

  async ping({ baseUrl }) {
    const targetBaseUrl = this.normalizeBaseUrl(baseUrl);
    const endpoint = `${targetBaseUrl}/api/v1/auth/tokens`;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(endpoint, {
        method: 'OPTIONS',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const elapsedMs = Date.now() - startTime;

      return {
        online: true,
        status: response.status,
        latencyMs: elapsedMs,
        targetBaseUrl,
        endpoint,
        message: 'Servidor iDempiere REST API v1 alcanzable y respondiendo.'
      };
    } catch (err) {
      const elapsedMs = Date.now() - startTime;
      return {
        online: false,
        status: 0,
        latencyMs: elapsedMs,
        targetBaseUrl,
        endpoint,
        message: `Servidor iDempiere no disponible en ${targetBaseUrl} (${err.message})`,
        error: err.message
      };
    }
  }

  verifyToken(token) {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Token no proporcionado o inválido' };
    }

    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
        const payload = JSON.parse(payloadJson);
        const now = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < now) {
          return { valid: false, expired: true, error: 'Token de sesión expirado' };
        }

        return {
          valid: true,
          expired: false,
          payload,
          user: {
            userName: payload.sub || 'Usuario iDempiere',
            clientId: payload.clientId,
            roleId: payload.roleId,
            organizationId: payload.organizationId,
            warehouseId: payload.warehouseId
          }
        };
      }

      return { valid: true, opaque: true, token };
    } catch (e) {
      return { valid: false, error: 'Error al decodificar token: ' + e.message };
    }
  }
}

module.exports = new IdempiereService();
