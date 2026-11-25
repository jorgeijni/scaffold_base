import React from 'react';

export default function CustomerMetricsView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
          Métricas de Clientes & Segmentación LTV
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>
          Análisis del comportamiento de compra a través del E-commerce y la PWA de Ventas
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', padding: '18px' }}>
            <div style={{ color: '#c2410c', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              👑 Clientes VIP Gold
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '6px 0' }}>
              420 Clientes (32.7%)
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Ticket promedio: $340.20 USD &bull; Más de 10 pedidos completados
            </div>
          </div>

          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '18px' }}>
            <div style={{ color: '#1d4ed8', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              ⭐ Consumidores Regulares
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '6px 0' }}>
              580 Clientes (45.2%)
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Ticket promedio: $128.50 USD &bull; 3 a 9 pedidos
            </div>
          </div>

          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '12px', padding: '18px' }}>
            <div style={{ color: '#15803d', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              🌱 Nuevos / Ocasionales
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '6px 0' }}>
              284 Clientes (22.1%)
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Ticket promedio: $24.80 USD &bull; 1 a 2 pedidos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

