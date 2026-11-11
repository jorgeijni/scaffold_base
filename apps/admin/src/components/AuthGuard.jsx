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
          background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0f172a',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f97316, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.85rem',
            marginBottom: '16px',
            boxShadow: '0 12px 28px rgba(234, 88, 12, 0.28)'
          }}
        >
          🍔
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
          Hamburger <span style={{ color: '#d97706' }}>Rapid</span>
        </div>
        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px', fontWeight: '600' }}>
          Verificando sesión activa...
        </div>
      </div>
    );
  }

  if (!hasValidToken) {
    return fallback || <LoginPage />;
  }

  return <>{children}</>;
}

