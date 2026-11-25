import React, { useState } from 'react';

// ==========================================
// ICONOS VECTORIALES EXACTOS (LUCIDE & PHOSPHOR)
// ==========================================

export function LogoIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '9px' }}>
      <rect width="40" height="40" rx="10" fill="#c3f53c" />
      {/* Glifo estilizado de código <> */}
      <path
        d="M17.5 14L11 20L17.5 26M22.5 14L29 20L22.5 26"
        stroke="#0f172a"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PanelLeftCloseIcon({ className = "h-4 w-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m16 15-3-3 3-3" />
    </svg>
  );
}

export function PanelLeftOpenIcon({ className = "h-5 w-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m14 9 3 3-3 3" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "h-4 w-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function FirstStepsIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <path d="M168,152a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,152Zm-8-40H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm56-64V216a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V48A16,16,0,0,1,56,32H92.26a47.92,47.92,0,0,1,71.48,0H200A16,16,0,0,1,216,48ZM96,64h64a32,32,0,0,0-64,0ZM200,48H173.25A47.93,47.93,0,0,1,176,64v8a8,8,0,0,1-8,8H88a8,8,0,0,1-8-8V64a47.93,47.93,0,0,1,2.75-16H56V216H200Z" />
    </svg>
  );
}

export function HomeIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <path d="M224,120v96a8,8,0,0,1-8,8H160a8,8,0,0,1-8-8V164a4,4,0,0,0-4-4H108a4,4,0,0,0-4,4v52a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V120a16,16,0,0,1,4.69-11.31l80-80a16,16,0,0,1,22.62,0l80,80A16,16,0,0,1,224,120Z" />
    </svg>
  );
}

export function StarIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z" />
    </svg>
  );
}

export function ContactsIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <path d="M200,112a8,8,0,0,1-8,8H152a8,8,0,0,1,0-16h40A8,8,0,0,1,200,112Zm-8,24H152a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm40-80V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM216,200V56H40V200H216Zm-80.26-34a8,8,0,1,1-15.5,4c-2.63-10.26-13.06-18-24.25-18s-21.61,7.74-24.25,18a8,8,0,1,1-15.5-4,39.84,39.84,0,0,1,17.19-23.34,32,32,0,1,1,45.12,0A39.76,39.76,0,0,1,135.75,166ZM96,136a16,16,0,1,0-16-16A16,16,0,0,0,96,136Z" />
    </svg>
  );
}

export function SalesIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31l-56,56V200H224A8,8,0,0,1,232,208Z" />
    </svg>
  );
}

export function PurchasesIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <path d="M72,104a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,104Zm8,40h96a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM232,56V208a8,8,0,0,1-11.58,7.15L192,200.94l-28.42,14.21a8,8,0,0,1-7.16,0L128,200.94,99.58,215.15a8,8,0,0,1-7.16,0L64,200.94,35.58,215.15A8,8,0,0,1,24,208V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Zm-16,0H40V195.06l20.42-10.22a8,8,0,0,1,7.16,0L96,199.06l28.42-14.22a8,8,0,0,1,7.16,0L160,199.06l28.42-14.22a8,8,0,0,1,7.16,0L216,195.06Z" />
    </svg>
  );
}

export function InventoryIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z" />
    </svg>
  );
}

export function FinanceIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <path d="M24,104H48v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16H208V104h24a8,8,0,0,0,4.19-14.81l-104-64a8,8,0,0,0-8.38,0l-104,64A8,8,0,0,0,24,104Zm40,0H96v64H64Zm80,0v64H112V104Zm48,64H160V104h32ZM128,41.39,203.74,88H52.26ZM248,208a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H240A8,8,0,0,1,248,208Z" />
    </svg>
  );
}

export function AiAgentIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <path d="M237.66,66.34a8,8,0,0,0-11.32,0L192,100.69,155.31,64l34.35-34.34a8,8,0,1,0-11.32-11.32L144,52.69,117.66,26.34a8,8,0,0,0-11.32,11.32L112.69,44l-53,53a40,40,0,0,0,0,56.57l15.71,15.71L26.34,218.34a8,8,0,0,0,11.32,11.32l49.09-49.09,15.71,15.71a40,40,0,0,0,56.57,0l53-53,6.34,6.35a8,8,0,0,0,11.32-11.32L203.31,112l34.35-34.34A8,8,0,0,0,237.66,66.34ZM147.72,185a24,24,0,0,1-33.95,0L71,142.23a24,24,0,0,1,0-33.95l53-53L200.69,132Z" />
    </svg>
  );
}

export function SettingsIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Z" />
    </svg>
  );
}

export function HeadphonesIcon({ size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

export function UserIcon({ size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL SIDEBAR NAVBAR
// ==========================================

export default function SidebarNavbar({
  activeView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  session,
  onOpenTokenModal,
  onLogout
}) {
  const [openSubmenus, setOpenSubmenus] = useState({
    comercial: false,
    operaciones: false,
    finanzas: false,
    sistema: false
  });

  const toggleSubmenu = (key) => {
    setOpenSubmenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Nombre de usuario para mostrar
  const displayName = session?.userName ? session.userName.split('@')[0] : 'Monica Ruiz Sanc...';
  const roleName = session?.roleName || 'Demo';
  const initial = (displayName.charAt(0) || 'M').toUpperCase();

  return (
    <nav
      aria-label="Navegación"
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
        transition: 'width 200ms ease-in-out',
        overflow: 'hidden',
        width: isCollapsed ? '56px' : '240px',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. HEADER (Top switcher y botón colapsar/expandir) */}
      {isCollapsed ? (
        <div style={{
          display: 'flex',
          height: '96px',
          flexShrink: 0,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          borderBottom: '1px solid #e2e8f0',
          padding: '8px 0'
        }}>
          <LogoIcon size={34} />
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expandir menú"
            title="Expandir menú"
            style={{
              display: 'flex',
              height: '32px',
              width: '32px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'background-color 0.15s, color 0.15s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <PanelLeftOpenIcon />
          </button>
        </div>
      ) : (
        <div style={{
          position: 'relative',
          display: 'flex',
          flexShrink: 0,
          alignItems: 'center',
          height: '62px',
          padding: '0 12px',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          {/* Company Switcher */}
          <div style={{
            display: 'flex',
            flex: 1,
            minWidth: 0,
            alignItems: 'center',
            gap: '8px',
            height: '40px',
            paddingLeft: '4px',
            paddingRight: '6px',
            borderRadius: '9999px',
            backgroundColor: 'transparent'
          }}>
            <LogoIcon size={32} />
            <div style={{
              display: 'flex',
              minWidth: 0,
              flex: 1,
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left'
            }}>
              <span style={{
                display: 'block',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.86rem',
                fontWeight: '700',
                lineHeight: 1.2,
                color: '#0f172a'
              }}>
                Calzados Sh...
              </span>
              <span style={{
                fontSize: '11px',
                lineHeight: 1.2,
                color: '#64748b',
                fontWeight: '500'
              }}>
                {roleName}
              </span>
            </div>
            <ChevronDownIcon />
          </div>

          {/* Botón Colapsar Sidebar */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Contraer menú"
            title="Contraer menú"
            style={{
              display: 'flex',
              height: '32px',
              width: '32px',
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'background-color 0.15s, color 0.15s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <PanelLeftCloseIcon />
          </button>
        </div>
      )}

      {/* 2. BODY SCROLLABLE DE NAVEGACIÓN */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: isCollapsed ? '8px 6px' : '8px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: isCollapsed ? '10px' : '2px'
      }}>
        {/* ================= SECCIÓN: GENERAL ================= */}
        {!isCollapsed && (
          <div style={{ padding: '12px 16px 4px 16px' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '500' }}>General</span>
          </div>
        )}

        {/* Primeros Pasos */}
        <div style={{ padding: isCollapsed ? '0' : '2px 8px', display: isCollapsed ? 'flex' : 'block', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onSelectView('first-steps')}
            title="Primeros pasos (1/5)"
            style={{
              display: 'flex',
              width: isCollapsed ? '40px' : '100%',
              height: isCollapsed ? '40px' : 'auto',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: isCollapsed ? '0' : '6px 12px',
              fontSize: '0.86rem',
              borderRadius: isCollapsed ? '8px' : '6px',
              border: 'none',
              backgroundColor: activeView === 'first-steps' ? '#ffffff' : 'transparent',
              color: activeView === 'first-steps' ? '#0f172a' : '#334155',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: activeView === 'first-steps' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { if (activeView !== 'first-steps') e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { if (activeView !== 'first-steps') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ color: activeView === 'first-steps' ? '#0f172a' : '#64748b', display: 'flex' }}>
              <FirstStepsIcon />
            </div>
            {!isCollapsed && (
              <>
                <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Primeros pasos
                </span>
                <span style={{
                  borderRadius: '9999px',
                  backgroundColor: '#e2e8f0',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#475569',
                  lineHeight: 1
                }}>
                  1/5
                </span>
              </>
            )}
            {isCollapsed && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                display: 'flex',
                height: '16px',
                minWidth: '16px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                padding: '0 3px',
                fontSize: '10px',
                fontWeight: '700',
                backgroundColor: '#2563eb',
                color: '#ffffff'
              }}>
                4
              </span>
            )}
          </button>
        </div>

        {/* Inicio (Home / Dashboard) */}
        <div style={{ padding: isCollapsed ? '0' : '2px 8px', display: isCollapsed ? 'flex' : 'block', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onSelectView('summary')}
            title="Inicio"
            style={{
              display: 'flex',
              width: isCollapsed ? '40px' : '100%',
              height: isCollapsed ? '40px' : 'auto',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: isCollapsed ? '0' : '6px 12px',
              fontSize: '0.86rem',
              fontWeight: '600',
              borderRadius: isCollapsed ? '8px' : '6px',
              border: activeView === 'summary' ? '1px solid #cbd5e1' : '1px solid transparent',
              backgroundColor: activeView === 'summary' ? '#ffffff' : 'transparent',
              color: '#0f172a',
              cursor: 'pointer',
              boxShadow: activeView === 'summary' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { if (activeView !== 'summary') e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { if (activeView !== 'summary') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ color: '#0f172a', display: 'flex' }}>
              <HomeIcon />
            </div>
            {!isCollapsed && (
              <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Inicio
              </span>
            )}
          </button>
        </div>

        {/* Favoritos (Catálogo Hamburguesas) */}
        <div style={{ padding: isCollapsed ? '0' : '2px 8px', display: isCollapsed ? 'flex' : 'block', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onSelectView('catalog')}
            title="Favoritos (Catálogo de Autor)"
            style={{
              display: 'flex',
              width: isCollapsed ? '40px' : '100%',
              height: isCollapsed ? '40px' : 'auto',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '10px',
              padding: isCollapsed ? '0' : '6px 12px',
              fontSize: '0.86rem',
              borderRadius: isCollapsed ? '8px' : '6px',
              border: 'none',
              backgroundColor: activeView === 'catalog' ? '#ffffff' : 'transparent',
              color: activeView === 'catalog' ? '#0f172a' : '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { if (activeView !== 'catalog') e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { if (activeView !== 'catalog') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: activeView === 'catalog' ? '#0f172a' : '#64748b', display: 'flex' }}>
                <StarIcon />
              </div>
              {!isCollapsed && (
                <span style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Favoritos
                </span>
              )}
            </div>
            {!isCollapsed && <ChevronDownIcon />}
          </button>
        </div>

        {/* ================= SECCIÓN: COMERCIAL ================= */}
        {!isCollapsed && (
          <div style={{ padding: '12px 16px 4px 16px' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '500' }}>Comercial</span>
          </div>
        )}

        {/* Contactos */}
        <div style={{ padding: isCollapsed ? '0' : '2px 8px', display: isCollapsed ? 'flex' : 'block', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onSelectView('erp_customers')}
            title="Contactos (C_BPartner)"
            style={{
              display: 'flex',
              width: isCollapsed ? '40px' : '100%',
              height: isCollapsed ? '40px' : 'auto',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: isCollapsed ? '0' : '6px 12px',
              fontSize: '0.86rem',
              borderRadius: isCollapsed ? '8px' : '6px',
              border: 'none',
              backgroundColor: activeView === 'erp_customers' ? '#ffffff' : 'transparent',
              color: activeView === 'erp_customers' ? '#0f172a' : '#334155',
              cursor: 'pointer',
              boxShadow: activeView === 'erp_customers' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { if (activeView !== 'erp_customers') e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { if (activeView !== 'erp_customers') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ color: activeView === 'erp_customers' ? '#0f172a' : '#64748b', display: 'flex' }}>
              <ContactsIcon />
            </div>
            {!isCollapsed && (
              <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Contactos
              </span>
            )}
          </button>
        </div>

        {/* Ventas */}
        <div style={{ padding: isCollapsed ? '0' : '2px 8px', display: isCollapsed ? 'flex' : 'block', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onSelectView('orders')}
            title="Ventas (Bandeja de Pedidos & Precios)"
            style={{
              display: 'flex',
              width: isCollapsed ? '40px' : '100%',
              height: isCollapsed ? '40px' : 'auto',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '10px',
              padding: isCollapsed ? '0' : '6px 12px',
              fontSize: '0.86rem',
              borderRadius: isCollapsed ? '8px' : '6px',
              border: 'none',
              backgroundColor: (activeView === 'orders' || activeView === 'prices') ? '#ffffff' : 'transparent',
              color: (activeView === 'orders' || activeView === 'prices') ? '#0f172a' : '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { if (activeView !== 'orders') e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { if (activeView !== 'orders') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: (activeView === 'orders' || activeView === 'prices') ? '#0f172a' : '#64748b', display: 'flex' }}>
                <SalesIcon />
              </div>
              {!isCollapsed && (
                <span style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Ventas
                </span>
              )}
            </div>
            {!isCollapsed && <ChevronDownIcon />}
          </button>
        </div>

        {/* ================= SECCIÓN: OPERACIONES ================= */}
        {!isCollapsed && (
          <div style={{ padding: '12px 16px 4px 16px' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '500' }}>Operaciones</span>
          </div>
        )}

        {/* Compras / Categorías */}
        <div style={{ padding: isCollapsed ? '0' : '2px 8px', display: isCollapsed ? 'flex' : 'block', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onSelectView('product_categories')}
            title="Compras & Categorías de Productos"
            style={{
              display: 'flex',
              width: isCollapsed ? '40px' : '100%',
              height: isCollapsed ? '40px' : 'auto',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '10px',
              padding: isCollapsed ? '0' : '6px 12px',
              fontSize: '0.86rem',
              borderRadius: isCollapsed ? '8px' : '6px',
              border: 'none',
              backgroundColor: activeView === 'product_categories' ? '#ffffff' : 'transparent',
              color: activeView === 'product_categories' ? '#0f172a' : '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { if (activeView !== 'product_categories') e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { if (activeView !== 'product_categories') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: activeView === 'product_categories' ? '#0f172a' : '#64748b', display: 'flex' }}>
                <PurchasesIcon />
              </div>
              {!isCollapsed && (
                <span style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Compras
                </span>
              )}
            </div>
            {!isCollapsed && <ChevronDownIcon />}
          </button>
        </div>

        {/* Inventario / Productos */}
        <div style={{ padding: isCollapsed ? '0' : '2px 8px', display: isCollapsed ? 'flex' : 'block', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onSelectView('products')}
            title="Inventario (Maestro M_Product)"
            style={{
              display: 'flex',
              width: isCollapsed ? '40px' : '100%',
              height: isCollapsed ? '40px' : 'auto',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '10px',
              padding: isCollapsed ? '0' : '6px 12px',
              fontSize: '0.86rem',
              borderRadius: isCollapsed ? '8px' : '6px',
              border: 'none',
              backgroundColor: activeView === 'products' ? '#ffffff' : 'transparent',
              color: activeView === 'products' ? '#0f172a' : '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { if (activeView !== 'products') e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { if (activeView !== 'products') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: activeView === 'products' ? '#0f172a' : '#64748b', display: 'flex' }}>
                <InventoryIcon />
              </div>
              {!isCollapsed && (
                <span style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Inventario
                </span>
              )}
            </div>
            {!isCollapsed && <ChevronDownIcon />}
          </button>
        </div>

        {/* ================= SECCIÓN: FINANZAS ================= */}
        {!isCollapsed && (
          <div style={{ padding: '12px 16px 4px 16px' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '500' }}>Finanzas</span>
          </div>
        )}

        {/* Finanzas (Impuestos C_Tax & Tarifas) */}
        <div style={{ padding: isCollapsed ? '0' : '2px 8px', display: isCollapsed ? 'flex' : 'block', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onSelectView('taxes')}
            title="Finanzas (Impuestos C_Tax & Tarifas)"
            style={{
              display: 'flex',
              width: isCollapsed ? '40px' : '100%',
              height: isCollapsed ? '40px' : 'auto',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '10px',
              padding: isCollapsed ? '0' : '6px 12px',
              fontSize: '0.86rem',
              borderRadius: isCollapsed ? '8px' : '6px',
              border: 'none',
              backgroundColor: (activeView === 'taxes' || activeView === 'prices') ? '#ffffff' : 'transparent',
              color: (activeView === 'taxes' || activeView === 'prices') ? '#0f172a' : '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { if (activeView !== 'taxes') e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { if (activeView !== 'taxes') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: (activeView === 'taxes' || activeView === 'prices') ? '#0f172a' : '#64748b', display: 'flex' }}>
                <FinanceIcon />
              </div>
              {!isCollapsed && (
                <span style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Finanzas
                </span>
              )}
            </div>
            {!isCollapsed && <ChevronDownIcon />}
          </button>
        </div>

        {/* ================= SECCIÓN: SISTEMA ================= */}
        {!isCollapsed && (
          <div style={{ padding: '12px 16px 4px 16px' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '500' }}>Sistema</span>
          </div>
        )}

        {/* Conectar agente de IA (iDempiere ERP v1 Live) */}
        <div style={{ padding: isCollapsed ? '0' : '2px 8px', display: isCollapsed ? 'flex' : 'block', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onSelectView('idempiere')}
            title="Conectar agente de IA (iDempiere ERP Live)"
            style={{
              display: 'flex',
              width: isCollapsed ? '40px' : '100%',
              height: isCollapsed ? '40px' : 'auto',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: isCollapsed ? '0' : '6px 12px',
              fontSize: '0.86rem',
              borderRadius: isCollapsed ? '8px' : '6px',
              border: 'none',
              backgroundColor: activeView === 'idempiere' ? '#ffffff' : 'transparent',
              color: activeView === 'idempiere' ? '#0f172a' : '#334155',
              cursor: 'pointer',
              boxShadow: activeView === 'idempiere' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { if (activeView !== 'idempiere') e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { if (activeView !== 'idempiere') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ color: activeView === 'idempiere' ? '#0f172a' : '#64748b', display: 'flex' }}>
              <AiAgentIcon />
            </div>
            {!isCollapsed && (
              <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Conectar agente de IA
              </span>
            )}
          </button>
        </div>

        {/* Configuración (Perfil & Base de Datos SQLite) */}
        <div style={{ padding: isCollapsed ? '0' : '2px 8px', display: isCollapsed ? 'flex' : 'block', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onSelectView('profile')}
            title="Configuración (Perfil & ERP)"
            style={{
              display: 'flex',
              width: isCollapsed ? '40px' : '100%',
              height: isCollapsed ? '40px' : 'auto',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '10px',
              padding: isCollapsed ? '0' : '6px 12px',
              fontSize: '0.86rem',
              borderRadius: isCollapsed ? '8px' : '6px',
              border: 'none',
              backgroundColor: (activeView === 'profile' || activeView === 'database') ? '#ffffff' : 'transparent',
              color: (activeView === 'profile' || activeView === 'database') ? '#0f172a' : '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { if (activeView !== 'profile') e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { if (activeView !== 'profile') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: (activeView === 'profile' || activeView === 'database') ? '#0f172a' : '#64748b', display: 'flex' }}>
                <SettingsIcon />
              </div>
              {!isCollapsed && (
                <span style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Configuración
                </span>
              )}
            </div>
            {!isCollapsed && <ChevronDownIcon />}
          </button>
        </div>
      </div>

      {/* 3. FOOTER (Ayuda y soporte + Usuario) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        paddingBottom: '8px',
        paddingLeft: '8px',
        paddingRight: '8px',
        gap: '4px',
        paddingTop: '8px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc'
      }}>
        {/* Ayuda y Soporte (Abre Inspector de Sesión Token) */}
        <button
          type="button"
          onClick={onOpenTokenModal}
          title="Ayuda y soporte (Inspector Token ERP)"
          style={{
            display: 'flex',
            width: '100%',
            height: isCollapsed ? '40px' : 'auto',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '10px',
            padding: isCollapsed ? '0' : '8px 10px',
            fontSize: '0.86rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#0f172a',
            cursor: 'pointer',
            transition: 'background-color 0.15s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <span style={{
            position: 'relative',
            display: 'flex',
            height: '28px',
            width: '28px',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '9999px',
            backgroundColor: '#e2e8f0',
            color: '#64748b'
          }}>
            <HeadphonesIcon size={16} />
          </span>
          {!isCollapsed && (
            <>
              <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Ayuda y soporte
              </span>
              <ChevronRightIcon />
            </>
          )}
        </button>

        {/* Usuario / Sesión con opción de Logout */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onLogout}
            title={`${session?.userName || 'Monica Ruiz Sanchez'} - Clic para Salir`}
            style={{
              display: 'flex',
              width: '100%',
              height: isCollapsed ? '40px' : 'auto',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: isCollapsed ? '0' : '8px 10px',
              fontSize: '0.86rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#0f172a',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0f172a'; }}
          >
            {isCollapsed ? (
              <div style={{ position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  height: '24px',
                  width: '24px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: '#e2e8f0',
                  color: '#0f172a'
                }}>
                  {initial}
                </div>
                <span style={{
                  position: 'absolute',
                  bottom: '-3px',
                  right: '-3px',
                  display: 'flex',
                  height: '14px',
                  width: '14px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '9999px',
                  backgroundColor: '#e2e8f0',
                  fontSize: '8px',
                  fontWeight: '800',
                  color: '#64748b',
                  boxShadow: '0 0 0 1px #f8fafc'
                }}>
                  A
                </span>
              </div>
            ) : (
              <>
                <span style={{
                  display: 'flex',
                  height: '28px',
                  width: '28px',
                  flexShrink: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '9999px',
                  backgroundColor: '#e2e8f0',
                  color: '#64748b'
                }}>
                  <UserIcon size={16} />
                </span>
                <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </span>
                <ChevronRightIcon />
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
