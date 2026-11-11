import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CORS_PROXY_PRESETS,
  DEFAULT_LANGUAGES,
  GARDENWORLD_DEMO_PRESET
} from '../services/AuthService';
import TwoStepContextForm from './TwoStepContextForm';

const SHOWCASE_HIGHLIGHTS = [
  {
    icon: '📦',
    title: 'Bandeja Central de Pedidos',
    desc: 'Supervisa órdenes web y preventa móvil en un flujo unificado.'
  },
  {
    icon: '🍔',
    title: 'Gestión de Catálogo Maestro',
    desc: 'Administra recetas, precios, disponibilidad e inventario en vivo.'
  },
  {
    icon: '🔒',
    title: 'Sesión Corporativa Segura',
    desc: 'Control de acceso contextualizado por empresa y sucursal.'
  }
];

export default function LoginPage() {
  const {
    connectionConfig,
    updateConnectionConfig,
    loginDirect,
    loginStepOne,
    loginStepTwo,
    fetchRoles,
    fetchOrganizations,
    fetchWarehouses,
    pingErp
  } = useAuth();

  // Modalidad de autenticación: 'direct' (Acceso Directo) | 'twoStep' (Selección por Sede)
  const [authMode, setAuthMode] = useState('direct');
  const [stepOneData, setStepOneData] = useState(null);

  // Credenciales
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Parámetros de sede (para acceso directo) y ajustes avanzados colapsables
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [directParams, setDirectParams] = useState({
    clientId: '11',
    roleId: '102',
    organizationId: '11',
    warehouseId: '103',
    language: 'en_US'
  });

  // Conectividad
  const [baseUrl, setBaseUrl] = useState(connectionConfig.baseUrl || GARDENWORLD_DEMO_PRESET.baseUrl);
  const [corsProxyEnabled, setCorsProxyEnabled] = useState(connectionConfig.corsProxyEnabled ?? true);
  const [corsProxyMode, setCorsProxyMode] = useState(connectionConfig.corsProxyMode || CORS_PROXY_PRESETS.LOCAL);
  const [corsProxyCustomUrl, setCorsProxyCustomUrl] = useState(connectionConfig.corsProxyCustomUrl || 'https://corsproxy.io/?');

  // Estados UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [demoNotice, setDemoNotice] = useState(null);

  const currentCorsConfig = {
    baseUrl,
    corsProxyEnabled,
    corsProxyMode,
    corsProxyCustomUrl
  };

  const syncConnectivity = (partial) => {
    const next = { ...currentCorsConfig, ...partial };
    updateConnectionConfig(next);
  };

  const handleLoadDemoCredentials = () => {
    setBaseUrl(GARDENWORLD_DEMO_PRESET.baseUrl);
    setUserName(GARDENWORLD_DEMO_PRESET.userName);
    setPassword(GARDENWORLD_DEMO_PRESET.password);
    setDirectParams({
      clientId: String(GARDENWORLD_DEMO_PRESET.parameters.clientId),
      roleId: String(GARDENWORLD_DEMO_PRESET.parameters.roleId),
      organizationId: String(GARDENWORLD_DEMO_PRESET.parameters.organizationId),
      warehouseId: String(GARDENWORLD_DEMO_PRESET.parameters.warehouseId),
      language: GARDENWORLD_DEMO_PRESET.parameters.language
    });
    syncConnectivity({ baseUrl: GARDENWORLD_DEMO_PRESET.baseUrl });
    setErrorMessage(null);
    setPingResult(null);
    setDemoNotice('Credenciales de demostración cargadas.');
  };

  const handleTestConnectivity = async () => {
    setIsTestingPing(true);
    setPingResult(null);
    syncConnectivity({});
    try {
      const result = await pingErp(currentCorsConfig);
      setPingResult(result);
    } catch (err) {
      setPingResult({ online: false, message: err.message });
    } finally {
      setIsTestingPing(false);
    }
  };

  const handleDirectSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    syncConnectivity({});

    try {
      const isDefaultContext =
        Number(directParams.clientId) === 11 &&
        Number(directParams.roleId) === 102 &&
        Number(directParams.organizationId) === 11;

      await loginDirect({
        userName,
        password,
        parameters: {
          clientId: Number(directParams.clientId),
          roleId: Number(directParams.roleId),
          organizationId: Number(directParams.organizationId),
          warehouseId: directParams.warehouseId === '' ? null : Number(directParams.warehouseId),
          language: directParams.language
        },
        baseUrl,
        corsProxy: currentCorsConfig,
        labels: isDefaultContext ? GARDENWORLD_DEMO_PRESET.labels : {}
      });
    } catch (err) {
      setErrorMessage(err.message || 'No fue posible iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepOneSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    syncConnectivity({});

    try {
      const result = await loginStepOne({
        userName,
        password,
        baseUrl,
        corsProxy: currentCorsConfig
      });
      setStepOneData(result);
    } catch (err) {
      setErrorMessage(err.message || 'No se pudieron validar tus credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepTwoConfirm = async ({ parameters, labels }) => {
    if (!stepOneData) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await loginStepTwo({
        tempToken: stepOneData.tempToken,
        parameters,
        userName: stepOneData.userName,
        baseUrl,
        corsProxy: currentCorsConfig,
        labels
      });
    } catch (err) {
      setErrorMessage(err.message || 'Error al confirmar la sucursal de trabajo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '11px',
    padding: '11px 14px',
    color: '#0f172a',
    fontSize: '0.9rem',
    fontWeight: '500',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: '700',
    marginBottom: '6px',
    color: '#334155'
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #fef3c7 0%, #f8fafc 42%, #f1f5f9 100%)',
        color: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      <div className="login-split-card">
        {/* Left Brand Showcase Panel */}
        <div
          className="login-brand-panel"
          style={{
            background: 'linear-gradient(155deg, #0f172a 0%, #1e293b 62%, #292524 100%)',
            color: '#ffffff',
            padding: '40px 34px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.28) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f97316, #dc2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.45rem',
                  boxShadow: '0 8px 18px rgba(234, 88, 12, 0.4)'
                }}
              >
                🍔
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  Hamburger <span style={{ color: '#fbbf24' }}>Rapid</span>
                </div>
                <div style={{ fontSize: '0.66rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.08em', marginTop: '3px' }}>
                  PANEL DE ADMINISTRACIÓN
                </div>
              </div>
            </div>

            <h2
              style={{
                fontSize: '1.65rem',
                fontWeight: '800',
                lineHeight: 1.2,
                letterSpacing: '-0.025em',
                margin: '0 0 12px'
              }}
            >
              Control central de pedidos y operación comercial.
            </h2>

            <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.55, margin: '0 0 28px' }}>
              Accede al centro de mando para supervisar ventas, catálogo maestro y métricas de clientes en tiempo real.
            </p>

            <div className="login-brand-features" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {SHOWCASE_HIGHLIGHTS.map((item) => (
                <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#f8fafc' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="login-brand-footer"
            style={{
              position: 'relative',
              zIndex: 2,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '16px',
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.74rem',
              color: '#94a3b8'
            }}
          >
            <span>Ecosistema Hamburger Rapid</span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="/" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: '700' }}>
                Tienda Web
              </a>
              <a href="/app" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: '700' }}>
                App Móvil
              </a>
            </div>
          </div>
        </div>

        {/* Right Clean Authentication Form Panel */}
        <div
          style={{
            background: '#ffffff',
            padding: '38px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          <div>
            {/* Form Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  Bienvenido de nuevo
                </h1>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0' }}>
                  Ingresa tus credenciales para acceder a la consola administrativa.
                </p>
              </div>

              {!stepOneData && (
                <button
                  type="button"
                  onClick={handleLoadDemoCredentials}
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#b45309',
                    borderRadius: '9999px',
                    padding: '6px 12px',
                    fontSize: '0.73rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  ✨ Cuenta Demo
                </button>
              )}
            </div>

            {/* Segmented Mode Switcher */}
            {!stepOneData && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  background: '#f1f5f9',
                  padding: '4px',
                  borderRadius: '12px',
                  marginBottom: '18px',
                  gap: '4px'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('direct');
                    setErrorMessage(null);
                  }}
                  style={{
                    background: authMode === 'direct' ? '#ffffff' : 'transparent',
                    border: 'none',
                    color: authMode === 'direct' ? '#0f172a' : '#64748b',
                    padding: '8px 10px',
                    borderRadius: '9px',
                    fontSize: '0.79rem',
                    fontWeight: authMode === 'direct' ? '800' : '600',
                    cursor: 'pointer',
                    boxShadow: authMode === 'direct' ? '0 1px 4px rgba(15, 23, 42, 0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Acceso Directo
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('twoStep');
                    setErrorMessage(null);
                  }}
                  style={{
                    background: authMode === 'twoStep' ? '#ffffff' : 'transparent',
                    border: 'none',
                    color: authMode === 'twoStep' ? '#0f172a' : '#64748b',
                    padding: '8px 10px',
                    borderRadius: '9px',
                    fontSize: '0.79rem',
                    fontWeight: authMode === 'twoStep' ? '800' : '600',
                    cursor: 'pointer',
                    boxShadow: authMode === 'twoStep' ? '0 1px 4px rgba(15, 23, 42, 0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Selección por Sede
                </button>
              </div>
            )}

            {/* Demo Notice */}
            {demoNotice && !errorMessage && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  marginBottom: '14px'
                }}
              >
                ✓ {demoNotice}
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '10px 13px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  marginBottom: '16px',
                  lineHeight: 1.45
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* Step 2 Dynamic Context Selector OR Step 1 / Direct Login Form */}
            {authMode === 'twoStep' && stepOneData ? (
              <TwoStepContextForm
                stepOneData={stepOneData}
                baseUrl={baseUrl}
                corsProxyConfig={currentCorsConfig}
                onFetchRoles={fetchRoles}
                onFetchOrganizations={fetchOrganizations}
                onFetchWarehouses={fetchWarehouses}
                onConfirm={handleStepTwoConfirm}
                onBack={() => {
                  setStepOneData(null);
                  setErrorMessage(null);
                }}
                isSubmitting={isSubmitting}
              />
            ) : (
              <form
                onSubmit={authMode === 'direct' ? handleDirectSubmit : handleStepOneSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
              >
                <div>
                  <label htmlFor="login-username" style={labelStyle}>
                    Usuario o Correo Corporativo
                  </label>
                  <input
                    id="login-username"
                    className="login-input"
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="nombre@hamburgerrapid.com"
                    autoComplete="username"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label htmlFor="login-password" style={{ ...labelStyle, marginBottom: 0 }}>
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: '700',
                        padding: 0
                      }}
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <input
                    id="login-password"
                    className="login-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    style={inputStyle}
                  />
                </div>

                {/* Primary CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '13px 18px',
                    fontSize: '0.94rem',
                    fontWeight: '800',
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    opacity: isSubmitting ? 0.78 : 1,
                    boxShadow: '0 10px 22px -6px rgba(217, 119, 6, 0.5)',
                    marginTop: '4px',
                    transition: 'transform 0.15s ease, opacity 0.15s ease'
                  }}
                >
                  {isSubmitting
                    ? 'Verificando acceso...'
                    : authMode === 'direct'
                      ? 'Iniciar Sesión →'
                      : 'Continuar →'}
                </button>

                {/* Discreet Collapsible Sede & Connection Options */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.76rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: '4px 0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>⚙️</span>
                    <span>Opciones de sede y conexión</span>
                    <span style={{ fontSize: '0.68rem' }}>{showAdvanced ? '▲' : '▼'}</span>
                  </button>

                  {showAdvanced && (
                    <div
                      style={{
                        marginTop: '10px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      {authMode === 'direct' && (
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                            Contexto Operativo
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <label htmlFor="param-client" style={{ ...labelStyle, fontSize: '0.71rem' }}>Empresa ID</label>
                              <input
                                id="param-client"
                                className="login-input"
                                type="number"
                                required
                                value={directParams.clientId}
                                onChange={(e) => setDirectParams({ ...directParams, clientId: e.target.value })}
                                style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.8rem', background: '#ffffff' }}
                              />
                            </div>
                            <div>
                              <label htmlFor="param-role" style={{ ...labelStyle, fontSize: '0.71rem' }}>Rol ID</label>
                              <input
                                id="param-role"
                                className="login-input"
                                type="number"
                                required
                                value={directParams.roleId}
                                onChange={(e) => setDirectParams({ ...directParams, roleId: e.target.value })}
                                style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.8rem', background: '#ffffff' }}
                              />
                            </div>
                            <div>
                              <label htmlFor="param-org" style={{ ...labelStyle, fontSize: '0.71rem' }}>Sucursal ID</label>
                              <input
                                id="param-org"
                                className="login-input"
                                type="number"
                                required
                                value={directParams.organizationId}
                                onChange={(e) => setDirectParams({ ...directParams, organizationId: e.target.value })}
                                style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.8rem', background: '#ffffff' }}
                              />
                            </div>
                            <div>
                              <label htmlFor="param-wh" style={{ ...labelStyle, fontSize: '0.71rem' }}>Almacén ID</label>
                              <input
                                id="param-wh"
                                className="login-input"
                                type="number"
                                value={directParams.warehouseId}
                                onChange={(e) => setDirectParams({ ...directParams, warehouseId: e.target.value })}
                                style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.8rem', background: '#ffffff' }}
                              />
                            </div>
                          </div>

                          <div style={{ marginTop: '8px' }}>
                            <label htmlFor="param-lang" style={{ ...labelStyle, fontSize: '0.71rem' }}>Idioma</label>
                            <select
                              id="param-lang"
                              className="login-input"
                              value={directParams.language}
                              onChange={(e) => setDirectParams({ ...directParams, language: e.target.value })}
                              style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.8rem', background: '#ffffff' }}
                            >
                              {DEFAULT_LANGUAGES.map((l) => (
                                <option key={l.code} value={l.code}>
                                  {l.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      <div style={{ borderTop: authMode === 'direct' ? '1px solid #e2e8f0' : 'none', paddingTop: authMode === 'direct' ? '10px' : 0 }}>
                        <label htmlFor="auth-service-url" style={{ ...labelStyle, fontSize: '0.71rem' }}>
                          Servidor de Autenticación
                        </label>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                          <input
                            id="auth-service-url"
                            className="login-input"
                            type="url"
                            required
                            value={baseUrl}
                            onChange={(e) => {
                              setBaseUrl(e.target.value);
                              syncConnectivity({ baseUrl: e.target.value });
                            }}
                            placeholder="https://auth.hamburgerrapid.com"
                            style={{
                              ...inputStyle,
                              padding: '7px 10px',
                              fontSize: '0.78rem',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                              background: '#ffffff'
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleTestConnectivity}
                            disabled={isTestingPing}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              borderRadius: '9px',
                              padding: '0 10px',
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              cursor: isTestingPing ? 'wait' : 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {isTestingPing ? 'Probando...' : 'Probar'}
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                          <label
                            htmlFor="cors-proxy-toggle"
                            style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.75rem', fontWeight: '700', color: '#334155', cursor: 'pointer' }}
                          >
                            <input
                              id="cors-proxy-toggle"
                              type="checkbox"
                              checked={corsProxyEnabled}
                              onChange={(e) => {
                                const enabled = e.target.checked;
                                setCorsProxyEnabled(enabled);
                                syncConnectivity({ corsProxyEnabled: enabled });
                              }}
                              style={{ accentColor: '#d97706', width: '15px', height: '15px', cursor: 'pointer' }}
                            />
                            <span>Usar puente de conexión</span>
                          </label>

                          {corsProxyEnabled && (
                            <select
                              aria-label="Modo de puente de conexión"
                              value={corsProxyMode}
                              onChange={(e) => {
                                setCorsProxyMode(e.target.value);
                                syncConnectivity({ corsProxyMode: e.target.value });
                              }}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '5px 8px',
                                color: '#334155',
                                fontSize: '0.74rem',
                                fontWeight: '600'
                              }}
                            >
                              <option value={CORS_PROXY_PRESETS.LOCAL}>Puente interno del servidor</option>
                              <option value={CORS_PROXY_PRESETS.CORSPROXY_IO}>Puente externo</option>
                              <option value={CORS_PROXY_PRESETS.CUSTOM}>Puente personalizado</option>
                            </select>
                          )}
                        </div>

                        {corsProxyEnabled && corsProxyMode === CORS_PROXY_PRESETS.CUSTOM && (
                          <input
                            type="text"
                            value={corsProxyCustomUrl}
                            onChange={(e) => {
                              setCorsProxyCustomUrl(e.target.value);
                              syncConnectivity({ corsProxyCustomUrl: e.target.value });
                            }}
                            placeholder="https://proxy.ejemplo.com/?"
                            style={{
                              ...inputStyle,
                              marginTop: '8px',
                              padding: '7px 10px',
                              fontSize: '0.76rem',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                              background: '#ffffff'
                            }}
                          />
                        )}

                        {pingResult && (
                          <div
                            style={{
                              marginTop: '8px',
                              background: pingResult.online ? '#f0fdf4' : '#fef2f2',
                              border: `1px solid ${pingResult.online ? '#bbf7d0' : '#fecaca'}`,
                              color: pingResult.online ? '#166534' : '#b91c1c',
                              borderRadius: '8px',
                              padding: '7px 10px',
                              fontSize: '0.74rem',
                              fontWeight: '600'
                            }}
                          >
                            {pingResult.online ? '✓ Conectado:' : '✕ Sin conexión:'} {pingResult.message}
                            {pingResult.latencyMs !== undefined ? ` (${pingResult.latencyMs}ms)` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          <div
            style={{
              textAlign: 'center',
              fontSize: '0.73rem',
              color: '#94a3b8',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '14px'
            }}
          >
            🔒 Acceso protegido &bull; Portal Corporativo Hamburger Rapid
          </div>
        </div>
      </div>
    </div>
  );
}
