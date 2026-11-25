import React from 'react';

export default function GeneralSummaryView({ onNavigate }) {
  const featuredBurgers = [
    {
      name: "Rey de las Burgers",
      badge: "Corona de Oro • Edición Legendaria",
      price: "$14.99",
      stock: "45 u.",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Burger Real Clásica",
      badge: "Clásica de Autor",
      price: "$9.99",
      stock: "60 u.",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Burger Real Doble",
      badge: "Doble Impacto",
      price: "$12.50",
      stock: "38 u.",
      image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Burger Doble Especial",
      badge: "Edición Especial",
      price: "$13.50",
      stock: "30 u.",
      image: "https://images.unsplash.com/photo-1583032015879-c5c48b59d9c5?auto=format&fit=crop&w=500&q=80"
    }
  ];

  return (
    <div>
      {/* 1. FILA DE 4 KPIS SUPERIORES (Exacto a Imagen 4) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* KPI 1: Ventas del día */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              VENTAS DEL DÍA
            </span>
            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '800' }}>
              +18.4%
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            $4,892.50 <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>USD</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            342 pedidos simulados completados
          </div>
        </div>

        {/* KPI 2: Hamburguesas activas */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              HAMBURGUESAS ACTIVAS
            </span>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '800' }}>
              10 Destacadas
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            10 Variantes
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Top: "Rey de las Burgers"
          </div>
        </div>

        {/* KPI 3: Clientes consumidores */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CLIENTES CONSUMIDORES
            </span>
            <span style={{ backgroundColor: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '800' }}>
              Segmentados
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            1,284
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            420 Clientes VIP recurrentes
          </div>
        </div>

        {/* KPI 4: Ticket promedio */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TICKET PROMEDIO
            </span>
            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '800' }}>
              Alto LTV
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            $22.40 <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>USD</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Margen operativo 68.5%
          </div>
        </div>
      </div>

      {/* 2. FILA MEDIA: DISTRIBUCIÓN DE CLIENTES & ESTADO BASE DE DATOS (Exacto a Imagen 4) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Tarjeta: Distribución de Consumidores por Nivel */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '22px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>
              <span>👥</span> Distribución de Consumidores por Nivel
            </div>
            <button
              onClick={() => onNavigate('customers')}
              style={{ background: 'none', border: 'none', color: '#b45309', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
            >
              Ver análisis completo &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* VIP Gold */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>👑 Clientes VIP Gold (&gt;10 pedidos)</span>
                <span style={{ color: '#64748b' }}>420 clientes (32.7%) &bull; $340.20 prom.</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: '32.7%', height: '100%', backgroundColor: '#ea580c', borderRadius: '9999px' }} />
              </div>
            </div>

            {/* Regulares */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>⭐ Consumidores Regulares (3-9 pedidos)</span>
                <span style={{ color: '#64748b' }}>580 clientes (45.2%) &bull; $128.50 prom.</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: '45.2%', height: '100%', backgroundColor: '#2563eb', borderRadius: '9999px' }} />
              </div>
            </div>

            {/* Nuevos / Ocasionales */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>🌱 Consumidores Nuevos / Ocasionales (1-2 pedidos)</span>
                <span style={{ color: '#64748b' }}>284 clientes (22.1%) &bull; $24.80 prom.</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: '22.1%', height: '100%', backgroundColor: '#10b981', borderRadius: '9999px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta: Estado de la Base de Datos */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '22px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', marginBottom: '14px' }}>
              <span>💾</span> Estado de la Base de Datos
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                MOTOR DE ALMACENAMIENTO
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚡ SQLite Datamart Local Activo
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                Archivo /BD: <code>/app/server/data/rapidfood.sqlite</code> &bull; Latencia &lt; 2ms
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => alert('Catálogo demo restablecido correctamente.')}
              style={{
                flex: 1,
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '9px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Restablecer Catálogo Demo
            </button>
            <button
              onClick={() => onNavigate('database')}
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 14px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Ver Diagnóstico &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 3. FILA INFERIOR: HAMBURGUESAS DESTACADAS EN VENTA (Exacto a Imagen 4) */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>
            <span>🍔</span> Hamburguesas Destacadas en Venta
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            style={{ background: 'none', border: 'none', color: '#b45309', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
          >
            Gestionar todo el catálogo &rarr;
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px'
        }}>
          {featuredBurgers.map((burger, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
            >
              <img
                src={burger.image}
                alt={burger.name}
                style={{ width: '100%', height: '140px', objectFit: 'cover' }}
              />
              <div style={{ padding: '14px' }}>
                <div style={{ color: '#ea580c', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
                  ★ {burger.badge}
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', marginBottom: '8px' }}>
                  {burger.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>
                    {burger.price}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '700', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>
                    Stock: {burger.stock}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

