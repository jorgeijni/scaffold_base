import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { authenticateCredentials, login } = useAuth();

  // Modo de Autenticación: 'direct' (1 Paso) o 'twoStep' (2 Pasos)
  const [authMode, setAuthMode] = useState('direct'); // 'direct' | 'twoStep'
  const [currentStep, setCurrentStep] = useState(1); // 1 = Credenciales, 2 = Seleccionar Perfil

  // Credenciales limpias (sin datos precargados)
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [baseUrl] = useState('http://localhost:8080');
  const [allowFallback] = useState(true);

  // Parámetros de Contexto para Login Directo
  const [directClientId] = useState('11');
  const [directRoleId] = useState('102');
  const [directOrgId] = useState('11');
  const [directWarehouseId] = useState('103');
  const [directLanguage] = useState('en_US');

  // Parámetros seleccionados en Paso 2 (Flujo de 2 Pasos)
  const [profileData, setProfileData] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(11);
  const [selectedRoleId, setSelectedRoleId] = useState(102);
  const [selectedOrgId, setSelectedOrgId] = useState(11);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(103);
  const [selectedLanguage, setSelectedLanguage] = useState('es_ES');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Estados UI
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);

  // Sanitizador de mensajes para evitar exponer datos técnicos o nombres de backend
  const sanitizeMessage = (text) => {
    if (!text || typeof text !== 'string') return text;
    return text
      .replace(/idempiere/gi, 'servidor')
      .replace(/http:\/\/[^\s]+/gi, '')
      .replace(/https:\/\/[^\s]+/gi, '')
      .replace(/REST API v1/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  // 1. Envío de Login Directo (1 Paso)
  const handleDirectSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setErrorDetail(null);

    try {
      await login({
        userName,
        password,
        parameters: {
          clientId: Number(directClientId),
          roleId: Number(directRoleId),
          organizationId: Number(directOrgId),
          warehouseId: Number(directWarehouseId),
          language: directLanguage
        },
        baseUrl,
        allowFallback
      });
    } catch (err) {
      setErrorMessage(sanitizeMessage(err.message) || 'Error al iniciar sesión');
      setErrorDetail(sanitizeMessage(err.detail) || null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Paso 1 de Autenticación en 2 Pasos (Validar Credenciales)
  const handleTwoStepValidate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setErrorDetail(null);

    try {
      const result = await authenticateCredentials({
        userName,
        password,
        baseUrl,
        allowFallback
      });

      // Credenciales válidas: configurar opciones y avanzar al Paso 2
      setProfileData(result);
      const def = result.defaultParameters || {};
      setSelectedClientId(def.clientId || 11);
      setSelectedRoleId(def.roleId || 102);
      setSelectedOrgId(def.organizationId || 11);
      setSelectedWarehouseId(def.warehouseId || 103);
      setSelectedLanguage(def.language || 'es_ES');
      setCurrentStep(2);
    } catch (err) {
      setErrorMessage(sanitizeMessage(err.message) || 'Credenciales inválidas');
      setErrorDetail(sanitizeMessage(err.detail) || null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Paso 2 de Autenticación en 2 Pasos (Confirmar Selección de Perfil)
  const handleTwoStepConfirm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setErrorDetail(null);

    try {
      await login({
        userName,
        password,
        parameters: {
          clientId: Number(selectedClientId),
          roleId: Number(selectedRoleId),
          organizationId: Number(selectedOrgId),
          warehouseId: Number(selectedWarehouseId),
          language: selectedLanguage
        },
        baseUrl,
        allowFallback
      });
    } catch (err) {
      setErrorMessage(sanitizeMessage(err.message) || 'Error al iniciar sesión con el perfil seleccionado');
      setErrorDetail(sanitizeMessage(err.detail) || null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opciones para el Paso 2
  const clients = profileData?.clients || [{ id: 11, name: 'Principal' }, { id: 0, name: 'General' }];
  const roles = profileData?.roles || [{ id: 102, clientId: 11, name: 'Administrador' }];
  const organizations = profileData?.organizations || [{ id: 11, clientId: 11, name: 'Sede Principal' }, { id: 0, clientId: 11, name: '*' }];
  const warehouses = profileData?.warehouses || [{ id: 103, orgId: 11, name: 'Almacén Principal' }, { id: 0, orgId: 0, name: '(Sin Almacén)' }];
  const languages = profileData?.languages || [
    { code: 'es_ES', name: 'Español (ES)' },
    { code: 'en_US', name: 'English (US)' },
    { code: 'pt_BR', name: 'Português (BR)' }
  ];

  const filteredRoles = roles.filter(r => r.clientId === undefined || r.clientId === selectedClientId);
  const filteredOrgs = organizations.filter(o => o.clientId === undefined || o.clientId === selectedClientId || o.id === 0);
  const filteredWarehouses = warehouses.filter(w => w.orgId === undefined || w.orgId === selectedOrgId || w.id === 0);

  const handleResetDefaults = (e) => {
    e.preventDefault();
    const def = profileData?.defaultParameters || {};
    setSelectedClientId(def.clientId || 11);
    setSelectedRoleId(def.roleId || 102);
    setSelectedOrgId(def.organizationId || 11);
    setSelectedWarehouseId(def.warehouseId || 103);
    setSelectedLanguage(def.language || 'es_ES');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    }}>
      {/* Resplandores visuales */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(2,132,199,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Tarjeta Principal Dark Glassmorphic */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(30, 41, 59, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '36px 32px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 20px rgba(217, 119, 6, 0.15)',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Encabezado con Isotipo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #d97706, #b45309)',
            boxShadow: '0 10px 20px -5px rgba(217, 119, 6, 0.5)',
            fontSize: '2rem',
            marginBottom: '14px'
          }}>
            🍔
          </div>

          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            margin: '0 0 4px 0',
            color: '#ffffff'
          }}>
            Hamburger <span style={{ color: '#f59e0b' }}>Rapid</span>
          </h1>

          <div style={{
            fontSize: '0.85rem',
            color: '#94a3b8',
            fontWeight: '500'
          }}>
            <span>Panel Administrativo</span>
          </div>
        </div>

        {/* Selector de Modo de Autenticación */}
        {!(authMode === 'twoStep' && currentStep === 2) && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              MODO DE ACCESO:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              
              {/* Botón 1: Acceso Directo */}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('direct');
                  setCurrentStep(1);
                  setErrorMessage(null);
                  setErrorDetail(null);
                }}
                style={{
                  background: authMode === 'direct' ? 'rgba(217, 119, 6, 0.25)' : 'rgba(217, 119, 6, 0.08)',
                  border: `1px solid ${authMode === 'direct' ? '#f59e0b' : 'rgba(217, 119, 6, 0.3)'}`,
                  color: '#fef3c7',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: authMode === 'direct' ? '0 0 12px rgba(217, 119, 6, 0.25)' : 'none'
                }}
              >
                <span>⚡</span> Acceso Directo
              </button>

              {/* Botón 2: Autenticación 2 Pasos */}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('twoStep');
                  setCurrentStep(1);
                  setErrorMessage(null);
                  setErrorDetail(null);
                }}
                style={{
                  background: authMode === 'twoStep' ? 'rgba(2, 132, 199, 0.25)' : 'rgba(59, 130, 246, 0.08)',
                  border: `1px solid ${authMode === 'twoStep' ? '#38bdf8' : 'rgba(59, 130, 246, 0.3)'}`,
                  color: '#dbeafe',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: authMode === 'twoStep' ? '0 0 12px rgba(2, 132, 199, 0.25)' : 'none'
                }}
              >
                <span>🛡️</span> Autenticación 2 Pasos
              </button>
            </div>
          </div>
        )}

        {/* Mensaje de Error */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            marginBottom: '18px',
            lineHeight: '1.4'
          }}>
            <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⛔</span> {errorMessage}
            </div>
            {errorDetail && (
              <div style={{ fontSize: '0.74rem', color: '#f87171', marginTop: '4px' }}>
                {errorDetail}
              </div>
            )}
          </div>
        )}

        {/* CASO A: Formulario de Credenciales (Paso 1) */}
        {(authMode === 'direct' || (authMode === 'twoStep' && currentStep === 1)) && (
          <form onSubmit={authMode === 'direct' ? handleDirectSubmit : handleTwoStepValidate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Campo Usuario */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: '#cbd5e1' }}>
                Usuario
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ingrese su usuario o correo"
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '11px 14px',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#d97706'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#cbd5e1' }}>
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '11px 14px',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#d97706'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            {/* Botón de Acción Principal */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: authMode === 'direct' 
                  ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                  : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '13px 20px',
                fontSize: '0.95rem',
                fontWeight: '800',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: authMode === 'direct' 
                  ? '0 10px 25px -5px rgba(217, 119, 6, 0.4)'
                  : '0 10px 25px -5px rgba(2, 132, 199, 0.4)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isSubmitting ? 0.7 : 1,
                marginTop: '4px'
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>🔐</span>
                  <span>
                    {authMode === 'direct' 
                      ? 'Ingresar al Panel ➔' 
                      : 'Continuar ➔ Seleccionar Perfil'}
                  </span>
                </>
              )}
            </button>
          </form>
        )}

        {/* CASO B: Formulario de Selección de Perfil (Paso 2) */}
        {authMode === 'twoStep' && currentStep === 2 && (
          <form onSubmit={handleTwoStepConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Header de Paso 2 */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem'
                }}>
                  👤
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#f8fafc' }}>
                    Seleccionar Perfil
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Usuario: <strong style={{ color: '#38bdf8' }}>{userName}</strong>
                  </div>
                </div>
              </div>
              <a
                href="#defaults"
                onClick={handleResetDefaults}
                style={{
                  fontSize: '0.74rem',
                  color: '#f59e0b',
                  textDecoration: 'underline',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Por Defecto
              </a>
            </div>

            {/* 1. Empresa */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                Empresa
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  const newClient = Number(e.target.value);
                  setSelectedClientId(newClient);
                  const firstRole = roles.find(r => r.clientId === newClient);
                  if (firstRole) setSelectedRoleId(firstRole.id);
                }}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* 2. Rol de Acceso */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                Rol de Acceso
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {filteredRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* 3. Organización y Almacén en 2 columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: '#f59e0b', marginBottom: '4px', fontWeight: '700' }}>
                  Organización
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid #d97706',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#fef3c7',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {filteredOrgs.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                  Almacén
                </label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {filteredWarehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Idioma y Fecha en 2 columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                  Idioma
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {languages.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '7px 10px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Ayuda contextual desplegable */}
            {showHelp && (
              <div style={{
                background: 'rgba(2, 132, 199, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                color: '#7dd3fc',
                lineHeight: 1.4
              }}>
                ℹ️ <strong>Ayuda:</strong> Al presionar <strong>OK</strong> se iniciará la sesión con el perfil y organización seleccionados.
              </div>
            )}

            {/* Botones de Acción (OK / Cancelar / Ayuda) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: '8px', marginTop: '10px' }}>
              
              {/* Botón OK */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, #1d70b8 0%, #0284c7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: isSubmitting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
                }}
              >
                <span>{isSubmitting ? '⏳' : '✓'}</span>
                <span>OK &bull; Entrar</span>
              </button>

              {/* Botón Cancelar */}
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setErrorMessage(null);
                }}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#cbd5e1',
                  border: '1px solid #475569',
                  borderRadius: '10px',
                  padding: '11px 12px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <span>✕</span>
                <span>Volver</span>
              </button>

              {/* Botón Ayuda */}
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                title="Mostrar ayuda"
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#94a3b8',
                  border: '1px solid #475569',
                  borderRadius: '10px',
                  padding: '11px 14px',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                ❓
              </button>
            </div>

          </form>
        )}

        {/* Footer Informativo */}
        <div style={{
          marginTop: '22px',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: '#64748b',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '12px'
        }}>
          <span>Panel Administrativo &bull; {authMode === 'direct' ? 'Acceso Directo' : (currentStep === 1 ? 'Paso 1: Credenciales' : 'Paso 2: Seleccionar Perfil')}</span>
        </div>

      </div>
    </div>
  );
}
