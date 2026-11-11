import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CORS_PROXY_PRESETS } from '../services/AuthService';

export default function ProfileErpSettingsView({ onOpenInspector }) {
  const {
    user,
    userId,
    clientId,
    roleId,
    organizationId,
    orgId,
    warehouseId,
    language,
    authMode,
    erpBaseUrl,
    corsProxyEnabled,
    corsProxyMode,
    corsProxyCustomUrl,
    updateConnectionConfig,
    pingErp,
    logout
  } = useAuth();

  const [baseUrlInput, setBaseUrlInput] = useState(erpBaseUrl || 'https://test.idempiere.org:443');
  const [proxyEnabled, setProxyEnabled] = useState(Boolean(corsProxyEnabled));
  const [proxyMode, setProxyMode] = useState(corsProxyMode || CORS_PROXY_PRESETS.LOCAL);
  const [customProxyUrl, setCustomProxyUrl] = useState(corsProxyCustomUrl || '');
  const [savedBanner, setSavedBanner] = useState(false);
  const [testing, setTesting] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  const effectiveOrgId = organizationId ?? orgId ?? 'N/A';

  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateConnectionConfig({
      baseUrl: baseUrlInput.trim(),
      corsProxyEnabled: proxyEnabled,
      corsProxyMode: proxyMode,
      corsProxyCustomUrl: customProxyUrl.trim()
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const handleTestConnectivity = async () => {
    setTesting(true);
    setPingResult(null);
    try {
      const res = await pingErp({
        baseUrl: baseUrlInput.trim(),
        corsProxyEnabled: proxyEnabled,
        corsProxyMode: proxyMode,
        corsProxyCustomUrl: customProxyUrl.trim()
      });
      setPingResult(res);
    } catch (err) {
      setPingResult({ online: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Session Context Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              👤 Perfil Operativo &amp; Contexto de Sesión iDempiere
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0' }}>
              Sesión persistida en navegador, lista para compartir librería AuthService con PWA de Preventa.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onOpenInspector}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                padding: '8px 14px',
                borderRadius: '9px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🔍 Ver Token Bearer
            </button>
            <button
              onClick={logout}
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#e11d48',
                padding: '8px 14px',
                borderRadius: '9px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px'
          }}
        >
          {[
            { label: 'Usuario (userName)', value: user?.userName || 'N/A' },
            { label: 'User ID', value: userId ?? 'N/A' },
            { label: 'Client ID', value: `${clientId ?? 'N/A'}${user?.clientName ? ` (${user.clientName})` : ''}` },
            { label: 'Role ID', value: `${roleId ?? 'N/A'}${user?.roleName ? ` (${user.roleName})` : ''}` },
            { label: 'Organization ID', value: `${effectiveOrgId}${user?.orgName ? ` (${user.orgName})` : ''}` },
            { label: 'Warehouse ID', value: `${warehouseId ?? 'N/A'}${user?.warehouseName ? ` (${user.warehouseName})` : ''}` },
            { label: 'Idioma', value: language || 'en_US' },
            { label: 'Modalidad Auth', value: authMode === 'two_step' ? '2 Pasos (Asistida)' : '1 Paso (Directa)' }
          ].map((field) => (
            <div key={field.label}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>{field.label}</div>
              <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                {field.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editable Base URL & CORS Proxy Config */}
      <form
        onSubmit={handleSaveConfig}
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            🌐 Conectividad iDempiere Base URL &amp; Proxy CORS
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0' }}>
            Ajusta el servidor destino y el proxy de navegador sin cerrar la sesión actual.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Base URL del Servidor iDempiere REST
            </label>
            <input
              type="url"
              required
              value={baseUrlInput}
              onChange={(e) => setBaseUrlInput(e.target.value)}
              placeholder="https://test.idempiere.org:443"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '9px',
                border: '1px solid #cbd5e1',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.8rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Estrategia de Proxy CORS en Navegador
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={proxyEnabled}
                  onChange={(e) => setProxyEnabled(e.target.checked)}
                />
                <span>Activar Proxy CORS</span>
              </label>

              {proxyEnabled && (
                <select
                  value={proxyMode}
                  onChange={(e) => setProxyMode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value={CORS_PROXY_PRESETS.LOCAL}>Proxy Backend (/api/idempiere/proxy)</option>
                  <option value={CORS_PROXY_PRESETS.CORSPROXY_IO}>corsproxy.io Público</option>
                  <option value={CORS_PROXY_PRESETS.CUSTOM}>Proxy Personalizado</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {proxyEnabled && proxyMode === CORS_PROXY_PRESETS.CUSTOM && (
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              URL Prefijo de Proxy CORS Personalizado
            </label>
            <input
              type="url"
              value={customProxyUrl}
              onChange={(e) => setCustomProxyUrl(e.target.value)}
              placeholder="https://corsproxy.io/?"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '9px',
                border: '1px solid #cbd5e1',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.8rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {savedBanner && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '9px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700' }}>
            ✅ Configuración de conectividad actualizada y persistida localmente.
          </div>
        )}

        {pingResult && (
          <div
            style={{
              background: pingResult.online ? '#f0fdf4' : '#fff1f2',
              border: `1px solid ${pingResult.online ? '#bbf7d0' : '#fecdd3'}`,
              color: pingResult.online ? '#166534' : '#9f1239',
              padding: '9px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem'
            }}
          >
            <strong>{pingResult.online ? '🟢 Endpoint Accesible:' : '🔴 Sin Conexión:'}</strong>{' '}
            {pingResult.message} ({pingResult.latencyMs}ms)
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="submit"
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '9px',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            💾 Guardar Configuración
          </button>

          <button
            type="button"
            onClick={handleTestConnectivity}
            disabled={testing}
            style={{
              background: '#fffbeb',
              color: '#b45309',
              border: '1px solid #fde68a',
              padding: '10px 18px',
              borderRadius: '9px',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: testing ? 'wait' : 'pointer'
            }}
          >
            ⚡ {testing ? 'Verificando...' : 'Probar Conectividad'}
          </button>
        </div>
      </form>
    </div>
  );
}

