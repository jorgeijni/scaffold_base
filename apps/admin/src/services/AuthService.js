/**
 * iDempiere REST API v1 - AuthService
 * 
 * Modulo desacoplado y reutilizable para autenticacion y gestion de sesion
 * contra iDempiere ERP. Disenado para el Panel de Administracion y reutilizable
 * en la PWA de Pedidos / Preventa.
 */

const STORAGE_KEY = 'idempiere_auth_session';
const CONFIG_KEY = 'idempiere_api_config';
const PROFILE_CONFIG_KEY = 'idempiere_profile_config';

export const DEFAULT_DEMO_CONFIG = {
  baseUrl: 'https://test.idempiere.org:443',
  userName: 'admin @ gardenworld.com',
  password: 'GardenAdmin',
  parameters: {
    clientId: 11,
    roleId: 102,
    organizationId: 11,
    warehouseId: 103,
    language: 'es_PE'
  }
};

export const DEFAULT_PROFILE_CONFIG = {
  baseUrl: 'https://test.idempiere.org:443',
  useCorsProxy: true,
  proxyMode: 'local',
  assistedMultiTenant: false, // false = 1 paso directo, true = 2 pasos asistido
  defaultParameters: {
    clientId: 11,
    roleId: 102,
    organizationId: 11,
    warehouseId: 103,
    language: 'es_PE'
  }
};

export const PROXY_MODES = {
  LOCAL: 'local',
  NONE: 'none',
  ALLORIGINS: 'allorigins',
  CORSPROXY: 'corsproxy',
  CUSTOM: 'custom'
};

/**
 * Servicio Centralizado de Autenticacion con iDempiere REST API v1
 */
export class AuthService {
  /**
   * Construye la URL final tomando en cuenta la modalidad de proxy CORS
   * @param {string} baseUrl - URL base del servidor iDempiere
   * @param {string} endpoint - Ruta relativa (/api/v1/auth/tokens)
   * @param {Object} proxyConfig - Configuracion del proxy
   * @returns {string} URL lista para fetch
   */
  static buildUrl(baseUrl, endpoint = '/api/v1/auth/tokens', proxyConfig = {}) {
    const cleanBase = (baseUrl || DEFAULT_DEMO_CONFIG.baseUrl).replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const targetUrl = `${cleanBase}${cleanEndpoint}`;

    // Compatibilidad si proxyConfig es string u objeto
    const mode = (typeof proxyConfig === 'string' ? proxyConfig : proxyConfig?.mode) || PROXY_MODES.LOCAL;

    switch (mode) {
      case PROXY_MODES.LOCAL:
        return `/api/idempiere-proxy?target=${encodeURIComponent(targetUrl)}`;
      case PROXY_MODES.ALLORIGINS:
        return `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      case PROXY_MODES.CORSPROXY:
        if (proxyConfig?.apiKey) {
          return `https://corsproxy.io/?key=${encodeURIComponent(proxyConfig.apiKey)}&url=${encodeURIComponent(targetUrl)}`;
        }
        // Fallback transparente: corsproxy.io sin API key devuelve HTTP 403 (keyless_legacy_url).
        // Usamos el Proxy Local como fallback seguro.
        console.warn('corsproxy.io requiere API Key; conmutando automáticamente al Proxy Local backend.');
        return `/api/idempiere-proxy?target=${encodeURIComponent(targetUrl)}`;
      case PROXY_MODES.CUSTOM:
        if (proxyConfig?.customUrl) {
          const prefix = proxyConfig.customUrl.endsWith('?') 
            ? proxyConfig.customUrl 
            : `${proxyConfig.customUrl}?target=`;
          return `${prefix}${encodeURIComponent(targetUrl)}`;
        }
        return targetUrl;
      case PROXY_MODES.NONE:
      default:
        return targetUrl;
    }
  }

  /**
   * Encabezados HTTP obligatorios para iDempiere REST API
   * @param {string} [token] - Bearer token opcional
   * @returns {HeadersInit}
   */
  static getHeaders(token = null) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Modalidad 1: Login Directo / 1 Paso (Acceso Rapido)
   * Envia en una sola peticion las credenciales y el objeto parameters.
   * Cumple la directiva estricta de iDempiere: POST /api/v1/auth/tokens
   * 
   * @param {Object} credentials - { userName, password }
   * @param {Object} parameters - { clientId, roleId, organizationId, warehouseId, language }
   * @param {Object} options - { baseUrl, proxyConfig }
   * @returns {Promise<Object>} Datos de sesion contextualizados
   */
  static async loginDirect(credentials, parameters, options = {}) {
    const url = this.buildUrl(options.baseUrl, '/api/v1/auth/tokens', options.proxyConfig);

    // BLINDADO TECNICO: El objeto organizationId debe llamarse 'organizationId' (NUNCA orgId)
    // y debe estar estrictamente dentro de "parameters"
    const payload = {
      userName: credentials.userName?.trim(),
      password: credentials.password,
      parameters: {
        clientId: Number(parameters.clientId),
        roleId: Number(parameters.roleId),
        organizationId: Number(parameters.organizationId ?? parameters.orgId),
        warehouseId: Number(parameters.warehouseId),
        language: parameters.language || 'en_US'
      }
    };

    const startTime = Date.now();
    let response;
    let data;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      data = await response.json().catch(() => null);
    } catch (networkError) {
      throw new Error(
        `Error de red o CORS al contactar iDempiere (${url}). ` +
        `Sugerencia: Activa el Proxy CORS o el Proxy Local en la barra superior. Detalle: ${networkError.message}`
      );
    }

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || data?.title || `HTTP ${response.status} ${response.statusText}`;
      const err = new Error(`Error en autenticacion iDempiere (${response.status}): ${errorMsg}`);
      err.status = response.status;
      err.data = data;
      err.url = url;
      throw err;
    }

    // Normalizar objeto de sesion
    const token = data?.token;
    if (!token) {
      throw new Error('Respuesta de iDempiere no contiene token de autenticacion valido.');
    }

    const session = {
      token,
      userId: data.userId ?? data.user?.id ?? 101,
      userName: credentials.userName,
      password: credentials.password,
      clientId: data.clientId ?? payload.parameters.clientId,
      clientName: data.clientName ?? (payload.parameters.clientId === 11 ? 'GardenWorld' : `Client #${payload.parameters.clientId}`),
      roleId: data.roleId ?? payload.parameters.roleId,
      roleName: data.roleName ?? (payload.parameters.roleId === 102 ? 'GardenAdmin' : `Role #${payload.parameters.roleId}`),
      orgId: data.organizationId ?? payload.parameters.organizationId,
      organizationId: data.organizationId ?? payload.parameters.organizationId,
      organizationName: data.organizationName ?? (payload.parameters.organizationId === 11 ? 'HQ - Headquarters' : `Org #${payload.parameters.organizationId}`),
      warehouseId: data.warehouseId ?? payload.parameters.warehouseId,
      warehouseName: data.warehouseName ?? (payload.parameters.warehouseId === 103 ? 'HQ Warehouse' : `Warehouse #${payload.parameters.warehouseId}`),
      language: payload.parameters.language,
      baseUrl: options.baseUrl || DEFAULT_DEMO_CONFIG.baseUrl,
      loginAt: new Date().toISOString(),
      rawResponse: data,
      latencyMs: duration
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Modalidad 2 - Paso 1: Validar credenciales de usuario para descubrir tenants, roles y orgs
   * POST /api/v1/auth/tokens con solo userName y password
   * 
   * @param {Object} credentials - { userName, password }
   * @param {Object} options - { baseUrl, proxyConfig }
   * @returns {Promise<Object>} { token, clients, roles, raw }
   */
  static async loginStep1(credentials, options = {}) {
    const url = this.buildUrl(options.baseUrl, '/api/v1/auth/tokens', options.proxyConfig);

    const payload = {
      userName: credentials.userName?.trim(),
      password: credentials.password
    };

    let response;
    let data;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      data = await response.json().catch(() => null);
    } catch (networkError) {
      throw new Error(
        `Error de red o CORS al contactar iDempiere (${url}). ` +
        `Prueba activando el Proxy CORS. Detalle: ${networkError.message}`
      );
    }

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `HTTP ${response.status} ${response.statusText}`;
      const err = new Error(`Credenciales invalidas en iDempiere: ${errorMsg}`);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return {
      tempToken: data?.token,
      clients: data?.clients || [],
      roles: data?.roles || [],
      organizations: data?.organizations || [],
      warehouses: data?.warehouses || [],
      raw: data
    };
  }

  /**
   * Modalidad 2 - Paso 2: Confirmar contexto seleccionado y obtener token definitivo
   * Envia PUT con Bearer token a /api/v1/auth/tokens o POST con credenciales y contexto completo
   * 
   * @param {Object} credentials - { userName, password }
   * @param {string} tempToken - Token temporal obtenido en Paso 1 (si aplica)
   * @param {Object} selectedContext - { clientId, roleId, organizationId, warehouseId, language }
   * @param {Object} options - { baseUrl, proxyConfig }
   * @returns {Promise<Object>} Sesion final guardada
   */
  static async loginStep2(credentials, tempToken, selectedContext, options = {}) {
    const url = this.buildUrl(options.baseUrl, '/api/v1/auth/tokens', options.proxyConfig);

    const parameters = {
      clientId: Number(selectedContext.clientId),
      roleId: Number(selectedContext.roleId),
      organizationId: Number(selectedContext.organizationId ?? selectedContext.orgId),
      warehouseId: Number(selectedContext.warehouseId),
      language: selectedContext.language || 'en_US'
    };

    // Intentamos primero la llamada de confirmacion PUT /api/v1/auth/tokens si existe tempToken
    if (tempToken) {
      try {
        const putResponse = await fetch(url, {
          method: 'PUT',
          headers: this.getHeaders(tempToken),
          body: JSON.stringify(parameters)
        });

        if (putResponse.ok) {
          const putData = await putResponse.json().catch(() => null);
          const finalToken = putData?.token || tempToken;
          const session = {
            token: finalToken,
            userId: putData?.userId || null,
            userName: credentials?.userName,
            clientId: parameters.clientId,
            clientName: selectedContext.clientName || `Client #${parameters.clientId}`,
            roleId: parameters.roleId,
            roleName: selectedContext.roleName || `Role #${parameters.roleId}`,
            orgId: parameters.organizationId,
            organizationId: parameters.organizationId,
            organizationName: selectedContext.organizationName || `Org #${parameters.organizationId}`,
            warehouseId: parameters.warehouseId,
            warehouseName: selectedContext.warehouseName || `Warehouse #${parameters.warehouseId}`,
            language: parameters.language,
            baseUrl: options.baseUrl || DEFAULT_DEMO_CONFIG.baseUrl,
            loginAt: new Date().toISOString(),
            rawResponse: putData
          };
          this.saveSession(session);
          return session;
        }
      } catch (err) {
        console.warn('PUT /tokens no soportado o fallo, realizando fallback a POST directo:', err);
      }
    }

    // Fallback robusto garantizado: Login directo con credenciales + parametros seleccionados
    return this.loginDirect(credentials, parameters, options);
  }

  /**
   * Guarda de forma persistente la sesion en localStorage y sessionStorage
   * @param {Object} session 
   */
  static saveSession(session) {
    try {
      const serialized = JSON.stringify(session);
      localStorage.setItem(STORAGE_KEY, serialized);
      sessionStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.error('Error guardando sesion en almacenamiento local:', e);
    }
  }

  /**
   * Obtiene la sesion activa actual
   * @returns {Object|null}
   */
  static getSession() {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Verifica si existe una sesion autenticada con token no nulo
   * @returns {boolean}
   */
  static isAuthenticated() {
    const session = this.getSession();
    return Boolean(session && session.token);
  }

  /**
   * Purga el estado de autenticacion
   */
  static logout() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  static clearSession() {
    this.logout();
  }

  /**
   * Configuracion de servidor y proxy guardada por el usuario
   */
  static getStoredConfig() {
    try {
      const conf = localStorage.getItem(CONFIG_KEY);
      return conf ? JSON.parse(conf) : null;
    } catch {
      return null;
    }
  }

  static saveStoredConfig(config) {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Error guardando configuracion:', e);
    }
  }

  /**
   * Configuracion de Perfil de Administrador y parametros ERP (Imagen 4)
   */
  static getProfileConfig() {
    try {
      const conf = localStorage.getItem(PROFILE_CONFIG_KEY);
      if (conf) {
        return { ...DEFAULT_PROFILE_CONFIG, ...JSON.parse(conf) };
      }
    } catch {}
    return { ...DEFAULT_PROFILE_CONFIG };
  }

  static saveProfileConfig(config) {
    try {
      localStorage.setItem(PROFILE_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Error guardando configuracion de perfil:', e);
    }
  }
}

export function buildApiUrl(baseUrl, endpoint, proxyMode) {
  return AuthService.buildUrl(baseUrl, endpoint, typeof proxyMode === 'string' ? { mode: proxyMode } : proxyMode);
}

export function getSession() {
  return AuthService.getSession();
}

