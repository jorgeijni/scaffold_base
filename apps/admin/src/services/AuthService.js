/**
 * AuthService - Librería base reutilizable para autenticación contra iDempiere REST API v1.
 *
 * Diseñada sin dependencias de framework (compatible con React Admin Panel y futura PWA de Pedidos).
 * Implementa:
 *  - Autenticación Directa (1 Paso): POST /api/v1/auth/tokens con objeto anidado `parameters` y `organizationId`.
 *  - Autenticación Asistida (2 Pasos): POST /api/v1/auth/tokens -> GET /roles, /organizations, /warehouses -> PUT /api/v1/auth/tokens.
 *  - Persistencia de sesión contextualizada (token, userId, clientId, roleId, orgId, warehouseId, language).
 *  - Manejo configurable de Base URL y Proxy CORS (Directo, Proxy Local /api/idempiere/proxy, corsproxy.io o personalizado).
 */

const DEFAULT_SESSION_STORAGE_KEY = 'idempiere_auth_session';
const DEFAULT_CONFIG_STORAGE_KEY = 'idempiere_connection_config';

export const CORS_PROXY_PRESETS = {
  LOCAL: 'local',
  CORSPROXY_IO: 'corsproxy.io',
  CUSTOM: 'custom'
};

export const DEFAULT_LANGUAGES = [
  { code: 'en_US', name: 'English (US)' },
  { code: 'es_ES', name: 'Español (ES)' },
  { code: 'es_MX', name: 'Español (MX)' },
  { code: 'es_CO', name: 'Español (CO)' },
  { code: 'pt_BR', name: 'Português (BR)' }
];

export const GARDENWORLD_DEMO_PRESET = {
  baseUrl: 'https://test.idempiere.org:443',
  userName: 'admin @ gardenworld.com',
  password: 'GardenAdmin',
  parameters: {
    clientId: 11,
    roleId: 102,
    organizationId: 11,
    warehouseId: 103,
    language: 'en_US'
  },
  labels: {
    clientName: 'GardenWorld',
    roleName: 'Admin',
    orgName: 'HQ',
    warehouseName: 'HQ Warehouse'
  }
};

export class AuthService {
  constructor(options = {}) {
    this.sessionStorageKey = options.sessionStorageKey || DEFAULT_SESSION_STORAGE_KEY;
    this.configStorageKey = options.configStorageKey || DEFAULT_CONFIG_STORAGE_KEY;
    this.localProxyPath = options.localProxyPath || '/api/idempiere/proxy';
    this.listeners = new Set();

    this.config = this.loadConnectionConfig({
      baseUrl: options.baseUrl || GARDENWORLD_DEMO_PRESET.baseUrl,
      corsProxyEnabled: options.corsProxyEnabled ?? true,
      corsProxyMode: options.corsProxyMode || CORS_PROXY_PRESETS.LOCAL,
      corsProxyCustomUrl: options.corsProxyCustomUrl || 'https://corsproxy.io/?'
    });

    this.session = this.loadSession();
  }

  // =========================================================================
  // Suscripción reactiva (para AuthContext o PWA)
  // =========================================================================
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.session, this.config);
      } catch (err) {
        console.warn('[AuthService] Error en listener:', err);
      }
    }
  }

  // =========================================================================
  // Configuración de Conectividad (Base URL + Proxy CORS)
  // =========================================================================
  normalizeBaseUrl(url) {
    if (!url || typeof url !== 'string' || !url.trim()) {
      return GARDENWORLD_DEMO_PRESET.baseUrl;
    }
    let cleaned = url.trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(cleaned)) {
      const isLocal = /^(localhost|127\.0\.0\.1)(:|\/|$)/i.test(cleaned);
      cleaned = `${isLocal ? 'http' : 'https'}://${cleaned}`;
    }
    return cleaned;
  }

  loadConnectionConfig(defaults) {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(this.configStorageKey) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...defaults, ...parsed, baseUrl: this.normalizeBaseUrl(parsed.baseUrl || defaults.baseUrl) };
      }
    } catch {
      // Ignorar errores de almacenamiento corrupto
    }
    return { ...defaults, baseUrl: this.normalizeBaseUrl(defaults.baseUrl) };
  }

  getConnectionConfig() {
    return { ...this.config };
  }

  setConnectionConfig(partial = {}) {
    this.config = {
      ...this.config,
      ...partial,
      baseUrl: this.normalizeBaseUrl(partial.baseUrl ?? this.config.baseUrl)
    };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.configStorageKey, JSON.stringify(this.config));
      }
    } catch {
      // Ignorar si storage no está disponible
    }
    this.notify();
    return this.getConnectionConfig();
  }

  resolveUrl(endpointPath, overrideConfig = null) {
    const cfg = overrideConfig ? { ...this.config, ...overrideConfig } : this.config;
    const base = this.normalizeBaseUrl(cfg.baseUrl);
    const normalizedPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
    const directTarget = `${base}${normalizedPath}`;

    if (!cfg.corsProxyEnabled) {
      return { requestUrl: directTarget, targetUrl: directTarget, viaProxy: false };
    }

    if (cfg.corsProxyMode === CORS_PROXY_PRESETS.LOCAL) {
      return {
        requestUrl: `${this.localProxyPath}?url=${encodeURIComponent(directTarget)}`,
        targetUrl: directTarget,
        viaProxy: true,
        proxyType: CORS_PROXY_PRESETS.LOCAL
      };
    }

    const proxyPrefix =
      cfg.corsProxyMode === CORS_PROXY_PRESETS.CORSPROXY_IO
        ? 'https://corsproxy.io/?'
        : (cfg.corsProxyCustomUrl || 'https://corsproxy.io/?').trim();

    const proxiedUrl = proxyPrefix.includes('?') || proxyPrefix.endsWith('=')
      ? `${proxyPrefix}${encodeURIComponent(directTarget)}`
      : `${proxyPrefix.replace(/\/+$/, '')}/${directTarget}`;

    return {
      requestUrl: proxiedUrl,
      targetUrl: directTarget,
      viaProxy: true,
      proxyType: cfg.corsProxyMode
    };
  }

  // =========================================================================
  // Utilidades JWT & Parseo de Respuestas iDempiere
  // =========================================================================
  decodeJwt(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const json = new TextDecoder().decode(bytes);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  isTokenExpired(token) {
    const claims = this.decodeJwt(token);
    if (!claims || !claims.exp) return false;
    return Math.floor(Date.now() / 1000) >= Number(claims.exp);
  }

  async safeReadResponse(response) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  extractArray(data, candidateKeys = []) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return [];
    for (const key of candidateKeys) {
      if (Array.isArray(data[key])) return data[key];
    }
    return [];
  }

  normalizeNamedList(items) {
    return items.map((item) => ({
      id: item.id !== undefined ? Number(item.id) : item.AD_Client_ID ?? item.AD_Role_ID ?? item.AD_Org_ID ?? item.M_Warehouse_ID,
      name: item.name || item.Name || item.label || `ID ${item.id}`,
      description: item.description || ''
    })).filter((item) => item.id !== undefined && !Number.isNaN(item.id));
  }

  normalizeLanguagesList(data) {
    const rawList = this.extractArray(data, ['languages', 'records', 'data']);
    if (rawList.length > 0) {
      return rawList
        .map((lang) => {
          if (typeof lang === 'string') return { code: lang, name: lang };
          const code = lang.language || lang.AD_Language || lang.code || lang.id;
          const name = lang.name || lang.Name || code;
          return code ? { code, name } : null;
        })
        .filter(Boolean);
    }
    if (data && typeof data === 'object' && (data.language || data.AD_Language)) {
      const code = data.language || data.AD_Language;
      return [{ code, name: data.name || code }, ...DEFAULT_LANGUAGES.filter((l) => l.code !== code)];
    }
    return DEFAULT_LANGUAGES;
  }

  buildHttpError(status, data, targetUrl) {
    const detail = data?.detail || data?.message || data?.error || data?.title || null;
    let message = `No se pudo completar la autenticación (código ${status}).`;
    if (status === 400) message = 'Los datos de acceso o sede proporcionados no son válidos.';
    if (status === 401) message = 'Usuario o contraseña incorrectos, o sesión expirada.';
    if (status === 403) message = 'Tu cuenta no cuenta con permisos para la sede u organización seleccionada.';
    if (status === 404) message = 'El servicio de autenticación no respondió en la dirección configurada.';

    const err = new Error(message);
    err.status = status;
    err.detail = detail;
    err.targetUrl = targetUrl;
    err.raw = data;
    return err;
  }

  buildNetworkError(err, viaProxy, targetUrl) {
    const hint = viaProxy
      ? 'No se pudo establecer comunicación con el servicio de autenticación a través del puente de red.'
      : 'No se pudo conectar con el servidor de autenticación. Verifica tu red o habilita el puente de conexión en opciones avanzadas.';
    const wrapped = new Error(hint);
    wrapped.status = 0;
    wrapped.detail = err?.message || 'Network / CORS error';
    wrapped.targetUrl = targetUrl;
    return wrapped;
  }

  async requestJson(endpointPath, { method = 'GET', body = null, token = null, connectionConfig = null, timeoutMs = 15000 } = {}) {
    const { requestUrl, targetUrl, viaProxy } = this.resolveUrl(endpointPath, connectionConfig);
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    try {
      const startTime = Date.now();
      const response = await fetch(requestUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;
      const data = await this.safeReadResponse(response);

      if (!response.ok) {
        throw this.buildHttpError(response.status, data, targetUrl);
      }

      return { data, status: response.status, latencyMs, targetUrl, viaProxy };
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      if (err.status !== undefined) throw err;
      throw this.buildNetworkError(err, viaProxy, targetUrl);
    }
  }

  // =========================================================================
  // Validación estricta de payload iDempiere v1
  // =========================================================================
  buildOneStepPayload({ userName, password, parameters = {} }) {
    if (!userName || !String(userName).trim()) {
      throw new Error('El campo "userName" es obligatorio.');
    }
    if (!password) {
      throw new Error('El campo "password" es obligatorio.');
    }

    // Regla estricta: organizationId (NUNCA orgId) dentro de objeto anidado parameters
    const organizationId = parameters.organizationId !== undefined
      ? Number(parameters.organizationId)
      : Number(parameters.orgId ?? 0);

    const parsedParams = {
      clientId: Number(parameters.clientId),
      roleId: Number(parameters.roleId),
      organizationId,
      language: parameters.language || 'en_US'
    };

    if (parameters.warehouseId !== undefined && parameters.warehouseId !== null && parameters.warehouseId !== '') {
      const whNum = Number(parameters.warehouseId);
      if (!Number.isNaN(whNum)) parsedParams.warehouseId = whNum;
    }

    if (Number.isNaN(parsedParams.clientId) || Number.isNaN(parsedParams.roleId) || Number.isNaN(parsedParams.organizationId)) {
      throw new Error('Los IDs de Client, Role y Organization deben ser numéricos válidos.');
    }

    return {
      userName: String(userName).trim(),
      password: String(password),
      parameters: parsedParams
    };
  }

  buildStepTwoParameters(parameters = {}) {
    const organizationId = parameters.organizationId !== undefined
      ? Number(parameters.organizationId)
      : Number(parameters.orgId ?? 0);

    const body = {
      clientId: Number(parameters.clientId),
      roleId: Number(parameters.roleId),
      organizationId,
      language: parameters.language || 'en_US'
    };

    if (parameters.warehouseId !== undefined && parameters.warehouseId !== null && parameters.warehouseId !== '') {
      const whNum = Number(parameters.warehouseId);
      if (!Number.isNaN(whNum)) body.warehouseId = whNum;
    }

    return body;
  }

  // =========================================================================
  // Modalidad 1: Login Directo / 1 Paso (POST /api/v1/auth/tokens)
  // =========================================================================
  async loginDirect({ userName, password, parameters, baseUrl, corsProxy, labels = {} }) {
    const connectionOverride = {
      ...(baseUrl ? { baseUrl } : {}),
      ...(corsProxy || {})
    };
    const payload = this.buildOneStepPayload({ userName, password, parameters });

    const { data, latencyMs, targetUrl, viaProxy } = await this.requestJson('/api/v1/auth/tokens', {
      method: 'POST',
      body: payload,
      connectionConfig: connectionOverride
    });

    const token = data.token || data.access_token;
    if (!token || typeof token !== 'string') {
      throw new Error('El servidor respondió sin un token de sesión válido.');
    }

    return this.persistSessionFromAuth({
      token,
      refreshToken: data.refresh_token || data.refreshToken || null,
      responseData: data,
      userName: payload.userName,
      parameters: payload.parameters,
      labels,
      authMode: 'one_step',
      targetUrl,
      viaProxy,
      latencyMs,
      connectionOverride
    });
  }

  // =========================================================================
  // Modalidad 2: Login Asistido en 2 Pasos (Multitenant Dinámico)
  // =========================================================================
  async loginStepOne({ userName, password, baseUrl, corsProxy }) {
    if (!userName || !String(userName).trim() || !password) {
      throw new Error('Debes ingresar usuario y contraseña para iniciar la validación.');
    }

    const connectionOverride = {
      ...(baseUrl ? { baseUrl } : {}),
      ...(corsProxy || {})
    };

    const { data, latencyMs, targetUrl, viaProxy } = await this.requestJson('/api/v1/auth/tokens', {
      method: 'POST',
      body: {
        userName: String(userName).trim(),
        password: String(password)
      },
      connectionConfig: connectionOverride
    });

    const tempToken = data.token || data.access_token;
    if (!tempToken) {
      throw new Error('No se recibió el token de verificación inicial.');
    }

    const claims = this.decodeJwt(tempToken);
    const clients = this.normalizeNamedList(this.extractArray(data, ['clients']));

    // Si Paso 1 devolvió roles directamente, usarlos; si no, consultar /api/v1/auth/roles
    let roles = this.normalizeNamedList(this.extractArray(data, ['roles']));
    let organizations = this.normalizeNamedList(this.extractArray(data, ['organizations']));
    let warehouses = this.normalizeNamedList(this.extractArray(data, ['warehouses']));
    let languages = this.extractArray(data, ['languages']).length > 0
      ? this.normalizeLanguagesList(data)
      : null;

    const defaultClientId = clients[0]?.id ?? null;

    if (roles.length === 0 && defaultClientId !== null) {
      roles = await this.fetchRoles(tempToken, defaultClientId, connectionOverride);
    }

    const defaultRoleId = roles[0]?.id ?? null;
    if (organizations.length === 0 && defaultClientId !== null && defaultRoleId !== null) {
      organizations = await this.fetchOrganizations(tempToken, defaultClientId, defaultRoleId, connectionOverride);
    }

    const defaultOrgId = organizations[0]?.id ?? null;
    if (warehouses.length === 0 && defaultClientId !== null && defaultRoleId !== null && defaultOrgId !== null) {
      warehouses = await this.fetchWarehouses(tempToken, defaultClientId, defaultRoleId, defaultOrgId, connectionOverride);
    }

    if (!languages) {
      languages = await this.fetchLanguages(tempToken, connectionOverride);
    }

    return {
      tempToken,
      userName: String(userName).trim(),
      userId: data.userId ?? data.AD_User_ID ?? claims?.AD_User_ID ?? claims?.userId ?? null,
      clients,
      roles,
      organizations,
      warehouses,
      languages,
      defaultParameters: {
        clientId: defaultClientId,
        roleId: defaultRoleId,
        organizationId: defaultOrgId,
        warehouseId: warehouses[0]?.id ?? '',
        language: languages[0]?.code || 'en_US'
      },
      targetUrl,
      viaProxy,
      latencyMs
    };
  }

  async fetchRoles(tempToken, clientId, connectionOverride = null) {
    if (clientId === null || clientId === undefined || clientId === '') return [];
    const { data } = await this.requestJson(`/api/v1/auth/roles?client=${encodeURIComponent(clientId)}`, {
      method: 'GET',
      token: tempToken,
      connectionConfig: connectionOverride
    });
    return this.normalizeNamedList(this.extractArray(data, ['roles', 'records', 'data']));
  }

  async fetchOrganizations(tempToken, clientId, roleId, connectionOverride = null) {
    if (clientId === null || roleId === null || clientId === '' || roleId === '') return [];
    const query = `client=${encodeURIComponent(clientId)}&role=${encodeURIComponent(roleId)}`;
    const { data } = await this.requestJson(`/api/v1/auth/organizations?${query}`, {
      method: 'GET',
      token: tempToken,
      connectionConfig: connectionOverride
    });
    return this.normalizeNamedList(this.extractArray(data, ['organizations', 'records', 'data']));
  }

  async fetchWarehouses(tempToken, clientId, roleId, organizationId, connectionOverride = null) {
    if (clientId === null || roleId === null || organizationId === null) return [];
    const query = `client=${encodeURIComponent(clientId)}&role=${encodeURIComponent(roleId)}&organization=${encodeURIComponent(organizationId)}`;
    try {
      const { data } = await this.requestJson(`/api/v1/auth/warehouses?${query}`, {
        method: 'GET',
        token: tempToken,
        connectionConfig: connectionOverride
      });
      return this.normalizeNamedList(this.extractArray(data, ['warehouses', 'records', 'data']));
    } catch {
      return [];
    }
  }

  async fetchLanguages(tempToken, connectionOverride = null) {
    try {
      const { data } = await this.requestJson('/api/v1/auth/language', {
        method: 'GET',
        token: tempToken,
        connectionConfig: connectionOverride
      });
      return this.normalizeLanguagesList(data);
    } catch {
      return DEFAULT_LANGUAGES;
    }
  }

  async loginStepTwo({ tempToken, parameters, userName, baseUrl, corsProxy, labels = {} }) {
    if (!tempToken) {
      throw new Error('Token temporal del Paso 1 no encontrado.');
    }

    const connectionOverride = {
      ...(baseUrl ? { baseUrl } : {}),
      ...(corsProxy || {})
    };
    const putBody = this.buildStepTwoParameters(parameters);

    const { data, latencyMs, targetUrl, viaProxy } = await this.requestJson('/api/v1/auth/tokens', {
      method: 'PUT',
      token: tempToken,
      body: putBody,
      connectionConfig: connectionOverride
    });

    const finalToken = data.token || data.access_token;
    if (!finalToken || typeof finalToken !== 'string') {
      throw new Error('El servidor no devolvió el token de sesión definitivo.');
    }

    return this.persistSessionFromAuth({
      token: finalToken,
      refreshToken: data.refresh_token || data.refreshToken || null,
      responseData: data,
      userName: userName || data.userName || 'Administrador',
      parameters: putBody,
      labels,
      authMode: 'two_step',
      targetUrl,
      viaProxy,
      latencyMs,
      connectionOverride
    });
  }

  // =========================================================================
  // Gestión y Persistencia de Sesión Contextualizada
  // =========================================================================
  persistSessionFromAuth({
    token,
    refreshToken,
    responseData,
    userName,
    parameters,
    labels = {},
    authMode,
    targetUrl,
    viaProxy,
    latencyMs,
    connectionOverride
  }) {
    const claims = this.decodeJwt(token) || {};

    const userId = responseData?.userId ?? responseData?.AD_User_ID ?? claims.AD_User_ID ?? claims.userId ?? claims.sub ?? null;
    const clientId = Number(responseData?.clientId ?? claims.AD_Client_ID ?? parameters.clientId);
    const roleId = Number(responseData?.roleId ?? claims.AD_Role_ID ?? parameters.roleId);
    const orgId = Number(responseData?.organizationId ?? responseData?.orgId ?? claims.AD_Org_ID ?? parameters.organizationId);
    const rawWh = responseData?.warehouseId ?? claims.M_Warehouse_ID ?? parameters.warehouseId ?? null;
    const warehouseId = rawWh !== null && rawWh !== '' && !Number.isNaN(Number(rawWh)) ? Number(rawWh) : null;
    const language = responseData?.language ?? claims.AD_Language ?? parameters.language ?? 'en_US';

    const effectiveCfg = this.setConnectionConfig(connectionOverride || {});

    const session = {
      token,
      refreshToken: refreshToken || null,
      userId,
      userName,
      clientId,
      roleId,
      orgId,
      organizationId: orgId,
      warehouseId,
      language,
      clientName: labels.clientName || `Client #${clientId}`,
      roleName: labels.roleName || `Role #${roleId}`,
      orgName: labels.orgName || (orgId === 0 ? '*' : `Org #${orgId}`),
      warehouseName: labels.warehouseName || (warehouseId !== null ? `Warehouse #${warehouseId}` : 'Sin Almacén'),
      authMode,
      endpoint: targetUrl,
      baseUrl: effectiveCfg.baseUrl,
      corsProxyEnabled: effectiveCfg.corsProxyEnabled,
      corsProxyMode: effectiveCfg.corsProxyMode,
      corsProxyCustomUrl: effectiveCfg.corsProxyCustomUrl,
      viaProxy,
      latencyMs,
      claims,
      expiresAt: claims.exp ? Number(claims.exp) * 1000 : null,
      savedAt: Date.now()
    };

    this.session = session;
    this.saveSessionToStorage(session);
    this.notify();
    return session;
  }

  saveSessionToStorage(session) {
    const serialized = JSON.stringify(session);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.sessionStorageKey, serialized);
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(this.sessionStorageKey, serialized);
      }
    } catch (err) {
      console.warn('[AuthService] No se pudo guardar la sesión:', err);
    }
  }

  loadSession() {
    try {
      const raw =
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(this.sessionStorageKey)) ||
        (typeof localStorage !== 'undefined' && localStorage.getItem(this.sessionStorageKey));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.token) return null;
      if (this.isTokenExpired(parsed.token)) {
        this.clearStorage();
        return null;
      }
      return parsed;
    } catch {
      this.clearStorage();
      return null;
    }
  }

  clearStorage() {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(this.sessionStorageKey);
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(this.sessionStorageKey);
    } catch {
      // Ignorar errores de storage
    }
  }

  getSession() {
    if (this.session && this.isTokenExpired(this.session.token)) {
      this.logout();
      return null;
    }
    return this.session;
  }

  getToken() {
    return this.getSession()?.token || null;
  }

  getContext() {
    const s = this.getSession();
    if (!s) return null;
    return {
      userId: s.userId,
      clientId: s.clientId,
      roleId: s.roleId,
      orgId: s.orgId,
      organizationId: s.organizationId,
      warehouseId: s.warehouseId,
      language: s.language
    };
  }

  isAuthenticated() {
    const s = this.getSession();
    return !!(s && s.token && !this.isTokenExpired(s.token));
  }

  getAuthHeaders() {
    const token = this.getToken();
    if (!token) return {};
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async testConnection(overrideConfig = null) {
    const { requestUrl, targetUrl, viaProxy, proxyType } = this.resolveUrl('/api/v1/auth/tokens', overrideConfig);
    const startTime = Date.now();
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;
      const probeMethod = viaProxy && proxyType !== CORS_PROXY_PRESETS.LOCAL ? 'GET' : 'OPTIONS';
      const res = await fetch(requestUrl, {
        method: probeMethod,
        headers: { 'Accept': 'application/json' },
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const reachable = res.status > 0 && res.status !== 404 && res.status < 500;
      return {
        online: reachable,
        status: res.status,
        latencyMs,
        targetUrl,
        viaProxy,
        message: reachable
          ? `Servicio de autenticación disponible (HTTP ${res.status}).`
          : `El servidor respondió HTTP ${res.status} al verificar disponibilidad.`
      };
    } catch (err) {
      return {
        online: false,
        status: 0,
        latencyMs: Date.now() - startTime,
        targetUrl,
        viaProxy,
        error: err.message,
        message: viaProxy
          ? `Sin respuesta del servidor vía puente de conexión (${err.message}).`
          : `Error de red o CORS al consultar el servidor. Activa el puente de conexión en opciones avanzadas.`
      };
    }
  }

  logout() {
    this.session = null;
    this.clearStorage();
    this.notify();
  }
}

export const authService = new AuthService();
export default authService;
