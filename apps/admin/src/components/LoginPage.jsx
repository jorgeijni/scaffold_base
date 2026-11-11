import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CORS_PROXY_PRESETS,
  DEFAULT_LANGUAGES,
  GARDENWORLD_DEMO_PRESET
} from '../services/AuthService';
import TwoStepContextForm from './TwoStepContextForm';

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

  // Modalidad de autenticación: 'direct' (1 Paso) | 'twoStep' (2 Pasos)
  const [authMode, setAuthMode] = useState('direct');
  const [stepOneData, setStepOneData] = useState(null);

  // Credenciales
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Parámetros de Contexto para Modalidad 1 (Login Directo / 1 Paso)
  const [directParams, setDirectParams] = useState({
    clientId: '11',
    roleId: '102',
    organizationId: '11',
    warehouseId: '103',
    language: 'en_US'
  });

  // Conectividad y CORS Proxy
  const [baseUrl, setBaseUrl] = useState(connectionConfig.baseUrl || GARDENWORLD_DEMO_PRESET.baseUrl);
  const [corsProxyEnabled, setCorsProxyEnabled] = useState(connectionConfig.corsProxyEnabled ?? true);
  const [corsProxyMode, setCorsProxyMode] = useState(connectionConfig.corsProxyMode || CORS_PROXY_PRESETS.LOCAL);
  const [corsProxyCustomUrl, setCorsProxyCustomUrl] = useState(connectionConfig.corsProxyCustomUrl || 'https://corsproxy.io/?');

  // Estados UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
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

  const handleLoadGardenWorldDemo = () => {
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
    setErrorDetail(null);
    setPingResult(null);
    setDemoNotice('Credenciales Demo GardenWorld cargadas (Client 11 · Role 102 · Org 11 · Wh 103).');
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
    setErrorDetail(null);
    syncConnectivity({});

    try {
      const isGardenDemo =
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
        labels: isGardenDemo ? GARDENWORLD_DEMO_PRESET.labels : {}
      });
    } catch (err) {
      setErrorMessage(err.message || 'Error al iniciar sesión en iDempiere.');
      setErrorDetail(err.detail || null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepOneSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setErrorDetail(null);
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
      setErrorMessage(err.message || 'No se pudieron validar las credenciales.');
      setErrorDetail(err.detail || null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepTwoConfirm = async ({ parameters, labels }) => {
    if (!stepOneData) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setErrorDetail(null);

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
      setErrorMessage(err.message || 'Error al confirmar contexto en iDempiere.');
      setErrorDetail(err.detail || null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(15, 23, 42, 0.72)',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#ffffff',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.76rem',
    fontWeight: '700',
    marginBottom: '5px',
    color: '#cbd5e1'
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Resplandores decorativos */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '12%',
          width: '340px',
          height: '340px',
          background: 'radial-gradient(circle, rgba(217,119,6,0.14) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '12%',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(2,132,199,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'rgba(30, 41, 59, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '30px 28px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.65), 0 0 24px rgba(217, 119, 6, 0.14)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              boxShadow: '0 10px 20px -5px rgba(217, 119, 6, 0.5)',
              fontSize: '1.8rem',
              marginBottom: '10px'
            }}
          >
            🍔
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 4px 0', color: '#ffffff' }}>
            Hamburger <span style={{ color: '#f59e0b' }}>Rapid</span> &bull; Backoffice
          </h1>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
            Autenticación Centralizada iDempiere REST API v1
          </div>
        </div>

        {/* Panel de Conectividad iDempiere & Proxy CORS */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '800' }}>
              🌐 Conectividad ERP &amp; CORS
            </span>

            <button
              type="button"
              onClick={handleLoadGardenWorldDemo}
              style={{
                background: 'rgba(217, 119, 6, 0.2)',
                border: '1px solid #f59e0b',
                color: '#fde68a',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '0.74rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              ⚡ Cargar Demo GardenWorld
            </button>
          </div>

          {/* Base URL editable */}
          <div>
            <label htmlFor="idempiere-base-url" style={{ ...labelStyle, fontSize: '0.72rem', marginBottom: '4px' }}>
              Base URL del API de iDempiere
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                id="idempiere-base-url"
                type="url"
                required
                value={baseUrl}
                onChange={(e) => {
                  setBaseUrl(e.target.value);
                  syncConnectivity({ baseUrl: e.target.value });
                }}
                placeholder="https://test.idempiere.org:443"
                style={{ ...inputStyle, padding: '8px 10px', fontSize: '0.8rem', fontFamily: 'monospace' }}
              />
              <button
                type="button"
                onClick={handleTestConnectivity}
                disabled={isTestingPing}
                title="Probar conectividad hacia /api/v1/auth/tokens"
                style={{
                  background: '#1e293b',
                  border: '1px solid #475569',
                  color: '#e2e8f0',
                  borderRadius: '8px',
                  padding: '0 10px',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  cursor: isTestingPing ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {isTestingPing ? '⏳' : '🔌 Ping'}
              </button>
            </div>
          </div>

          {/* Selector Proxy CORS */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
            <label
              htmlFor="cors-proxy-toggle"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: '700', color: '#e2e8f0', cursor: 'pointer' }}
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
                style={{ accentColor: '#f59e0b', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>Activar Proxy CORS</span>
            </label>

            {corsProxyEnabled && (
              <select
                aria-label="Tipo de Proxy CORS"
                value={corsProxyMode}
                onChange={(e) => {
                  setCorsProxyMode(e.target.value);
                  syncConnectivity({ corsProxyMode: e.target.value });
                }}
                style={{
                  background: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '7px',
                  padding: '5px 8px',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
              >
                <option value={CORS_PROXY_PRESETS.LOCAL}>Proxy Local (/api/idempiere/proxy)</option>
                <option value={CORS_PROXY_PRESETS.CORSPROXY_IO}>https://corsproxy.io/?</option>
                <option value={CORS_PROXY_PRESETS.CUSTOM}>Proxy Personalizado...</option>
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
              placeholder="https://corsproxy.io/?"
              style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.76rem', fontFamily: 'monospace' }}
            />
          )}

          {pingResult && (
            <div
              style={{
                background: pingResult.online ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
                border: `1px solid ${pingResult.online ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                color: pingResult.online ? '#6ee7b7' : '#fca5a5',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.74rem'
              }}
            >
              <strong>{pingResult.online ? '✓ Conectado' : '✕ Sin conexión'}:</strong> {pingResult.message}{' '}
              {pingResult.latencyMs !== undefined && `(${pingResult.latencyMs}ms)`}
            </div>
          )}
        </div>

        {/* Notificación Demo */}
        {demoNotice && (
          <div
            style={{
              background: 'rgba(217, 119, 6, 0.16)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              color: '#fde68a',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '0.76rem',
              marginBottom: '14px'
            }}
          >
            ✓ {demoNotice}
          </div>
        )}

        {/* Selector de Modalidad de Autenticación */}
        {!stepOneData && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '800', marginBottom: '6px' }}>
              Modalidad de Autenticación:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('direct');
                  setErrorMessage(null);
                  setErrorDetail(null);
                }}
                style={{
                  background: authMode === 'direct' ? 'rgba(217, 119, 6, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                  border: `1px solid ${authMode === 'direct' ? '#f59e0b' : '#334155'}`,
                  color: authMode === 'direct' ? '#fef3c7' : '#94a3b8',
                  padding: '9px 10px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                ⚡ 1 Paso (Directo)
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('twoStep');
                  setErrorMessage(null);
                  setErrorDetail(null);
                }}
                style={{
                  background: authMode === 'twoStep' ? 'rgba(2, 132, 199, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                  border: `1px solid ${authMode === 'twoStep' ? '#38bdf8' : '#334155'}`,
                  color: authMode === 'twoStep' ? '#dbeafe' : '#94a3b8',
                  padding: '9px 10px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                🛡️ 2 Pasos (Multitenant)
              </button>
            </div>
          </div>
        )}

        {/* Errores */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              color: '#fca5a5',
              padding: '10px 12px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              marginBottom: '14px',
              lineHeight: 1.4
            }}
          >
            <div style={{ fontWeight: '800' }}>⛔ {errorMessage}</div>
            {errorDetail && <div style={{ fontSize: '0.74rem', color: '#f87171', marginTop: '4px' }}>{errorDetail}</div>}
          </div>
        )}

        {/* Paso 2 del Login Asistido */}
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
              setErrorDetail(null);
            }}
            isSubmitting={isSubmitting}
          />
        ) : (
          <form
            onSubmit={authMode === 'direct' ? handleDirectSubmit : handleStepOneSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div>
              <label htmlFor="login-username" style={labelStyle}>Usuario (userName)</label>
              <input
                id="login-username"
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej. admin @ gardenworld.com"
                style={inputStyle}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label htmlFor="login-password" style={{ ...labelStyle, marginBottom: 0 }}>Contraseña (password)</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.73rem', cursor: 'pointer', fontWeight: '700' }}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                style={inputStyle}
              />
            </div>

            {/* Parámetros de Contexto para Modalidad 1 (Directo) */}
            {authMode === 'direct' && (
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#f59e0b', fontWeight: '800' }}>
                  Parámetros de Contexto (parameters)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label htmlFor="param-client" style={{ ...labelStyle, fontSize: '0.72rem' }}>Client ID</label>
                    <input
                      id="param-client"
                      type="number"
                      required
                      value={directParams.clientId}
                      onChange={(e) => setDirectParams({ ...directParams, clientId: e.target.value })}
                      style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="param-role" style={{ ...labelStyle, fontSize: '0.72rem' }}>Role ID</label>
                    <input
                      id="param-role"
                      type="number"
                      required
                      value={directParams.roleId}
                      onChange={(e) => setDirectParams({ ...directParams, roleId: e.target.value })}
                      style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="param-org" style={{ ...labelStyle, fontSize: '0.72rem' }}>Organization ID</label>
                    <input
                      id="param-org"
                      type="number"
                      required
                      value={directParams.organizationId}
                      onChange={(e) => setDirectParams({ ...directParams, organizationId: e.target.value })}
                      style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="param-wh" style={{ ...labelStyle, fontSize: '0.72rem' }}>Warehouse ID</label>
                    <input
                      id="param-wh"
                      type="number"
                      value={directParams.warehouseId}
                      onChange={(e) => setDirectParams({ ...directParams, warehouseId: e.target.value })}
                      style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="param-lang" style={{ ...labelStyle, fontSize: '0.72rem' }}>Idioma (language)</label>
                  <select
                    id="param-lang"
                    value={directParams.language}
                    onChange={(e) => setDirectParams({ ...directParams, language: e.target.value })}
                    style={{ ...inputStyle, padding: '8px 10px', fontSize: '0.82rem' }}
                  >
                    {DEFAULT_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name} ({l.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background:
                  authMode === 'direct'
                    ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                    : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 18px',
                fontSize: '0.92rem',
                fontWeight: '800',
                cursor: isSubmitting ? 'wait' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
                boxShadow:
                  authMode === 'direct'
                    ? '0 10px 25px -5px rgba(217, 119, 6, 0.4)'
                    : '0 10px 25px -5px rgba(2, 132, 199, 0.4)'
              }}
            >
              {isSubmitting
                ? '⏳ Conectando con iDempiere...'
                : authMode === 'direct'
                  ? '🔐 Iniciar Sesión (POST /api/v1/auth/tokens)'
                  : '🛡️ Paso 1: Validar Credenciales'}
            </button>
          </form>
        )}

        <div
          style={{
            marginTop: '18px',
            textAlign: 'center',
            fontSize: '0.7rem',
            color: '#64748b',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '10px',
            fontFamily: 'monospace'
          }}
        >
          POST {baseUrl.replace(/\/+$/, '')}/api/v1/auth/tokens {corsProxyEnabled ? `• Proxy: ${corsProxyMode}` : '• Directo'}
        </div>
      </div>
    </div>
  );
}
