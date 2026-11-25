import React, { useState } from 'react';

const CATALOG_DATA = [
  {
    id: 1,
    name: "Rey de las Burgers",
    badge: "Corona de Oro • Edición Legendaria",
    rating: 4.9,
    price: 14.99,
    stock: 45,
    category: "Especiales",
    status: "Activa",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    name: "Burger Real Clásica",
    badge: "Clásica de Autor",
    rating: 4.8,
    price: 9.99,
    stock: 60,
    category: "Clásicas",
    status: "Activa",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    name: "Burger Real Doble",
    badge: "Doble Impacto",
    rating: 4.9,
    price: 12.50,
    stock: 38,
    category: "Especiales",
    status: "Activa",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    name: "Burger Doble Especial",
    badge: "Edición Especial",
    rating: 4.9,
    price: 13.50,
    stock: 30,
    category: "Especiales",
    status: "Activa",
    image: "https://images.unsplash.com/photo-1583032015879-c5c48b59d9c5?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 5,
    name: "Burger Trufa & Portobello",
    badge: "Gourmet Select",
    rating: 5.0,
    price: 15.50,
    stock: 25,
    category: "Gourmet",
    status: "Activa",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 6,
    name: "Burger Crispy Smokehouse",
    badge: "Pollo Crujiente",
    rating: 4.7,
    price: 11.99,
    stock: 40,
    category: "Pollo",
    status: "Activa",
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 7,
    name: "Burger BBQ Bourbon Flame",
    badge: "Ahumada a la Leña",
    rating: 4.8,
    price: 13.99,
    stock: 35,
    category: "Especiales",
    status: "Activa",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 8,
    name: "Burger Bacon Cheese Deluxe",
    badge: "Favorita Clásica",
    rating: 4.8,
    price: 10.99,
    stock: 52,
    category: "Clásicas",
    status: "Activa",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 9,
    name: "Burger Guacamole & Chipotle Crunch",
    badge: "Fusión Picante",
    rating: 4.7,
    price: 12.99,
    stock: 28,
    category: "Especiales",
    status: "Activa",
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 10,
    name: "Burger Green Garden Truffle",
    badge: "100% Plant-Based",
    rating: 4.8,
    price: 11.50,
    stock: 22,
    category: "Veggie",
    status: "Activa",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=500&q=80"
  }
];

export default function BurgerCatalogView() {
  const [burgers, setBurgers] = useState(CATALOG_DATA);
  const [editingBurger, setEditingBurger] = useState(null);

  const handleStockChange = (id, newStock) => {
    setBurgers(prev => prev.map(b => b.id === id ? { ...b, stock: Math.max(0, Number(newStock)) } : b));
  };

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Catálogo de 10 Creaciones de Autor
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
            Control de precios, stock e inventario sincronizado con iDempiere ERP (M_Product)
          </p>
        </div>

        <button
          onClick={() => alert('Sincronizando catálogo con iDempiere M_Product...')}
          style={{
            backgroundColor: '#ea580c',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '0.8rem',
            fontWeight: '800',
            cursor: 'pointer'
          }}
        >
          🔄 Sincronizar con ERP
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 14px' }}>Hamburguesa</th>
              <th style={{ padding: '10px 14px' }}>Nivel de Especialidad</th>
              <th style={{ padding: '10px 14px' }}>Categoría</th>
              <th style={{ padding: '10px 14px' }}>Precio</th>
              <th style={{ padding: '10px 14px' }}>Stock</th>
              <th style={{ padding: '10px 14px' }}>Estado</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {burgers.map(burger => (
              <tr key={burger.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={burger.image}
                    alt={burger.name}
                    style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>{burger.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ID M_Product #{1000000 + burger.id}</div>
                  </div>
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    backgroundColor: '#fffbeb',
                    color: '#b45309',
                    border: '1px solid #fef3c7',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: '800'
                  }}>
                    ★ {burger.badge}
                  </span>
                </td>

                <td style={{ padding: '12px 14px', color: '#475569' }}>
                  {burger.category}
                </td>

                <td style={{ padding: '12px 14px', fontWeight: '800', color: '#ea580c' }}>
                  ${burger.price.toFixed(2)}
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <input
                    type="number"
                    value={burger.stock}
                    onChange={(e) => handleStockChange(burger.id, e.target.value)}
                    style={{
                      width: '65px',
                      padding: '4px 8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}
                  />
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: '800'
                  }}>
                    ● {burger.status}
                  </span>
                </td>

                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                  <button
                    onClick={() => alert(`Detalles del producto ${burger.name}:\nPrecio: $${burger.price}\nStock actual: ${burger.stock} unidades.\nSincronizado con lista de precios M_PriceList de GardenWorld.`)}
                    style={{
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

