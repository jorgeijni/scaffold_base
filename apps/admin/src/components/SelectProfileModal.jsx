import React, { useState } from 'react';

/**
 * Modal "Selecionar Perfil" (Estilo Dark Glassmorphic 100% Coherente con Hamburger Rapid & iDempiere ERP)
 */
export default function SelectProfileModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  profileData,
  isSubmitting,
  errorMessage
}) {
  if (!isOpen || !profileData) return null;

  const clients = profileData.clients || [{ id: 11, name: 'GardenWorld' }];
  const roles = profileData.roles || [{ id: 102, clientId: 11, name: 'GardenWorld Admin' }];
  const organizations = profileData.organizations || [{ id: 11, clientId: 11, name: 'HQ' }, { id: 0, clientId: 11, name: '*' }];
  const warehouses = profileData.warehouses || [{ id: 103, orgId: 11, name: 'HQ Warehouse' }, { id: 0, orgId: 0, name: '(Sin Almacén)' }];
  const languages = profileData.languages || [
    { code: 'pt_BR', name: 'Portuguese (BR)' },
    { code: 'en_US', name: 'English (US)' },
    { code: 'es_ES', name: 'Spanish (ES)' }
  ];

  const defaultParams = profileData.defaultParameters || {
    clientId: 11,
    roleId: 102,
    organizationId: 11,
    warehouseId: 103,
    language: 'pt_BR'
  };

  const [selectedClientId, setSelectedClientId] = useState(defaultParams.clientId || 11);
  const [selectedRoleId, setSelectedRoleId] = useState(defaultParams.roleId || 102);
  const [selectedOrgId, setSelectedOrgId] = useState(defaultParams.organizationId || 11);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(defaultParams.warehouseId || 103);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultParams.language || 'pt_BR');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showHelp, setShowHelp] = useState(false);

  const filteredRoles = roles.filter(r => r.clientId === undefined || r.clientId === selectedClientId);
  const filteredOrgs = organizations.filter(o => o.clientId === undefined || o.clientId === selectedClientId || o.id === 0);
  const filteredWarehouses = warehouses.filter(w => w.orgId === undefined || w.orgId === selectedOrgId || w.id === 0);

  const handleResetDefaults = (e) => {
    e.preventDefault();
    setSelectedClientId(defaultParams.clientId);
    setSelectedRoleId(defaultParams.roleId);
    setSelectedOrgId(defaultParams.organizationId);
    setSelectedWarehouseId(defaultParams.warehouseId);
    setSelectedLanguage(defaultParams.language || 'pt_BR');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      clientId: Number(selectedClientId),
      roleId: Number(selectedRoleId),
      organizationId: Number(selectedOrgId),
      warehouseId: Number(selectedWarehouseId),
      language: selectedLanguage,
      loginDate: selectedDate
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.15)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        color: '#f8fafc',
        position: 'relative'
      }}>

        {/* Encabezado */}
        <div style={{
          padding: '20px 24px 14px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
              <circle cx="48" cy="30" r="10" fill="#38bdf8" />
              <path d="M50 43 C 36 43, 26 55, 30 70 C 33 79, 44 84, 53 84 C 68 84, 78 70, 68 54 C 62 45, 52 44, 48 49 C 45 53, 49 59, 54 59 C 60 59, 63 53, 59 51" fill="#38bdf8" />
            </svg>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                Selecionar Perfil
              </h2>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                iDempiere Open Source ERP &bull; <span style={{ color: '#38bdf8', fontWeight: '700' }}>{userName}</span>
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

        {errorMessage && (
          <div style={{
            margin: '14px 24px 0 24px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#fca5a5',
            fontSize: '0.8rem'
          }}>
            <strong>⚠️ Error:</strong> {errorMessage}
          </div>
        )}

        <form onSubmit={handleFormSubmit} style={{ padding: '20px 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Empresa */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: '600' }}>
                Empresa (Client)
              </label>
              <a
                href="#defaults"
                onClick={handleResetDefaults}
                style={{ fontSize: '0.72rem', color: '#f59e0b', textDecoration: 'underline', fontWeight: '700', cursor: 'pointer' }}
              >
                Defaults
              </a>
            </div>
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
                outline: 'none'
              }}
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Perfil */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
              Perfil (Role)
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
                outline: 'none'
              }}
            >
              {filteredRoles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Org y Almacén en 2 columnas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#f59e0b', marginBottom: '4px', fontWeight: '700' }}>
                Org (organizationId)
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
                  outline: 'none'
                }}
              >
                {filteredOrgs.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                Armazém (Warehouse)
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
                  outline: 'none'
                }}
              >
                {filteredWarehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Idioma y Fecha en 2 columnas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                Idioma (Language)
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
                  outline: 'none'
                }}
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                Data (Fecha)
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
                  outline: 'none'
                }}
              />
            </div>
          </div>

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
              ℹ️ <strong>Ayuda iDempiere:</strong> Selecciona el perfil deseado y pulsa <strong>OK</strong> para conectar.
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: '8px', marginTop: '10px' }}>
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
              <span>OK</span>
            </button>

            <button
              type="button"
              onClick={onClose}
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
              <span>Cancelar</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
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
      </div>
    </div>
  );
}
