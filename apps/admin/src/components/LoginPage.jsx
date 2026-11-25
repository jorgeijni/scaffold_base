import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_GARDENWORLD_PARAMS, getWarehouses } from '../services/idempiereAuthService';

export default function LoginPage() {
  const {
    loginDirect,
    requestContextStep1,
    completeLoginStep2,
    isLoading,
    authError,
    setAuthError,
    loginMode,
    setLoginMode,
    connectionMode,
    setConnectionMode,
    erpBaseUrl,
    setErpBaseUrl
  } = useAuth();

  // Form State
  const [userName, setUserName] = useState(DEFAULT_GARDENWORLD_PARAMS.userName);
  const [password, setPassword] = useState(DEFAULT_GARDENWORLD_PARAMS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);

  // Parámetros de contexto para Modalidad 1 (REGLA ESTRICTA: organizationId)
  const [parameters, setParameters] = useState({
    clientId: DEFAULT_GARDENWORLD_PARAMS.parameters.clientId,
    roleId: DEFAULT_GARDENWORLD_PARAMS.parameters.roleId,
    organizationId: DEFAULT_GARDENWORLD_PARAMS.parameters.organizationId,
    warehouseId: DEFAULT_GARDENWORLD_PARAMS.parameters.warehouseId,
    language: DEFAULT_GARDENWORLD_PARAMS.parameters.language
  });

  // Estado para Modalidad 2 (2 Pasos)
  const [currentStep, setCurrentStep] = useState(1); // 1 = Credenciales, 2 = Selección de Contexto
  const [stage1Token, setStage1Token] = useState(null);
  const [availableContext, setAvailableContext] = useState(null);
  const [selectedContext, setSelectedContext] = useState({
    clientId: 11,
    roleId: 102,
    organizationId: 11,
    warehouseId: 103,
    language: 'es_PE'
  });

  const [errorDetails, setErrorDetails] = useState(null);

  // Cambios en parámetros manuales (Modalidad 1)
  const handleParamChange = (field, value) => {
    setParameters(prev => ({
      ...prev,
      [field]: field === 'language' ? value : (parseInt(value, 10) || 0)
    }));
  };

  // Botón "Cargar Demo GardenWorld"
  const handleFillDemo = (e) => {
    e?.preventDefault();
    setUserName(DEFAULT_GARDENWORLD_PARAMS.userName);
    setPassword(DEFAULT_GARDENWORLD_PARAMS.password);
    setParameters({ ...DEFAULT_GARDENWORLD_PARAMS.parameters });
    setSelectedContext({ ...DEFAULT_GARDENWORLD_PARAMS.parameters });
    setErpBaseUrl(DEFAULT_GARDENWORLD_PARAMS.erpBaseUrl);
    setAuthError(null);
    setErrorDetails(null);
    setCurrentStep(1);
    setAvailableContext(null);
  };

  // Login Rápido 1-Clic
  const handleQuickDemoLogin = async () => {
    handleFillDemo();
    await loginDirect(
      {
        userName: DEFAULT_GARDENWORLD_PARAMS.userName,
        password: DEFAULT_GARDENWORLD_PARAMS.password,
        parameters: DEFAULT_GARDENWORLD_PARAMS.parameters,
        erpBaseUrl: DEFAULT_GARDENWORLD_PARAMS.erpBaseUrl
      },
      connectionMode
    );
  };

  // Envío Formulario Modalidad 1 (Login Directo en 1 Paso)
  const handleSubmitModalidad1 = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setErrorDetails(null);

    const result = await loginDirect(
      {
        userName,
        password,
        parameters,
        erpBaseUrl
      },
      connectionMode
    );

    if (result && !result.success && result.details) {
      setErrorDetails(result.details);
    }
  };

  // Modalidad 2: Paso 1 (Consultar Contexto Multitenant)
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setErrorDetails(null);

    const result = await requestContextStep1(
      { userName, password, erpBaseUrl },
      connectionMode
    );

    if (result.success && !result.authenticated) {
      const data = result.contextData || result;
      setAvailableContext(data);
      setStage1Token(data.stage1Token || null);
      
      const firstOrgId = data.organizations?.[0]?.id ?? 11;
      const matchingWh = (data.warehouses || []).filter(w =>
        w.organizationId === undefined || Number(w.organizationId) === Number(firstOrgId)
      );

      // Auto-seleccionar primer elemento disponible en cascada
      setSelectedContext({
        clientId: data.clients?.[0]?.id ?? 11,
        roleId: data.roles?.[0]?.id ?? 102,
        organizationId: firstOrgId,
        warehouseId: matchingWh[0]?.id ?? (data.warehouses?.[0]?.id ?? 103),
        language: data.languages?.[0]?.id ?? 'es_PE'
      });
      setCurrentStep(2);
    }
  };

  // Cambio en cascada: Organización -> Almacenes dinámicos
  const handleOrganizationChange = async (newOrgId) => {
    const orgIdNum = Number(newOrgId);
    let matchingWh = (availableContext?.warehouses || []).filter(w =>
      Number(w.organizationId) === orgIdNum
    );

    // Si aún no tenemos los almacenes precargados para esta org, consultarlos
    if (matchingWh.length === 0 && (availableContext?.stage1Token || stage1Token)) {
      try {
        const liveWh = await getWarehouses(
          erpBaseUrl,
          availableContext?.stage1Token || stage1Token,
          selectedContext.clientId,
          selectedContext.roleId,
          orgIdNum,
          connectionMode
        );
        if (liveWh && liveWh.length > 0) {
          matchingWh = liveWh;
          setAvailableContext(prev => ({
            ...prev,
            warehouses: [
              ...(prev?.warehouses || []).filter(w => Number(w.organizationId) !== orgIdNum),
              ...liveWh
            ]
          }));
        }
      } catch (err) {
        console.warn('Aviso consultando almacenes para organización:', orgIdNum, err);
      }
    }

    setSelectedContext(prev => ({
      ...prev,
      organizationId: orgIdNum,
      warehouseId: matchingWh.length > 0 ? matchingWh[0].id : ''
    }));
  };

  // Modalidad 2: Paso 2 (Confirmar Contexto y Obtener Token)
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setErrorDetails(null);

    const result = await completeLoginStep2(
      { userName, password, erpBaseUrl, stage1Token },
      selectedContext,
      connectionMode
    );

    if (result && !result.success && result.details) {
      setErrorDetails(result.details);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #1e1e28 0%, #0d0e12 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Background Glows */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(234, 88, 12, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'rgba(25, 27, 34, 0.92)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.65), 0 0 40px rgba(217, 119, 6, 0.1)',
        padding: '36px 32px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #d97706, #ea580c)',
            fontSize: '2rem',
            boxShadow: '0 10px 25px rgba(217, 119, 6, 0.35)',
            marginBottom: '14px'
          }}>
            🍔
          </div>

          <h1 style={{
            color: '#ffffff',
            fontSize: '1.65rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            marginBottom: '4px'
          }}>
            Hamburger Rapid
          </h1>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(217, 119, 6, 0.15)',
            border: '1px solid rgba(217, 119, 6, 0.3)',
            borderRadius: '9999px',
            padding: '4px 14px',
            color: '#fbbf24',
            fontSize: '0.74rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            <span>🔒</span> Control de Acceso &bull; iDempiere ERP v1
          </div>

          <p style={{
            color: '#94a3b8',
            fontSize: '0.82rem',
            marginTop: '8px',
            lineHeight: 1.4
          }}>
            Autenticación directa de usuarios con credenciales activas en iDempiere ERP.
          </p>
        </div>

        {/* Technical Directive Badge (Blindaje iDempiere v1) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.74rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
            <span style={{ color: '#10b981', fontWeight: '800' }}>✓</span>
            <span>Ruta: <code>POST /api/v1/auth/tokens</code></span>
          </div>
          <div style={{ color: '#f59e0b', fontWeight: '700' }}>
            organizationId [v1]
          </div>
        </div>

        {/* Conectividad y CORS Toolbar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>
              🌐 Conexión &amp; Proxy CORS
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setErpBaseUrl('https://test.idempiere.org')}
                style={{
                  background: erpBaseUrl === 'https://test.idempiere.org' ? '#d97706' : '#1e293b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                GardenWorld Live
              </button>
              <button
                type="button"
                onClick={() => setErpBaseUrl('http://localhost:8080')}
                style={{
                  background: erpBaseUrl === 'http://localhost:8080' ? '#d97706' : '#1e293b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Localhost :8080
              </button>
            </div>
          </div>

          {/* Editable Base URL */}
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={erpBaseUrl}
              onChange={(e) => setErpBaseUrl(e.target.value)}
              placeholder="https://test.idempiere.org"
              style={{
                width: '100%',
                padding: '8px 10px',
                background: '#0d0e12',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#38bdf8',
                fontSize: '0.82rem',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Connection Mode Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setConnectionMode('proxy')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: connectionMode === 'proxy' ? '1px solid #f59e0b' : '1px solid #334155',
                background: connectionMode === 'proxy' ? '#d97706' : '#1e293b',
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              title="Recomendado: Sin bloqueos CORS, con alta disponibilidad y tolerancia a fallos en el backend"
            >
              🛡️ Proxy Backend (Recomendado)
            </button>
            <button
              type="button"
              onClick={() => setConnectionMode('direct')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: connectionMode === 'direct' ? '1px solid #f59e0b' : '1px solid #334155',
                background: connectionMode === 'direct' ? '#d97706' : '#1e293b',
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              title="Conexión HTTP/HTTPS directa desde el navegador (con auto-recuperación transparente)"
            >
              ⚡ REST Directo al ERP
            </button>
          </div>
        </div>

        {/* Modalidad Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => {
              setLoginMode('direct');
              setCurrentStep(1);
            }}
            style={{
              padding: '10px 12px',
              borderRadius: '9px',
              border: 'none',
              background: loginMode === 'direct' ? 'linear-gradient(135deg, #d97706, #b45309)' : 'transparent',
              color: loginMode === 'direct' ? '#ffffff' : '#94a3b8',
              fontWeight: '800',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            ⚡ Modalidad 1: 1 Paso (Directo)
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('assisted');
              setCurrentStep(1);
            }}
            style={{
              padding: '10px 12px',
              borderRadius: '9px',
              border: 'none',
              background: loginMode === 'assisted' ? 'linear-gradient(135deg, #d97706, #b45309)' : 'transparent',
              color: loginMode === 'assisted' ? '#ffffff' : '#94a3b8',
              fontWeight: '800',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            🏢 Modalidad 2: 2 Pasos (Multitenant)
          </button>
        </div>

        {/* Botón Cargar Demo GardenWorld */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={handleFillDemo}
            style={{
              flex: 1,
              padding: '9px 12px',
              background: 'rgba(217, 119, 6, 0.15)',
              border: '1px solid rgba(217, 119, 6, 0.4)',
              borderRadius: '10px',
              color: '#fef3c7',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            📋 Cargar Demo GardenWorld
          </button>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '9px 12px',
              background: 'linear-gradient(135deg, #d97706, #ea580c)',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.78rem',
              cursor: isLoading ? 'wait' : 'pointer',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
            }}
          >
            ⚡ Acceso Rápido 1-Clic
          </button>
        </div>

        {/* Error Notification Alert */}
        {authError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '18px',
            color: '#fca5a5',
            fontSize: '0.8rem',
            lineHeight: 1.4
          }}>
            <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}>
              <span>⚠️</span> Error de Autenticación iDempiere:
            </div>
            <div style={{ marginTop: '4px' }}>{authError}</div>
            {errorDetails && (
              <pre style={{
                marginTop: '8px',
                padding: '6px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '6px',
                fontSize: '0.7rem',
                overflowX: 'auto',
                color: '#fecaca'
              }}>
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* FORMULARIO MODALIDAD 1: LOGIN DIRECTO (1 PASO)            */}
        {/* ========================================================= */}
        {loginMode === 'direct' && (
          <form onSubmit={handleSubmitModalidad1}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700', marginBottom: '6px' }}>
                Usuario iDempiere (userName):
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="admin @ gardenworld.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700' }}>
                  Contraseña (password):
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="GardenAdmin"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Acordeón de Parámetros Fijos (parameters) */}
            <div style={{ marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => setShowAdvancedParams(!showAdvancedParams)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f59e0b',
                  fontSize: '0.76rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 0'
                }}
              >
                <span>{showAdvancedParams ? '▼' : '▶'}</span>
                <span>Parámetros de Contexto ERP iDempiere (parameters object)</span>
              </button>

              {showAdvancedParams && (
                <div style={{
                  marginTop: '10px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px'
                }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Client ID (clientId):
                    </label>
                    <input
                      type="number"
                      value={parameters.clientId}
                      onChange={(e) => handleParamChange('clientId', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', background: '#0d0e12', border: '1px solid #334155', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Role ID (roleId):
                    </label>
                    <input
                      type="number"
                      value={parameters.roleId}
                      onChange={(e) => handleParamChange('roleId', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', background: '#0d0e12', border: '1px solid #334155', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      Organization ID (organizationId):
                    </label>
                    <input
                      type="number"
                      value={parameters.organizationId}
                      onChange={(e) => handleParamChange('organizationId', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', background: '#0d0e12', border: '1px solid #0284c7', borderRadius: '6px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: '700' }}
                    />
                    <span style={{ fontSize: '0.62rem', color: '#64748b' }}>* Campo v1 (no orgId)</span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Warehouse ID (warehouseId):
                    </label>
                    <input
                      type="number"
                      value={parameters.warehouseId}
                      onChange={(e) => handleParamChange('warehouseId', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', background: '#0d0e12', border: '1px solid #334155', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Idioma (language):
                    </label>
                    <select
                      value={parameters.language}
                      onChange={(e) => handleParamChange('language', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', background: '#0d0e12', border: '1px solid #334155', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }}
                    >
                      <option value="es_PE">es_PE (Español Perú)</option>
                      <option value="en_US">en_US (Inglés Americano)</option>
                      <option value="es_ES">es_ES (Español)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: isLoading ? '#475569' : 'linear-gradient(135deg, #d97706, #ea580c)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: isLoading ? 'wait' : 'pointer',
                boxShadow: '0 8px 24px rgba(217, 119, 6, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? '⏳ Autenticando en iDempiere...' : '🔐 Ingresar al Panel (1 Paso)'}
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* FORMULARIO MODALIDAD 2: LOGIN ASISTIDO EN 2 PASOS          */}
        {/* ========================================================= */}
        {loginMode === 'assisted' && (
          <div>
            {/* Step Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                background: currentStep === 1 ? '#d97706' : '#1e293b',
                color: 'white',
                fontSize: '0.74rem',
                fontWeight: '800',
                textAlign: 'center'
              }}>
                1. Validar Credenciales
              </div>
              <div style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                background: currentStep === 2 ? '#d97706' : '#1e293b',
                color: 'white',
                fontSize: '0.74rem',
                fontWeight: '800',
                textAlign: 'center'
              }}>
                2. Elegir Contexto
              </div>
            </div>

            {currentStep === 1 ? (
              <form onSubmit={handleStep1Submit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700', marginBottom: '6px' }}>
                    Usuario iDempiere:
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="admin @ gardenworld.com"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(15, 23, 42, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700', marginBottom: '6px' }}>
                    Contraseña:
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="GardenAdmin"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(15, 23, 42, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isLoading ? '#475569' : 'linear-gradient(135deg, #d97706, #ea580c)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    cursor: isLoading ? 'wait' : 'pointer',
                    boxShadow: '0 8px 24px rgba(217, 119, 6, 0.35)'
                  }}
                >
                  {isLoading ? '⏳ Consultando iDempiere...' : '🔍 Consultar Roles y Organizaciones (Paso 1)'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleStep2Submit}>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '18px'
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '700' }}>
                    ✓ Usuario "{userName}" verificado. Seleccione el contexto de sesión:
                  </div>

                  {/* Tenant / Cliente */}
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Empresa / Tenant (Client):
                    </label>
                    <select
                      value={selectedContext.clientId}
                      onChange={(e) => setSelectedContext(prev => ({ ...prev, clientId: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '8px 10px', background: '#0d0e12', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '0.82rem' }}
                    >
                      {availableContext?.clients?.map(c => (
                        <option key={c.id} value={c.id}>{c.name} (#{c.id})</option>
                      ))}
                    </select>
                  </div>

                  {/* Rol */}
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Rol Asignado (Role):
                    </label>
                    <select
                      value={selectedContext.roleId}
                      onChange={(e) => setSelectedContext(prev => ({ ...prev, roleId: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '8px 10px', background: '#0d0e12', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '0.82rem' }}
                    >
                      {availableContext?.roles?.map(r => (
                        <option key={r.id} value={r.id}>{r.name} (#{r.id})</option>
                      ))}
                    </select>
                  </div>

                  {/* Organización */}
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      Organización / Sucursal (organizationId):
                    </label>
                    <select
                      value={selectedContext.organizationId}
                      onChange={(e) => handleOrganizationChange(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', background: '#0d0e12', border: '1px solid #0284c7', borderRadius: '8px', color: '#38bdf8', fontSize: '0.82rem', fontWeight: '700' }}
                    >
                      {availableContext?.organizations?.map(o => (
                        <option key={o.id} value={o.id}>{o.name} (#{o.id})</option>
                      ))}
                    </select>
                  </div>

                  {/* Almacén (Filtrado en Cascada según Organización) */}
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Almacén de Despacho (Warehouse):
                    </label>
                    {(() => {
                      const visibleWarehouses = (availableContext?.warehouses || []).filter(w =>
                        w.organizationId === undefined || Number(w.organizationId) === Number(selectedContext.organizationId)
                      );
                      return (
                        <select
                          value={selectedContext.warehouseId}
                          onChange={(e) => setSelectedContext(prev => ({ ...prev, warehouseId: Number(e.target.value) }))}
                          style={{ width: '100%', padding: '8px 10px', background: '#0d0e12', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '0.82rem' }}
                        >
                          {visibleWarehouses.length > 0 ? (
                            visibleWarehouses.map(w => (
                              <option key={w.id} value={w.id}>{w.name} (#{w.id})</option>
                            ))
                          ) : (
                            <option value="">(Sin almacenes asignados a esta organización)</option>
                          )}
                        </select>
                      );
                    })()}
                  </div>

                  {/* Idioma */}
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Idioma:
                    </label>
                    <select
                      value={selectedContext.language}
                      onChange={(e) => setSelectedContext(prev => ({ ...prev, language: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', background: '#0d0e12', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '0.82rem' }}
                    >
                      <option value="es_PE">es_PE (Español)</option>
                      <option value="en_US">en_US (Inglés)</option>
                      <option value="es_ES">es_ES (Español España)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: '1px solid #475569',
                      background: 'transparent',
                      color: '#cbd5e1',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    ← Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: isLoading ? '#475569' : 'linear-gradient(135deg, #d97706, #ea580c)',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      cursor: isLoading ? 'wait' : 'pointer',
                      boxShadow: '0 8px 24px rgba(217, 119, 6, 0.35)'
                    }}
                  >
                    {isLoading ? '⏳ Obteniendo Token...' : '✅ Confirmar Contexto y Entrar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '22px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.74rem',
          color: '#64748b'
        }}>
          <div>
            <a href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>← Volver al Menú Digital</a>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            style={{
              background: 'none',
              border: 'none',
              color: '#f59e0b',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.74rem'
            }}
          >
            Restablecer GardenWorld
          </button>
        </div>
      </div>
    </div>
  );
}
