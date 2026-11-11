/**
 * iDempiere REST API v1 Authentication & Gateway Service
 *
 * Reglas estrictas de integración iDempiere v1:
 * 1. Endpoint base: POST /api/v1/auth/tokens (plural obligatorio)
 * 2. Cabeceras obligatorias: Content-Type: application/json, Accept: application/json
 * 3. Payload 1 Paso: parameters anidados con organizationId (nunca orgId)
 * 4. Flujo 2 Pasos: POST /api/v1/auth/tokens -> GET /roles, /organizations, /warehouses -> PUT /api/v1/auth/tokens
 * 5. Política de acceso: cualquier usuario con credenciales activas (200 OK + token válido) es autorizado.
 */

const DEFAULT_BASE_URL = process.env.IDEMPIERE_BASE_URL || 'https://test.idempiere.org:443';
const DEFAULT_TIMEOUT_MS = 10000;

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

  decodeJwtClaims(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
      return JSON.parse(payloadJson);
    } catch {
      return null;
    }
  }

  async parseResponse(response) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  extractList(data, keys = []) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return [];
    for (const k of keys) {
      if (Array.isArray(data[k])) return data[k];
    }
    return [];
  }

  async fetchJson(url, { method = 'GET', token = null, body = null } = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await this.parseResponse(response);
      return { response, data };
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Paso 1: Valida credenciales contra POST /api/v1/auth/tokens
   * y obtiene clientes, roles, organizaciones y almacenes disponibles.
   */
  async authenticate({ userName, password, baseUrl }) {
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
      const { response, data } = await this.fetchJson(endpoint, {
        method: 'POST',
        body: { userName: userName.trim(), password }
      });
      const latencyMs = Date.now() - startTime;

      if (!response.ok || !data.token) {
        return {
          success: false,
          status: response.status || 401,
          error:
            response.status === 401
              ? 'HTTP 401 Unauthorized: Usuario o contraseña incorrectos en iDempiere.'
              : data.detail || data.message || 'Error de autenticación en iDempiere.',
          detail: data.detail || data.message || 'Credenciales rechazadas.',
          endpoint,
          latencyMs
        };
      }

      const tempToken = data.token;
      const claims = this.decodeJwtClaims(tempToken) || {};
      const clients = this.extractList(data, ['clients']);
      let roles = this.extractList(data, ['roles']);
      let organizations = this.extractList(data, ['organizations']);
      let warehouses = this.extractList(data, ['warehouses']);

      const defaultClientId = clients[0]?.id;
      if (roles.length === 0 && defaultClientId !== undefined) {
        const rolesRes = await this.fetchJson(`${targetBaseUrl}/api/v1/auth/roles?client=${encodeURIComponent(defaultClientId)}`, {
          token: tempToken
        });
        if (rolesRes.response.ok) {
          roles = this.extractList(rolesRes.data, ['roles', 'records', 'data']);
        }
      }

      const defaultRoleId = roles[0]?.id;
      if (organizations.length === 0 && defaultClientId !== undefined && defaultRoleId !== undefined) {
        const orgRes = await this.fetchJson(
          `${targetBaseUrl}/api/v1/auth/organizations?client=${encodeURIComponent(defaultClientId)}&role=${encodeURIComponent(defaultRoleId)}`,
          { token: tempToken }
        );
        if (orgRes.response.ok) {
          organizations = this.extractList(orgRes.data, ['organizations', 'records', 'data']);
        }
      }

      const defaultOrgId = organizations[0]?.id;
      if (warehouses.length === 0 && defaultClientId !== undefined && defaultRoleId !== undefined && defaultOrgId !== undefined) {
        const whRes = await this.fetchJson(
          `${targetBaseUrl}/api/v1/auth/warehouses?client=${encodeURIComponent(defaultClientId)}&role=${encodeURIComponent(defaultRoleId)}&organization=${encodeURIComponent(defaultOrgId)}`,
          { token: tempToken }
        );
        if (whRes.response.ok) {
          warehouses = this.extractList(whRes.data, ['warehouses', 'records', 'data']);
        }
      }

      return {
        success: true,
        mode: 'live',
        userName: userName.trim(),
        userId: data.userId ?? claims.AD_User_ID ?? claims.userId ?? null,
        tempToken,
        clients,
        roles,
        organizations,
        warehouses,
        languages: this.extractList(data, ['languages']),
        defaultParameters: {
          clientId: defaultClientId,
          roleId: defaultRoleId,
          organizationId: defaultOrgId,
          warehouseId: warehouses[0]?.id ?? null,
          language: 'en_US'
        },
        endpoint,
        latencyMs
      };
    } catch (networkError) {
      return {
        success: false,
        status: 503,
        error: `No se pudo conectar al servidor iDempiere en "${targetBaseUrl}".`,
        detail: networkError.message,
        endpoint,
        latencyMs: Date.now() - startTime
      };
    }
  }

  buildLoginPayload({ userName, password, parameters = {} }) {
    if (!userName || typeof userName !== 'string') {
      throw new Error('El parámetro "userName" es obligatorio.');
    }
    if (!password || typeof password !== 'string') {
      throw new Error('El parámetro "password" es obligatorio.');
    }

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
      parsedParams.warehouseId = Number(parameters.warehouseId);
    }

    return {
      userName: userName.trim(),
      password,
      parameters: parsedParams
    };
  }

  /**
   * Login Directo (POST) o Finalización Paso 2 (PUT con tempToken)
   */
  async login({ userName, password, parameters = {}, baseUrl, tempToken = null }) {
    const targetBaseUrl = this.normalizeBaseUrl(baseUrl);
    const endpoint = `${targetBaseUrl}/api/v1/auth/tokens`;
    const startTime = Date.now();

    try {
      let response;
      let responseData;
      const organizationId = parameters.organizationId !== undefined
        ? Number(parameters.organizationId)
        : Number(parameters.orgId ?? 0);

      if (tempToken) {
        const putBody = {
          clientId: Number(parameters.clientId),
          roleId: Number(parameters.roleId),
          organizationId,
          language: parameters.language || 'en_US'
        };
        if (parameters.warehouseId !== undefined && parameters.warehouseId !== null && parameters.warehouseId !== '') {
          putBody.warehouseId = Number(parameters.warehouseId);
        }
        ({ response, data: responseData } = await this.fetchJson(endpoint, {
          method: 'PUT',
          token: tempToken,
          body: putBody
        }));
      } else {
        const payload = this.buildLoginPayload({ userName, password, parameters });
        ({ response, data: responseData } = await this.fetchJson(endpoint, {
          method: 'POST',
          body: payload
        }));
      }

      const latencyMs = Date.now() - startTime;
      const token = responseData.token || responseData.access_token;

      if (response.ok && token) {
        const claims = this.decodeJwtClaims(token) || {};
        return {
          success: true,
          mode: 'live',
          endpoint,
          latencyMs,
          token,
          refreshToken: responseData.refresh_token || responseData.refreshToken || null,
          user: {
            userId: responseData.userId ?? claims.AD_User_ID ?? claims.userId ?? null,
            userName: (userName || responseData.userName || 'Usuario iDempiere').trim(),
            clientId: Number(responseData.clientId ?? claims.AD_Client_ID ?? parameters.clientId),
            roleId: Number(responseData.roleId ?? claims.AD_Role_ID ?? parameters.roleId),
            orgId: Number(responseData.organizationId ?? claims.AD_Org_ID ?? organizationId),
            organizationId: Number(responseData.organizationId ?? claims.AD_Org_ID ?? organizationId),
            warehouseId: responseData.warehouseId ?? claims.M_Warehouse_ID ?? parameters.warehouseId ?? null,
            language: responseData.language ?? claims.AD_Language ?? parameters.language ?? 'en_US'
          },
          rawResponse: responseData
        };
      }

      return {
        success: false,
        status: response.status || 401,
        error:
          response.status === 401
            ? 'HTTP 401 Unauthorized: Usuario o contraseña incorrectos en iDempiere.'
            : response.status === 403
              ? 'HTTP 403 Forbidden: El rol u organización no están asignados a este usuario.'
              : responseData.detail || responseData.message || 'Error al iniciar sesión en iDempiere ERP.',
        detail: responseData.detail || responseData.message || JSON.stringify(responseData),
        endpoint,
        latencyMs
      };
    } catch (networkError) {
      return {
        success: false,
        status: 503,
        error: `No se pudo establecer conexión con el servidor iDempiere en "${targetBaseUrl}".`,
        detail: networkError.message,
        endpoint,
        latencyMs: Date.now() - startTime
      };
    }
  }

  async ping({ baseUrl }) {
    const targetBaseUrl = this.normalizeBaseUrl(baseUrl);
    const endpoint = `${targetBaseUrl}/api/v1/auth/tokens`;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(endpoint, {
        method: 'OPTIONS',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const reachable = response.status > 0 && response.status !== 404 && response.status < 500;

      return {
        online: reachable,
        status: response.status,
        latencyMs,
        targetBaseUrl,
        endpoint,
        message: reachable
          ? `Servidor iDempiere REST API v1 alcanzable (HTTP ${response.status}).`
          : `Endpoint /api/v1/auth/tokens respondió HTTP ${response.status}.`
      };
    } catch (err) {
      return {
        online: false,
        status: 0,
        latencyMs: Date.now() - startTime,
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

    const payload = this.decodeJwtClaims(token);
    if (payload) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return { valid: false, expired: true, error: 'Token de sesión expirado' };
      }
      return {
        valid: true,
        expired: false,
        payload,
        user: {
          userId: payload.AD_User_ID ?? payload.userId ?? payload.sub ?? null,
          clientId: payload.AD_Client_ID ?? payload.clientId ?? null,
          roleId: payload.AD_Role_ID ?? payload.roleId ?? null,
          orgId: payload.AD_Org_ID ?? payload.organizationId ?? null,
          organizationId: payload.AD_Org_ID ?? payload.organizationId ?? null,
          warehouseId: payload.M_Warehouse_ID ?? payload.warehouseId ?? null
        }
      };
    }

    return { valid: true, opaque: true, token };
  }
}

module.exports = new IdempiereService();
