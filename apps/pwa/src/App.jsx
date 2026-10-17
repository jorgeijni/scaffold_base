import React, { useState, useEffect } from 'react';

// Catálogo base de Hamburger Rapid para PWA
const DEFAULT_BURGERS = [
  {
    id: 1,
    name: 'Rey de las Burgers',
    category: 'Especiales',
    price: 15.90,
    specialty: 'Signature Master',
    calories: '920 kcal',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    description: 'Doble Angus a la leña, cheddar 12 meses, cebolla al bourbon y salsa secreta del Rey.'
  },
  {
    id: 2,
    name: 'Burger Real Clásica',
    category: 'Clásicas',
    price: 11.50,
    specialty: 'Edición Real',
    calories: '680 kcal',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    description: 'Medallón Angus a la llama, queso americano fundido, pepinillos encurtidos y tomate.'
  },
  {
    id: 3,
    name: 'Burger Real Doble',
    category: 'Especiales',
    price: 14.50,
    specialty: 'Doble Corona',
    calories: '890 kcal',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    description: 'Doble carne smash caramelizada, doble cheddar inglés derretido y emulsión Dijon.'
  },
  {
    id: 4,
    name: 'Burger Doble Especial',
    category: 'Especiales',
    price: 16.20,
    specialty: 'Gran Chef',
    calories: '960 kcal',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
    description: 'Doble picaña madurada, provolone ahumado, bacon jam al oporto y rúcula fresca.'
  },
  {
    id: 5,
    name: 'Burger Trufa Deluxe',
    category: 'Especiales',
    price: 17.50,
    specialty: 'Gourmet Supreme',
    calories: '840 kcal',
    image: 'https://images.unsplash.com/photo-1582196016295-f8c8bd4b3e99?w=600&auto=format&fit=crop&q=80',
    description: 'Angus prime con aceite de trufa negra, portobellos a la manteca francesa y brie.'
  },
  {
    id: 6,
    name: 'Burger BBQ Ahumada Rapid',
    category: 'Clásicas',
    price: 13.80,
    specialty: 'Smokehouse Prime',
    calories: '780 kcal',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80',
    description: 'Carne a la leña con salsa BBQ de café, queso gouda y aros de cebolla crocantes.'
  },
  {
    id: 7,
    name: 'Burger Royal Crispy Chicken',
    category: 'Pollo',
    price: 12.90,
    specialty: 'Crispy Especial',
    calories: '720 kcal',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
    description: 'Suprema de pollo marinada 24h en buttermilk, coleslaw con manzana y mayonesa ajo negro.'
  },
  {
    id: 8,
    name: 'Burger Smash Cheddar Melt',
    category: 'Clásicas',
    price: 12.20,
    specialty: 'Smash Lovers',
    calories: '710 kcal',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&auto=format&fit=crop&q=80',
    description: 'Dos patties finos con cebolla en plancha, triple cheddar derretido y salsa tártara.'
  },
  {
    id: 9,
    name: 'Burger Spicy Chipotle Fire',
    category: 'Especiales',
    price: 13.50,
    specialty: 'Spicy Fire',
    calories: '760 kcal',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&auto=format&fit=crop&q=80',
    description: 'Carne Angus picante, pepper jack fundido, jalapeños toreados y guacamole casero.'
  },
  {
    id: 10,
    name: 'Burger Monster Rapid XXL',
    category: 'Especiales',
    price: 18.90,
    specialty: 'Legendaria XXL',
    calories: '1250 kcal',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop&q=80',
    description: 'Triple Angus (450g), cuatro quesos, doble bacon glaseado en maple y huevo campero.'
  }
];

const OFFERS = [
  {
    id: 'off-1',
    code: 'RAPID2X1',
    title: '2x1 en Burger Real Clásica',
    discountDesc: '50% de descuento en la segunda hamburguesa',
    type: 'percent',
    amount: 15,
    tag: '⚡ Oferta Flash',
    bg: '#fef3c7',
    border: '#fde68a'
  },
  {
    id: 'off-2',
    code: 'COMBODOBLE',
    title: 'Combo Burger Real Doble + Papas',
    discountDesc: 'Descuento de $4.00 directo en combo',
    type: 'fixed',
    amount: 4.0,
    tag: '👑 Bestseller',
    bg: '#ffedd5',
    border: '#fed7aa'
  },
  {
    id: 'off-3',
    code: 'REYESPECIAL',
    title: 'Rey de las Burgers con $5 OFF',
    discountDesc: 'Prueba la estrella del menú con descuento real',
    type: 'fixed',
    amount: 5.0,
    tag: '🔥 Recomendado',
    bg: '#fee2e2',
    border: '#fecaca'
  },
  {
    id: 'off-4',
    code: 'DELIVERYFREE',
    title: 'Envío Express GRATIS (20 Min)',
    discountDesc: 'Ahorra el costo de envío en tu orden',
    type: 'shipping',
    amount: 2.0,
    tag: '🚀 Sin costo envío',
    bg: '#d1fae5',
    border: '#a7f3d0'
  }
];

export default function App() {
  // Navigation State: 'menu' | 'ofertas' | 'ordenes' | 'perfil'
  const [activeTab, setActiveTab] = useState('menu');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [burgers, setBurgers] = useState(DEFAULT_BURGERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [tipPercent, setTipPercent] = useState(10);
  const [toastMessage, setToastMessage] = useState(null);

  // Selected Burger for Customization Modal
  const [customizingBurger, setCustomizingBurger] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Orders State
  const [orders, setOrders] = useState([
    {
      id: 'HR-1092',
      customerName: 'Carlos Mendoza',
      items: [
        { name: 'Rey de las Burgers', quantity: 2, price: 15.90, extras: ['Extra Queso Cheddar'] }
      ],
      total: 33.30,
      step: 1, // 0: Recibido, 1: Cocina, 2: En camino, 3: Entregado
      statusText: 'Preparando en cocina 👨‍🍳',
      createdAt: 'Hace 12 min',
      address: 'Av. Las Condes #1240, Dpto 804'
    }
  ]);

  // User Profile
  const [userProfile, setUserProfile] = useState({
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    tier: 'VIP Gold 👑',
    points: 1450,
    address: 'Av. Las Condes #1240, Dpto 804, Santiago',
    paymentMethod: 'Tarjeta Visa •••• 4892'
  });

  // Load backend burgers & orders if reachable
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch products
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setBurgers(data.data);
        }
      })
      .catch(() => console.log('Operando con catálogo local'));

    // Fetch existing orders
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          const mapped = data.data.map((o, idx) => ({
            id: o.id,
            customerName: o.customerName || 'Cliente PWA',
            items: o.items || [],
            total: o.total || 0,
            step: idx === 0 ? 1 : 3,
            statusText: o.status || 'Preparando en cocina 👨‍🍳',
            createdAt: 'Hace pocos minutos',
            address: o.address || 'Av. Las Condes #1240'
          }));
          setOrders(mapped);
        }
      })
      .catch(() => console.log('Usando órdenes locales'));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart Calculations
  const subtotal = cart.reduce((acc, item) => {
    const extrasCost = (item.extras || []).length * 1.50;
    return acc + (item.price + extrasCost) * item.quantity;
  }, 0);

  let discountAmount = 0;
  let deliveryFee = subtotal > 25 ? 0 : 2.00;

  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = (subtotal * appliedCoupon.amount) / 100;
    } else if (appliedCoupon.type === 'fixed') {
      discountAmount = Math.min(appliedCoupon.amount, subtotal);
    } else if (appliedCoupon.type === 'shipping') {
      deliveryFee = 0;
    }
  }

  const tipAmount = (subtotal * tipPercent) / 100;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee + tipAmount);
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Cart Handlers
  const handleOpenCustomization = (burger) => {
    setCustomizingBurger(burger);
    setSelectedExtras([]);
    setModalQuantity(1);
  };

  const toggleExtra = (extraName) => {
    if (selectedExtras.includes(extraName)) {
      setSelectedExtras(selectedExtras.filter(e => e !== extraName));
    } else {
      setSelectedExtras([...selectedExtras, extraName]);
    }
  };

  const confirmAddToCart = () => {
    if (!customizingBurger) return;
    const existingIndex = cart.findIndex(
      item => item.id === customizingBurger.id && JSON.stringify(item.extras) === JSON.stringify(selectedExtras)
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += modalQuantity;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          ...customizingBurger,
          extras: [...selectedExtras],
          quantity: modalQuantity
        }
      ]);
    }

    setCustomizingBurger(null);
    showToast(`🍔 ¡${customizingBurger.name} agregada al carrito!`);
  };

  const handleUpdateQuantity = (index, delta) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  const handleApplyCoupon = (couponCode) => {
    const codeToSearch = (couponCode || couponInput).trim().toUpperCase();
    const found = OFFERS.find(o => o.code === codeToSearch);
    if (found) {
      setAppliedCoupon(found);
      setCouponInput('');
      showToast(`🎟️ Cupón ${found.code} aplicado con éxito!`);
    } else {
      showToast('❌ Cupón no válido. Prueba con RAPID2X1 o REYESPECIAL');
    }
  };

  // Simulación de Compra
  const handleSimulateCheckout = async () => {
    if (cart.length === 0) return;

    const newOrderPayload = {
      customerName: userProfile.name,
      items: cart.map(c => ({
        name: c.name,
        quantity: c.quantity,
        price: c.price,
        extras: c.extras
      })),
      total: parseFloat(grandTotal.toFixed(2)),
      address: userProfile.address,
      coupon: appliedCoupon ? appliedCoupon.code : null
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderPayload)
      });
      const data = await res.json();
      const orderId = data.success && data.data ? data.data.id : `HR-${Math.floor(1000 + Math.random() * 9000)}`;

      const createdOrder = {
        id: orderId,
        customerName: userProfile.name,
        items: [...cart],
        total: grandTotal,
        step: 0, // Recibido
        statusText: 'Orden Recibida en Sistema 📲',
        createdAt: 'Justo ahora',
        address: userProfile.address
      };

      setOrders([createdOrder, ...orders]);
      setCart([]);
      setIsCartOpen(false);
      setAppliedCoupon(null);
      setActiveTab('ordenes');
      showToast(`🎉 ¡Orden ${orderId} simulada con éxito!`);
    } catch {
      // Offline fallback
      const orderId = `HR-${Math.floor(1000 + Math.random() * 9000)}`;
      const createdOrder = {
        id: orderId,
        customerName: userProfile.name,
        items: [...cart],
        total: grandTotal,
        step: 0,
        statusText: 'Orden Recibida en Sistema 📲',
        createdAt: 'Justo ahora',
        address: userProfile.address
      };
      setOrders([createdOrder, ...orders]);
      setCart([]);
      setIsCartOpen(false);
      setActiveTab('ordenes');
      showToast(`🎉 ¡Orden ${orderId} creada en modo offline!`);
    }
  };

  // Advance Order Status Simulation
  const handleAdvanceOrderStatus = (orderId) => {
    const stepsConfig = [
      { step: 0, text: 'Orden Recibida en Sistema 📲' },
      { step: 1, text: 'Preparando en cocina 👨‍🍳' },
      { step: 2, text: 'En camino con repartidor 🛵' },
      { step: 3, text: 'Entregado con éxito ✅' }
    ];

    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const nextStep = (order.step + 1) % 4;
        return {
          ...order,
          step: nextStep,
          statusText: stepsConfig[nextStep].text
        };
      }
      return order;
    }));
    showToast('🔄 Estado de la orden avanzado para simulación');
  };

  // Filtered burgers
  const filteredBurgers = burgers.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (b.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' ||
                            b.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden', background: '#faf9f6' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '24px',
          fontSize: '0.85rem',
          fontWeight: '700',
          zIndex: 9999,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: '#fef3c7',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            border: '1px solid #fde68a'
          }}>
            🍔
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1' }}>
              Hamburger <span style={{ color: '#d97706' }}>Rapid</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>
              PWA Móvil &bull; Entrega en 20 Min
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '0.72rem',
            padding: '3px 8px',
            borderRadius: '12px',
            fontWeight: '700',
            background: isOnline ? '#dcfce7' : '#fee2e2',
            color: isOnline ? '#166534' : '#991b1b',
            border: `1px solid ${isOnline ? '#bbf7d0' : '#fecaca'}`
          }}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>

          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'relative',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem',
              color: '#0f172a'
            }}
          >
            <span>🛒</span>
            <span>${subtotal.toFixed(2)}</span>
            {totalCartItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#d97706',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800'
              }}>
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Body Content Scrollable Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="fade-in">
        
        {/* ============================================================== */}
        {/* PESTAÑA 1: MENÚ */}
        {/* ============================================================== */}
        {activeTab === 'menu' && (
          <div>
            {/* Banner Promocional Rápido */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
              border: '1px solid #fde68a',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ background: '#d97706', color: '#ffffff', fontSize: '0.65rem', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  20 Min Express
                </span>
                <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#92400e', marginTop: '4px' }}>
                  ¡Rey de las Burgers con Papas!
                </div>
                <div style={{ fontSize: '0.75rem', color: '#78350f' }}>
                  Usa el cupón <strong>RAPID2X1</strong> para pedir con descuento.
                </div>
              </div>
              <div style={{ fontSize: '2.2rem' }}>🔥</div>
            </div>

            {/* Buscador */}
            <div style={{ marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="🔍 Buscar hamburguesas, ingredientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  color: '#0f172a',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              />
            </div>

            {/* Categorías Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
              {['Todos', 'Especiales', 'Clásicas', 'Pollo'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: categoryFilter === cat ? '1px solid #d97706' : '1px solid #e2e8f0',
                    background: categoryFilter === cat ? '#d97706' : '#ffffff',
                    color: categoryFilter === cat ? '#ffffff' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Lista de Hamburguesas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredBurgers.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <img
                    src={b.image}
                    alt={b.name}
                    style={{ width: '115px', height: '125px', objectFit: 'cover' }}
                  />

                  <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                        <span style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid #fde68a'
                        }}>
                          {b.specialty || 'Signature'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.calories || '750 kcal'}</span>
                      </div>

                      <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '4px 0 2px' }}>
                        {b.name}
                      </h4>

                      <p style={{ fontSize: '0.75rem', color: '#64748b', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {b.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#b45309' }}>
                        ${b.price.toFixed(2)}
                      </span>

                      <button
                        onClick={() => handleOpenCustomization(b)}
                        style={{
                          background: '#d97706',
                          color: '#ffffff',
                          border: 'none',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: OFERTAS */}
        {/* ============================================================== */}
        {activeTab === 'ofertas' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>Cupones & Promociones</h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Aplica estos códigos exclusivos directamente en tu simulación de compra.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {OFFERS.map((offer) => (
                <div
                  key={offer.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: `1px solid ${offer.border}`,
                    padding: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: offer.bg, color: '#92400e', fontSize: '0.72rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${offer.border}` }}>
                      {offer.tag}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: '800', color: '#b45309', background: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px dashed #cbd5e1' }}>
                      {offer.code}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    {offer.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px' }}>
                    {offer.discountDesc}
                  </p>

                  <button
                    onClick={() => {
                      handleApplyCoupon(offer.code);
                      setIsCartOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px',
                      background: appliedCoupon?.code === offer.code ? '#10b981' : '#d97706',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {appliedCoupon?.code === offer.code ? '✅ Cupón Aplicado' : '🎟️ Aplicar Cupón al Carrito'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 3: ORDENES */}
        {/* ============================================================== */}
        {activeTab === 'ordenes' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>Seguimiento & Órdenes</h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Simulación del ciclo de vida de tus hamburguesas en tiempo real.</p>
            </div>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📦</div>
                <h4 style={{ color: '#0f172a', fontWeight: '700' }}>No tienes órdenes activas</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '8px 0 16px' }}>Agrega hamburguesas del Menú para simular tu primera compra.</p>
                <button
                  onClick={() => setActiveTab('menu')}
                  style={{ background: '#d97706', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Ver Menú de Burgers
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map((order, idx) => (
                  <div
                    key={order.id || idx}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '16px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
                    }}
                  >
                    {/* Header de la orden */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>Orden {order.id}</span>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{order.createdAt} &bull; {order.address}</div>
                      </div>
                      <span style={{
                        background: order.step === 3 ? '#dcfce7' : '#fef3c7',
                        color: order.step === 3 ? '#166534' : '#92400e',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        border: `1px solid ${order.step === 3 ? '#bbf7d0' : '#fde68a'}`
                      }}>
                        {order.statusText}
                      </span>
                    </div>

                    {/* Stepper de estado */}
                    <div style={{ background: '#fafaf9', padding: '12px', borderRadius: '12px', marginBottom: '14px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.7rem', fontWeight: '700', color: '#475569' }}>
                        <span style={{ color: order.step >= 0 ? '#d97706' : '#94a3b8' }}>1. Recibido</span>
                        <span style={{ color: order.step >= 1 ? '#d97706' : '#94a3b8' }}>2. Cocina</span>
                        <span style={{ color: order.step >= 2 ? '#d97706' : '#94a3b8' }}>3. En camino</span>
                        <span style={{ color: order.step >= 3 ? '#10b981' : '#94a3b8' }}>4. Entregado</span>
                      </div>
                      
                      {/* Barra de progreso */}
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${((order.step + 1) / 4) * 100}%`,
                          height: '100%',
                          background: order.step === 3 ? '#10b981' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '10px', marginBottom: '12px' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                          <span style={{ color: '#334155' }}>
                            <strong>{item.quantity}x</strong> {item.name} {item.extras && item.extras.length > 0 ? `(+${item.extras.join(', ')})` : ''}
                          </span>
                          <span style={{ fontWeight: '700', color: '#0f172a' }}>
                            ${((item.price || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total y botón para avanzar simulación */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                      <div>
                        <small style={{ fontSize: '0.7rem', color: '#64748b' }}>TOTAL PAGADO</small>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#b45309' }}>
                          ${parseFloat(order.total || 0).toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAdvanceOrderStatus(order.id)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#0f172a',
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ Avanzar Estado Simulado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 4: PERFIL */}
        {/* ============================================================== */}
        {activeTab === 'perfil' && (
          <div>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '18px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#fef3c7',
                border: '2px solid #fde68a',
                margin: '0 auto 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                👨‍💻
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>{userProfile.name}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>{userProfile.email}</p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: '800',
                color: '#92400e'
              }}>
                <span>Rapid Rewards:</span>
                <span>{userProfile.tier}</span>
                <span>&bull; {userProfile.points} Pts</span>
              </div>
            </div>

            {/* Preferencias de Envío */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                📍 Dirección de Entrega Favorita
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '10px' }}>{userProfile.address}</p>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>
                ✓ Zona con cobertura express garantizada (Menos de 20 min)
              </div>
            </div>

            {/* Método de Pago */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                💳 Método de Pago Predeterminado
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#334155' }}>
                <span>💳</span>
                <span>{userProfile.paymentMethod}</span>
              </div>
            </div>

            {/* Accesos al Ecosistema */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="/"
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  padding: '12px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>🌐 Volver al Portal E-commerce</span>
                <span>&rarr;</span>
              </a>

              <a
                href="/admin"
                style={{
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>⚙️ Abrir Panel Administrativo</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL DE PERSONALIZACIÓN DE BURGER */}
      {/* ============================================================== */}
      {customizingBurger && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '20px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                  {customizingBurger.specialty}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                  {customizingBurger.name}
                </h3>
              </div>
              <button
                onClick={() => setCustomizingBurger(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              {customizingBurger.description}
            </p>

            {/* Extras Selection */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Personaliza tus Extras Gourmet:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Extra Queso Cheddar 12 Meses', price: 1.50 },
                  { name: 'Bacon Ahumado Crujiente', price: 2.00 },
                  { name: 'Salsa Especial Rey Extra', price: 0.80 },
                  { name: 'Cebolla Crispy', price: 1.00 }
                ].map((extra) => (
                  <label
                    key={extra.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: selectedExtras.includes(extra.name) ? '1px solid #d97706' : '1px solid #e2e8f0',
                      background: selectedExtras.includes(extra.name) ? '#fffbeb' : '#fafaf9',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: '600', color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes(extra.name)}
                        onChange={() => toggleExtra(extra.name)}
                      />
                      <span>{extra.name}</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#b45309' }}>
                      +${extra.price.toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Cantidad:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>{modalQuantity}</span>
                <button
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total and Confirm */}
            <button
              onClick={confirmAddToCart}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
              }}
            >
              Añadir a mi Orden &bull; ${((customizingBurger.price + selectedExtras.length * 1.50) * modalQuantity).toFixed(2)}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DRAWER / MODAL DEL CARRITO & SIMULADOR DE CHECKOUT */}
      {/* ============================================================== */}
      {isCartOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '20px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.2)'
          }}>
            {/* Header del carrito */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>🛒</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Mi Carrito Express</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}
              >
                &times;
              </button>
            </div>

            {/* Contenido scrolleable del carrito */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🍔</div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>Tu carrito está vacío</div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Explora el menú y agrega tu hamburguesa favorita.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px',
                        background: '#fafaf9',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9'
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: '8px' }}>
                        <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: '700' }}>
                          ${item.price.toFixed(2)} c/u
                        </div>
                        {item.extras && item.extras.length > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            +{item.extras.join(', ')}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleUpdateQuantity(index, -1)}
                          style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(index, 1)}
                          style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cupón Section */}
              {cart.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                    ¿Tienes un cupón de descuento?
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="Ej: RAPID2X1"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        textTransform: 'uppercase'
                      }}
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      style={{
                        background: '#0f172a',
                        color: 'white',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Aplicar
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '700', marginTop: '6px' }}>
                      ✓ Cupón <strong>{appliedCoupon.code}</strong> aplicado ({appliedCoupon.title})
                    </div>
                  )}
                </div>
              )}

              {/* Propina Selector */}
              {cart.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    Propina para el repartidor express:
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[0, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setTipPercent(pct)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '8px',
                          border: tipPercent === pct ? '1px solid #d97706' : '1px solid #cbd5e1',
                          background: tipPercent === pct ? '#fef3c7' : '#ffffff',
                          color: tipPercent === pct ? '#92400e' : '#475569',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        {pct === 0 ? 'Sin' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Desglose de Totales */}
              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal Productos:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: '700' }}>
                      <span>Descuento ({appliedCoupon.code}):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Entrega Express (20 min):</span>
                    <span>{deliveryFee === 0 ? 'GRATIS' : `$${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Propina Repartidor ({tipPercent}%):</span>
                    <span>${tipAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', paddingTop: '8px', borderTop: '1px solid #e2e8f0', marginTop: '4px' }}>
                    <span>TOTAL:</span>
                    <span style={{ color: '#b45309' }}>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de Confirmación y Simulación */}
            {cart.length > 0 && (
              <div style={{ paddingTop: '14px', flexShrink: 0 }}>
                <button
                  onClick={handleSimulateCheckout}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #d97706, #b45309)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(217, 119, 6, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🚀 Confirmar y Simular Pedido</span>
                  <span>&bull;</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BOTTOM NAVIGATION TABS (Menú, Ofertas, Ordenes, Perfil) */}
      {/* ============================================================== */}
      <nav style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0',
        flexShrink: 0,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
      }}>
        {[
          { id: 'menu', label: 'Menú', icon: '🍔' },
          { id: 'ofertas', label: 'Ofertas', icon: '🏷️' },
          { id: 'ordenes', label: 'Ordenes', icon: '📦', badge: orders.length > 0 ? orders.length : null },
          { id: 'perfil', label: 'Perfil', icon: '👤' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer',
                color: isActive ? '#b45309' : '#64748b',
                position: 'relative',
                padding: '4px 12px'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: isActive ? '800' : '600' }}>
                {tab.label}
              </span>
              {tab.badge && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '12px',
                  background: '#d97706',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

    </div>
  );
}
