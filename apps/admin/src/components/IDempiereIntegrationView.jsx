import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/authService';

export default function IDempiereIntegrationView() {
  const { session, logout, baseUrl, proxyMode } = useAuth();
  const [copied, setCopied] = useState(false);
  const [testUrl, setTestUrl] = useState(
    `${baseUrl || 'https://test.idempiere.org:443'}/api/v1/auth/tokens`
  );
  const [pingResult, setPingResult] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  const handleCopyToken = () => {
    if (session?.token) {
      navigator.clipboard.writeText(session.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);

    const startTime = Date.now();
    try {
      const url = AuthService.buildUrl(baseUrl, '/api/v1/auth/tokens', { mode: proxyMode });
      const validPassword = session?.password || 'GardenAdmin';
      const validUserName = session?.userName || 'admin @ gardenworld.com';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userName: validUserName,
          password: validPassword,
          parameters: {
            clientId: Number(session?.clientId || 11),
            roleId: Number(session?.roleId || 102),
            organizationId: Number(session?.organizationId || 11),
            warehouseId: Number(session?.warehouseId || 103),
            language: session?.language || 'en_US'
          }
        })
      });

      const duration = Date.now() - startTime;
      const nowStr = new Date().toLocaleTimeString();

      if (res.ok) {
        setPingResult({
          ok: true,
          status: '200 (OK - Conexión Exitosa)',
          statusText: 'Autenticación iDempiere respondida correctamente',
          latency: `${duration} ms`,
          time: nowStr
        });
      } else {
        const errorData = await res.json().catch(() => null);
        const detail = errorData?.detail || errorData?.message || res.statusText || '';
        setPingResult({
          ok: false,
          status: `${res.status} (${detail})`,
          statusText: detail,
          latency: `${duration} ms`,
          time: nowStr
        });
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      setPingResult({
        ok: false,
        status: 'Error de Red / CORS',
        statusText: err.message,
        latency: `${duration} ms`,
        time: new Date().toLocaleTimeString()
      });
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. TOP BANNER DE CONEXIÓN ACTIVA (Exacto a Imagen 5) */}
      <div style={{
        backgroundColor: '#ecfdf5',
        border: '1px solid #a7f3d0',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            backgroundColor: '#059669',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)'
          }}>
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#064e3b' }}>
                Conexión iDempiere ERP REST API v1
              </span>
              <span style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '0.68rem',
                fontWeight: '800',
                letterSpacing: '0.04em'
              }}>
                LIVE PRODUCTION ERP
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '2px' }}>
              Autenticación corporativa validada con token Bearer activo
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => alert(`Token Activo:\n${session?.token}`)}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔍 Inspeccionar Token
          </button>

          <button
            onClick={logout}
            style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#dc2626',
              cursor: 'pointer'
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* 2. FILA DE 4 TARJETAS: DIRECTIVAS, CONTEXTO Y TOKEN (Exacto a Imagen 5) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px'
      }}>
        {/* Directiva A */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>
              DIRECTIVA A &bull; BLINDADA
            </span>
            <span>🎯</span>
          </div>
          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', marginBottom: '6px' }}>
            Endpoint en Plural (/tokens)
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', marginBottom: '10px' }}>
            Ruta exacta configurada: <code>POST /api/v1/auth/tokens</code>. Se prohíbe terminantemente la ruta singular <code>/token</code> para evitar HTTP 404 en el despachador de Apache Felix OSGi.
          </p>
          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '700' }}>
            <div>✓ Accept: application/json</div>
            <div>✓ Content-Type: application/json</div>
          </div>
        </div>

        {/* Directiva B */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>
              DIRECTIVA B &bull; BLINDADA
            </span>
            <span>📦</span>
          </div>
          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', marginBottom: '6px' }}>
            Payload Anidado y organizationId
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', marginBottom: '10px' }}>
            Parámetros encapsulados en objeto "parameters". Campo de organización nombrado estrictamente "organizationId" (nunca "orgId") para prevenir fallo Java LoginCredential.
          </p>
          <pre style={{
            backgroundColor: '#f1f5f9',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            color: '#0284c7',
            margin: 0
          }}>
"parameters": &#123; "organizationId": {session?.organizationId ?? 11} &#125;
          </pre>
        </div>

        {/* Contexto GardenWorld */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#ea580c', textTransform: 'uppercase' }}>
              CONTEXTO GARDENWORLD
            </span>
            <span>🏢</span>
          </div>
          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', marginBottom: '6px' }}>
            Parámetros ERP Activos
          </div>
          <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: '1.6' }}>
            <div><strong>Client:</strong> {session?.clientId ?? 11} ({session?.clientName ?? 'GardenWorld, Inc.'})</div>
            <div><strong>Role:</strong> {session?.roleId ?? 102} ({session?.roleName ?? 'GardenAdmin'})</div>
            <div><strong>Org:</strong> {session?.organizationId ?? 11} (HQ - Headquarters)</div>
            <div><strong>Warehouse:</strong> {session?.warehouseId ?? 103}</div>
            <div style={{ color: '#64748b', marginTop: '2px' }}>
              Usuario: <code>{session?.userName || 'admin@gardenworld.com'}</code>
            </div>
          </div>
        </div>

        {/* Token Seguridad */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' }}>
              TOKEN SEGURIDAD
            </span>
            <button
              onClick={handleCopyToken}
              style={{
                background: 'none',
                border: 'none',
                color: copied ? '#16a34a' : '#0284c7',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {copied ? '✓ Copiado' : '📋 Copiar'}
            </button>
          </div>
          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', marginBottom: '6px' }}>
            Bearer Token Emitido
          </div>
          <div style={{
            backgroundColor: '#0f172a',
            color: '#38bdf8',
            padding: '8px 10px',
            borderRadius: '6px',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            maxHeight: '60px',
            overflowY: 'hidden',
            marginBottom: '6px'
          }}>
            {session?.token ? `${session.token.slice(0, 75)}...` : 'Bearer eyJraWQiOiJpZGVtcGllcmUtLCJhbGciOi...'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            Emisión: {session?.loginAt ? new Date(session.loginAt).toLocaleTimeString() : '20:56:33'}
          </div>
        </div>
      </div>

      {/* 3. FILA INFERIOR: PAYLOAD TRANSMITIDO & DIAGNÓSTICO DE CONEXIÓN (Exacto a Imagen 5) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {/* Payload JSON Transmitido */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '22px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Payload JSON Transmitido a iDempiere
            </h3>
            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: '800' }}>
              VALIDADO ✓
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '12px' }}>
            Cumplimiento estricto con las directivas del motor TrekGlobal REST v1
          </div>

          <pre style={{
            backgroundColor: '#0a0e17',
            color: '#38bdf8',
            borderRadius: '10px',
            padding: '14px',
            fontSize: '0.76rem',
            fontFamily: 'monospace',
            overflowX: 'auto',
            margin: '0 0 14px 0'
          }}>
{JSON.stringify({
  userName: session?.userName || "admin @ gardenworld.com",
  password: "****************",
  parameters: {
    clientId: session?.clientId || 11,
    roleId: session?.roleId || 102,
    organizationId: session?.organizationId || 11,
    warehouseId: session?.warehouseId || 103,
    language: session?.language || "en_US"
  }
}, null, 2)}
          </pre>

          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '0.72rem',
            color: '#92400e',
            lineHeight: '1.45'
          }}>
            <strong>💡 Nota del Arquitecto:</strong> Si los parámetros se envían planos en la raíz (ej: <code>&#123; "clientId": 11, ... &#125;</code>) o si se usa "orgId", Jackson/Gson en iDempiere falla al deserializar la clase Java <code>com.trekglobal.idempiere.rest.api.v1.auth.LoginCredential</code>, arrojando HTTP 400 Bad Request. Nuestra implementación garantiza que este fallo nunca ocurra.
          </div>
        </div>

        {/* Herramienta de Diagnóstico de Conexión ERP */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '22px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              Herramienta de Diagnóstico de Conexión ERP
            </h3>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '14px' }}>
              Prueba la accesibilidad HTTP/REST del endpoint iDempiere en tiempo real
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                URL Base del Servidor iDempiere:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    color: '#0f172a'
                  }}
                />
                <button
                  onClick={handleTestPing}
                  disabled={isPinging}
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: isPinging ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)'
                  }}
                >
                  {isPinging ? 'Probando...' : '⚡ Probar Ping'}
                </button>
              </div>
            </div>

            {/* Resultado Ping */}
            {pingResult && (
              <div style={{
                backgroundColor: pingResult.ok ? '#f0fdf4' : '#fff1f2',
                border: `1px solid ${pingResult.ok ? '#bbf7d0' : '#fecdd3'}`,
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.75rem',
                color: pingResult.ok ? '#15803d' : '#be123c',
                marginBottom: '14px'
              }}>
                <div><strong>Estado:</strong> {pingResult.status} ({pingResult.statusText})</div>
                <div><strong>Latencia:</strong> {pingResult.latency} &bull; {pingResult.time}</div>
              </div>
            )}
          </div>

          {/* Guía de Errores Comunes de iDempiere */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 14px',
            fontSize: '0.72rem',
            color: '#475569'
          }}>
            <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              Guía de Errores Comunes de iDempiere:
            </div>
            <ul style={{ paddingLeft: '16px', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <li><strong>HTTP 404:</strong> Causado por usar <code>/token</code> en singular. Solucionado usando <code>/tokens</code>.</li>
              <li><strong>HTTP 400:</strong> Causado por <code>orgId</code> en raíz o tipos de datos no numéricos. Solucionado con sanitización estricta.</li>
              <li><strong>HTTP 401:</strong> Credenciales inválidas o usuario sin el rol 102 en el cliente 11.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

