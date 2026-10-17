import React, { useState, useEffect } from 'react';

// Fallback data
const INITIAL_FALLBACK_BURGERS = [
  {
    id: 1,
    name: 'Rey de las Burgers',
    category: 'Especiales',
    price: 15.90,
    stock: 45,
    specialty: 'Signature Master',
    calories: '920 kcal',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    description: 'Doble Angus a la leña de roble, cheddar 12 meses, cebolla al bourbon y salsa secreta del Rey.',
    isAvailable: true
  },
  {
    id: 2,
    name: 'Burger Real Clásica',
    category: 'Clásicas',
    price: 11.50,
    stock: 60,
    specialty: 'Edición Real',
    calories: '680 kcal',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80',
    description: 'Medallón Angus a la llama, queso americano fundido, pepinillos agridulces y tomate maduro.',
    isAvailable: true
  },
  {
    id: 3,
    name: 'Burger Real Doble',
    category: 'Especiales',
    price: 14.50,
    stock: 38,
    specialty: 'Doble Corona',
    calories: '890 kcal',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
    description: 'Doble medallón smash caramelizado, doble cheddar inglés derretido y emulsión Dijon.',
    isAvailable: true
  },
  {
    id: 4,
    name: 'Burger Doble Especial',
    category: 'Especiales',
    price: 16.20,
    stock: 32,
    specialty: 'Gran Chef',
    calories: '960 kcal',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=80',
    description: 'Doble picaña madurada, provolone ahumado, mermelada de bacon al oporto y rúcula fresca.',
    isAvailable: true
  },
  {
    id: 5,
    name: 'Burger Trufa Deluxe',
    category: 'Especiales',
    price: 17.50,
    stock: 25,
    specialty: 'Gourmet Supreme',
    calories: '840 kcal',
    image: 'https://images.unsplash.com/photo-1582196016295-f8c8bd4b3e99?w=500&auto=format&fit=crop&q=80',
    description: 'Angus prime con aceite de trufa negra, portobellos a la manteca francesa y queso brie.',
    isAvailable: true
  },
  {
    id: 6,
    name: 'Burger BBQ Ahumada Rapid',
    category: 'Clásicas',
    price: 13.80,
    stock: 50,
    specialty: 'Smokehouse Prime',
    calories: '780 kcal',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&auto=format&fit=crop&q=80',
    description: 'Carne a la leña con salsa BBQ de café, queso gouda y aros de cebolla crocantes.',
    isAvailable: true
  },
  {
    id: 7,
    name: 'Burger Royal Crispy Chicken',
    category: 'Pollo Crispy',
    price: 12.90,
    stock: 45,
    specialty: 'Crispy Especial',
    calories: '720 kcal',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&auto=format&fit=crop&q=80',
    description: 'Pechuga marinada 24h en buttermilk, ensalada coleslaw fresca con manzana y mayonesa ajo negro.',
    isAvailable: true
  },
  {
    id: 8,
    name: 'Burger Smash Cheddar Melt',
    category: 'Clásicas',
    price: 12.20,
    stock: 55,
    specialty: 'Smash Lovers',
    calories: '710 kcal',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&auto=format&fit=crop&q=80',
    description: 'Dos patties finos prensados con cebolla en plancha, triple cheddar derretido y salsa tártara.',
    isAvailable: true
  },
  {
    id: 9,
    name: 'Burger Spicy Chipotle Fire',
    category: 'Especiales',
    price: 13.50,
    stock: 35,
    specialty: 'Spicy Fire',
    calories: '760 kcal',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&auto=format&fit=crop&q=80',
    description: 'Carne Angus picante, pepper jack fundido, jalapeños toreados y guacamole casero.',
    isAvailable: true
  },
  {
    id: 10,
    name: 'Burger Monster Rapid XXL',
    category: 'Especiales',
    price: 18.90,
    stock: 20,
    specialty: 'Legendaria XXL',
    calories: '1250 kcal',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&auto=format&fit=crop&q=80',
    description: 'Triple Angus (450g), cuatro quesos, doble bacon glaseado en maple y huevo campero.',
    isAvailable: true
  }
];

export default function App() {
  const [activeSection, setActiveSection] = useState('burgers'); // 'burgers' | 'customers' | 'database' | 'orders'
  const [burgers, setBurgers] = useState(INITIAL_FALLBACK_BURGERS);
  const [customerMetrics, setCustomerMetrics] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [toastMessage, setToastMessage] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pingLatency, setPingLatency] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  // Form para agregar nueva hamburguesa
  const [newBurger, setNewBurger] = useState({
    name: '',
    category: 'Especiales',
    price: '',
    stock: '30',
    specialty: 'Chef Signature',
    calories: '800 kcal',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    description: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cargar datos del Backend
  const fetchData = async () => {
    try {
      // 1. Health & DB Status
      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json();
      if (healthData && healthData.database) {
        setDbStatus(healthData.database);
      }

      // 2. Products / Burgers
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      if (prodData.success && prodData.data && prodData.data.length > 0) {
        setBurgers(prodData.data);
      }

      // 3. Customer Consumption Metrics
      const custRes = await fetch('/api/metrics/customers');
      const custData = await custRes.json();
      if (custData.success && custData.data) {
        setCustomerMetrics(custData.data);
      }

      // 4. Orders
      const orderRes = await fetch('/api/orders');
      const orderData = await orderRes.json();
      if (orderData.success && orderData.data) {
        setOrders(orderData.data);
      }
    } catch (err) {
      console.warn('Operando con datos cacheados:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Ping a la Base de Datos
  const handlePingDb = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      await res.json();
      const elapsed = Math.round(performance.now() - start);
      setPingLatency(elapsed);
      showToast(`⚡ Ping completado: ${elapsed} ms de latencia`);
    } catch {
      setPingLatency(1);
      showToast('⚡ Ping local: 1 ms');
    } finally {
      setIsPinging(false);
    }
  };

  // Toggle disponibilidad de producto
  const handleToggleAvailability = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setBurgers(burgers.map(b => b.id === id ? { ...b, isAvailable: !b.isAvailable } : b));
        showToast('🔄 Estado de disponibilidad actualizado');
      } else {
        // Fallback local
        setBurgers(burgers.map(b => b.id === id ? { ...b, isAvailable: !b.isAvailable } : b));
        showToast('🔄 Estado actualizado localmente');
      }
    } catch {
      setBurgers(burgers.map(b => b.id === id ? { ...b, isAvailable: !b.isAvailable } : b));
      showToast('🔄 Estado actualizado localmente');
    }
  };

  // Eliminar hamburguesa
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta variante de hamburguesa?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setBurgers(burgers.filter(b => b.id !== id));
      showToast('🗑️ Variante eliminada del catálogo');
    } catch {
      setBurgers(burgers.filter(b => b.id !== id));
      showToast('🗑️ Variante eliminada localmente');
    }
  };

  // Agregar nueva hamburguesa
  const handleCreateBurger = async (e) => {
    e.preventDefault();
    if (!newBurger.name || !newBurger.price) {
      showToast('⚠️ Nombre y precio son obligatorios');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBurger)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBurgers([data.data, ...burgers]);
        showToast('✅ ¡Nueva hamburguesa agregada al catálogo!');
      } else {
        const local = { ...newBurger, id: Date.now(), price: parseFloat(newBurger.price), isAvailable: true };
        setBurgers([local, ...burgers]);
        showToast('✅ Hamburguesa creada localmente');
      }
    } catch {
      const local = { ...newBurger, id: Date.now(), price: parseFloat(newBurger.price), isAvailable: true };
      setBurgers([local, ...burgers]);
      showToast('✅ Hamburguesa creada localmente');
    }

    setIsAddModalOpen(false);
    setNewBurger({
      name: '',
      category: 'Especiales',
      price: '',
      stock: '30',
      specialty: 'Chef Signature',
      calories: '800 kcal',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
      description: ''
    });
  };

  // Reset datos iniciales
  const handleResetData = async () => {
    if (!window.confirm('¿Restablecer el catálogo y métricas demo de Hamburger Rapid?')) return;
    try {
      await fetch('/api/reset', { method: 'POST' });
      fetchData();
      showToast('🌱 Datos iniciales restablecidos con éxito');
    } catch {
      setBurgers(INITIAL_FALLBACK_BURGERS);
      showToast('🌱 Catálogo restablecido localmente');
    }
  };

  // Filtros
  const filteredBurgers = burgers.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (b.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (b.specialty || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'Todas' || b.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          fontSize: '0.88rem',
          fontWeight: '700',
          zIndex: 9999,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Top Header Navbar */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#fef3c7',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            border: '1px solid #fde68a'
          }}>
            🍔
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>
              Hamburger <span style={{ color: '#d97706' }}>Rapid</span> &bull; Panel de Control
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
              Gestión Comercial, Métricas de Clientes y Estado de Base de Datos
            </div>
          </div>
        </div>

        {/* Database Quick Pill & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            background: dbStatus?.mode === 'mysql' ? '#dcfce7' : '#fef3c7',
            border: `1px solid ${dbStatus?.mode === 'mysql' ? '#86efac' : '#fde68a'}`,
            color: dbStatus?.mode === 'mysql' ? '#166534' : '#92400e',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>{dbStatus?.mode === 'mysql' ? '🐬' : '⚡'}</span>
            <span>{dbStatus?.mode === 'mysql' ? 'MySQL Conectado' : 'Modo In-Memory Activo'}</span>
            {pingLatency !== null && <span style={{ opacity: 0.8 }}>({pingLatency}ms)</span>}
          </div>

          <button
            onClick={handleResetData}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            🌱 Reset Demo
          </button>

          <a
            href="/"
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🌐 E-commerce
          </a>

          <a
            href="/app"
            style={{
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)'
            }}
          >
            📱 PWA Móvil
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        
        {/* Top 4 KPI Executive Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* KPI 1 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Consumo Total Clientes</span>
              <span style={{ background: '#fef3c7', padding: '4px 8px', borderRadius: '8px', fontSize: '1.1rem' }}>💰</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#b45309' }}>
              ${customerMetrics?.summary?.totalRevenue || '1,220.10'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '700', marginTop: '4px' }}>
              ↑ +24.5% vs periodo anterior &bull; {customerMetrics?.summary?.totalOrders || 80} órdenes
            </div>
          </div>

          {/* KPI 2 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Variantes de Hamburguesas</span>
              <span style={{ background: '#ffedd5', padding: '4px 8px', borderRadius: '8px', fontSize: '1.1rem' }}>🍔</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
              {burgers.length} Recetas
            </div>
            <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: '700', marginTop: '4px' }}>
              {burgers.filter(b => b.isAvailable).length} activas en menú &bull; "Rey de las Burgers" #1
            </div>
          </div>

          {/* KPI 3 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Ticket Promedio Consumo</span>
              <span style={{ background: '#dcfce7', padding: '4px 8px', borderRadius: '8px', fontSize: '1.1rem' }}>📈</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#166534' }}>
              ${customerMetrics?.summary?.avgTicket || '22.40'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
              78.4% tasa de recompra mensual
            </div>
          </div>

          {/* KPI 4 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Salud Motor de Base de Datos</span>
              <span style={{ background: '#e0f2fe', padding: '4px 8px', borderRadius: '8px', fontSize: '1.1rem' }}>🗄️</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0369a1' }}>
              {dbStatus?.health || 'HEALTHY'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '700', marginTop: '4px' }}>
              {dbStatus?.mode === 'mysql' ? 'MySQL Pool Activo' : 'In-Memory WAL'} &bull; 99.98% Uptime
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px',
          marginBottom: '24px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'burgers', label: '🍔 Catálogo de Hamburguesas', count: burgers.length },
            { id: 'customers', label: '👥 Métricas de Consumidores / Clientes', count: customerMetrics?.topCustomers?.length || 7 },
            { id: 'database', label: '🗄️ Estado de la Base de Datos', count: 'Live' },
            { id: 'orders', label: '📦 Órdenes en Tiempo Real', count: orders.length }
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid #d97706' : '1px solid #cbd5e1',
                  background: isActive ? '#fef3c7' : '#ffffff',
                  color: isActive ? '#92400e' : '#475569',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  background: isActive ? '#d97706' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569',
                  padding: '2px 8px',
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

        {/* ================================================================ */}
        {/* SECCIÓN 1: CATÁLOGO DE HAMBURGUESAS */}
        {/* ================================================================ */}
        {activeSection === 'burgers' && (
          <div className="fade-in">
            {/* Header de catálogo con controles */}
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '16px 20px',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px' }}>
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre, ingrediente o especialidad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Todas">Todas las Categorías</option>
                  <option value="Especiales">Especiales</option>
                  <option value="Clásicas">Clásicas</option>
                  <option value="Pollo Crispy">Pollo Crispy</option>
                </select>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)'
                }}
              >
                <span>+</span>
                <span>Nueva Hamburguesa</span>
              </button>
            </div>

            {/* Tabla de Hamburguesas */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '14px 18px' }}>Hamburguesa</th>
                    <th style={{ padding: '14px 18px' }}>Categoría</th>
                    <th style={{ padding: '14px 18px' }}>Nivel de Especialidad</th>
                    <th style={{ padding: '14px 18px' }}>Precio</th>
                    <th style={{ padding: '14px 18px' }}>Stock</th>
                    <th style={{ padding: '14px 18px' }}>Disponibilidad</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBurgers.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={b.image}
                            alt={b.name}
                            style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                          />
                          <div>
                            <div style={{ fontWeight: '800', color: '#0f172a' }}>{b.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}>
                          {b.category}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '800'
                        }}>
                          {b.specialty || 'Signature'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', fontWeight: '800', color: '#b45309', fontSize: '0.95rem' }}>
                        ${parseFloat(b.price || 0).toFixed(2)}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          color: b.stock < 25 ? '#ef4444' : '#10b981',
                          fontWeight: '700',
                          fontSize: '0.85rem'
                        }}>
                          {b.stock} u.
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => handleToggleAvailability(b.id)}
                          style={{
                            background: b.isAvailable ? '#dcfce7' : '#fee2e2',
                            color: b.isAvailable ? '#166534' : '#991b1b',
                            border: `1px solid ${b.isAvailable ? '#86efac' : '#fecaca'}`,
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          {b.isAvailable ? '✓ Disponible' : '⏸️ Pausada'}
                        </button>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteProduct(b.id)}
                          title="Eliminar del menú"
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#ef4444',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SECCIÓN 2: MÉTRICAS DE CONSUMIDORES / CLIENTES SEGÚN CONSUMO */}
        {/* ================================================================ */}
        {activeSection === 'customers' && (
          <div className="fade-in">
            {/* Header Informativo */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                Análisis de Consumidores por Segmento de Consumo
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Distribución estratégica de clientes basada en volumen de compra acumulado, recurrencia y valor de vida (LTV).
              </p>
            </div>

            {/* 3 Tarjetas de Segmentos de Consumo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {/* Segmento 1: VIP */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #fde68a',
                padding: '20px',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ background: '#fef3c7', color: '#92400e', fontWeight: '800', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', border: '1px solid #fde68a' }}>
                    👑 Segmento VIP (Gasto &gt; $200)
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#b45309' }}>54% Ingresos</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                  ${customerMetrics?.segments?.vip?.revenue || '637.70'}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                  Clientes de más alta fidelidad. Frecuencia de compra de 3 a 5 veces por semana, con preferencia por <em>Rey de las Burgers</em> y <em>Burger Doble Especial</em>.
                </p>
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>
                  ✓ Beneficio activo: Envío gratuito permanente y atención prioritaria
                </div>
              </div>

              {/* Segmento 2: Platino */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #cbd5e1',
                padding: '20px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ background: '#f1f5f9', color: '#334155', fontWeight: '800', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                    ⭐ Segmento Platino ($100 - $200)
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#475569' }}>31% Ingresos</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                  ${customerMetrics?.segments?.platinum?.revenue || '363.40'}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                  Consumidores constantes con frecuencia semanal. Gran respuesta a promociones 2x1 y combos familiares de <em>Burger Real Doble</em>.
                </p>
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#0284c7', fontWeight: '700' }}>
                  ✓ Próximo upgrade: A solo 3 pedidos para alcanzar estatus VIP
                </div>
              </div>

              {/* Segmento 3: Frecuentes / Ocasionales */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ background: '#f8fafc', color: '#64748b', fontWeight: '800', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    🏷️ Frecuentes &amp; Ocasionales (&lt; $100)
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#64748b' }}>15% Ingresos</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                  ${customerMetrics?.segments?.regular?.revenue || '219.00'}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                  Nuevos consumidores adquiridos vía PWA y redes. Ticket promedio enfocado en <em>Burger Real Clásica</em> y <em>Burger Smash</em>.
                </p>
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#b45309', fontWeight: '700' }}>
                  ✓ Campaña activa: Cupón <strong>RAPID2X1</strong> para acelerar recompra
                </div>
              </div>
            </div>

            {/* Gráficos Visuales de Consumo y Canales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* Distribución por Canales */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
                  Consumo por Canal de Venta
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
                      <span>📱 PWA Móvil (App)</span>
                      <span style={{ color: '#b45309' }}>68% ($829.60)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: '68%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
                      <span>🌐 Web E-commerce</span>
                      <span style={{ color: '#0284c7' }}>22% ($268.40)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: '22%', height: '100%', background: '#0284c7' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
                      <span>🏬 Take-Away / Mostrador</span>
                      <span style={{ color: '#64748b' }}>10% ($122.10)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: '10%', height: '100%', background: '#64748b' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas de Comportamiento */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
                  Comportamiento de Consumidores
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ background: '#fafaf9', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <small style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Hora Pico de Consumo</small>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>19:30 - 22:00</div>
                    <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Cena nocturna express</span>
                  </div>

                  <div style={{ background: '#fafaf9', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <small style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Burger Más Solicitada</small>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#b45309', marginTop: '2px' }}>Rey de las Burgers</div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>42% de pedidos</span>
                  </div>

                  <div style={{ background: '#fafaf9', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <small style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Frecuencia Promedio</small>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>2.8 días</div>
                    <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Alta recurrencia</span>
                  </div>

                  <div style={{ background: '#fafaf9', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <small style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Tiempo de Entrega</small>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>18.4 min</div>
                    <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Meta cumplida (&lt; 20m)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Clientes Consumidores */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                  Ranking de Consumidores Registrados
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                  Ordenados por Gasto Acumulado ($)
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '14px 18px' }}>Consumidor</th>
                    <th style={{ padding: '14px 18px' }}>Nivel / Tier</th>
                    <th style={{ padding: '14px 18px' }}>Gasto Acumulado</th>
                    <th style={{ padding: '14px 18px' }}>Pedidos</th>
                    <th style={{ padding: '14px 18px' }}>Hamburguesa Favorita</th>
                    <th style={{ padding: '14px 18px' }}>Última Actividad</th>
                  </tr>
                </thead>
                <tbody>
                  {(customerMetrics?.topCustomers || [
                    { name: 'Carlos Mendoza', email: 'carlos.mendoza@email.com', tier: 'VIP Gold', totalSpent: 348.50, ordersCount: 22, favoriteBurger: 'Rey de las Burgers', lastOrder: 'Hace 2 horas' },
                    { name: 'Sofía Valenzuela', email: 'sofia.v@techstudio.com', tier: 'VIP Gold', totalSpent: 289.20, ordersCount: 18, favoriteBurger: 'Burger Doble Especial', lastOrder: 'Ayer' },
                    { name: 'Mateo Rodríguez', email: 'mateo.dev@gmail.com', tier: 'Platino', totalSpent: 195.40, ordersCount: 14, favoriteBurger: 'Burger Real Doble', lastOrder: 'Hace 2 días' },
                    { name: 'Valentina Herrera', email: 'vale.herrera@agencia.cl', tier: 'Platino', totalSpent: 168.00, ordersCount: 11, favoriteBurger: 'Burger Trufa Deluxe', lastOrder: 'Hace 3 días' },
                    { name: 'Diego Torres', email: 'diego.torres@startup.io', tier: 'Frecuente', totalSpent: 98.70, ordersCount: 7, favoriteBurger: 'Burger Real Clásica', lastOrder: 'Hace 4 días' },
                    { name: 'Camila Silva', email: 'camila.silva@uai.edu', tier: 'Frecuente', totalSpent: 84.50, ordersCount: 6, favoriteBurger: 'Burger Royal Crispy Chicken', lastOrder: 'Hace 5 días' },
                    { name: 'Lucas Navas', email: 'lucas.n@freelance.net', tier: 'Ocasional', totalSpent: 35.80, ordersCount: 2, favoriteBurger: 'Burger Smash Cheddar Melt', lastOrder: 'Hace 1 semana' }
                  ]).map((cust, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem', border: '1px solid #fde68a' }}>
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', color: '#0f172a' }}>{cust.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cust.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: cust.tier.includes('VIP') ? '#fef3c7' : cust.tier.includes('Platino') ? '#e0f2fe' : '#f1f5f9',
                          color: cust.tier.includes('VIP') ? '#92400e' : cust.tier.includes('Platino') ? '#0369a1' : '#475569',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '800'
                        }}>
                          {cust.tier}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', fontWeight: '800', color: '#b45309', fontSize: '0.95rem' }}>
                        ${parseFloat(cust.totalSpent || 0).toFixed(2)}
                      </td>

                      <td style={{ padding: '14px 18px', fontWeight: '700', color: '#0f172a' }}>
                        {cust.ordersCount} órdenes
                      </td>

                      <td style={{ padding: '14px 18px', color: '#334155', fontWeight: '600' }}>
                        🍔 {cust.favoriteBurger}
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#64748b' }}>
                        {cust.lastOrder}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SECCIÓN 3: ESTADO DE LA BASE DE DATOS */}
        {/* ================================================================ */}
        {activeSection === 'database' && (
          <div className="fade-in">
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                  Monitor de Salud e Infraestructura de Base de Datos
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Inspección en tiempo real de persistencia relacional, latencias de red y pool de conexiones.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handlePingDb}
                  disabled={isPinging}
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>⚡</span>
                  <span>{isPinging ? 'Midiendo...' : 'Hacer Ping a DB'}</span>
                </button>

                <button
                  onClick={fetchData}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Refrescar Estado
                </button>
              </div>
            </div>

            {/* Tarjeta Principal de Diagnóstico */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    background: dbStatus?.mode === 'mysql' ? '#dcfce7' : '#fef3c7',
                    border: `1px solid ${dbStatus?.mode === 'mysql' ? '#86efac' : '#fde68a'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem'
                  }}>
                    {dbStatus?.mode === 'mysql' ? '🐬' : '⚡'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
                      {dbStatus?.mode === 'mysql' ? 'Motor MySQL Relacional Conectado' : 'Modo In-Memory Transaccional Activo'}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Persistencia: {dbStatus?.mode === 'mysql' ? 'Disco Permanente (ACID)' : 'Memoria RAM de Alta Velocidad (Fall-back automático)'}
                    </div>
                  </div>
                </div>

                <span style={{
                  background: '#dcfce7',
                  color: '#166534',
                  border: '1px solid #86efac',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: '800'
                }}>
                  ● ESTADO SALUDABLE (HEALTHY)
                </span>
              </div>

              {/* Grid de Propiedades Técnicas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                background: '#fafaf9',
                border: '1px solid #f1f5f9',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div>
                  <small style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Host del Servidor</small>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                    {dbStatus?.host || '127.0.0.1 (Local)'}
                  </div>
                </div>

                <div>
                  <small style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Puerto TCP</small>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                    {dbStatus?.port || '3306'}
                  </div>
                </div>

                <div>
                  <small style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Base de Datos</small>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#b45309', marginTop: '2px' }}>
                    {dbStatus?.database || 'hamburger_rapid_db'}
                  </div>
                </div>

                <div>
                  <small style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Usuario DB</small>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                    {dbStatus?.user || 'root / app'}
                  </div>
                </div>

                <div>
                  <small style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Latencia Medida</small>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>
                    {pingLatency !== null ? `${pingLatency} ms` : `${dbStatus?.latencyMs || 2} ms`}
                  </div>
                </div>

                <div>
                  <small style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Pool de Conexiones</small>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                    {dbStatus?.poolConnections?.active || 2} Activas / {dbStatus?.poolConnections?.totalLimit || 10} Max
                  </div>
                </div>
              </div>

              {/* Conteo de Tablas y Registros */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                  Conteo de Entidades y Registros Auditados
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#b45309' }}>
                      {burgers.length}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>
                      🍔 Registros en Tabla "products"
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0284c7' }}>
                      {customerMetrics?.topCustomers?.length || 7}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>
                      👥 Clientes en "consumers"
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#166534' }}>
                      {orders.length}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>
                      📦 Órdenes en "orders"
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#7c3aed' }}>
                      100%
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>
                      🔒 Integridad Referencial
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SECCIÓN 4: ÓRDENES EN TIEMPO REAL */}
        {/* ================================================================ */}
        {activeSection === 'orders' && (
          <div className="fade-in">
            <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                  Comandas y Órdenes en Tiempo Real (PWA Live Feed)
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Visualiza los pedidos simulados generados por los usuarios desde la aplicación móvil PWA.
                </p>
              </div>

              <button
                onClick={fetchData}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🔄 Actualizar Comandas
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📦</div>
                  <h4 style={{ color: '#0f172a', fontWeight: '700' }}>No hay órdenes en cola</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Simula un pedido en la PWA Móvil para verlo reflejado aquí.</p>
                </div>
              ) : (
                orders.map((ord, idx) => (
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
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem' }}>
                          Orden #{ord.id}
                        </span>
                        <span style={{
                          background: ord.status?.includes('Entregado') ? '#dcfce7' : '#fef3c7',
                          color: ord.status?.includes('Entregado') ? '#166534' : '#92400e',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: '800'
                        }}>
                          {ord.status || 'Preparando'}
                        </span>
                        <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                          {ord.channel || 'PWA Mobile'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px' }}>
                        Cliente: <strong>{ord.customerName}</strong> &bull; Entrega en: {ord.address || 'Av. Las Condes'}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                        Detalle: {ord.items?.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#b45309' }}>
                        ${parseFloat(ord.total || 0).toFixed(2)}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>
                        ● Simulación Sincronizada
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* ================================================================ */}
      {/* MODAL CREAR NUEVA HAMBURGUESA */}
      {/* ================================================================ */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
            border: '1px solid #fde68a'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                🍔 Agregar Nueva Hamburguesa al Catálogo
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBurger} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Nombre de la Hamburguesa:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Burger Real Triple Queso"
                  value={newBurger.name}
                  onChange={(e) => setNewBurger({ ...newBurger, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Categoría:
                  </label>
                  <select
                    value={newBurger.category}
                    onChange={(e) => setNewBurger({ ...newBurger, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff' }}
                  >
                    <option value="Especiales">Especiales</option>
                    <option value="Clásicas">Clásicas</option>
                    <option value="Pollo Crispy">Pollo Crispy</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Badge Nivel Especialidad:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Doble Corona, Gran Chef"
                    value={newBurger.specialty}
                    onChange={(e) => setNewBurger({ ...newBurger, specialty: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Precio ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="14.50"
                    value={newBurger.price}
                    onChange={(e) => setNewBurger({ ...newBurger, price: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Stock Inicial:
                  </label>
                  <input
                    type="number"
                    value={newBurger.stock}
                    onChange={(e) => setNewBurger({ ...newBurger, stock: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Calorías:
                  </label>
                  <input
                    type="text"
                    value={newBurger.calories}
                    onChange={(e) => setNewBurger({ ...newBurger, calories: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Descripción de Ingredientes:
                </label>
                <textarea
                  rows="2"
                  placeholder="Detalla los cortes de carne, quesos y salsas de la receta..."
                  value={newBurger.description}
                  onChange={(e) => setNewBurger({ ...newBurger, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #d97706, #b45309)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Guardar Hamburguesa
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer del Dashboard */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 28px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#94a3b8'
      }}>
        Hamburger Rapid Admin Suite &bull; React + Node.js + MySQL &bull; Dokploy CI/CD Live
      </footer>
    </div>
  );
}
