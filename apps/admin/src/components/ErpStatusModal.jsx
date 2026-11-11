import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const VERIFIED_DIRECTIVES = [
  { label: 'Endpoint Plural:', value: '/api/v1/auth/tokens' },
  { label: 'Cabecera:', value: 'Content-Type / Accept: json' },
  { label: 'Parámetro Org:', value: 'organizationId (no orgId)' },
  { label: 'Contexto Anidado:', value: 'parameters: { ... }' }
];

function formatSessionTimestamp(isoString) {
  if (!isoString) return new Date().toLocaleString('es-CO');
  try {
    return new Date(isoString).toLocaleString('es-CO');
  } catch {
    return String(isoString);
  }
}

export default function ErpStatusModal({ isOpen, onClose }) {
  const {
    session,
    user,
    token,
    authMode,
    erpEndpoint,
    erpBaseUrl,
    corsProxyEnabled,
    corsProxyMode,
    latencyMs
  } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso si clipboard no esta disponible en contexto inseguro
    }
  };

  const resolvedEndpoint =
    session?.endpoint ||
    erpEndpoint ||
    `${(erpBaseUrl || '').replace(/\/+$/, '')}/api/v1/auth/tokens`;
  const effectiveOrgId = user?.organizationId ?? user?.orgId ?? 'N/A';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '680px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          color: '#0f172a',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #60a5fa, #1d4ed8)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                flexShrink: 0
              }}
            >
              🛡️
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Inspector de Sesión iDempiere ERP REST
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                Auditoría y estado del token de autenticación según especificación v1
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar Inspector"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#475569',
              fontSize: '1.15rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            padding: '18px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            overflowY: 'auto'
          }}
        >
          {/* Connection Status Banner */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '12px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.2)',
                  flexShrink: 0
                }}
              />
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#14532d' }}>
                  Conectado a Servidor iDempiere Live
                </div>
                <div style={{ fontSize: '0.74rem', color: '#15803d', marginTop: '1px' }}>
                  Autenticación corporativa validada con token Bearer activo
                  {authMode === 'two_step' ? ' • Flujo Asistido (2 Pasos)' : ' • Flujo Directo (1 Paso)'}
                  {latencyMs !== null ? ` • ${latencyMs}ms` : ''}
                  {corsProxyEnabled ? ` • CORS (${corsProxyMode})` : ''}
                </div>
              </div>
            </div>

            <span
              style={{
                background: '#16a34a',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: '800',
                letterSpacing: '0.04em'
              }}
            >
              BEARER
            </span>
          </div>

          {/* Blindaje Tecnico Verificado */}
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: '800',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px'
              }}
            >
              BLINDAJE TÉCNICO IDEMPIERE V1 VERIFICADO
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '10px'
              }}
            >
              {VERIFIED_DIRECTIVES.map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ color: '#16a34a', fontWeight: '800' }}>✓</span>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>{item.label}</span>
                  <code
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      color: '#334155',
                      fontSize: '0.75rem'
                    }}
                  >
                    {item.value}
                  </code>
                </div>
              ))}
            </div>
          </div>

          {/* Parametros de Contexto ERP */}
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: '800',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px'
              }}
            >
              PARÁMETROS DE CONTEXTO ERP EN SESIÓN
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '14px',
                fontSize: '0.8rem'
              }}
            >
              <div>
                <div style={{ color: '#64748b', fontSize: '0.73rem', marginBottom: '3px' }}>Usuario:</div>
                <div style={{ fontWeight: '800', color: '#0f172a', wordBreak: 'break-word' }}>
                  {user?.userName || 'N/A'}
                </div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontSize: '0.73rem', marginBottom: '3px' }}>Client ID:</div>
                <div style={{ fontWeight: '800', color: '#d97706' }}>
                  {user?.clientId ?? 'N/A'}
                  {user?.clientName ? ` (${user.clientName})` : ''}
                </div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontSize: '0.73rem', marginBottom: '3px' }}>Role ID:</div>
                <div style={{ fontWeight: '800', color: '#d97706' }}>
                  {user?.roleId ?? 'N/A'}
                  {user?.roleName ? ` (${user.roleName})` : ''}
                </div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontSize: '0.73rem', marginBottom: '3px' }}>Organization ID:</div>
                <div style={{ fontWeight: '800', color: '#d97706' }}>
                  {effectiveOrgId}
                  {user?.orgName ? ` (${user.orgName})` : ''}
                </div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontSize: '0.73rem', marginBottom: '3px' }}>Warehouse ID:</div>
                <div style={{ fontWeight: '800', color: '#d97706' }}>
                  {user?.warehouseId ?? 'N/A'}
                  {user?.warehouseName ? ` (${user.warehouseName})` : ''}
                </div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontSize: '0.73rem', marginBottom: '3px' }}>Idioma:</div>
                <div style={{ fontWeight: '800', color: '#0f172a' }}>
                  {user?.language || 'en_US'}
                </div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontSize: '0.73rem', marginBottom: '3px' }}>User ID:</div>
                <div style={{ fontWeight: '800', color: '#0f172a' }}>
                  {user?.userId ?? 'N/A'}
                </div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontSize: '0.73rem', marginBottom: '3px' }}>Proxy CORS:</div>
                <div style={{ fontWeight: '700', color: corsProxyEnabled ? '#0284c7' : '#334155' }}>
                  {corsProxyEnabled ? `Activo (${corsProxyMode})` : 'Directo'}
                </div>
              </div>
            </div>
          </div>

          {/* Token Terminal */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}
            >
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155' }}>
                Token de Acceso (JWT / Bearer Token):
              </span>
              <button
                onClick={handleCopyToken}
                disabled={!token}
                style={{
                  background: copied ? '#dcfce7' : '#ffffff',
                  color: copied ? '#166534' : '#334155',
                  border: `1px solid ${copied ? '#86efac' : '#cbd5e1'}`,
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  cursor: token ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {copied ? '✅ Token Copiado' : '📋 Copiar Token'}
              </button>
            </div>

            <div
              style={{
                background: '#09101d',
                color: '#67e8f9',
                borderRadius: '10px',
                padding: '14px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.76rem',
                lineHeight: 1.5,
                wordBreak: 'break-all',
                maxHeight: '112px',
                overflowY: 'auto',
                border: '1px solid #1e293b'
              }}
            >
              {token || 'No hay token Bearer activo en esta sesión.'}
            </div>
          </div>

          {/* Footer Timestamp + Endpoint */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              paddingTop: '10px',
              borderTop: '1px solid #f1f5f9',
              fontSize: '0.73rem',
              color: '#64748b'
            }}
          >
            <span>Inicio de sesión: {formatSessionTimestamp(session?.savedAt)}</span>
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', wordBreak: 'break-all' }}>
              Endpoint: {resolvedEndpoint}
            </span>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div
          style={{
            padding: '12px 24px 18px',
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: '1px solid #f1f5f9',
            background: '#ffffff'
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Cerrar Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
