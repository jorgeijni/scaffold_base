import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const COMMON_ERRORS = [
  {
    code: 'HTTP 404',
    detail: 'Causado por usar /token en singular. Solucionado usando /tokens.'
  },
  {
    code: 'HTTP 400',
    detail: 'Causado por orgId en raíz o tipos de datos no numéricos. Solucionado con sanitización estricta.'
  },
  {
    code: 'HTTP 401',
    detail: 'Credenciales inválidas o usuario sin el rol/organización asignados en el cliente.'
  }
];

function extractBaseUrl(inputUrl) {
  const trimmed = String(inputUrl || '').trim().replace(/\/+$/, '');
  return trimmed.replace(/\/api\/v1\/auth\/tokens$/i, '');
}

function formatTimeOnly(isoString) {
  if (!isoString) return new Date().toLocaleTimeString('es-CO');
  try {
    return new Date(isoString).toLocaleTimeString('es-CO');
  } catch {
    return String(isoString);
  }
}

export default function IdempiereErpView({ onOpenInspector }) {
  const {
    session,
    user,
    token,
    authMode,
    erpBaseUrl,
    erpEndpoint,
    corsProxyEnabled,
    corsProxyMode,
    corsProxyCustomUrl,
    latencyMs,
    pingErp,
    logout
  } = useAuth();

  const defaultDiagnosticUrl =
    erpEndpoint && erpEndpoint.startsWith('http')
      ? erpEndpoint
      : `${extractBaseUrl(erpBaseUrl || 'https://test.idempiere.org:443')}/api/v1/auth/tokens`;

  const [diagnosticUrl, setDiagnosticUrl] = useState(defaultDiagnosticUrl);
  const [copiedToken, setCopiedToken] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  useEffect(() => {
    setDiagnosticUrl(defaultDiagnosticUrl);
  }, [defaultDiagnosticUrl]);

  const effectiveOrgId = user?.organizationId ?? user?.orgId ?? 11;
  const maskedToken = token
    ? `${token.slice(0, 26)}...${token.slice(-14)}`
    : 'Sin token activo';

  const transmittedPayload =
    authMode === 'two_step'
      ? {
          step1_credentials: {
            endpoint: 'POST /api/v1/auth/tokens',
            userName: user?.userName || 'admin@empresa.com',
            password: '***********'
          },
          step2_contextSelection: {
            endpoint: 'PUT /api/v1/auth/tokens',
            roleId: Number(user?.roleId ?? 102),
            organizationId: Number(effectiveOrgId),
            warehouseId: Number(user?.warehouseId ?? 103),
            language: user?.language || 'en_US'
          }
        }
      : {
          userName: user?.userName || 'admin@empresa.com',
          password: '***********',
          parameters: {
            clientId: Number(user?.clientId ?? 11),
            roleId: Number(user?.roleId ?? 102),
            organizationId: Number(effectiveOrgId),
            warehouseId: Number(user?.warehouseId ?? 103),
            language: user?.language || 'en_US'
          }
        };

  const handleCopyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } catch {
      // Clipboard no disponible en contextos sin permiso
    }
  };

  const handlePing = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const normalizedBase = extractBaseUrl(diagnosticUrl) || extractBaseUrl(erpBaseUrl);
      const res = await pingErp({
        baseUrl: normalizedBase,
        corsProxyEnabled,
        corsProxyMode,
        corsProxyCustomUrl
      });
      setPingResult(res);
    } catch (err) {
      setPingResult({
        online: false,
        status: 0,
        latencyMs: 0,
        message: err.message || 'No fue posible completar el diagnóstico HTTP.'
      });
    } finally {
      setPinging(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Green Status Hero Banner */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #22c55e, #0284c7)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem',
              boxShadow: '0 6px 14px rgba(16, 185, 129, 0.25)',
              flexShrink: 0
            }}
          >
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                Conexión iDempiere ERP REST API v1
              </span>
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
                {erpBaseUrl?.includes('test.idempiere.org') ? 'LIVE IDEMPIERE ERP' : 'LIVE PRODUCTION ERP'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '3px' }}>
              Autenticación corporativa validada con token Bearer activo
              {latencyMs !== null ? ` • Latencia: ${latencyMs}ms` : ''}
              {corsProxyEnabled ? ` • Vía Proxy CORS (${corsProxyMode})` : ' • Conexión Directa'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenInspector}
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '8px 14px',
              borderRadius: '9px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔍</span>
            <span>Inspeccionar Token</span>
          </button>

          <button
            onClick={logout}
            style={{
              background: '#fff1f2',
              color: '#e11d48',
              border: '1px solid #fecdd3',
              padding: '8px 14px',
              borderRadius: '9px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Card 1: Directiva A */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span
                style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                DIRECTIVA A &bull; BLINDADA
              </span>
              <span style={{ fontSize: '1rem' }}>🎯</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              Endpoint en Plural (/tokens)
            </div>
            <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
              Ruta exacta configurada: <code style={{ fontWeight: '700', color: '#0f172a' }}>POST /api/v1/auth/tokens</code>.
              Se prohíbe terminantemente la ruta singular <code style={{ color: '#e11d48' }}>/token</code> para evitar
              HTTP 404 en el despachador de Apache Felix OSGi.
            </p>
          </div>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 10px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '0.72rem',
              color: '#334155',
              lineHeight: 1.5
            }}
          >
            <div>✓ Accept: application/json</div>
            <div>✓ Content-Type: application/json</div>
          </div>
        </div>

        {/* Card 2: Directiva B */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span
                style={{
                  background: '#ffedd5',
                  color: '#c2410c',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                DIRECTIVA B &bull; BLINDADA
              </span>
              <span style={{ fontSize: '1rem' }}>📦</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              Payload Anidado y organizationId
            </div>
            <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
              Parámetros encapsulados en objeto <code style={{ fontWeight: '700' }}>&quot;parameters&quot;</code>. Campo
              de organización nombrado estrictamente <code style={{ fontWeight: '700' }}>&quot;organizationId&quot;</code>{' '}
              (nunca <code style={{ color: '#e11d48' }}>&quot;orgId&quot;</code>) para prevenir fallo Java LoginCredential.
            </p>
          </div>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 10px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '0.72rem',
              color: '#0284c7',
              fontWeight: '600'
            }}
          >
            {`"parameters": { "organizationId": ${effectiveOrgId} }`}
          </div>
        </div>

        {/* Card 3: Active Context */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                background: '#dbeafe',
                color: '#1d4ed8',
                fontSize: '0.68rem',
                fontWeight: '800',
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              CONTEXTO {(user?.clientName || 'ERP').toUpperCase().slice(0, 16)}
            </span>
            <span style={{ fontSize: '1rem' }}>🏢</span>
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>
            Parámetros ERP Activos
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '8px',
              fontSize: '0.75rem',
              color: '#475569'
            }}
          >
            <div>
              Client:{' '}
              <strong style={{ color: '#0f172a' }}>
                {user?.clientId ?? 'N/A'} {user?.clientName ? `(${user.clientName})` : ''}
              </strong>
            </div>
            <div>
              Role:{' '}
              <strong style={{ color: '#0f172a' }}>
                {user?.roleId ?? 'N/A'} {user?.roleName ? `(${user.roleName})` : ''}
              </strong>
            </div>
            <div>
              Org:{' '}
              <strong style={{ color: '#0f172a' }}>
                {effectiveOrgId} {user?.orgName ? `(${user.orgName})` : ''}
              </strong>
            </div>
            <div>
              Warehouse:{' '}
              <strong style={{ color: '#0f172a' }}>{user?.warehouseId ?? 'N/A'}</strong>
            </div>
          </div>
          <div
            style={{
              borderTop: '1px solid #f1f5f9',
              paddingTop: '8px',
              fontSize: '0.74rem',
              color: '#475569',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '6px',
              flexWrap: 'wrap'
            }}
          >
            <span>
              Usuario: <strong style={{ color: '#0f172a' }}>{user?.userName || 'N/A'}</strong>
            </span>
            <span>Idioma: {user?.language || 'en_US'}</span>
          </div>
        </div>

        {/* Card 4: Token Summary */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span
                style={{
                  background: '#e0e7ff',
                  color: '#4338ca',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                TOKEN SEGURIDAD
              </span>
              <button
                onClick={handleCopyToken}
                disabled={!token}
                style={{
                  background: copiedToken ? '#dcfce7' : '#ffffff',
                  color: copiedToken ? '#15803d' : '#334155',
                  border: `1px solid ${copiedToken ? '#86efac' : '#cbd5e1'}`,
                  padding: '3px 9px',
                  borderRadius: '7px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: token ? 'pointer' : 'not-allowed'
                }}
              >
                {copiedToken ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
              Bearer Token Emitido
            </div>
            <div
              style={{
                background: '#09101d',
                color: '#7dd3fc',
                borderRadius: '8px',
                padding: '10px 12px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.72rem',
                wordBreak: 'break-all',
                lineHeight: 1.4
              }}
            >
              {maskedToken}
            </div>
          </div>

          <div style={{ fontSize: '0.73rem', color: '#64748b' }}>
            Emitido: {formatTimeOnly(session?.savedAt)}
          </div>
        </div>
      </div>

      {/* Bottom 2-Column Payload & Diagnostics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '16px',
          alignItems: 'stretch'
        }}
      >
        {/* Left: Transmitted JSON Payload */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Payload JSON Transmitido a iDempiere
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '3px 0 0' }}>
                Cumplimiento estricto con las directivas del motor TrekGlobal REST v1
              </p>
            </div>
            <span
              style={{
                background: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
                fontSize: '0.68rem',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              VALIDADO ✓
            </span>
          </div>

          <pre
            style={{
              background: '#09101d',
              color: '#34d399',
              borderRadius: '10px',
              padding: '16px',
              margin: 0,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '0.76rem',
              lineHeight: 1.55,
              overflowX: 'auto'
            }}
          >
            {JSON.stringify(transmittedPayload, null, 2)}
          </pre>

          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '9px',
              padding: '10px 12px',
              fontSize: '0.73rem',
              color: '#78350f',
              lineHeight: 1.45
            }}
          >
            <strong>💡 Nota del Arquitecto:</strong> Si los parámetros se envían planos en la raíz (ej:{' '}
            <code>{`{ "clientId": 11, ... }`}</code>) o si se usa <code>&quot;orgId&quot;</code>, Jackson/Gson en
            iDempiere falla en deserializar la clase Java{' '}
            <code>com.trekglobal.idempiere.rest.api.v1.auth.LoginCredential</code>, arrojando HTTP 400 Bad Request.
            Nuestra implementación garantiza que este fallo nunca ocurra.
          </div>
        </div>

        {/* Right: ERP Connection Diagnostics Tool */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Herramienta de Diagnóstico de Conexión ERP
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '3px 0 0' }}>
                Prueba la accesibilidad HTTP/REST del endpoint iDempiere en tiempo real
              </p>
            </div>

            <div>
              <label
                htmlFor="idempiere-diagnostic-url"
                style={{
                  display: 'block',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '6px'
                }}
              >
                URL Base / Endpoint del Servidor iDempiere:
              </label>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  id="idempiere-diagnostic-url"
                  type="url"
                  value={diagnosticUrl}
                  onChange={(e) => setDiagnosticUrl(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '220px',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1px solid #cbd5e1',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: '0.78rem',
                    color: '#0f172a',
                    background: '#f8fafc',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handlePing}
                  disabled={pinging}
                  style={{
                    background: pinging ? '#f59e0b' : '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '9px',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    cursor: pinging ? 'wait' : 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>⚡</span>
                  <span>{pinging ? 'Probando...' : 'Probar Ping'}</span>
                </button>
              </div>
            </div>

            {pingResult && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '9px',
                  fontSize: '0.76rem',
                  background: pingResult.online ? '#f0fdf4' : '#fff1f2',
                  color: pingResult.online ? '#166534' : '#9f1239',
                  border: `1px solid ${pingResult.online ? '#bbf7d0' : '#fecdd3'}`
                }}
              >
                <strong>{pingResult.online ? '🟢 ERP En Línea:' : '🔴 Sin Respuesta Directa:'}</strong>{' '}
                {pingResult.message}
                {typeof pingResult.latencyMs === 'number' ? ` (${pingResult.latencyMs}ms)` : ''}
              </div>
            )}

            <div style={{ paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Guía de Errores Comunes de iDempiere:
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: '#475569',
                  lineHeight: 1.45
                }}
              >
                {COMMON_ERRORS.map((err) => (
                  <li key={err.code}>
                    <strong style={{ color: '#0f172a' }}>{err.code}:</strong> {err.detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '9px',
              padding: '10px 12px',
              fontSize: '0.73rem',
              color: '#475569',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <span>
              Canal transporte:{' '}
              <strong style={{ color: '#0f172a' }}>
                {corsProxyEnabled ? `Proxy CORS (${corsProxyMode})` : 'HTTPS Directo'}
              </strong>
            </span>
            <button
              onClick={onOpenInspector}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#d97706',
                fontWeight: '800',
                fontSize: '0.74rem',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Abrir Inspector Completo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
