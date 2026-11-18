import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// SVGs exactos extraídos de referencias/nav-bar-abierto.html
const IconHome = ({ className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className={className} style={{ flexShrink: 0 }}>
    <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z"></path>
  </svg>
);

const IconStar = ({ className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className={className} style={{ flexShrink: 0 }}>
    <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z"></path>
  </svg>
);

const IconContacts = ({ className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className={className} style={{ flexShrink: 0 }}>
    <path d="M200,112a8,8,0,0,1-8,8H152a8,8,0,0,1,0-16h40A8,8,0,0,1,200,112Zm-8,24H152a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm40-80V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM216,200V56H40V200H216Zm-80.26-34a8,8,0,1,1-15.5,4c-2.63-10.26-13.06-18-24.25-18s-21.61,7.74-24.25,18a8,8,0,1,1-15.5-4,39.84,39.84,0,0,1,17.19-23.34,32,32,0,1,1,45.12,0A39.76,39.76,0,0,1,135.75,166ZM96,136a16,16,0,1,0-16-16A16,16,0,0,0,96,136Z"></path>
  </svg>
);

const IconSales = ({ className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className={className} style={{ flexShrink: 0 }}>
    <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31l-56,56V200H224A8,8,0,0,1,232,208Z"></path>
  </svg>
);

const IconPurchases = ({ className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className={className} style={{ flexShrink: 0 }}>
    <path d="M72,104a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,104Zm8,40h96a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM232,56V208a8,8,0,0,1-11.58,7.15L192,200.94l-28.42,14.21a8,8,0,0,1-7.16,0L128,200.94,99.58,215.15a8,8,0,0,1-7.16,0L64,200.94,35.58,215.15A8,8,0,0,1,24,208V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Zm-16,0H40V195.06l20.42-10.22a8,8,0,0,1,7.16,0L96,199.06l28.42-14.22a8,8,0,0,1,7.16,0L160,199.06l28.42-14.22a8,8,0,0,1,7.16,0L216,195.06Z"></path>
  </svg>
);

const IconInventory = ({ className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className={className} style={{ flexShrink: 0 }}>
    <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z"></path>
  </svg>
);

const IconFinance = ({ className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className={className} style={{ flexShrink: 0 }}>
    <path d="M24,104H48v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16H208V104h24a8,8,0,0,0,4.19-14.81l-104-64a8,8,0,0,0-8.38,0l-104,64A8,8,0,0,0,24,104Zm40,0H96v64H64Zm80,0v64H112V104Zm48,64H160V104h32ZM128,41.39,203.74,88H52.26ZM248,208a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H240A8,8,0,0,1,248,208Z"></path>
  </svg>
);

const IconAI = ({ className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className={className} style={{ flexShrink: 0 }}>
    <path d="M237.66,66.34a8,8,0,0,0-11.32,0L192,100.69,155.31,64l34.35-34.34a8,8,0,1,0-11.32-11.32L144,52.69,117.66,26.34a8,8,0,0,0-11.32,11.32L112.69,44l-53,53a40,40,0,0,0,0,56.57l15.71,15.71L26.34,218.34a8,8,0,0,0,11.32,11.32l49.09-49.09,15.71,15.71a40,40,0,0,0,56.57,0l53-53,6.34,6.35a8,8,0,0,0,11.32-11.32L203.31,112l34.35-34.34A8,8,0,0,0,237.66,66.34ZM147.72,185a24,24,0,0,1-33.95,0L71,142.23a24,24,0,0,1,0-33.95l53-53L200.69,132Z"></path>
  </svg>
);

const IconSettings = ({ className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className={className} style={{ flexShrink: 0 }}>
    <path d="M216,130.16q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.6,107.6,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.29,107.29,0,0,0-26.25-10.86,8,8,0,0,0-7.06,1.48L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.6,107.6,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"></path>
  </svg>
);

const IconHeadphones = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path>
  </svg>
);

const IconUser = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const IconChevronDown = ({ className = 'h-3.5 w-3.5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="m6 9 6 6 6-6"></path>
  </svg>
);

const IconChevronRight = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <path d="m9 18 6-6-6-6"></path>
  </svg>
);

const IconPanelLeftClose = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
    <path d="M9 3v18"></path>
    <path d="m16 15-3-3 3-3"></path>
  </svg>
);

const IconPanelLeftOpen = ({ className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0 }}>
    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
    <path d="M9 3v18"></path>
    <path d="m13 9 3 3-3 3"></path>
  </svg>
);

export default function AdminSidebar({
  activeSection,
  onSelectSection,
  burgersCount = 10,
  ordersCount = 5,
  onOpenInspector,
  isOpenMobile,
  onCloseMobile
}) {
  const { user, orgId, organizationId, logout } = useAuth();
  const effectiveOrgId = organizationId ?? orgId ?? 11;

  // Persistencia de estado colapsado (68px) vs abierto (240px)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('idempiere_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Estado de submenús desplegables en modo expandido
  const [isSettingsOpen, setIsSettingsOpen] = useState(
    ['catalogs', 'tipo-intervencion-wash', 'database', 'profile'].includes(activeSection)
  );
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('idempiere_sidebar_collapsed', String(next));
      } catch {
        // Ignorar en entornos sin localStorage
      }
      return next;
    });
  };

  const handleNavClick = (sectionId) => {
    onSelectSection(sectionId);
    if (onCloseMobile) onCloseMobile();
  };

  // Identificador de usuario a mostrar
  const displayUserName = user?.userName || 'Jorge Jimenez';
  const displayUserInitial = (displayUserName[0] || 'J').toUpperCase();

  // Mapeo de ítems activos
  const isContactsActive = activeSection === 'customers';
  const isDashboardActive = activeSection === 'resumen';
  const isSalesActive = activeSection === 'orders';
  const isPurchasesActive = activeSection === 'burgers';
  const isFinanceActive = activeSection === 'pricelists';
  const isAIActive = activeSection === 'idempiere';
  const isSettingsActive = ['catalogs', 'tipo-intervencion-wash', 'database', 'profile'].includes(activeSection);

  return (
    <nav
      aria-label="Navegación"
      className={isOpenMobile ? 'admin-sidebar open' : 'admin-sidebar'}
      style={{
        width: isCollapsed ? '68px' : '240px',
        minWidth: isCollapsed ? '68px' : '240px',
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        height: '100vh',
        transition: 'width 200ms ease-in-out',
        overflow: 'hidden',
        zIndex: 40,
        userSelect: 'none'
      }}
    >
      {/* ======================================================== */}
      {/* 1. HEADER (EMPRESA / LOGO & BOTÓN COLAPSO)              */}
      {/* ======================================================== */}
      {isCollapsed ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 0 10px 0',
          borderBottom: '1px solid #f1f5f9'
        }}>
          {/* Logo Verde Neón con símbolo < > */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: '#bef227',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(190, 242, 39, 0.45)'
            }}
            title="Hamburger Rapid • Etendo AI"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 7-5 5 5 5" />
              <path d="m16 7 5 5-5 5" />
            </svg>
          </div>

          {/* Botón para descolapsar */}
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label="Expandir menú"
            title="Expandir menú"
            style={{
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <IconPanelLeftOpen className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: '62px',
          padding: '0 12px',
          gap: '8px',
          flexShrink: 0,
          borderBottom: '1px solid #f1f5f9'
        }}>
          {/* Company Switcher */}
          <button
            type="button"
            aria-label="Cambiar empresa"
            style={{
              display: 'flex',
              flex: 1,
              minWidth: 0,
              alignItems: 'center',
              gap: '8px',
              height: '40px',
              padding: '0 8px 0 4px',
              borderRadius: '9999px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Logo Verde Neón < > */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#bef227',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(190, 242, 39, 0.45)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m8 7-5 5 5 5" />
                <path d="m16 7 5 5-5 5" />
              </svg>
            </div>

            <span style={{ display: 'flex', minWidth: 0, flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', fontSize: '0.86rem', fontWeight: '700', color: '#0f172a', lineHeight: 1.15 }}>
                {displayUserName}
              </span>
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: '500', lineHeight: 1.15 }}>
                Demo &bull; Org #{effectiveOrgId}
              </span>
            </span>

            <IconChevronDown className="h-3.5 w-3.5" />
          </button>

          {/* Botón Contraer Menú */}
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label="Contraer menú"
            title="Contraer menú"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <IconPanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. BODY / NAVEGACIÓN PRINCIPAL (SCROLLABLE)              */}
      {/* ======================================================== */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="sidebar-scroll">

        {/* ---------------- GENERAL ---------------- */}
        {!isCollapsed && (
          <div style={{ padding: '14px 16px 4px 16px', fontSize: '0.72rem', fontWeight: '600', color: '#94a3b8', textTransform: 'none' }}>
            General
          </div>
        )}

        {/* Inicio */}
        <div style={{ padding: isCollapsed ? '3px 0' : '2px 8px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => handleNavClick('resumen')}
            title="Inicio"
            style={
              isCollapsed
                ? isDashboardActive
                  ? {
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                  : {
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                : {
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                    fontWeight: isDashboardActive ? '700' : '500',
                    color: isDashboardActive ? '#0f172a' : '#334155',
                    background: isDashboardActive ? '#f8fafc' : 'transparent',
                    border: 'none',
                    borderLeft: isDashboardActive ? '3px solid #0f172a' : '3px solid transparent',
                    borderRadius: isDashboardActive ? '0 8px 8px 0' : '6px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }
            }
          >
            {isCollapsed && isDashboardActive ? (
              <div style={{ width: '30px', height: '30px', background: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <IconHome className="h-5 w-5" />
              </div>
            ) : (
              <IconHome className="h-5 w-5" />
            )}
            {!isCollapsed && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Inicio</span>}
          </button>
        </div>

        {/* Favoritos */}
        <div style={{ padding: isCollapsed ? '3px 0' : '2px 8px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setIsFavoritesOpen(p => !p)}
            title="Favoritos"
            style={
              isCollapsed
                ? {
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }
                : {
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                    fontWeight: '500',
                    color: '#334155',
                    background: 'transparent',
                    border: 'none',
                    borderLeft: '3px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }
            }
          >
            <IconStar className="h-5 w-5" />
            {!isCollapsed && (
              <>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Favoritos</span>
                <span style={{ transform: isFavoritesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
                  <IconChevronDown className="h-3.5 w-3.5" />
                </span>
              </>
            )}
          </button>
        </div>

        {/* ---------------- COMERCIAL ---------------- */}
        {!isCollapsed && (
          <div style={{ padding: '16px 16px 4px 16px', fontSize: '0.72rem', fontWeight: '600', color: '#94a3b8', textTransform: 'none' }}>
            Comercial
          </div>
        )}

        {/* Contactos (Customers) */}
        <div style={{ padding: isCollapsed ? '3px 0' : '2px 8px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => handleNavClick('customers')}
            title="Contactos & Métricas de Clientes"
            style={
              isCollapsed
                ? isContactsActive
                  ? {
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                  : {
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                : isContactsActive
                ? {
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '7px 10px',
                    fontSize: '0.86rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }
                : {
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                    fontWeight: '500',
                    color: '#334155',
                    background: 'transparent',
                    border: 'none',
                    borderLeft: '3px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }
            }
          >
            {isContactsActive ? (
              <div style={{ width: '28px', height: '28px', background: '#0f172a', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                <IconContacts className="h-4 w-4" />
              </div>
            ) : (
              <IconContacts className="h-5 w-5" />
            )}
            {!isCollapsed && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Contactos</span>}
          </button>
        </div>

        {/* Ventas (Orders Inbox) */}
        <div style={{ padding: isCollapsed ? '3px 0' : '2px 8px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => handleNavClick('orders')}
            title="Ventas & Bandeja de Pedidos"
            style={
              isCollapsed
                ? isSalesActive
                  ? {
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                  : {
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                : {
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                    fontWeight: isSalesActive ? '700' : '500',
                    color: isSalesActive ? '#0f172a' : '#334155',
                    background: isSalesActive ? '#f8fafc' : 'transparent',
                    border: 'none',
                    borderLeft: isSalesActive ? '3px solid #0f172a' : '3px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }
            }
          >
            {isCollapsed && isSalesActive ? (
              <div style={{ width: '30px', height: '30px', background: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <IconSales className="h-5 w-5" />
              </div>
            ) : (
              <IconSales className="h-5 w-5" />
            )}
            {!isCollapsed && (
              <>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ventas</span>
                <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.68rem', fontWeight: '800', padding: '2px 7px', borderRadius: '10px', marginRight: '4px' }}>
                  {ordersCount}
                </span>
                <IconChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

        {/* ---------------- OPERACIONES ---------------- */}
        {!isCollapsed && (
          <div style={{ padding: '16px 16px 4px 16px', fontSize: '0.72rem', fontWeight: '600', color: '#94a3b8', textTransform: 'none' }}>
            Operaciones
          </div>
        )}

        {/* Compras / Catálogo Hamburguesas */}
        <div style={{ padding: isCollapsed ? '3px 0' : '2px 8px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => handleNavClick('burgers')}
            title="Compras & Catálogo Hamburguesas"
            style={
              isCollapsed
                ? isPurchasesActive
                  ? {
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                  : {
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                : {
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                    fontWeight: isPurchasesActive ? '700' : '500',
                    color: isPurchasesActive ? '#0f172a' : '#334155',
                    background: isPurchasesActive ? '#f8fafc' : 'transparent',
                    border: 'none',
                    borderLeft: isPurchasesActive ? '3px solid #0f172a' : '3px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }
            }
          >
            {isCollapsed && isPurchasesActive ? (
              <div style={{ width: '30px', height: '30px', background: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <IconPurchases className="h-5 w-5" />
              </div>
            ) : (
              <IconPurchases className="h-5 w-5" />
            )}
            {!isCollapsed && (
              <>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Compras</span>
                <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.68rem', fontWeight: '800', padding: '2px 7px', borderRadius: '10px', marginRight: '4px' }}>
                  {burgersCount}
                </span>
                <IconChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Inventario */}
        <div style={{ padding: isCollapsed ? '3px 0' : '2px 8px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => handleNavClick('burgers')}
            title="Inventario de Productos & Insumos"
            style={
              isCollapsed
                ? {
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }
                : {
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                    fontWeight: '500',
                    color: '#334155',
                    background: 'transparent',
                    border: 'none',
                    borderLeft: '3px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }
            }
          >
            <IconInventory className="h-5 w-5" />
            {!isCollapsed && (
              <>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Inventario</span>
                <IconChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

        {/* ---------------- FINANZAS ---------------- */}
        {!isCollapsed && (
          <div style={{ padding: '16px 16px 4px 16px', fontSize: '0.72rem', fontWeight: '600', color: '#94a3b8', textTransform: 'none' }}>
            Finanzas
          </div>
        )}

        {/* Finanzas / Tarifas */}
        <div style={{ padding: isCollapsed ? '3px 0' : '2px 8px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => handleNavClick('pricelists')}
            title="Finanzas & Catálogo de Tarifas y Precios"
            style={
              isCollapsed
                ? isFinanceActive
                  ? {
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                  : {
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                : {
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                    fontWeight: isFinanceActive ? '700' : '500',
                    color: isFinanceActive ? '#0f172a' : '#334155',
                    background: isFinanceActive ? '#f8fafc' : 'transparent',
                    border: 'none',
                    borderLeft: isFinanceActive ? '3px solid #0f172a' : '3px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }
            }
          >
            {isCollapsed && isFinanceActive ? (
              <div style={{ width: '30px', height: '30px', background: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <IconFinance className="h-5 w-5" />
              </div>
            ) : (
              <IconFinance className="h-5 w-5" />
            )}
            {!isCollapsed && (
              <>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Finanzas</span>
                <IconChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

        {/* ---------------- SISTEMA ---------------- */}
        {!isCollapsed && (
          <div style={{ padding: '16px 16px 4px 16px', fontSize: '0.72rem', fontWeight: '600', color: '#94a3b8', textTransform: 'none' }}>
            Sistema
          </div>
        )}

        {/* Conectar Agente de IA / iDempiere ERP */}
        <div style={{ padding: isCollapsed ? '3px 0' : '2px 8px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => handleNavClick('idempiere')}
            title="Conectar agente de IA & Conexión ERP"
            style={
              isCollapsed
                ? isAIActive
                  ? {
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                  : {
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                : {
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                    fontWeight: isAIActive ? '700' : '500',
                    color: isAIActive ? '#0f172a' : '#334155',
                    background: isAIActive ? '#f8fafc' : 'transparent',
                    border: 'none',
                    borderLeft: isAIActive ? '3px solid #0f172a' : '3px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }
            }
          >
            {isCollapsed && isAIActive ? (
              <div style={{ width: '30px', height: '30px', background: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <IconAI className="h-5 w-5" />
              </div>
            ) : (
              <IconAI className="h-5 w-5" />
            )}
            {!isCollapsed && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Conectar agente de IA</span>}
          </button>
        </div>

        {/* Configuración */}
        <div style={{ padding: isCollapsed ? '3px 0' : '2px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                handleNavClick('catalogs');
              } else {
                setIsSettingsOpen(p => !p);
              }
            }}
            title="Configuración del Sistema"
            style={
              isCollapsed
                ? isSettingsActive
                  ? {
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                  : {
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }
                : {
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                    fontWeight: isSettingsActive ? '700' : '500',
                    color: isSettingsActive ? '#0f172a' : '#334155',
                    background: isSettingsActive ? '#f8fafc' : 'transparent',
                    border: 'none',
                    borderLeft: isSettingsActive ? '3px solid #0f172a' : '3px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }
            }
          >
            {isCollapsed && isSettingsActive ? (
              <div style={{ width: '30px', height: '30px', background: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <IconSettings className="h-5 w-5" />
              </div>
            ) : (
              <IconSettings className="h-5 w-5" />
            )}
            {!isCollapsed && (
              <>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Configuración</span>
                <span style={{ transform: isSettingsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
                  <IconChevronDown className="h-3.5 w-3.5" />
                </span>
              </>
            )}
          </button>

          {/* Submenú de Configuración (Expandido) */}
          {!isCollapsed && isSettingsOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '4px 0 4px 28px', gap: '2px' }}>
              <button
                type="button"
                onClick={() => handleNavClick('catalogs')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: activeSection === 'catalogs' ? '700' : '500',
                  color: activeSection === 'catalogs' ? '#0f172a' : '#64748b',
                  background: activeSection === 'catalogs' ? '#f1f5f9' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Catálogos Maestros ERP (7)
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('tipo-intervencion-wash')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: activeSection === 'tipo-intervencion-wash' ? '700' : '500',
                  color: activeSection === 'tipo-intervencion-wash' ? '#0f172a' : '#64748b',
                  background: activeSection === 'tipo-intervencion-wash' ? '#f1f5f9' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Intervención Wash
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('database')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: activeSection === 'database' ? '700' : '500',
                  color: activeSection === 'database' ? '#0f172a' : '#64748b',
                  background: activeSection === 'database' ? '#f1f5f9' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Base de Datos SQLite
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: activeSection === 'profile' ? '700' : '500',
                  color: activeSection === 'profile' ? '#0f172a' : '#64748b',
                  background: activeSection === 'profile' ? '#f1f5f9' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Perfil & Conexión ERP
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. FOOTER (AYUDA Y SOPORTE & USUARIO AVATAR CON J Y A)   */}
      {/* ======================================================== */}
      <div style={{
        flexShrink: 0,
        padding: isCollapsed ? '10px 0' : '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderTop: '1px solid #f1f5f9',
        position: 'relative'
      }}>
        {/* Ayuda y Soporte */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onOpenInspector && onOpenInspector()}
            title="Ayuda y soporte"
            style={
              isCollapsed
                ? {
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }
                : {
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    fontSize: '0.84rem',
                    fontWeight: '500',
                    color: '#334155',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }
            }
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              flexShrink: 0
            }}>
              <IconHeadphones className="h-4 w-4" />
            </span>
            {!isCollapsed && (
              <>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Ayuda y soporte
                </span>
                <IconChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Usuario - Avatar con J y badge A */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(p => !p)}
            aria-label={displayUserName}
            title={displayUserName}
            style={
              isCollapsed
                ? {
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                  }
                : {
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    background: isUserMenuOpen ? '#f1f5f9' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }
            }
            onMouseEnter={e => { if (!isUserMenuOpen) e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={e => { if (!isUserMenuOpen) e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Avatar circular con inicial J y sub-badge A (Replicando la imagen colapsada) */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#e0e7ff',
                color: '#1e1b4b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.86rem',
                fontWeight: '800'
              }}>
                {displayUserInitial}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-3px',
                right: '-3px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.62rem',
                fontWeight: '900',
                color: '#2563eb',
                border: '1.5px solid #ffffff'
              }}>
                A
              </div>
            </div>

            {!isCollapsed && (
              <>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayUserName}
                </span>
                <IconChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Popover desplegable del menú de usuario */}
        {isUserMenuOpen && (
          <div style={{
            position: 'absolute',
            bottom: '68px',
            left: isCollapsed ? '72px' : '10px',
            width: '210px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            padding: '10px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ padding: '4px 6px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>{displayUserName}</div>
              <div style={{ fontSize: '0.70rem', color: '#64748b' }}>Rol {user?.roleName || 'Admin'} &bull; Org #{effectiveOrgId}</div>
            </div>

            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                if (onOpenInspector) onOpenInspector();
              }}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '6px',
                border: 'none',
                background: '#f8fafc',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#334155',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              🛡️ Token & Contexto ERP
            </button>

            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                handleNavClick('profile');
              }}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '6px',
                border: 'none',
                background: '#f8fafc',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#334155',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              ⚙️ Configuración Perfil
            </button>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '5px 8px',
                  fontSize: '0.75rem',
                  color: '#475569',
                  textDecoration: 'none'
                }}
              >
                🌐 Landing E-commerce
              </a>
              <a
                href="/app"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '5px 8px',
                  fontSize: '0.75rem',
                  color: '#475569',
                  textDecoration: 'none'
                }}
              >
                📱 App Móvil PWA
              </a>
            </div>

            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                logout();
              }}
              style={{
                width: '100%',
                padding: '7px 8px',
                borderRadius: '6px',
                border: 'none',
                background: '#fff1f2',
                color: '#e11d48',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                textAlign: 'center',
                marginTop: '4px'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        )}

      </div>
    </nav>
  );
}
