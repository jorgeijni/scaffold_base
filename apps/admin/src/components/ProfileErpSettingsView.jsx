import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CORS_PROXY_PRESETS,
  DEFAULT_LANGUAGES,
  GARDENWORLD_DEMO_PRESET
} from '../services/AuthService';

function formatConnectionTimestamp(isoString) {
  if (!isoString) return new Date().toLocaleString('es-CO');
  try {
    return new Date(isoString).toLocaleString('es-CO');
  } catch {
    return String(isoString);
  }
}

export default function ProfileErpSettingsView({ onOpenInspector, onCatalogSynced, onShowToast }) {
  const {
    session,
    user,
    token,
    userId,
    roleId,
    organizationId,
    orgId,
    warehouseId,
    language,
    erpBaseUrl,
    corsProxyEnabled,
    corsProxyMode,
    corsProxyCustomUrl,
    connectionConfig,
    updateConnectionConfig,
    pingErp,
    getAuthHeaders
  } = useAuth();

  const initialDefaults = connectionConfig?.defaultParameters || GARDENWORLD_DEMO_PRESET.parameters;

  const [baseUrlInput, setBaseUrlInput] = useState(
    connectionConfig?.baseUrl || erpBaseUrl || GARDENWORLD_DEMO_PRESET.baseUrl
  );
  const [proxyEnabled, setProxyEnabled] = useState(Boolean(corsProxyEnabled));
  const [proxyMode, setProxyMode] = useState(corsProxyMode || CORS_PROXY_PRESETS.LOCAL);
  const [customProxyUrl, setCustomProxyUrl] = useState(corsProxyCustomUrl || 'https://corsproxy.io/?');
  const [multiTenantEnabled, setMultiTenantEnabled] = useState(
    Boolean(connectionConfig?.enableMultiTenantLogin)
  );

  const [defaultClientId, setDefaultClientId] = useState(String(initialDefaults.clientId ?? 11));
  const [defaultRoleId, setDefaultRoleId] = useState(String(initialDefaults.roleId ?? 102));
  const [defaultOrgId, setDefaultOrgId] = useState(String(initialDefaults.organizationId ?? 11));
  const [defaultWhId, setDefaultWhId] = useState(String(initialDefaults.warehouseId ?? 103));
  const [defaultLanguage, setDefaultLanguage] = useState(initialDefaults.language || 'es_PE');

  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [configSavedNote, setConfigSavedNote] = useState(null);

  const [catalogBusy, setCatalogBusy] = useState(null);
  const [catalogStatus, setCatalogStatus] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);

  const effectiveOrgId = organizationId ?? orgId ?? 'N/A';

  const persistConfig = (overrides = {}) => {
    const nextConfig = {
      baseUrl: overrides.baseUrl ?? baseUrlInput.trim(),
      corsProxyEnabled: overrides.corsProxyEnabled ?? proxyEnabled,
      corsProxyMode: overrides.corsProxyMode ?? proxyMode,
      corsProxyCustomUrl: overrides.corsProxyCustomUrl ?? customProxyUrl.trim(),
      enableMultiTenantLogin: overrides.enableMultiTenantLogin ?? multiTenantEnabled,
      defaultParameters: {
        clientId: Number((overrides.clientId ?? defaultClientId) || 11),
        roleId: Number((overrides.roleId ?? defaultRoleId) || 102),
        organizationId: Number((overrides.organizationId ?? defaultOrgId) || 11),
        warehouseId:
          (overrides.warehouseId ?? defaultWhId) === ''
            ? null
            : Number(overrides.warehouseId ?? defaultWhId),
        language: overrides.language ?? defaultLanguage
      }
    };
    updateConnectionConfig(nextConfig);
    setConfigSavedNote('Configuración guardada y aplicada al portal de acceso.');
  };

  useEffect(() => {
    fetch('/api/idempiere/catalog/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setSyncHistory(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleTestConnectivity = async () => {
    setTestingPing(true);
    setPingResult(null);
    persistConfig();
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
      setTestingPing(false);
    }
  };

  const handleSeedCatalog = async () => {
    setCatalogBusy('seed');
    setCatalogStatus(null);
    try {
      const res = await fetch('/api/idempiere/catalog/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          baseUrl: baseUrlInput.trim(),
          token
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo completar el aprovisionamiento.');
      }
      setCatalogStatus({ ok: true, message: data.message });
      if (Array.isArray(data.history)) setSyncHistory(data.history);
      if (onShowToast) onShowToast('🌱 Catálogo procesado en iDempiere REST');
    } catch (err) {
      setCatalogStatus({ ok: false, message: err.message });
    } finally {
      setCatalogBusy(null);
    }
  };

  const handleSyncSqlite = async () => {
    setCatalogBusy('sqlite');
    setCatalogStatus(null);
    try {
      const res = await fetch('/api/idempiere/catalog/sync-sqlite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al sincronizar el Datamart.');
      }
      setCatalogStatus({ ok: true, message: data.message });
      if (Array.isArray(data.history)) setSyncHistory(data.history);
      if (onCatalogSynced) onCatalogSynced();
      if (onShowToast) onShowToast('🔄 Catálogo sincronizado con el Datamart local');
    } catch (err) {
      setCatalogStatus({ ok: false, message: err.message });
    } finally {
      setCatalogBusy(null);
    }
  };

  const handleRefreshHistory = async () => {
    setCatalogBusy('history');
    try {
      const res = await fetch('/api/idempiere/catalog/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSyncHistory(data.data);
        setCatalogStatus({
          ok: true,
          message:
            data.data.length > 0
              ? `Historial actualizado (${data.data.length} registros).`
              : 'Historial actualizado (sin operaciones registradas aún en esta sesión).'
        });
      }
    } catch (err) {
      setCatalogStatus({ ok: false, message: err.message });
    } finally {
      setCatalogBusy(null);
    }
  };

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '14px'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 11px',
    borderRadius: '9px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    fontSize: '0.82rem',
    fontWeight: '600',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Dark Obsidian Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b1120 0%, #1e293b 100%)',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          color: '#ffffff',
          boxShadow: '0 8px 24px -8px rgba(15, 23, 42, 0.35)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem',
              flexShrink: 0,
              boxShadow: '0 6px 16px rgba(245, 158, 11, 0.35)'
            }}
          >
            👤
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Perfil de Administrador &amp; Configuración de Servidor
              </h2>
              <span
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em'
                }}
              >
                ACTIVO
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '4px 0 0' }}>
              Gestión segura de la dirección del servidor central, parámetros de acceso y modo de inicio de sesión.
            </p>
          </div>
        </div>

        {onOpenInspector && (
          <button
            type="button"
            onClick={onOpenInspector}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              color: '#f8fafc',
              padding: '8px 14px',
              borderRadius: '9px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🔍 Ver Token Activo
          </button>
        )}
      </div>

      {configSavedNote && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            borderRadius: '10px',
            padding: '9px 14px',
            fontSize: '0.78rem',
            fontWeight: '700',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>✅ {configSavedNote}</span>
          <button
            type="button"
            onClick={() => setConfigSavedNote(null)}
            style={{ background: 'transparent', border: 'none', color: '#15803d', cursor: 'pointer', fontWeight: '800' }}
          >
            ×
          </button>
        </div>
      )}

      {/* 4-Column Configuration Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))',
          gap: '16px',
          alignItems: 'stretch'
        }}
      >
        {/* CARD 1: Sesión Activa del Usuario */}
        <div style={cardStyle}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '1rem' }}>🔑</span>
              <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Sesión Activa del Usuario
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
              {[
                { label: 'Usuario Autenticado', value: user?.userName || 'N/A', color: '#0f172a' },
                { label: 'Identificador de Usuario (ID)', value: userId ?? 'N/A', color: '#0f172a' },
                { label: 'Organización Activa (ID)', value: `Org #${effectiveOrgId}`, color: '#2563eb' },
                { label: 'Rol Asignado (ID)', value: `Rol #${roleId ?? 'N/A'}`, color: '#d97706' },
                { label: 'Almacén Asignado (ID)', value: `Almacén #${warehouseId ?? 'N/A'}`, color: '#0f172a' },
                { label: 'Idioma de Interfaz', value: language || 'en_US', color: '#0f172a' },
                { label: 'Fecha / Hora de Conexión', value: formatConnectionTimestamp(session?.savedAt), color: '#475569' }
              ].map((row, idx) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    paddingBottom: idx < 6 ? '9px' : 0,
                    borderBottom: idx < 6 ? '1px solid #f1f5f9' : 'none'
                  }}
                >
                  <span style={{ color: '#64748b', fontWeight: '500' }}>{row.label}</span>
                  <span
                    style={{
                      fontWeight: '800',
                      color: row.color,
                      textAlign: 'right',
                      wordBreak: 'break-word'
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 2: Servidor Central & Blindaje de Conexión */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem' }}>🛡️</span>
              <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Servidor Central &amp; Blindaje de Conexión
              </h3>
            </div>

            <p style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
              Esta dirección se almacena de forma segura en este panel y{' '}
              <strong style={{ color: '#334155' }}>nunca se muestra en la pantalla de inicio de sesión</strong>{' '}
              para proteger la infraestructura contra atacantes.
            </p>

            <div>
              <label
                htmlFor="profile-base-url"
                style={{ display: 'block', fontSize: '0.73rem', fontWeight: '700', color: '#334155', marginBottom: '5px' }}
              >
                Dirección URL del Servidor Corporativo
              </label>
              <input
                id="profile-base-url"
                type="url"
                value={baseUrlInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setBaseUrlInput(val);
                  persistConfig({ baseUrl: val });
                }}
                placeholder="https://test.idempiere.org:443"
                style={{
                  ...inputStyle,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: '0.78rem'
                }}
              />
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <label
                htmlFor="profile-cors-checkbox"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', fontWeight: '700', color: '#334155', cursor: 'pointer' }}
              >
                <input
                  id="profile-cors-checkbox"
                  type="checkbox"
                  checked={proxyEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setProxyEnabled(checked);
                    persistConfig({ corsProxyEnabled: checked });
                  }}
                />
                <span>Habilitar Proxy CORS para peticiones HTTP/REST</span>
              </label>

              {proxyEnabled && (
                <select
                  aria-label="Modo de Proxy CORS"
                  value={proxyMode}
                  onChange={(e) => {
                    const mode = e.target.value;
                    setProxyMode(mode);
                    persistConfig({ corsProxyMode: mode });
                  }}
                  style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.75rem' }}
                >
                  <option value={CORS_PROXY_PRESETS.LOCAL}>Proxy Local (/api/idempiere/proxy)</option>
                  <option value={CORS_PROXY_PRESETS.CORSPROXY_IO}>corsproxy.io Público</option>
                  <option value={CORS_PROXY_PRESETS.CUSTOM}>Proxy Personalizado</option>
                </select>
              )}

              {proxyEnabled && proxyMode === CORS_PROXY_PRESETS.CUSTOM && (
                <input
                  type="url"
                  value={customProxyUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setCustomProxyUrl(url);
                    persistConfig({ corsProxyCustomUrl: url });
                  }}
                  placeholder="https://corsproxy.io/?"
                  style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.74rem', fontFamily: 'monospace' }}
                />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pingResult && (
              <div
                style={{
                  background: pingResult.online ? '#f0fdf4' : '#fff1f2',
                  border: `1px solid ${pingResult.online ? '#bbf7d0' : '#fecdd3'}`,
                  color: pingResult.online ? '#166534' : '#9f1239',
                  borderRadius: '8px',
                  padding: '7px 10px',
                  fontSize: '0.73rem',
                  fontWeight: '600'
                }}
              >
                {pingResult.online ? '🟢 En línea:' : '🔴 Sin conexión:'} {pingResult.message}
                {typeof pingResult.latencyMs === 'number' ? ` (${pingResult.latencyMs}ms)` : ''}
              </div>
            )}

            <button
              type="button"
              onClick={handleTestConnectivity}
              disabled={testingPing}
              style={{
                width: '100%',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.8rem',
                fontWeight: '800',
                cursor: testingPing ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px'
              }}
            >
              <span>🔌</span>
              <span>{testingPing ? 'Probando Conectividad...' : 'Probar Conectividad de Servidor'}</span>
            </button>
          </div>
        </div>

        {/* CARD 3: Modo de Autenticación en Pantalla de Login */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem' }}>⚙️</span>
              <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Modo de Autenticación en Pantalla de Login
              </h3>
            </div>

            <p style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
              Define cómo se comportará la ventana de inicio de sesión cuando los usuarios ingresen sus credenciales.
            </p>

            <label
              htmlFor="profile-multitenant-toggle"
              style={{
                background: multiTenantEnabled ? '#eff6ff' : '#f8fafc',
                border: `1px solid ${multiTenantEnabled ? '#bfdbfe' : '#e2e8f0'}`,
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              <input
                id="profile-multitenant-toggle"
                type="checkbox"
                checked={multiTenantEnabled}
                onChange={(e) => {
                  const next = e.target.checked;
                  setMultiTenantEnabled(next);
                  persistConfig({ enableMultiTenantLogin: next });
                }}
                style={{ marginTop: '3px' }}
              />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.3 }}>
                  Habilitar Modo Asistido Multi-Tenant (Selección Dinámica)
                </div>
                <p style={{ fontSize: '0.73rem', color: '#475569', lineHeight: 1.45, margin: '6px 0 0' }}>
                  {multiTenantEnabled ? (
                    <>
                      <strong>Activado (2 Pasos):</strong> Al ingresar usuario y contraseña, se consultarán dinámicamente
                      las empresas, roles y sucursales disponibles para el usuario.
                    </>
                  ) : (
                    <>
                      <strong>Desactivado (1 Solo Paso):</strong> Al ingresar usuario y contraseña, el login se
                      completará en 1 solo paso automático utilizando los parámetros predeterminados configurados a
                      continuación.
                    </>
                  )}
                </p>
              </div>
            </label>
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '9px',
              padding: '10px 12px',
              fontSize: '0.74rem',
              color: '#334155',
              lineHeight: 1.4
            }}
          >
            <strong>💡 Modo actual:</strong>{' '}
            {multiTenantEnabled
              ? 'Login Asistido en 2 Pasos (Multi-Tenant Dinámico)'
              : 'Login Directo en 1 Paso (Sin fricciones)'}
          </div>
        </div>

        {/* CARD 4: Parámetros Predeterminados de Conexión */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem' }}>🏢</span>
              <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Parámetros Predeterminados de Conexión
              </h3>
            </div>

            <p style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
              Estos parámetros son utilizados automáticamente en el inicio de sesión de 1 solo paso y están ocultos del
              login público.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label htmlFor="default-client-id" style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Tenant / Client ID
                </label>
                <input
                  id="default-client-id"
                  type="number"
                  value={defaultClientId}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDefaultClientId(v);
                    persistConfig({ clientId: v });
                  }}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="default-role-id" style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Rol ID
                </label>
                <input
                  id="default-role-id"
                  type="number"
                  value={defaultRoleId}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDefaultRoleId(v);
                    persistConfig({ roleId: v });
                  }}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="default-org-id" style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Organización ID
                </label>
                <input
                  id="default-org-id"
                  type="number"
                  value={defaultOrgId}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDefaultOrgId(v);
                    persistConfig({ organizationId: v });
                  }}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="default-wh-id" style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Almacén ID
                </label>
                <input
                  id="default-wh-id"
                  type="number"
                  value={defaultWhId}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDefaultWhId(v);
                    persistConfig({ warehouseId: v });
                  }}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label htmlFor="default-lang-select" style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                Idioma Predeterminado
              </label>
              <select
                id="default-lang-select"
                value={defaultLanguage}
                onChange={(e) => {
                  const lang = e.target.value;
                  setDefaultLanguage(lang);
                  persistConfig({ language: lang });
                }}
                style={inputStyle}
              >
                {DEFAULT_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: Aprovisionamiento & Sincronización de Catálogo iDempiere */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <span style={{ fontSize: '1.05rem' }}>📦</span>
              <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Aprovisionamiento &amp; Sincronización de Catálogo iDempiere
              </h3>
            </div>
            <p style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Inyecta las <strong>5 categorías gastronómicas oficiales</strong> y las{' '}
              <strong>10 hamburguesas de autor</strong> en el ERP (GardenWorld), asigna sus precios en{' '}
              <code>M_ProductPrice</code> y sincroniza sus IDs oficiales (<code>M_Product_ID</code>) hacia el Datamart
              SQLite de la PWA.
            </p>
          </div>

          <span
            style={{
              background: token ? '#f0fdf4' : '#fff1f2',
              color: token ? '#15803d' : '#9f1239',
              border: `1px solid ${token ? '#bbf7d0' : '#fecdd3'}`,
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: '800',
              whiteSpace: 'nowrap'
            }}
          >
            &bull; {token ? 'Token Bearer Activo' : 'Sin Token'}
          </span>
        </div>

        {/* Action Buttons Row */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleSeedCatalog}
            disabled={catalogBusy !== null}
            style={{
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '9px',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: catalogBusy ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px'
            }}
          >
            <span>🌱</span>
            <span>{catalogBusy === 'seed' ? 'Sembrando Catálogo...' : 'Sembrar Catálogo en iDempiere (POST)'}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncSqlite}
            disabled={catalogBusy !== null}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '9px',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: catalogBusy ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px'
            }}
          >
            <span>🔄</span>
            <span>{catalogBusy === 'sqlite' ? 'Sincronizando...' : 'Sincronizar Catálogo hacia SQLite'}</span>
          </button>

          <button
            type="button"
            onClick={handleRefreshHistory}
            disabled={catalogBusy !== null}
            style={{
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '10px 16px',
              borderRadius: '9px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: catalogBusy ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px'
            }}
          >
            <span>📋</span>
            <span>{catalogBusy === 'history' ? 'Actualizando...' : 'Actualizar Historial'}</span>
          </button>
        </div>

        {catalogStatus && (
          <div
            style={{
              background: catalogStatus.ok ? '#f0fdf4' : '#fff1f2',
              border: `1px solid ${catalogStatus.ok ? '#bbf7d0' : '#fecdd3'}`,
              color: catalogStatus.ok ? '#166534' : '#9f1239',
              borderRadius: '9px',
              padding: '9px 12px',
              fontSize: '0.78rem',
              fontWeight: '600'
            }}
          >
            {catalogStatus.ok ? '✅' : '⛔'} {catalogStatus.message}
          </div>
        )}

        {syncHistory.length > 0 && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
              Registro Reciente de Sincronización
            </div>
            {syncHistory.slice(0, 4).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.75rem',
                  color: '#334155',
                  paddingTop: '4px',
                  borderTop: '1px dashed #e2e8f0',
                  flexWrap: 'wrap'
                }}
              >
                <span>
                  <strong>{item.action}</strong> &mdash; {item.message}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {formatConnectionTimestamp(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
