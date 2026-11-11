import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';

/**
 * AuthGuard - Protege el Panel de Administración.
 * Si no existe un token Bearer válido en sesión, redirige al login;
 * si existe una sesión activa válida, renderiza la consola de administración.
 */
export default function AuthGuard({ children, fallback = null }) {
  const { isAuthenticated, isLoading, token, authService, logout } = useAuth();

  const hasValidToken = Boolean(isAuthenticated && token && !authService.isTokenExpired(token));

  useEffect(() => {
    if (isLoading) return;

    if (!hasValidToken) {
      if (token && authService.isTokenExpired(token)) {
        logout();
      }
      if (window.location.hash !== '#/login') {
        window.history.replaceState(null, '', '#/login');
      }
    } else if (window.location.hash === '#/login' || !window.location.hash) {
      window.history.replaceState(null, '', '#/console');
    }
  }, [isLoading, hasValidToken, token, authService, logout]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f8fafc',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #d97706, #b45309)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            marginBottom: '16px',
            boxShadow: '0 10px 25px rgba(217, 119, 6, 0.4)'
          }}
        >
          🍔
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
          Hamburger <span style={{ color: '#f59e0b' }}>Rapid</span>
        </div>
        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '6px' }}>
          Verificando sesión activa en iDempiere...
        </div>
      </div>
    );
  }

  if (!hasValidToken) {
    return fallback || <LoginPage />;
  }

  return <>{children}</>;
}

