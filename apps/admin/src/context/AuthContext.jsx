import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/AuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession());
  const [connectionConfig, setConnectionConfig] = useState(() => authService.getConnectionConfig());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(authService.getSession());
    setConnectionConfig(authService.getConnectionConfig());
    setIsLoading(false);

    const unsubscribe = authService.subscribe((nextSession, nextConfig) => {
      setSession(nextSession);
      setConnectionConfig(nextConfig);
    });

    return unsubscribe;
  }, []);

  const updateConnectionConfig = (partial) => {
    return authService.setConnectionConfig(partial);
  };

  const loginDirect = async (params) => {
    return authService.loginDirect(params);
  };

  const loginStepOne = async (params) => {
    return authService.loginStepOne(params);
  };

  const loginStepTwo = async (params) => {
    return authService.loginStepTwo(params);
  };

  const fetchRoles = async (tempToken, clientId, overrideConfig = null) => {
    return authService.fetchRoles(tempToken, clientId, overrideConfig);
  };

  const fetchOrganizations = async (tempToken, clientId, roleId, overrideConfig = null) => {
    return authService.fetchOrganizations(tempToken, clientId, roleId, overrideConfig);
  };

  const fetchWarehouses = async (tempToken, clientId, roleId, organizationId, overrideConfig = null) => {
    return authService.fetchWarehouses(tempToken, clientId, roleId, organizationId, overrideConfig);
  };

  const logout = () => {
    authService.logout();
    fetch('/api/idempiere/logout', { method: 'POST' }).catch(() => {});
  };

  const pingErp = async (overrideConfig = null) => {
    return authService.testConnection(overrideConfig);
  };

  const getAuthHeaders = () => {
    return authService.getAuthHeaders();
  };

  const user = session
    ? {
        userId: session.userId,
        userName: session.userName,
        clientId: session.clientId,
        roleId: session.roleId,
        orgId: session.orgId,
        organizationId: session.organizationId,
        warehouseId: session.warehouseId,
        language: session.language,
        clientName: session.clientName,
        roleName: session.roleName,
        orgName: session.orgName,
        warehouseName: session.warehouseName
      }
    : null;

  const isAuthenticated = Boolean(session?.token && !authService.isTokenExpired(session.token));

  const value = {
    session,
    user,
    token: session?.token || null,
    refreshToken: session?.refreshToken || null,
    isAuthenticated,
    isLoading,
    userId: session?.userId ?? null,
    clientId: session?.clientId ?? null,
    roleId: session?.roleId ?? null,
    orgId: session?.orgId ?? null,
    organizationId: session?.organizationId ?? null,
    warehouseId: session?.warehouseId ?? null,
    language: session?.language ?? null,
    authMode: session?.authMode || null,
    erpEndpoint: session?.endpoint || '/api/v1/auth/tokens',
    erpBaseUrl: session?.baseUrl || connectionConfig.baseUrl,
    baseUrl: connectionConfig.baseUrl,
    corsProxyEnabled: connectionConfig.corsProxyEnabled,
    corsProxyMode: connectionConfig.corsProxyMode,
    corsProxyCustomUrl: connectionConfig.corsProxyCustomUrl,
    connectionConfig,
    latencyMs: session?.latencyMs ?? null,
    viaProxy: session?.viaProxy ?? false,
    authService,
    updateConnectionConfig,
    loginDirect,
    loginStepOne,
    loginStepTwo,
    fetchRoles,
    fetchOrganizations,
    fetchWarehouses,
    logout,
    pingErp,
    getAuthHeaders
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
