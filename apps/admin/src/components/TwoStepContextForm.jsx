import React, { useState } from 'react';
import { DEFAULT_LANGUAGES } from '../services/AuthService';

/**
 * Paso 2 del Login Asistido (Multitenant Dinámico):
 * Permite seleccionar Empresa, Rol, Organización, Almacén e Idioma
 * recargando dinámicamente las opciones dependientes desde iDempiere REST API v1.
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
    background: 'rgba(15, 23, 42, 0.85)',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '9px 12px',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    color: '#cbd5e1',
    marginBottom: '4px',
    fontWeight: '700'
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}
      >
        <div>
          <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#f8fafc' }}>
            Paso 2: Seleccionar Contexto ERP
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
            Usuario verificado: <strong style={{ color: '#38bdf8' }}>{stepOneData.userName}</strong>
            {stepOneData.userId ? ` (ID: ${stepOneData.userId})` : ''}
          </div>
        </div>
        {loadingCascade && (
          <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '700' }}>
            ⏳ Cargando...
          </span>
        )}
      </div>

      {cascadeError && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fcd34d',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.76rem'
          }}
        >
          ⚠️ No se pudieron recargar opciones dinámicas: {cascadeError}
        </div>
      )}

      <div>
        <label style={labelStyle}>Empresa / Tenant (clientId)</label>
        <select
          value={clientId}
          onChange={(e) => handleClientChange(e.target.value)}
          required
          style={selectStyle}
        >
          {clients.length === 0 && <option value="">Sin empresas disponibles</option>}
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (ID: {c.id})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Rol de Acceso (roleId)</label>
        <select
          value={roleId}
          onChange={(e) => handleRoleChange(e.target.value)}
          required
          disabled={loadingCascade || roles.length === 0}
          style={selectStyle}
        >
          {roles.length === 0 && <option value="">Sin roles para esta empresa</option>}
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} (ID: {r.id})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ ...labelStyle, color: '#f59e0b' }}>Organización (organizationId)</label>
          <select
            value={organizationId}
            onChange={(e) => handleOrgChange(e.target.value)}
            required
            disabled={loadingCascade || organizations.length === 0}
            style={{ ...selectStyle, borderColor: '#d97706', color: '#fef3c7' }}
          >
            {organizations.length === 0 && <option value="">Sin organizaciones</option>}
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} (ID: {o.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Almacén (warehouseId)</label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            disabled={loadingCascade}
            style={selectStyle}
          >
            {warehouses.length === 0 && <option value="">(Sin Almacén)</option>}
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} (ID: {w.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Idioma (language)</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={selectStyle}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name} ({l.code})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px', marginTop: '6px' }}>
        <button
          type="submit"
          disabled={isSubmitting || loadingCascade || clientId === '' || roleId === '' || organizationId === ''}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '11px 16px',
            fontSize: '0.88rem',
            fontWeight: '800',
            cursor: isSubmitting ? 'wait' : 'pointer',
            opacity: isSubmitting || loadingCascade ? 0.7 : 1,
            boxShadow: '0 6px 18px rgba(2, 132, 199, 0.35)'
          }}
        >
          {isSubmitting ? '⏳ Obteniendo token final...' : '✓ Confirmar y Entrar'}
        </button>

        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'rgba(30, 41, 59, 0.85)',
            color: '#cbd5e1',
            border: '1px solid #475569',
            borderRadius: '10px',
            padding: '11px 12px',
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

