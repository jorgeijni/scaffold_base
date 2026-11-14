import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/AuthService';

export default function MasterCatalogsView({ activeSubTab: initialSubTab = 'categories' }) {
  const { token, baseUrl } = useAuth();

  // Subtab: 'categories' | 'products' | 'pricelists' | 'customer-categories' | 'customers' | 'taxes'
  const [activeCatalog, setActiveCatalog] = useState(initialSubTab);

  // Data States
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [priceLists, setPriceLists] = useState([]);
  const [customerCategories, setCustomerCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [syncHistory, setSyncHistory] = useState([]);

  // Price List Selection & Versions State
  const [selectedPriceListId, setSelectedPriceListId] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [versionPrices, setVersionPrices] = useState([]);

  // Loading & Action States
  const [loading, setLoading] = useState(false);
  const [syncingCatalog, setSyncingCatalog] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'price_edit'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Carga inicial
  useEffect(() => {
    fetchAllCatalogs();
  }, []);

  // Recarga al cambiar de catálogo si es necesario
  useEffect(() => {
    setSearchQuery('');
    setFeedback(null);
  }, [activeCatalog]);

  const showToast = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  const getActiveToken = () => {
    if (token) return token;
    const session = AuthService.getSession();
    return session?.token || null;
  };

  const getEffectiveBaseUrl = () => {
    if (baseUrl) return baseUrl;
    const config = AuthService.getConnectionConfig();
    return config?.baseUrl || 'https://test.idempiere.org:443';
  };

  const fetchAllCatalogs = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes, plRes, cCatRes, custRes, taxRes, histRes] = await Promise.all([
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/pricelists').then(r => r.json()),
        fetch('/api/customer-categories').then(r => r.json()),
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/taxes').then(r => r.json()),
        fetch('/api/idempiere/sync/history').then(r => r.json())
      ]);

      if (catRes.success) setCategories(catRes.data || []);
      if (prodRes.success) setProducts(prodRes.data || []);
      if (plRes.success) {
        setPriceLists(plRes.data || []);
        if (plRes.data?.length > 0 && !selectedPriceListId) {
          const defaultList = plRes.data.find(l => l.is_default) || plRes.data[0];
          setSelectedPriceListId(defaultList.id);
          loadPriceListDetails(defaultList.id);
        }
      }
      if (cCatRes.success) setCustomerCategories(cCatRes.data || []);
      if (custRes.success) setCustomers(custRes.data || []);
      if (taxRes.success) setTaxes(taxRes.data || []);
      if (histRes.success) setSyncHistory(histRes.data || []);
    } catch (err) {
      console.error('Error cargando catálogos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPriceListDetails = async (plId) => {
    try {
      const verRes = await fetch(`/api/pricelists/${plId}/versions`).then(r => r.json());
      if (verRes.success && verRes.data?.length > 0) {
        const vId = verRes.data[0].id;
        setSelectedVersionId(vId);
        const pricesRes = await fetch(`/api/pricelists/versions/${vId}/prices`).then(r => r.json());
        if (pricesRes.success) setVersionPrices(pricesRes.data || []);
      } else {
        setSelectedVersionId(null);
        setVersionPrices([]);
      }
    } catch (err) {
      console.error('Error cargando versiones de precios:', err);
    }
  };

  const handleSelectPriceList = (plId) => {
    setSelectedPriceListId(plId);
    loadPriceListDetails(plId);
  };

  // ==========================================
  // SINCRONIZACIÓN CON IDEMPIERE ERP
  // ==========================================
  const handleSyncCatalog = async (catalogKey) => {
    setSyncingCatalog(catalogKey);
    const authToken = getActiveToken();
    const targetUrl = getEffectiveBaseUrl();

    let endpoint = '/api/idempiere/sync/all';
    if (catalogKey === 'categories') endpoint = '/api/idempiere/sync/categories';
    if (catalogKey === 'products') endpoint = '/api/idempiere/sync/products';
    if (catalogKey === 'pricelists') endpoint = '/api/idempiere/sync/pricelists';
    if (catalogKey === 'customer-categories') endpoint = '/api/idempiere/sync/customer-categories';
    if (catalogKey === 'customers') endpoint = '/api/idempiere/sync/customers';
    if (catalogKey === 'taxes') endpoint = '/api/idempiere/sync/taxes';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          baseUrl: targetUrl,
          token: authToken
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`✅ Sincronización exitosa: ${data.catalog || 'Catálogos'} (${data.syncedCount ?? data.message} registros procesados). Fuente: ${data.source || 'iDempiere'}`);
        await fetchAllCatalogs();
      } else {
        showToast(`❌ Error al sincronizar: ${data.error || 'Respuesta inesperada'}`, 'error');
      }
    } catch (err) {
      showToast(`❌ Error de conexión al sincronizar: ${err.message}`, 'error');
    } finally {
      setSyncingCatalog(null);
    }
  };

  // ==========================================
  // OPERACIONES CRUD EN MODAL
  // ==========================================
  const openCreateModal = () => {
    setModalMode('create');
    setEditingItem(null);
    if (activeCatalog === 'categories') {
      setFormData({ name: '', value: '', description: '', is_active: true });
    } else if (activeCatalog === 'products') {
      setFormData({
        name: '',
        value: '',
        category: categories[0]?.name || 'Especiales',
        category_id: categories[0]?.id || null,
        price: '',
        stock: '30',
        specialty: 'Signature Edition',
        badgeColor: '#ea580c',
        calories: '750 kcal',
        description: '',
        isAvailable: true
      });
    } else if (activeCatalog === 'pricelists') {
      setFormData({
        name: '',
        value: '',
        description: '',
        currency: 'PEN',
        is_default: false,
        initialVersionName: 'Versión Oficial 2026-Q1'
      });
    } else if (activeCatalog === 'customer-categories') {
      setFormData({
        name: '',
        value: '',
        description: '',
        discount_percent: '5.0',
        is_default: false,
        is_active: true
      });
    } else if (activeCatalog === 'customers') {
      setFormData({
        name: '',
        value: '',
        tax_id: '',
        category_id: customerCategories[0]?.id || 3,
        email: '',
        phone: '',
        address: '',
        tier: 'Regular',
        is_active: true
      });
    }
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setEditingItem(item);
    setFormData({ ...item });
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingItem(null);
    setFormData({});
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = '';
      let method = modalMode === 'create' ? 'POST' : 'PUT';

      if (activeCatalog === 'categories') {
        endpoint = modalMode === 'create' ? '/api/categories' : `/api/categories/${editingItem.id}`;
      } else if (activeCatalog === 'products') {
        endpoint = modalMode === 'create' ? '/api/products' : `/api/products/${editingItem.id}`;
      } else if (activeCatalog === 'pricelists') {
        endpoint = modalMode === 'create' ? '/api/pricelists' : `/api/pricelists/${editingItem.id}`;
      } else if (activeCatalog === 'customer-categories') {
        endpoint = modalMode === 'create' ? '/api/customer-categories' : `/api/customer-categories/${editingItem.id}`;
      } else if (activeCatalog === 'customers') {
        endpoint = modalMode === 'create' ? '/api/customers' : `/api/customers/${editingItem.id}`;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Registro guardado exitosamente en SQLite`);
        closeModal();
        await fetchAllCatalogs();
      } else {
        showToast(data.error || 'Error al guardar el registro', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${name}" del catálogo? Esta acción actualizará la base de datos SQLite.`)) {
      return;
    }

    let endpoint = '';
    if (activeCatalog === 'categories') endpoint = `/api/categories/${id}`;
    if (activeCatalog === 'products') endpoint = `/api/products/${id}`;
    if (activeCatalog === 'pricelists') endpoint = `/api/pricelists/${id}`;
    if (activeCatalog === 'customer-categories') endpoint = `/api/customer-categories/${id}`;
    if (activeCatalog === 'customers') endpoint = `/api/customers/${id}`;

    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Registro eliminado correctamente de SQLite`);
        await fetchAllCatalogs();
      } else {
        showToast(data.error || 'No se pudo eliminar el registro', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdatePrice = async (versionId, productId, priceStd) => {
    try {
      const res = await fetch(`/api/pricelists/versions/${versionId}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          price_std: parseFloat(priceStd),
          price_list: parseFloat(priceStd) * 1.1,
          price_limit: parseFloat(priceStd) * 0.9
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Precio actualizado en la versión`);
        loadPriceListDetails(selectedPriceListId);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filtro de búsqueda
  const filterList = (items, fields = ['name', 'value']) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      fields.some(f => String(item[f] || '').toLowerCase().includes(q))
    );
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      {/* Toast Feedback */}
      {feedback && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: feedback.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: feedback.type === 'error' ? '#991b1b' : '#166534',
          border: `1px solid ${feedback.type === 'error' ? '#fecaca' : '#86efac'}`,
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: '700',
          fontSize: '0.88rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          {feedback.message}
        </div>
      )}

      {/* Top Header & Global Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.6rem' }}>📚</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Catálogos Maestros ERP & Base de Datos SQLite
            </h1>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Administración unificada y sincronización bidireccional entre la base de datos local SQLite y las tablas maestras de iDempiere ERP.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleSyncCatalog('all')}
            disabled={syncingCatalog === 'all'}
            style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '0.84rem',
              fontWeight: '800',
              cursor: syncingCatalog === 'all' ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
            }}
          >
            <span>{syncingCatalog === 'all' ? '⏳' : '⚡'}</span>
            <span>{syncingCatalog === 'all' ? 'Sincronizando Todo...' : 'Sincronización Total ERP (6 Catálogos)'}</span>
          </button>

          <button
            onClick={fetchAllCatalogs}
            disabled={loading}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '0.84rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🔄 Refrescar SQLite
          </button>
        </div>
      </div>

      {/* Tabs Selector for the 6 Catalogs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        background: '#f1f5f9',
        padding: '6px',
        borderRadius: '12px',
        overflowX: 'auto',
        marginBottom: '20px'
      }}>
        {[
          { id: 'categories', label: 'Categorías Productos', icon: '🏷️', count: categories.length, maintainable: true, erpTable: 'M_Product_Category' },
          { id: 'products', label: 'Catálogo de Productos', icon: '🍔', count: products.length, maintainable: true, erpTable: 'M_Product' },
          { id: 'pricelists', label: 'Catálogo de Precios', icon: '💲', count: priceLists.length, maintainable: true, erpTable: 'M_PriceList' },
          { id: 'customer-categories', label: 'Categorías Clientes', icon: '👥', count: customerCategories.length, maintainable: true, erpTable: 'C_BP_Group' },
          { id: 'customers', label: 'Catálogo Clientes', icon: '👤', count: customers.length, maintainable: true, erpTable: 'C_BPartner' },
          { id: 'taxes', label: 'Impuestos (Solo Lectura)', icon: '🏛️', count: taxes.length, maintainable: false, erpTable: 'C_Tax' }
        ].map(tab => {
          const isActive = activeCatalog === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCatalog(tab.id)}
              style={{
                flex: '1',
                minWidth: '160px',
                padding: '10px 14px',
                border: 'none',
                borderRadius: '8px',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#0f172a' : '#64748b',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                fontWeight: isActive ? '800' : '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
              <span style={{
                background: isActive ? '#fef3c7' : '#e2e8f0',
                color: isActive ? '#92400e' : '#475569',
                padding: '2px 7px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: '800'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Catalog Content Area */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '22px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
      }}>

        {/* Action Header for Current Catalog */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px'
        }}>
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px', maxWidth: '380px' }}>
            <input
              type="text"
              placeholder={`Buscar en ${activeCatalog}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Right Actions: Maintainable vs Read-only */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeCatalog === 'taxes' ? (
              <span style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: '800'
              }}>
                🔒 Catálogo de Solo Lectura (ERP Oficial)
              </span>
            ) : (
              <button
                onClick={openCreateModal}
                style={{
                  background: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>➕</span>
                <span>Nuevo Registro</span>
              </button>
            )}

            <button
              onClick={() => handleSyncCatalog(activeCatalog)}
              disabled={syncingCatalog === activeCatalog}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                borderRadius: '8px',
                padding: '9px 14px',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: syncingCatalog === activeCatalog ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{syncingCatalog === activeCatalog ? '⏳' : '🔄'}</span>
              <span>{syncingCatalog === activeCatalog ? 'Sincronizando...' : 'Sincronizar desde ERP'}</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 1. TABLA: CATEGORÍAS DE PRODUCTOS (Mantenible) */}
        {/* ======================================================== */}
        {activeCatalog === 'categories' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Código ERP</th>
                  <th style={{ padding: '12px 16px' }}>Nombre de Categoría</th>
                  <th style={{ padding: '12px 16px' }}>Descripción</th>
                  <th style={{ padding: '12px 16px' }}>Productos Asociados</th>
                  <th style={{ padding: '12px 16px' }}>Estado</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filterList(categories, ['name', 'value', 'description']).map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '800', color: '#b45309' }}>
                      {c.value}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>
                      {c.name}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.82rem', maxWidth: '320px' }}>
                      {c.description || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '12px', fontWeight: '700', color: '#334155' }}>
                        {c.products_count ?? 0} ítems
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: c.is_active ? '#dcfce7' : '#fee2e2',
                        color: c.is_active ? '#166534' : '#991b1b',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '800'
                      }}>
                        {c.is_active ? '● Activa' : '○ Inactiva'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(c)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteItem(c.id, c.name)}
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. TABLA: PRODUCTOS (Mantenible) */}
        {/* ======================================================== */}
        {activeCatalog === 'products' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Producto</th>
                  <th style={{ padding: '12px 16px' }}>SKU / Código</th>
                  <th style={{ padding: '12px 16px' }}>Categoría</th>
                  <th style={{ padding: '12px 16px' }}>Precio</th>
                  <th style={{ padding: '12px 16px' }}>Stock</th>
                  <th style={{ padding: '12px 16px' }}>Especialidad</th>
                  <th style={{ padding: '12px 16px' }}>Estado</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filterList(products, ['name', 'value', 'category', 'specialty']).map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: '800', color: '#0f172a' }}>{p.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.calories || '750 kcal'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#475569', fontSize: '0.8rem' }}>
                      {p.value || `HR-BUR-${p.id}`}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700' }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '800', color: '#b45309' }}>
                      ${parseFloat(p.price || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: p.stock < 25 ? '#ef4444' : '#10b981' }}>
                      {p.stock} u.
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                        padding: '3px 8px',
                        borderRadius: '16px',
                        fontSize: '0.74rem',
                        fontWeight: '800'
                      }}>
                        {p.specialty || 'Signature'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: p.isAvailable ? '#dcfce7' : '#fee2e2',
                        color: p.isAvailable ? '#166534' : '#991b1b',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '800'
                      }}>
                        {p.isAvailable ? '✓ Disponible' : '⏸️ Pausada'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(p)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteItem(p.id, p.name)}
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. TABLA: CATÁLOGO DE PRECIOS & VERSIONES (Mantenible) */}
        {/* ======================================================== */}
        {activeCatalog === 'pricelists' && (
          <div>
            {/* Listas de Precios Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '22px' }}>
              {priceLists.map(pl => {
                const isSelected = selectedPriceListId === pl.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => handleSelectPriceList(pl.id)}
                    style={{
                      border: isSelected ? '2px solid #ea580c' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      background: isSelected ? '#fffaf5' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#64748b' }}>{pl.value}</span>
                      {pl.is_default && (
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                          ★ Tarifa Base
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>{pl.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{pl.description || 'Sin descripción'}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: '700', color: '#b45309' }}>Moneda: {pl.currency}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(pl); }}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}
                      >
                        ✏️ Editar Lista
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Versiones y Matriz de Precios */}
            {selectedPriceListId && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Precios por Versión de Lista Vigente
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Ajuste granular de precios de lista, precios de venta y límites mínimos para esta tarifa.
                    </div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '12px 16px' }}>Producto</th>
                      <th style={{ padding: '12px 16px' }}>Categoría</th>
                      <th style={{ padding: '12px 16px' }}>Precio Lista</th>
                      <th style={{ padding: '12px 16px' }}>Precio Estándar (Venta)</th>
                      <th style={{ padding: '12px 16px' }}>Precio Límite Mínimo</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Ajustar Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {versionPrices.map(vp => (
                      <tr key={vp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>
                          {vp.product_name}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>
                          {vp.product_category}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>
                          ${parseFloat(vp.price_list).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '800', color: '#b45309' }}>
                          ${parseFloat(vp.price_std).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>
                          ${parseFloat(vp.price_limit).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <input
                            type="number"
                            step="0.10"
                            defaultValue={vp.price_std}
                            onBlur={(e) => handleUpdatePrice(vp.version_id, vp.product_id, e.target.value)}
                            style={{
                              width: '90px',
                              padding: '5px 8px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              textAlign: 'right',
                              fontWeight: '700'
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. TABLA: CATEGORÍAS DE CLIENTES / BP_GROUPS (Mantenible) */}
        {/* ======================================================== */}
        {activeCatalog === 'customer-categories' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Código ERP</th>
                  <th style={{ padding: '12px 16px' }}>Grupo de Clientes</th>
                  <th style={{ padding: '12px 16px' }}>Descripción</th>
                  <th style={{ padding: '12px 16px' }}>Descuento Oficial</th>
                  <th style={{ padding: '12px 16px' }}>Clientes Registrados</th>
                  <th style={{ padding: '12px 16px' }}>Estado</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filterList(customerCategories, ['name', 'value', 'description']).map(g => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0284c7' }}>
                      {g.value}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>
                      {g.name}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.82rem', maxWidth: '320px' }}>
                      {g.description || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '800', color: '#059669' }}>
                      {g.discount_percent}% OFF
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '12px', fontWeight: '700', color: '#334155' }}>
                        {g.customers_count ?? 0} socios
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: g.is_active ? '#dcfce7' : '#fee2e2',
                        color: g.is_active ? '#166534' : '#991b1b',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '800'
                      }}>
                        {g.is_active ? '● Activo' : '○ Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(g)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteItem(g.id, g.name)}
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. TABLA: CATÁLOGO DE CLIENTES / BPARTNERS (Mantenible) */}
        {/* ======================================================== */}
        {activeCatalog === 'customers' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Cliente</th>
                  <th style={{ padding: '12px 16px' }}>Documento / RUC</th>
                  <th style={{ padding: '12px 16px' }}>Categoría / Grupo</th>
                  <th style={{ padding: '12px 16px' }}>Contacto & Dirección</th>
                  <th style={{ padding: '12px 16px' }}>Consumo Acumulado</th>
                  <th style={{ padding: '12px 16px' }}>Estado</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filterList(customers, ['name', 'value', 'tax_id', 'email', 'phone']).map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {c.avatar && (
                          <img
                            src={c.avatar}
                            alt={c.name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: '800', color: '#0f172a' }}>{c.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.value}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#475569' }}>
                      {c.tax_id || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: c.tier?.includes('VIP') ? '#fef3c7' : '#e0f2fe',
                        color: c.tier?.includes('VIP') ? '#92400e' : '#0369a1',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.74rem',
                        fontWeight: '800'
                      }}>
                        {c.category_name || c.tier || 'Estándar'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8rem' }}>
                      <div style={{ color: '#0f172a', fontWeight: '600' }}>{c.email}</div>
                      <div style={{ color: '#64748b' }}>{c.phone} • {c.address}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '800', color: '#b45309' }}>${parseFloat(c.total_spent || 0).toFixed(2)}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.orders_count} pedidos</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: c.is_active ? '#dcfce7' : '#fee2e2',
                        color: c.is_active ? '#166534' : '#991b1b',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '800'
                      }}>
                        {c.is_active ? '● Activo' : '○ Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(c)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteItem(c.id, c.name)}
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. TABLA: CATÁLOGO DE IMPUESTOS (SOLO LECTURA) */}
        {/* ======================================================== */}
        {activeCatalog === 'taxes' && (
          <div>
            {/* Banner Informativo de Solo Lectura */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🔒</span>
              <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.45 }}>
                <strong>Catálogo Tributario Oficial de Solo Lectura:</strong> Por reglas fiscales y consistencia contable,
                las tasas y tipos de impuestos no permiten creación ni alteración manual en la aplicación comercial;
                se leen y sincronizan directamente desde la tabla maestra <code>C_Tax</code> de iDempiere ERP.
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px 16px' }}>Código ERP</th>
                    <th style={{ padding: '12px 16px' }}>Nombre del Impuesto</th>
                    <th style={{ padding: '12px 16px' }}>Tasa Gravada (%)</th>
                    <th style={{ padding: '12px 16px' }}>Categoría de Impuesto</th>
                    <th style={{ padding: '12px 16px' }}>Descripción Legal</th>
                    <th style={{ padding: '12px 16px' }}>Estado en ERP</th>
                  </tr>
                </thead>
                <tbody>
                  {filterList(taxes, ['name', 'value', 'category_name', 'description']).map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#475569' }}>
                        {t.value}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0f172a' }}>
                        {t.name}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: t.rate > 0 ? '#fef3c7' : '#f1f5f9',
                          color: t.rate > 0 ? '#92400e' : '#475569',
                          border: `1px solid ${t.rate > 0 ? '#fde68a' : '#cbd5e1'}`,
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontWeight: '800',
                          fontSize: '0.84rem'
                        }}>
                          {t.rate}%
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#334155', fontWeight: '600' }}>
                        {t.category_name}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.82rem', maxWidth: '340px' }}>
                        {t.description || 'Sin observaciones'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: t.is_active ? '#dcfce7' : '#fee2e2',
                          color: t.is_active ? '#166534' : '#991b1b',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '800'
                        }}>
                          {t.is_active ? '✓ Activo ERP' : '○ Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL UNIVERSAL PARA CREACIÓN / EDICIÓN DE CATÁLOGOS     */}
      {/* ======================================================== */}
      {modalMode && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {modalMode === 'create' ? 'Nuevo Registro' : 'Editar Registro'} • {
                  activeCatalog === 'categories' ? 'Categoría de Productos' :
                  activeCatalog === 'products' ? 'Producto' :
                  activeCatalog === 'pricelists' ? 'Lista de Precios' :
                  activeCatalog === 'customer-categories' ? 'Categoría de Clientes' : 'Cliente / Socio de Negocio'
                }
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <form onSubmit={handleSaveModal} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Campos para CATEGORÍAS DE PRODUCTOS */}
              {activeCatalog === 'categories' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Nombre de Categoría *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Código / Value ERP</label>
                    <input
                      type="text"
                      placeholder="ej. CAT-ESP"
                      value={formData.value || ''}
                      onChange={e => setFormData({ ...formData, value: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Descripción</label>
                    <textarea
                      rows="3"
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="cat_active"
                      checked={Boolean(formData.is_active)}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <label htmlFor="cat_active" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>Categoría Activa</label>
                  </div>
                </>
              )}

              {/* Campos para PRODUCTOS */}
              {activeCatalog === 'products' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Nombre del Producto *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>SKU / Código</label>
                      <input
                        type="text"
                        value={formData.value || ''}
                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Categoría *</label>
                      <select
                        value={formData.category || 'Especiales'}
                        onChange={e => {
                          const catObj = categories.find(c => c.name === e.target.value);
                          setFormData({ ...formData, category: e.target.value, category_id: catObj ? catObj.id : null });
                        }}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Precio ($) *</label>
                      <input
                        type="number"
                        step="0.10"
                        required
                        value={formData.price || ''}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Stock Inicial</label>
                      <input
                        type="number"
                        value={formData.stock || ''}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Nivel de Especialidad</label>
                    <input
                      type="text"
                      value={formData.specialty || ''}
                      onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>URL Imagen</label>
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Descripción Gastronómica</label>
                    <textarea
                      rows="2"
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="prod_avail"
                      checked={Boolean(formData.isAvailable)}
                      onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                    />
                    <label htmlFor="prod_avail" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>Disponible para venta</label>
                  </div>
                </>
              )}

              {/* Campos para LISTAS DE PRECIOS */}
              {activeCatalog === 'pricelists' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Nombre de la Lista de Precios *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Código / Value</label>
                      <input
                        type="text"
                        value={formData.value || ''}
                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Moneda</label>
                      <select
                        value={formData.currency || 'PEN'}
                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                      >
                        <option value="PEN">Soles (PEN)</option>
                        <option value="USD">Dólares (USD)</option>
                        <option value="EUR">Euros (EUR)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Descripción</label>
                    <textarea
                      rows="2"
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="pl_def"
                      checked={Boolean(formData.is_default)}
                      onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                    />
                    <label htmlFor="pl_def" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>Marcar como Lista Predeterminada de Ventas</label>
                  </div>
                </>
              )}

              {/* Campos para CATEGORÍAS DE CLIENTES */}
              {activeCatalog === 'customer-categories' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Nombre del Grupo de Clientes *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Código / Value</label>
                      <input
                        type="text"
                        value={formData.value || ''}
                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Descuento Comercial (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.discount_percent || ''}
                        onChange={e => setFormData({ ...formData, discount_percent: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Descripción</label>
                    <textarea
                      rows="2"
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="ccat_act"
                      checked={Boolean(formData.is_active)}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <label htmlFor="ccat_act" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>Grupo Activo</label>
                  </div>
                </>
              )}

              {/* Campos para CLIENTES */}
              {activeCatalog === 'customers' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Nombre Completo o Razón Social *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>DNI / RUC / Tax ID</label>
                      <input
                        type="text"
                        value={formData.tax_id || ''}
                        onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Categoría / Grupo *</label>
                      <select
                        value={formData.category_id || customerCategories[0]?.id || ''}
                        onChange={e => {
                          const catId = Number(e.target.value);
                          const grp = customerCategories.find(g => g.id === catId);
                          setFormData({ ...formData, category_id: catId, category_name: grp?.name || '' });
                        }}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                      >
                        {customerCategories.map(g => (
                          <option key={g.id} value={g.id}>{g.name} ({g.discount_percent}% OFF)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Correo Electrónico</label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Teléfono Celular</label>
                      <input
                        type="text"
                        value={formData.phone || ''}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Dirección de Entrega / Facturación</label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="cust_act"
                      checked={Boolean(formData.is_active)}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <label htmlFor="cust_act" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>Cliente Activo</label>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Guardando...' : 'Guardar en SQLite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
