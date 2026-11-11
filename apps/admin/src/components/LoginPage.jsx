import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GARDENWORLD_DEMO_PRESET } from '../services/AuthService';
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
    loginDirect,
    loginStepOne,
    loginStepTwo,
    fetchRoles,
    fetchOrganizations,
    fetchWarehouses
  } = useAuth();

  // Política de login gobernada desde Perfil de Administrador & Configuración de Servidor
  const isMultiTenantMode = Boolean(connectionConfig?.enableMultiTenantLogin);
  const configuredBaseUrl = connectionConfig?.baseUrl || GARDENWORLD_DEMO_PRESET.baseUrl;
  const configuredDefaults = connectionConfig?.defaultParameters || GARDENWORLD_DEMO_PRESET.parameters;

  const [stepOneData, setStepOneData] = useState(null);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [demoNotice, setDemoNotice] = useState(null);

  const handleLoadDemoCredentials = () => {
    setUserName(GARDENWORLD_DEMO_PRESET.userName);
    setPassword(GARDENWORLD_DEMO_PRESET.password);
    setErrorMessage(null);
    setDemoNotice('Credenciales de demostración listas para ingresar.');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isMultiTenantMode) {
        const result = await loginStepOne({
          userName,
          password,
          baseUrl: configuredBaseUrl,
          corsProxy: connectionConfig
        });
        setStepOneData(result);
        return;
      }

      const params = {
        clientId: Number(configuredDefaults.clientId ?? 11),
        roleId: Number(configuredDefaults.roleId ?? 102),
        organizationId: Number(configuredDefaults.organizationId ?? 11),
        warehouseId:
          configuredDefaults.warehouseId === '' || configuredDefaults.warehouseId === null
            ? null
            : Number(configuredDefaults.warehouseId),
        language: configuredDefaults.language || 'en_US'
      };

      const isDefaultGardenContext =
        params.clientId === 11 && params.roleId === 102 && params.organizationId === 11;

      await loginDirect({
        userName,
        password,
        parameters: params,
        baseUrl: configuredBaseUrl,
        corsProxy: connectionConfig,
        labels: isDefaultGardenContext ? GARDENWORLD_DEMO_PRESET.labels : {}
      });
    } catch (err) {
      setErrorMessage(err.message || 'No fue posible iniciar sesión. Verifica tus credenciales.');
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
        baseUrl: configuredBaseUrl,
        corsProxy: connectionConfig,
        labels
      });
    } catch (err) {
      setErrorMessage(err.message || 'No se pudo completar la selección de sucursal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '11px',
    padding: '12px 14px',
    color: '#0f172a',
    fontSize: '0.92rem',
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
            padding: '42px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '24px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Form Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  Bienvenido de nuevo
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '5px 0 0', lineHeight: 1.45 }}>
                  {isMultiTenantMode
                    ? 'Ingresa tus credenciales para seleccionar tu empresa y sucursal.'
                    : 'Ingresa tus credenciales para acceder a la consola administrativa.'}
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

            {demoNotice && !errorMessage && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '600'
                }}
              >
                ✓ {demoNotice}
              </div>
            )}

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
                  lineHeight: 1.45
                }}
              >
                {errorMessage}
              </div>
            )}

            {isMultiTenantMode && stepOneData ? (
              <TwoStepContextForm
                stepOneData={stepOneData}
                baseUrl={configuredBaseUrl}
                corsProxyConfig={connectionConfig}
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
                onSubmit={handleLoginSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
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
                    marginTop: '6px'
                  }}
                >
                  {isSubmitting
                    ? 'Verificando acceso...'
                    : isMultiTenantMode
                      ? 'Continuar →'
                      : 'Iniciar Sesión →'}
                </button>
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
