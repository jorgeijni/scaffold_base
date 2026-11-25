import React, { useState, useEffect } from 'react';
import { syncSingleCatalog } from '../services/idempiereSyncService';

export default function ProductsView({ session, onNotify }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/product-categories')
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (prodData.success) setProducts(prodData.data || []);
      if (catData.success) setCategories(catData.data || []);
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify('error', 'Error cargando datos de productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    if (!session) {
      if (onNotify) onNotify('warning', 'Inicie sesión en iDempiere para sincronizar este catálogo.');
      return;
    }
    setSyncing(true);
    try {
      const result = await syncSingleCatalog('products', session);
      if (onNotify) onNotify('success', `¡Sincronizado! Se procesaron ${result.count} productos desde iDempiere ERP.`);
      loadData();
    } catch (err) {
      if (onNotify) onNotify('error', `Fallo al sincronizar productos: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.value || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = !selectedCategoryFilter || String(p.category_id) === String(selectedCategoryFilter);
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', marginBottom: '8px' }}>
            🔒 SOLO LECTURA &bull; MAESTRO ERP
          </div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: '800' }}>
            📦 Catálogo Maestro de Productos (M_Product)
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            Este catálogo se alimenta exclusivamente desde el ERP iDempiere garantizando que el ERP sea la única fuente de la verdad. No permite mutaciones locales.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              padding: '10px 18px',
              background: syncing ? '#475569' : '#0284c7',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: syncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {syncing ? '🔄 Sincronizando...' : '⚡ Sincronizar Productos desde ERP'}
          </button>
        </div>
      </div>

      {/* Barra de Filtro / Búsqueda */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por SKU, nombre, descripción o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '280px',
            maxWidth: '420px',
            padding: '9px 14px',
            background: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '0.88rem'
          }}
        />

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          style={{
            padding: '9px 14px',
            background: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '0.88rem'
          }}
        >
          <option value="">Todas las categorías ({categories.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div style={{ color: '#64748b', fontSize: '0.82rem' }}>
          Mostrando {filteredProducts.length} de {products.length} productos
        </div>
      </div>

      {/* Tabla Solo Lectura */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#1a2234', color: '#94a3b8', borderBottom: '1px solid #1f2937' }}>
              <th style={{ padding: '14px 18px' }}>ID ERP</th>
              <th style={{ padding: '14px 18px' }}>Imagen</th>
              <th style={{ padding: '14px 18px' }}>Código / SKU</th>
              <th style={{ padding: '14px 18px' }}>Nombre del Producto</th>
              <th style={{ padding: '14px 18px' }}>Categoría</th>
              <th style={{ padding: '14px 18px' }}>Precio Ref.</th>
              <th style={{ padding: '14px 18px' }}>Stock</th>
              <th style={{ padding: '14px 18px' }}>Estado</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Modo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                  Cargando catálogo maestro de productos desde SQLite...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                  No se encontraron productos sincronizados en SQLite. Haz clic en "Sincronizar Productos desde ERP".
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '14px 18px', fontWeight: '700', color: '#cbd5e1' }}>#{p.id}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                      alt={p.name}
                      style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #374151' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'; }}
                    />
                  </td>
                  <td style={{ padding: '14px 18px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '700' }}>
                    {p.value || `PROD-${p.id}`}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: '600', color: '#f8fafc' }}>{p.name}</div>
                    {p.description && (
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', background: '#1e293b', color: '#94a3b8' }}>
                      {p.category_name || 'General'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: '800', color: '#10b981', fontSize: '0.95rem' }}>
                    ${Number(p.price || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                    {p.stock}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: p.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: p.is_active ? '#34d399' : '#f87171'
                    }}>
                      {p.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: '#1f2937',
                      color: '#94a3b8',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      border: '1px solid #374151'
                    }}>
                      👁️ Solo Lectura
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
