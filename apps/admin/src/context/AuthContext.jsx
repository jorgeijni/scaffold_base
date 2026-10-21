import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'idempiere_auth_session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [loginMode, setLoginMode] = useState(null); // 'live' | 'resilient_simulated'
  const [erpEndpoint, setErpEndpoint] = useState('/api/v1/auth/tokens');
  const [erpBaseUrl, setErpBaseUrl] = useState('http://localhost:8080');
  const [latencyMs, setLatencyMs] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesión al cargar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (session && session.token) {
          setUser(session.user);
          setToken(session.token);
          setRefreshToken(session.refreshToken || null);
          setIsMock(session.isMock || false);
          setLoginMode(session.loginMode || (session.isMock ? 'resilient_simulated' : 'live'));
          setErpEndpoint(session.erpEndpoint || '/api/v1/auth/tokens');
          setErpBaseUrl(session.erpBaseUrl || 'http://localhost:8080');
          setLatencyMs(session.latencyMs || null);
          setWarningMessage(session.warningMessage || null);
        }
      }
    } catch (e) {
      console.warn('Error al leer sesión almacenada de iDempiere:', e);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Paso 1: Valida credenciales y obtiene opciones de perfil
  const authenticateCredentials = async ({ userName, password, baseUrl, allowFallback = true }) => {
    const targetBase = baseUrl || erpBaseUrl || 'http://localhost:8080';
    const response = await fetch('/api/idempiere/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        userName,
        password,
        baseUrl: targetBase,
        allowFallback
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const err = new Error(data.error || 'Credenciales inválidas en iDempiere');
      err.detail = data.detail;
      err.status = data.status || response.status;
      throw err;
    }

    return data;
  };

  // Función de inicio de sesión (Paso 2 con contexto y roles)
  const login = async ({ userName, password, parameters, baseUrl, allowFallback = true }) => {
    setIsLoading(true);
    setWarningMessage(null);

    try {
      const targetBase = baseUrl || erpBaseUrl || 'http://localhost:8080';
      const response = await fetch('/api/idempiere/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userName,
          password,
          parameters,
          baseUrl: targetBase,
          allowFallback
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setIsLoading(false);
        const err = new Error(data.error || 'Fallo en la autenticación con iDempiere');
        err.detail = data.detail;
        err.status = data.status || response.status;
        err.endpoint = data.endpoint;
        throw err;
      }

      // Éxito: Guardar sesión
      setUser(data.user);
      setToken(data.token);
      setRefreshToken(data.refreshToken || null);
      setIsMock(!!data.isMock);
      setLoginMode(data.mode);
      setErpEndpoint(data.endpoint);
      setErpBaseUrl(targetBase);
      setLatencyMs(data.latencyMs);
      setWarningMessage(data.warning || null);

      const sessionToSave = {
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        isMock: !!data.isMock,
        loginMode: data.mode,
        erpEndpoint: data.endpoint,
        erpBaseUrl: targetBase,
        latencyMs: data.latencyMs,
        warningMessage: data.warning || null,
        savedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionToSave));

      setIsLoading(false);
      return data;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Función de cierre de sesión
  const logout = async () => {
    try {
      await fetch('/api/idempiere/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Error menor al avisar logout al servidor:', e);
    }
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setIsMock(false);
    setLoginMode(null);
    setWarningMessage(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Probar ping directo al backend / iDempiere
  const pingErp = async (customUrl) => {
    const url = customUrl || erpBaseUrl;
    try {
      const res = await fetch(`/api/idempiere/status?baseUrl=${encodeURIComponent(url)}`);
      return await res.json();
    } catch (err) {
      return { online: false, error: err.message };
    }
  };

  // Helper para cabeceras con Bearer Token
  const getAuthHeaders = () => {
    if (!token) return {};
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const value = {
    user,
    token,
    refreshToken,
    isAuthenticated: !!user && !!token,
    isMock,
    loginMode,
    erpEndpoint,
    erpBaseUrl,
    latencyMs,
    warningMessage,
    isLoading,
    authenticateCredentials,
    login,
    logout,
    pingErp,
    getAuthHeaders,
    setErpBaseUrl
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
