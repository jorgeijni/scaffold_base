import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ErpStatusModal({ isOpen, onClose }) {
  const { user, token, isMock, loginMode, erpEndpoint, erpBaseUrl, latencyMs, warningMessage, pingErp } = useAuth();
  const [copied, setCopied] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunPing = async () => {
    setPinging(true);
    try {
      const res = await pingErp(erpBaseUrl);
      setTestResult(res);
    } catch (err) {
      setTestResult({ online: false, error: err.message });
    } finally {
      setPinging(false);
    }
  };

  const maskedToken = token
    ? `${token.substring(0, 16)}...${token.substring(token.length - 12)}`
    : 'No hay token activo';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '580px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        color: '#0f172a'
      }}>
        {/* Header del Modal */}
        <div style={{
          padding: '18px 24px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>⚙️</span>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800' }}>
                Diagnóstico de Integración iDempiere ERP v1
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Sesión Activa, Parámetros de Contexto y Token Bearer
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.4rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Contenido del Modal */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Badge Estado */}
          <div style={{
            background: isMock ? '#fef3c7' : '#dcfce7',
            border: `1px solid ${isMock ? '#fde68a' : '#86efac'}`,
            padding: '12px 16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>{isMock ? '🟡' : '🟢'}</span>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: isMock ? '#92400e' : '#166534' }}>
                  {isMock ? 'Modo Resiliente / Simulación de Contingencia' : 'Conectado en Vivo con iDempiere REST API v1'}
                </div>
                <div style={{ fontSize: '0.75rem', color: isMock ? '#b45309' : '#15803d' }}>
                  {isMock 
                    ? 'El ERP remoto no estaba accesible; se emitió token de contingencia.'
                    : `Conexión verificada exitosamente (${latencyMs || 0}ms).`}
                </div>
              </div>
            </div>
          </div>

          {warningMessage && (
            <div style={{
              background: '#fffbeb',
              borderLeft: '4px solid #f59e0b',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: '#92400e'
            }}>
              ⚠️ {warningMessage}
            </div>
          )}

          {/* Cuadrícula de Parámetros de Contexto */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
              📋 Parámetros de Contexto Inyectados (Reglas iDempiere v1)
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              background: '#f8fafc',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.82rem'
            }}>
              <div>
                <span style={{ color: '#64748b' }}>Usuario (userName):</span>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{user?.userName || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Endpoint Base:</span>
                <div style={{ fontWeight: '700', color: '#0284c7', fontFamily: 'monospace' }}>
                  POST /api/v1/auth/tokens
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Cliente (clientId):</span>
                <div style={{ fontWeight: '700' }}>{user?.clientId} ({user?.clientName || 'GardenWorld'})</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Rol (roleId):</span>
                <div style={{ fontWeight: '700' }}>{user?.roleId} ({user?.roleName || 'Admin'})</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Organización (organizationId):</span>
                <div style={{ fontWeight: '700', color: '#d97706' }}>
                  {user?.organizationId} ({user?.orgName || 'HQ'}) &bull; <small style={{ color: '#059669' }}>OK</small>
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Almacén (warehouseId):</span>
                <div style={{ fontWeight: '700' }}>{user?.warehouseId || 103}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Idioma (language):</span>
                <div style={{ fontWeight: '700' }}>{user?.language || 'en_US'}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Servidor Destino:</span>
                <div style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '0.75rem' }}>{erpBaseUrl}</div>
              </div>
            </div>
          </div>

          {/* Token Bearer */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
              🔑 Token Bearer de Sesión
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#0f172a',
              color: '#38bdf8',
              padding: '10px 14px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.78rem'
            }}>
              <span style={{ flex: 1, wordBreak: 'break-all' }}>{maskedToken}</span>
              <button
                type="button"
                onClick={handleCopyToken}
                style={{
                  background: copied ? '#10b981' : '#334155',
                  color: '#ffffff',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {copied ? '✓ Copiado' : 'Copiar Token'}
              </button>
            </div>
          </div>

          {/* Prueba de Conectividad Interactiva */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>
                Test de Conectividad con iDempiere ({erpBaseUrl})
              </span>
              <button
                type="button"
                disabled={pinging}
                onClick={handleRunPing}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: pinging ? 'wait' : 'pointer'
                }}
              >
                {pinging ? 'Probando...' : '⚡ Ejecutar Ping'}
              </button>
            </div>

            {testResult && (
              <div style={{
                background: testResult.online ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${testResult.online ? '#a7f3d0' : '#fecaca'}`,
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                color: testResult.online ? '#065f46' : '#991b1b'
              }}>
                <strong>{testResult.online ? '✓ En línea' : '✗ Sin conexión'}</strong>: {testResult.message || testResult.error} {testResult.latencyMs && `(${testResult.latencyMs}ms)`}
              </div>
            )}
          </div>

        </div>

        {/* Footer del Modal */}
        <div style={{
          padding: '14px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Cerrar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
}
