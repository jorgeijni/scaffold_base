import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function normalizeOrigin(order) {
  if (order.originType === 'ecommerce' || order.originType === 'pwa') {
    return order.originType;
  }
  const ch = (order.channel || '').toLowerCase();
  if (ch.includes('ecom') || ch.includes('web')) return 'ecommerce';
  return 'pwa';
}

export default function OrdersInbox({ orders = [], onRefresh, onShowToast }) {
  const { user, token, erpBaseUrl, getAuthHeaders } = useAuth();
  const [originFilter, setOriginFilter] = useState('all'); // 'all' | 'pwa' | 'ecommerce'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [syncLogModal, setSyncLogModal] = useState(null);

  const pwaCount = orders.filter((o) => normalizeOrigin(o) === 'pwa').length;
  const ecommerceCount = orders.filter((o) => normalizeOrigin(o) === 'ecommerce').length;

  const filteredOrders = orders.filter((ord) => {
    const origin = normalizeOrigin(ord);
    if (originFilter !== 'all' && origin !== originFilter) return false;
    if (statusFilter !== 'all' && !(ord.status || '').toLowerCase().includes(statusFilter.toLowerCase())) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const hay = `${ord.id} ${ord.customerName} ${ord.salesRep || ''} ${ord.channel || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const handleUpdateStatus = async (orderId, nextStatus) => {
    setBusyOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          status: nextStatus,
          approvedBy: user?.userName || 'Admin'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo actualizar el estado del pedido.');
      }
      onShowToast(`✅ Orden #${orderId} actualizada a "${nextStatus}"`);
      await onRefresh();
    } catch (err) {
      onShowToast(`⚠️ ${err.message}`);
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleSyncToIdempiere = async (order) => {
    setBusyOrderId(order.id);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}/sync-erp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          baseUrl: erpBaseUrl,
          token,
          context: {
            userId: user?.userId,
            userName: user?.userName,
            clientId: user?.clientId,
            roleId: user?.roleId,
            orgId: user?.orgId,
            organizationId: user?.organizationId,
            warehouseId: user?.warehouseId,
            language: user?.language
          }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error coordinando sincronización con iDempiere.');
      }
      onShowToast(`🔄 Pedido #${order.id}: ${data.message}`);
      setSyncLogModal(data);
      await onRefresh();
    } catch (err) {
      onShowToast(`⛔ ${err.message}`);
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <div className="fade-in">
      {/* Banner de Articulación 3 Capas + Contexto de Sesión iDempiere */}
      <div
        style={{
          background: '#0f172a',
          color: '#f8fafc',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          border: '1px solid #1e293b'
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f59e0b', fontWeight: '800' }}>
            Arquitectura Integrada 3 Capas &bull; Sincronización ERP
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: '700', marginTop: '2px' }}>
            🌐 E-commerce + 📱 PWA Preventa / Vendedores ➔ 🖥️ Panel Admin ➔ 🗄️ iDempiere REST v1
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.74rem' }}>
          <span style={{ background: '#1e293b', padding: '4px 10px', borderRadius: '8px', border: '1px solid #334155' }}>
            User ID: <strong>{user?.userId ?? 'N/A'}</strong>
          </span>
          <span style={{ background: '#1e293b', padding: '4px 10px', borderRadius: '8px', border: '1px solid #334155' }}>
            Client: <strong>#{user?.clientId}</strong>
          </span>
          <span style={{ background: '#1e293b', padding: '4px 10px', borderRadius: '8px', border: '1px solid #334155' }}>
            Role: <strong>#{user?.roleId}</strong>
          </span>
          <span style={{ background: '#1e293b', padding: '4px 10px', borderRadius: '8px', border: '1px solid #d97706', color: '#fde68a' }}>
            Org: <strong>#{user?.orgId}</strong>
          </span>
          <span style={{ background: '#1e293b', padding: '4px 10px', borderRadius: '8px', border: '1px solid #334155' }}>
            Wh: <strong>#{user?.warehouseId ?? 'N/A'}</strong>
          </span>
        </div>
      </div>

      {/* Encabezado y Controles de Filtro por Origen */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Bandeja Central de Gestión de Pedidos
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Supervisa, aprueba y coordina la sincronización hacia iDempiere de pedidos provenientes de PWA Preventa y E-commerce.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🔄 Actualizar Bandeja
          </button>
        </div>

        {/* Filtros por Origen + Búsqueda + Estado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: '📋 Todos los Orígenes', count: orders.length },
              { id: 'pwa', label: '📱 PWA Preventa / Vendedores', count: pwaCount },
              { id: 'ecommerce', label: '🌐 E-commerce', count: ecommerceCount }
            ].map((pill) => {
              const active = originFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setOriginFilter(pill.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '20px',
                    border: active ? '1px solid #d97706' : '1px solid #cbd5e1',
                    background: active ? '#fef3c7' : '#f8fafc',
                    color: active ? '#92400e' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{pill.label}</span>
                  <span
                    style={{
                      background: active ? '#d97706' : '#e2e8f0',
                      color: active ? '#ffffff' : '#334155',
                      padding: '1px 7px',
                      borderRadius: '10px',
                      fontSize: '0.72rem'
                    }}
                  >
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px', maxWidth: '460px' }}>
            <input
              type="text"
              placeholder="🔍 Buscar orden, cliente o vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
            <select
              aria-label="Filtrar por estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente de Aprobación</option>
              <option value="aprobado">Aprobado</option>
              <option value="preparando">En Cocina</option>
              <option value="camino">En Camino</option>
              <option value="entregado">Entregado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>📦</div>
            <h4 style={{ color: '#0f172a', fontWeight: '700' }}>Sin pedidos para el filtro seleccionado</h4>
            <p style={{ color: '#64748b', fontSize: '0.84rem' }}>
              Cambia el filtro de origen o genera un nuevo pedido desde la PWA o E-commerce.
            </p>
          </div>
        ) : (
          filteredOrders.map((ord, idx) => {
            const origin = normalizeOrigin(ord);
            const isPwa = origin === 'pwa';
            const isPending = (ord.status || '').toLowerCase().includes('pendiente');
            const isRejected = (ord.status || '').toLowerCase().includes('rechazado');
            const isSynced = ord.erpSyncStatus === 'Sincronizado';
            const isQueued = ord.erpSyncStatus === 'Coordinado (Cola ERP)';
            const isBusy = busyOrderId === ord.id;

            return (
              <div
                key={ord.id || idx}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '16px 20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem' }}>
                      Orden #{ord.id}
                    </span>

                    {/* Badge de Origen */}
                    <span
                      style={{
                        background: isPwa ? '#fef3c7' : '#e0f2fe',
                        color: isPwa ? '#92400e' : '#0369a1',
                        border: `1px solid ${isPwa ? '#fde68a' : '#bae6fd'}`,
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        padding: '3px 10px',
                        borderRadius: '12px'
                      }}
                    >
                      {isPwa ? '📱 PWA Preventa / Vendedores' : '🌐 E-commerce'}
                    </span>

                    {/* Badge de Estado */}
                    <span
                      style={{
                        background: isRejected ? '#fee2e2' : ord.status?.includes('Entregado') ? '#dcfce7' : '#f1f5f9',
                        color: isRejected ? '#991b1b' : ord.status?.includes('Entregado') ? '#166534' : '#334155',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: '800'
                      }}
                    >
                      {ord.status || 'Pendiente de Aprobación'}
                    </span>

                    {/* Badge de Sincronización ERP */}
                    <span
                      style={{
                        background: isSynced ? '#dcfce7' : isQueued ? '#e0f2fe' : '#fffbeb',
                        color: isSynced ? '#166534' : isQueued ? '#0369a1' : '#92400e',
                        border: `1px solid ${isSynced ? '#86efac' : isQueued ? '#bae6fd' : '#fde68a'}`,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: '800'
                      }}
                    >
                      {isSynced
                        ? `✅ ERP ${ord.erpDocumentNo || 'Sincronizado'}`
                        : isQueued
                          ? '📤 Coordinado (Cola ERP)'
                          : '⏳ Pendiente Sincronización ERP'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px' }}>
                    Cliente: <strong>{ord.customerName}</strong>
                    {ord.salesRep && (
                      <>
                        {' '}&bull; Vendedor/Origen: <strong>{ord.salesRep}</strong>
                      </>
                    )}
                    {' '}&bull; Entrega: {ord.address || 'Dirección estándar'}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Detalle: {ord.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                  </div>
                </div>

                {/* Monto y Acciones */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#b45309' }}>
                    ${parseFloat(ord.total || 0).toFixed(2)}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUpdateStatus(ord.id, 'Aprobado ✅')}
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '7px',
                            padding: '6px 10px',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          ✓ Aprobar
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUpdateStatus(ord.id, 'Rechazado ❌')}
                          style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            borderRadius: '7px',
                            padding: '6px 10px',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          ✕ Rechazar
                        </button>
                      </>
                    )}

                    {!isPending && !isRejected && !ord.status?.includes('Entregado') && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          const next = ord.status?.includes('Aprobado')
                            ? 'Preparando en cocina 👨‍🍳'
                            : ord.status?.includes('Preparando')
                              ? 'En camino con repartidor 🛵'
                              : 'Entregado con éxito ✅';
                          handleUpdateStatus(ord.id, next);
                        }}
                        style={{
                          background: '#f1f5f9',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          borderRadius: '7px',
                          padding: '6px 10px',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        ➔ Avanzar Estado
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleSyncToIdempiere(ord)}
                        style={{
                          background: isSynced ? '#f8fafc' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                          color: isSynced ? '#334155' : '#ffffff',
                          border: isSynced ? '1px solid #cbd5e1' : 'none',
                          borderRadius: '7px',
                          padding: '6px 12px',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          cursor: isBusy ? 'wait' : 'pointer'
                        }}
                      >
                        {isBusy ? '⏳...' : isSynced ? '🔁 Re-sincronizar ERP' : '📤 Sincronizar iDempiere'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Detalle de Sincronización ERP */}
      {syncLogModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '540px', width: '100%', padding: '20px', boxShadow: '0 20px 45px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>
                Resultado de Coordinación iDempiere ERP
              </h3>
              <button
                type="button"
                onClick={() => setSyncLogModal(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: '800' }}
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#334155', marginBottom: '10px' }}>
              {syncLogModal.message}
            </p>
            <pre
              style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                overflowX: 'auto',
                maxHeight: '260px'
              }}
            >
              {JSON.stringify(syncLogModal.erpPayload || syncLogModal.data, null, 2)}
            </pre>
            <div style={{ textAlign: 'right', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setSyncLogModal(null)}
                style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '700', cursor: 'pointer' }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
