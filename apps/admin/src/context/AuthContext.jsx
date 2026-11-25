import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEFAULT_GARDENWORLD_PARAMS,
  loginDirect as serviceLoginDirect,
  requestContextStep1 as serviceRequestContextStep1,
  completeLoginStep2 as serviceCompleteLoginStep2,
  saveSession,
  loadSession,
  clearSession
} from '../services/idempiereAuthService';
import { AuthService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Inicialización de sesión desde almacenamiento persistente
  const [auth, setAuth] = useState(() => {
    return loadSession();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // Modalidad de autenticación seleccionada: 'direct' (1 Paso) | 'assisted' (2 Pasos)
  const [loginMode, setLoginMode] = useState('direct');

  // Modo de conexión: 'proxy' (Backend Local/Cloud - Recomendado) | 'direct' (REST Directo al ERP)
  const [connectionMode, setConnectionMode] = useState('proxy');

  // URL Base editable de iDempiere (sin puerto :443 redundante)
  const [erpBaseUrl, setErpBaseUrl] = useState(() => {
    const raw = auth?.erpBaseUrl || DEFAULT_GARDENWORLD_PARAMS.erpBaseUrl;
    return (raw || '').replace(/:443$/, '');
  });

  // Guardar en almacenamiento cada vez que cambie auth
  useEffect(() => {
    if (auth && auth.token) {
      saveSession(auth);
      AuthService.saveSession(auth);
    } else {
      clearSession();
      AuthService.logout();
    }
  }, [auth]);

  /**
   * Construye el objeto unificado de sesión
   */
  const buildNormalizedSession = (authData, credentials, connMode) => {
    const params = authData.parameters || credentials.parameters || {};
    const normOrgId = Number(params.organizationId ?? params.orgId ?? 11);
    const normClientId = Number(params.clientId ?? 11);
    const normRoleId = Number(params.roleId ?? 102);
    const normWarehouseId = Number(params.warehouseId ?? 103);
    const normLanguage = params.language || 'es_PE';

    return {
      token: authData.token,
      tokenType: authData.tokenType || 'Bearer',
      userId: authData.userId || 100,
      userName: authData.userName || credentials.userName || 'admin @ gardenworld.com',
      password: credentials.password || authData.password || 'GardenAdmin',
      // Contexto canónico exigido por el negocio
      clientId: normClientId,
      roleId: normRoleId,
      organizationId: normOrgId,
      orgId: normOrgId, // Compatibilidad
      warehouseId: normWarehouseId,
      language: normLanguage,
      // Metadatos descriptivos
      clientName: authData.client?.name || 'GardenWorld, Inc.',
      roleName: authData.role?.name || (normRoleId === 102 ? 'GardenAdmin' : `Rol #${normRoleId}`),
      orgName: authData.organization?.name || `HQ Org #${normOrgId}`,
      warehouseName: authData.warehouse?.name || `Almacén #${normWarehouseId}`,
      simulated: Boolean(authData.simulated),
      simulatedReason: authData.simulatedReason,
      erpBaseUrl: credentials.erpBaseUrl || erpBaseUrl,
      baseUrl: credentials.erpBaseUrl || erpBaseUrl, // Compatibilidad
      connectionMode: connMode,
      parameters: {
        clientId: normClientId,
        roleId: normRoleId,
        organizationId: normOrgId,
        warehouseId: normWarehouseId,
        language: normLanguage
      },
      audit: authData.audit || {
        endpointCalled: '/api/v1/auth/tokens',
        connectionMode: connMode,
        timestamp: new Date().toISOString()
      },
      loginTime: new Date().toISOString(),
      loginAt: new Date().toISOString()
    };
  };

  /**
   * Modalidad 1: Login Directo en 1 Paso
   */
  const loginDirect = async (credentials, overrideConnMode) => {
    setIsLoading(true);
    setAuthError(null);
    const activeMode = overrideConnMode || connectionMode;

    try {
      const authData = await serviceLoginDirect(credentials, activeMode);
      const session = buildNormalizedSession(authData, credentials, activeMode);
      setAuth(session);
      setIsLoading(false);
      return { success: true, session, ...session };
    } catch (err) {
      setIsLoading(false);
      const message = err.message || 'Error al autenticar con iDempiere ERP';
      setAuthError(message);
      return { success: false, error: message, details: err.details };
    }
  };

  /**
   * Modalidad 2 (Paso 1): Consulta de Contexto Multitenant
   */
  const requestContextStep1 = async (credentials, overrideConnMode) => {
    setIsLoading(true);
    setAuthError(null);
    const activeMode = overrideConnMode || connectionMode;

    try {
      const result = await serviceRequestContextStep1(credentials, activeMode);
      setIsLoading(false);
      return { success: true, authenticated: false, contextData: result, ...result };
    } catch (err) {
      setIsLoading(false);
      const message = err.message || 'Error al consultar contexto multitenant';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Modalidad 2 (Paso 2): Confirmación de Contexto y Emisión de Token
   */
  const completeLoginStep2 = async (credentials, selectedContext, overrideConnMode) => {
    setIsLoading(true);
    setAuthError(null);
    const activeMode = overrideConnMode || connectionMode;

    try {
      const authData = await serviceCompleteLoginStep2(credentials, selectedContext, activeMode);
      const session = buildNormalizedSession(
        authData,
        { ...credentials, parameters: selectedContext },
        activeMode
      );
      setAuth(session);
      setIsLoading(false);
      return { success: true, session, ...session };
    } catch (err) {
      setIsLoading(false);
      const message = err.message || 'Error al completar inicio de sesión en iDempiere';
      setAuthError(message);
      return { success: false, error: message, details: err.details };
    }
  };

  /**
   * Cierre de sesión y purga de almacenamiento local
   */
  const logout = () => {
    setAuth(null);
    setAuthError(null);
    clearSession();
    AuthService.logout();
  };

  const value = {
    auth,
    session: auth, // Alias para componentes de RapidFood
    isAuthenticated: Boolean(auth?.token),
    isLoading,
    loading: isLoading, // Alias
    authError,
    setAuthError,
    clearError: () => setAuthError(null),
    loginMode,
    setLoginMode,
    connectionMode,
    setConnectionMode,
    proxyMode: connectionMode === 'direct' ? 'none' : 'local',
    setProxyMode: (mode) => setConnectionMode(mode === 'none' ? 'direct' : 'proxy'),
    baseUrl: erpBaseUrl,
    setBaseUrl: setErpBaseUrl,
    erpBaseUrl,
    setErpBaseUrl,
    loginDirect,
    requestContextStep1,
    loginStep1: requestContextStep1, // Alias
    completeLoginStep2,
    loginStep2: completeLoginStep2, // Alias
    logout,
    isInspectorOpen,
    setIsInspectorOpen,
    isTokenModalOpen,
    setIsTokenModalOpen,
    defaultParams: DEFAULT_GARDENWORLD_PARAMS
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
