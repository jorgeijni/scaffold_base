import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar({
  activeSection,
  onSelectSection,
  burgersCount,
  ordersCount,
  onOpenInspector,
  isOpenMobile,
  onCloseMobile
}) {
  const { user, orgId, organizationId, logout } = useAuth();
  const effectiveOrgId = organizationId ?? orgId ?? 11;

  const navItems = [
    { id: 'resumen', label: 'Resumen General', icon: '📊' },
    { id: 'burgers', label: 'Catálogo Hamburguesas', icon: '🍔', badge: burgersCount, badgeTone: 'neutral' },
    { id: 'orders', label: 'Bandeja Pedidos', icon: '📦', badge: ordersCount, badgeTone: 'neutral' },
    { id: 'customers', label: 'Métricas de Clientes', icon: '👥' },
    { id: 'database', label: 'Estado Base de Datos', icon: '🗄️' },
    { id: 'idempiere', label: 'iDempiere ERP', icon: '🏢', pill: 'Live' },
    { id: 'profile', label: 'Perfil & Conexión ERP', icon: '⚙️' }
  ];

  const handleNavClick = (sectionId) => {
    onSelectSection(sectionId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      style={{
        width: '256px',
        minWidth: '256px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 14px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 40
      }}
      className={isOpenMobile ? 'admin-sidebar open' : 'admin-sidebar'}
    >
      {/* Top: Brand + Nav Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f97316, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: '0 4px 10px rgba(234, 88, 12, 0.25)',
                flexShrink: 0
              }}
            >
              🍔
            </div>
            <div>
              <div style={{ fontSize: '0.96rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.15 }}>
                Hamburger Rapid
              </div>
              <div style={{ fontSize: '0.62rem', fontWeight: '800', color: '#d97706', letterSpacing: '0.06em' }}>
                CONTROL DASHBOARD
              </div>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="admin-sidebar-close"
              aria-label="Cerrar menú"
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                color: '#475569',
                fontWeight: '700'
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid #fde68a' : '1px solid transparent',
                  background: isActive ? '#fffbeb' : 'transparent',
                  color: isActive ? '#b45309' : '#334155',
                  fontSize: '0.83rem',
                  fontWeight: isActive ? '800' : '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </span>

                {typeof item.badge === 'number' && (
                  <span
                    style={{
                      background: isActive ? '#fef3c7' : '#f1f5f9',
                      color: isActive ? '#b45309' : '#475569',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      flexShrink: 0
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {item.pill && (
                  <span
                    style={{
                      background: '#f97316',
                      color: '#ffffff',
                      fontSize: '0.66rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      flexShrink: 0
                    }}
                  >
                    {item.pill}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: User Context Box + Quick Access */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '14px' }}>
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.9rem' }}>🛡️</span>
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: '800',
                color: '#0f172a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={user?.userName}
            >
              {user?.userName || 'Usuario ERP'}
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '10px', paddingLeft: '22px' }}>
            {user?.roleName || `Rol ${user?.roleId || 'N/A'}`} &bull; Org {effectiveOrgId}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px' }}>
            <button
              onClick={onOpenInspector}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 8px',
                fontSize: '0.74rem',
                fontWeight: '700',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Token Info
            </button>
            <button
              onClick={logout}
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.74rem',
                fontWeight: '700',
                color: '#e11d48',
                cursor: 'pointer'
              }}
            >
              Salir
            </button>
          </div>
        </div>

        <div style={{ padding: '0 6px' }}>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: '800',
              color: '#94a3b8',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}
          >
            ACCESO RÁPIDO
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#334155',
                textDecoration: 'none',
                padding: '5px 4px',
                borderRadius: '6px'
              }}
            >
              <span>🌐</span>
              <span>Landing E-commerce</span>
            </a>
            <a
              href="/app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#334155',
                textDecoration: 'none',
                padding: '5px 4px',
                borderRadius: '6px'
              }}
            >
              <span>📱</span>
              <span>App Móvil PWA</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
