import React, { useState } from 'react';
import { DEFAULT_LANGUAGES } from '../services/AuthService';

/**
 * Paso 2 del acceso asistido:
 * Permite seleccionar empresa, rol operativo, sucursal, punto de despacho e idioma
 * recargando dinámicamente las opciones asignadas al usuario.
 */
export default function TwoStepContextForm({
  stepOneData,
  baseUrl,
  corsProxyConfig,
  onFetchRoles,
  onFetchOrganizations,
  onFetchWarehouses,
  onConfirm,
  onBack,
  isSubmitting
}) {
  const clients = stepOneData.clients || [];
  const [roles, setRoles] = useState(stepOneData.roles || []);
  const [organizations, setOrganizations] = useState(stepOneData.organizations || []);
  const [warehouses, setWarehouses] = useState(stepOneData.warehouses || []);
  const languages = stepOneData.languages?.length ? stepOneData.languages : DEFAULT_LANGUAGES;

  const def = stepOneData.defaultParameters || {};
  const [clientId, setClientId] = useState(def.clientId ?? (clients[0]?.id ?? ''));
  const [roleId, setRoleId] = useState(def.roleId ?? (roles[0]?.id ?? ''));
  const [organizationId, setOrganizationId] = useState(def.organizationId ?? (organizations[0]?.id ?? ''));
  const [warehouseId, setWarehouseId] = useState(def.warehouseId ?? (warehouses[0]?.id ?? ''));
  const [language, setLanguage] = useState(def.language || 'en_US');

  const [loadingCascade, setLoadingCascade] = useState(false);
  const [cascadeError, setCascadeError] = useState(null);

  const connectionOverride = { ...corsProxyConfig, baseUrl };

  const handleClientChange = async (nextClientId) => {
    const parsedClient = Number(nextClientId);
    setClientId(parsedClient);
    setLoadingCascade(true);
    setCascadeError(null);

    try {
      const nextRoles = await onFetchRoles(stepOneData.tempToken, parsedClient, connectionOverride);
      setRoles(nextRoles);
      const nextRoleId = nextRoles[0]?.id ?? '';
      setRoleId(nextRoleId);

      if (nextRoleId !== '') {
        const nextOrgs = await onFetchOrganizations(stepOneData.tempToken, parsedClient, nextRoleId, connectionOverride);
        setOrganizations(nextOrgs);
        const nextOrgId = nextOrgs[0]?.id ?? '';
        setOrganizationId(nextOrgId);

        if (nextOrgId !== '') {
          const nextWhs = await onFetchWarehouses(stepOneData.tempToken, parsedClient, nextRoleId, nextOrgId, connectionOverride);
          setWarehouses(nextWhs);
          setWarehouseId(nextWhs[0]?.id ?? '');
        } else {
          setWarehouses([]);
          setWarehouseId('');
        }
      } else {
        setOrganizations([]);
        setOrganizationId('');
        setWarehouses([]);
        setWarehouseId('');
      }
    } catch (err) {
      setCascadeError(err.message);
    } finally {
      setLoadingCascade(false);
    }
  };

  const handleRoleChange = async (nextRoleId) => {
    const parsedRole = Number(nextRoleId);
    setRoleId(parsedRole);
    setLoadingCascade(true);
    setCascadeError(null);

    try {
      const nextOrgs = await onFetchOrganizations(stepOneData.tempToken, clientId, parsedRole, connectionOverride);
      setOrganizations(nextOrgs);
      const nextOrgId = nextOrgs[0]?.id ?? '';
      setOrganizationId(nextOrgId);

      if (nextOrgId !== '') {
        const nextWhs = await onFetchWarehouses(stepOneData.tempToken, clientId, parsedRole, nextOrgId, connectionOverride);
        setWarehouses(nextWhs);
        setWarehouseId(nextWhs[0]?.id ?? '');
      } else {
        setWarehouses([]);
        setWarehouseId('');
      }
    } catch (err) {
      setCascadeError(err.message);
    } finally {
      setLoadingCascade(false);
    }
  };

  const handleOrgChange = async (nextOrgId) => {
    const parsedOrg = Number(nextOrgId);
    setOrganizationId(parsedOrg);
    setLoadingCascade(true);
    setCascadeError(null);

    try {
      const nextWhs = await onFetchWarehouses(stepOneData.tempToken, clientId, roleId, parsedOrg, connectionOverride);
      setWarehouses(nextWhs);
      setWarehouseId(nextWhs[0]?.id ?? '');
    } catch (err) {
      setCascadeError(err.message);
    } finally {
      setLoadingCascade(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedClient = clients.find((c) => Number(c.id) === Number(clientId));
    const selectedRole = roles.find((r) => Number(r.id) === Number(roleId));
    const selectedOrg = organizations.find((o) => Number(o.id) === Number(organizationId));
    const selectedWh = warehouses.find((w) => Number(w.id) === Number(warehouseId));

    onConfirm({
      parameters: {
        clientId: Number(clientId),
        roleId: Number(roleId),
        organizationId: Number(organizationId),
        warehouseId: warehouseId === '' ? null : Number(warehouseId),
        language
      },
      labels: {
        clientName: selectedClient?.name,
        roleName: selectedRole?.name,
        orgName: selectedOrg?.name,
        warehouseName: selectedWh?.name
      }
    });
  };

  const selectStyle = {
    width: '100%',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#0f172a',
    fontSize: '0.86rem',
    fontWeight: '600',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.76rem',
    color: '#334155',
    marginBottom: '6px',
    fontWeight: '700'
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}
      >
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>
            Selecciona tu entorno de trabajo
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            Cuenta verificada: <strong style={{ color: '#b45309' }}>{stepOneData.userName}</strong>
          </div>
        </div>
        {loadingCascade && (
          <span style={{ fontSize: '0.74rem', color: '#b45309', fontWeight: '700' }}>
            Actualizando...
          </span>
        )}
      </div>

      {cascadeError && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            color: '#92400e',
            padding: '9px 12px',
            borderRadius: '10px',
            fontSize: '0.78rem',
            fontWeight: '600'
          }}
        >
          No se pudieron actualizar todas las listas: {cascadeError}
        </div>
      )}

      <div>
        <label htmlFor="step2-client" style={labelStyle}>Empresa / Marca</label>
        <select
          id="step2-client"
          className="login-input"
          value={clientId}
          onChange={(e) => handleClientChange(e.target.value)}
          required
          style={selectStyle}
        >
          {clients.length === 0 && <option value="">Sin empresas asignadas</option>}
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="step2-role" style={labelStyle}>Perfil de Acceso / Rol</label>
        <select
          id="step2-role"
          className="login-input"
          value={roleId}
          onChange={(e) => handleRoleChange(e.target.value)}
          required
          disabled={loadingCascade || roles.length === 0}
          style={selectStyle}
        >
          {roles.length === 0 && <option value="">Sin perfiles disponibles</option>}
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label htmlFor="step2-org" style={labelStyle}>Sucursal / Sede</label>
          <select
            id="step2-org"
            className="login-input"
            value={organizationId}
            onChange={(e) => handleOrgChange(e.target.value)}
            required
            disabled={loadingCascade || organizations.length === 0}
            style={selectStyle}
          >
            {organizations.length === 0 && <option value="">Sin sucursales</option>}
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="step2-warehouse" style={labelStyle}>Punto de Despacho</label>
          <select
            id="step2-warehouse"
            className="login-input"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            disabled={loadingCascade}
            style={selectStyle}
          >
            {warehouses.length === 0 && <option value="">Predeterminado</option>}
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="step2-language" style={labelStyle}>Idioma de la sesión</label>
        <select
          id="step2-language"
          className="login-input"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={selectStyle}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px', marginTop: '4px' }}>
        <button
          type="submit"
          disabled={isSubmitting || loadingCascade || clientId === '' || roleId === '' || organizationId === ''}
          style={{
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '11px',
            padding: '12px 16px',
            fontSize: '0.88rem',
            fontWeight: '800',
            cursor: isSubmitting ? 'wait' : 'pointer',
            opacity: isSubmitting || loadingCascade ? 0.72 : 1,
            boxShadow: '0 8px 20px -4px rgba(217, 119, 6, 0.45)'
          }}
        >
          {isSubmitting ? 'Ingresando...' : 'Confirmar y Entrar →'}
        </button>

        <button
          type="button"
          onClick={onBack}
          style={{
            background: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            borderRadius: '11px',
            padding: '12px',
            fontSize: '0.84rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          ← Volver
        </button>
      </div>
    </form>
  );
}
