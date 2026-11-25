import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';

/**
 * 🛡️ AuthGuard.jsx
 * Control de Acceso Frontend para el Panel de Administración
 * Replicado fielmente de laboratorio1
 * 
 * Regla de Negocio:
 * - Si no existe un token válido en sesión, renderiza la pantalla de Login manteniendo su estado.
 * - Si existe sesión activa con credenciales válidas en iDempiere ERP (200 OK con token),
 *   desbloquea y renderiza la consola de administración.
 */
export default function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
