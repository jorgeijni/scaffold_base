import React, { useState, useEffect } from 'react';

// Catálogo de las 10 Variantes de Hamburguesas
const PRODUCTS = [
  {
    id: 1,
    name: "Rey de las Burgers",
    badge: "Corona de Oro • Edición Legendaria",
    rating: 4.9,
    time: "10-12 min",
    calories: "980 kcal",
    price: 14.99,
    description: "Doble medallón de carne Angus Black 100% flameada al roble vivo, queso cheddar inglés añejado 12 meses, cebolla caramelizada al bourbon, panceta crocante y salsa secreta Real en pan brioche artesanal dorado con mantequilla clarificada.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    category: "especiales"
  },
  {
    id: 2,
    name: "Burger Real Clásica",
    badge: "Clásica de Autor",
    rating: 4.8,
    time: "8-10 min",
    calories: "650 kcal",
    price: 9.99,
    description: "Medallón de res seleccionada a la plancha de hierro fundido, doble loncha de queso cheddar fundido, lechuga hidropónica fresca, tomate maduro, pepinillos encurtidos y salsa de la casa.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
    category: "clasicas"
  },
  {
    id: 3,
    name: "Burger Real Doble",
    badge: "Doble Impacto",
    rating: 4.9,
    time: "12-14 min",
    calories: "890 kcal",
    price: 12.50,
    description: "Dos carnes smash con costra caramelizada profunda, cuádruple queso americano extra derretido, panceta crujiente, relish dulce y mayonesa trufada en pan de papa tostado.",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
    category: "especiales"
  },
  {
    id: 4,
    name: "Burger Doble Especial",
    badge: "Edición Especial",
    rating: 4.9,
    time: "12-14 min",
    calories: "920 kcal",
    price: 13.50,
    description: "Doble blend premium de picaña y asado de tira, queso Monterrey Jack fundido con pimientos asados, huevo de campo a la plancha con yema tierna y alioli de ajo negro.",
    image: "https://images.unsplash.com/photo-1583032015879-c5c48b59d9c5?auto=format&fit=crop&w=600&q=80",
    category: "especiales"
  },
  {
    id: 5,
    name: "Burger Trufa & Portobello",
    badge: "Gourmet Select",
    rating: 5.0,
    time: "14-16 min",
    calories: "810 kcal",
    price: 15.50,
    description: "Carne madurada Dry-Aged 30 días, sombrero de hongo Portobello glaseado al vino tinto, queso suizo Emmental gratinado y aceite de trufa blanca de Piamonte.",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
    category: "gourmet"
  },
  {
    id: 6,
    name: "Burger Crispy Smokehouse",
    badge: "Pollo Crujiente",
    rating: 4.7,
    time: "10-12 min",
    calories: "740 kcal",
    price: 11.99,
    description: "Suprema de pechuga campera marinada 24 horas en buttermilk y pimentón ahumado, rebozada en copos crujientes, coleslaw de manzana verde y mayonesa chipotle.",
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80",
    category: "pollo"
  },
  {
    id: 7,
    name: "Burger BBQ Bourbon Flame",
    badge: "Ahumada a la Leña",
    rating: 4.8,
    time: "12-15 min",
    calories: "860 kcal",
    price: 13.99,
    description: "Medallón de res ahumado pacientemente con virutas de roble, aros de cebolla artesanalmente rebozados a la cerveza, pulled pork meloso y salsa barbacoa al bourbon Jim Beam.",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80",
    category: "especiales"
  },
  {
    id: 8,
    name: "Burger Bacon Cheese Deluxe",
    badge: "Favorita Clásica",
    rating: 4.8,
    time: "8-10 min",
    calories: "720 kcal",
    price: 10.99,
    description: "180g de carne jugosa a la parrilla, triple tiro de tocino ahumado de corte grueso extra crocante, quesos gouda y cheddar fundidos y mostaza Dijon antigua.",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80",
    category: "clasicas"
  },
  {
    id: 9,
    name: "Burger Guacamole & Chipotle Crunch",
    badge: "Fusión Picante",
    rating: 4.7,
    time: "10-12 min",
    calories: "780 kcal",
    price: 12.99,
    description: "Carne a la parrilla sobre cama de guacamole rústico con toque de lima fresca y cilantro, totopos crocantes de maíz, queso Oaxaca derretido y emulsión de chipotle tatemado.",
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80",
    category: "especiales"
  },
  {
    id: 10,
    name: "Burger Green Garden Truffle",
    badge: "100% Plant-Based",
    rating: 4.8,
    time: "10-12 min",
    calories: "590 kcal",
    price: 11.50,
    description: "Medallón artesanal a base de lentejas francesas, quinoa andina y setas salteadas, queso vegetal cremoso ahumado, rúcula selvática, tomate seco y crema de trufa negra.",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80",
    category: "veggie"
  }
];

export default function App() {
  // Tema: 'dark' (Imagen 2) o 'light' (Imagen 3)
  const [theme, setTheme] = useState('dark');
  
  // Pestañas inferiores: 'menu' | 'offers' | 'orders' | 'profile'
  const [activeTab, setActiveTab] = useState('menu');

  // Filtros de búsqueda y categorías
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Carrito de compras
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pwa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Historial de Órdenes simuladas
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('pwa_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'PWA-1084',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        items: [
          { name: 'Rey de las Burgers', qty: 2, price: 14.99 },
          { name: 'Papas Rústicas', qty: 2, price: 3.50 }
        ],
        total: 36.98,
        status: 'Listo para Entrega',
        erpStatus: 'Sincronizado a iDempiere',
        origin: 'PWA Preventa'
      }
    ];
  });

  // Modal de Personalización
  const [customizingItem, setCustomizingItem] = useState(null);
  const [extras, setExtras] = useState({
    extraBacon: false,
    extraCheese: false,
    comboFriesDrink: false,
    sauceExtra: false
  });

  // Modal de Carrito / Checkout
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  // Persistir carrito y órdenes
  useEffect(() => {
    localStorage.setItem('pwa_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pwa_orders', JSON.stringify(orders));
  }, [orders]);

  // Colores dinámicos según el tema
  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#0b0e14' : '#f8fafc',
    card: isDark ? '#141824' : '#ffffff',
    cardBorder: isDark ? '#222938' : '#e2e8f0',
    text: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    headerBg: isDark ? '#10141e' : '#ffffff',
    bottomNavBg: isDark ? '#10141e' : '#ffffff',
    bottomNavBorder: isDark ? '#1e2433' : '#e2e8f0',
    primaryOrange: '#ea580c',
    gold: '#f59e0b',
    chipBg: isDark ? '#1c2233' : '#f1f5f9',
    chipBorder: isDark ? '#2b344a' : '#cbd5e1'
  };

  // Filtrado de hamburguesas
  const filteredProducts = PRODUCTS.filter(p => {
    if (selectedCategory === 'especiales' && p.category !== 'especiales') return false;
    if (selectedCategory === 'clasicas' && p.category !== 'clasicas') return false;
    if (selectedCategory === 'gourmet' && p.category !== 'gourmet') return false;
    if (selectedCategory === 'pollo' && p.category !== 'pollo' && p.category !== 'veggie') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.badge.toLowerCase().includes(q);
    }
    return true;
  });

  // Agregar al carrito
  const addToCart = (product, customOpts = null) => {
    const itemPrice = customOpts ? customOpts.totalPrice : product.price;
    const newItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: itemPrice,
      image: product.image,
      qty: 1,
      extras: customOpts?.extrasSummary || null
    };
    setCart(prev => [...prev, newItem]);
    setCustomizingItem(null);
  };

  // Aplicar cupón
  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'REY20') {
      setDiscountPercent(20);
      alert('¡Cupón REY20 aplicado con éxito! 20% de descuento en tu orden.');
    } else if (couponCode.toUpperCase() === 'COMBO50') {
      setDiscountPercent(15);
      alert('¡Cupón COMBO50 aplicado! 15% de descuento.');
    } else {
      alert('Cupón inválido. Prueba con REY20 o COMBO50.');
    }
  };

  // Totales
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const total = Math.max(0, subtotal - discountAmount);

  // Simular Compra / Checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newOrder = {
      id: `PWA-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      items: [...cart],
      total: Number(total.toFixed(2)),
      status: 'Recibido en Cocina',
      erpStatus: 'Sincronizado a iDempiere ERP (C_Order)',
      origin: 'PWA Preventa'
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setIsCartOpen(false);
    setCheckoutSuccess(newOrder);
    setActiveTab('orders');
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: colors.bg,
      color: colors.text,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxShadow: '0 0 40px rgba(0,0,0,0.5)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* 1. TOP HEADER (Exacto a Imágenes 2 y 3) */}
      <header style={{
        background: colors.headerBg,
        borderBottom: `1px solid ${colors.cardBorder}`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        {/* Logo / Nombre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.4rem' }}>🍔</span>
          <div>
            <div style={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: '700',
              fontSize: '1.15rem',
              letterSpacing: '0.02em',
              lineHeight: 1
            }}>
              BURGER FACTORY
            </div>
            <div style={{ fontSize: '0.65rem', color: colors.gold, fontWeight: '700' }}>
              &bull; EST. 2016 &bull; NextCollege 2027
            </div>
          </div>
        </div>

        {/* Acciones Derecha: Switch Modo Claro/Oscuro y Carrito */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            style={{
              background: isDark ? '#1c2233' : '#f1f5f9',
              border: `1px solid ${colors.cardBorder}`,
              color: colors.text,
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isDark ? '☀️ Claro' : '🌙 Oscuro'}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              background: colors.primaryOrange,
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)'
            }}
          >
            🛒 {cart.length}
          </button>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      <main style={{ flex: 1, paddingBottom: '80px', overflowY: 'auto' }}>
        
        {/* PESTAÑA: MENÚ (Exacto a Imágenes 2 y 3) */}
        {activeTab === 'menu' && (
          <div style={{ padding: '16px' }}>
            
            {/* Banner Recomendado de Hoy */}
            <div style={{
              background: isDark ? 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)' : 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '14px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 8px 20px rgba(234, 88, 12, 0.25)'
            }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9 }}>
                  RECOMENDADO DE HOY
                </span>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', margin: '2px 0' }}>
                  👑 REY DE LAS BURGERS + PAPAS
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.95 }}>
                  Usa el cupón <strong>REY20</strong> para un 20% de descuento.
                </div>
              </div>

              <button
                onClick={() => addToCart(PRODUCTS[0])}
                style={{
                  background: '#ffffff',
                  color: '#ea580c',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}
              >
                + Pedir
              </button>
            </div>

            {/* Barra de Búsqueda */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="🔍 Buscar hamburguesas, ingredientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: colors.card,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: colors.text,
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Chips de Categorías */}
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '16px'
            }}>
              {[
                { id: 'all', label: 'Todas' },
                { id: 'especiales', label: 'Especiales' },
                { id: 'clasicas', label: 'Clásicas' },
                { id: 'gourmet', label: 'Gourmet' },
                { id: 'pollo', label: 'Pollo/Veggie' }
              ].map(chip => {
                const isSelected = selectedCategory === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedCategory(chip.id)}
                    style={{
                      background: isSelected ? colors.primaryOrange : colors.chipBg,
                      color: isSelected ? '#ffffff' : colors.textMuted,
                      border: `1px solid ${isSelected ? colors.primaryOrange : colors.chipBorder}`,
                      borderRadius: '9999px',
                      padding: '6px 16px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s'
                    }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Lista Vertical de Hamburguesas (Imágenes 2 y 3) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredProducts.map(burger => (
                <div
                  key={burger.id}
                  style={{
                    background: colors.card,
                    border: `1px solid ${colors.cardBorder}`,
                    borderRadius: '16px',
                    padding: '14px',
                    display: 'flex',
                    gap: '14px',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.04)'
                  }}
                >
                  {/* Foto Cuadrada */}
                  <img
                    src={burger.image}
                    alt={burger.name}
                    style={{
                      width: '95px',
                      height: '95px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />

                  {/* Info y Acciones */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      color: colors.gold,
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      marginBottom: '2px'
                    }}>
                      ★ {burger.badge} ★ {burger.rating}
                    </div>

                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '800',
                      margin: '0 0 2px 0',
                      color: colors.text
                    }}>
                      {burger.name}
                    </h3>

                    <div style={{
                      fontSize: '0.7rem',
                      color: colors.textMuted,
                      marginBottom: '6px',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <span>⏱ {burger.time}</span>
                      <span>•</span>
                      <span>🔥 {burger.calories}</span>
                    </div>

                    <p style={{
                      fontSize: '0.74rem',
                      color: colors.textMuted,
                      lineHeight: '1.4',
                      margin: '0 0 10px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {burger.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto'
                    }}>
                      <span style={{
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: colors.primaryOrange
                      }}>
                        ${burger.price.toFixed(2)}
                      </span>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setCustomizingItem(burger)}
                          style={{
                            background: isDark ? '#1c2233' : '#f1f5f9',
                            border: `1px solid ${colors.cardBorder}`,
                            color: colors.textMuted,
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Personalizar
                        </button>

                        <button
                          onClick={() => addToCart(burger)}
                          style={{
                            background: colors.primaryOrange,
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)'
                          }}
                        >
                          + Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA: OFERTAS & CUPONES */}
        {activeTab === 'offers' && (
          <div style={{ padding: '20px 16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '14px' }}>
              🎁 Cupones & Promociones
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: colors.card,
                border: `1px solid ${colors.gold}`,
                borderRadius: '16px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.gold, fontWeight: '800', fontSize: '0.75rem' }}>
                    CUPÓN VIP REY20
                  </span>
                  <span style={{ background: '#f59e0b20', color: colors.gold, padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                    -20% OFF
                  </span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', margin: '4px 0' }}>
                  20% en Rey de las Burgers + Papas
                </div>
                <p style={{ fontSize: '0.78rem', color: colors.textMuted, marginBottom: '12px' }}>
                  Válido para pedidos en la PWA y portal E-commerce.
                </p>
                <button
                  onClick={() => { setCouponCode('REY20'); setDiscountPercent(20); alert('Cupón REY20 aplicado!'); }}
                  style={{
                    background: colors.primaryOrange,
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Usar Cupón REY20
                </button>
              </div>

              <div style={{
                background: colors.card,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: '16px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#10b981', fontWeight: '800', fontSize: '0.75rem' }}>
                    COMBO FAMILIAR
                  </span>
                  <span style={{ background: '#10b98120', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                    -15% OFF
                  </span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', margin: '4px 0' }}>
                  Cupón COMBO50
                </div>
                <p style={{ fontSize: '0.78rem', color: colors.textMuted, marginBottom: '12px' }}>
                  15% en pedidos con 3 o más creaciones de autor.
                </p>
                <button
                  onClick={() => { setCouponCode('COMBO50'); setDiscountPercent(15); alert('Cupón COMBO50 aplicado!'); }}
                  style={{
                    background: isDark ? '#1c2233' : '#f1f5f9',
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.text,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Usar Cupón COMBO50
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: ÓRDENES REALIZADAS (Simulación de Compra) */}
        {activeTab === 'orders' && (
          <div style={{ padding: '20px 16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '14px' }}>
              📋 Mis Órdenes ({orders.length})
            </h2>

            {checkoutSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#10b981',
                padding: '14px',
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '0.85rem'
              }}>
                <div style={{ fontWeight: '800', marginBottom: '2px' }}>
                  🎉 ¡Pedido #{checkoutSuccess.id} Creado Exitosamente!
                </div>
                <div>Tu pedido fue registrado en la PWA y sincronizado al ERP iDempiere.</div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {orders.map(order => (
                <div
                  key={order.id}
                  style={{
                    background: colors.card,
                    border: `1px solid ${colors.cardBorder}`,
                    borderRadius: '16px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>{order.id}</span>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: '700'
                    }}>
                      ● {order.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: colors.textMuted, marginBottom: '10px' }}>
                    {new Date(order.date).toLocaleString()} &bull; {order.origin}
                  </div>

                  <div style={{ borderTop: `1px solid ${colors.cardBorder}`, paddingTop: '8px', marginBottom: '10px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', margin: '4px 0' }}>
                        <span>{item.qty}x {item.name}</span>
                        <span>${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: `1px solid ${colors.cardBorder}`,
                    paddingTop: '8px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: colors.gold, display: 'block' }}>
                        ⚡ {order.erpStatus}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.2rem', fontWeight: '700', color: colors.primaryOrange }}>
                      Total: ${order.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA: PERFIL */}
        {activeTab === 'profile' && (
          <div style={{ padding: '20px 16px' }}>
            <div style={{
              background: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: '20px',
              padding: '24px 16px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>👤</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Vendedor / Cliente PWA</h2>
              <div style={{ fontSize: '0.8rem', color: colors.gold, fontWeight: '700', marginTop: '2px' }}>
                ★ Cliente VIP Gold &bull; 850 Puntos Acumulados
              </div>
              <p style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '8px' }}>
                Sincronización directa con iDempiere ERP (Client ID: 11 - GardenWorld)
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="/"
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.text,
                  padding: '14px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>🌐 Ir a la Landing E-commerce</span>
                <span>&rarr;</span>
              </a>

              <a
                href="/admin"
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.gold,
                  padding: '14px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>⚙️ Abrir Panel de Control &bull; ERP</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* 3. MODAL DE PERSONALIZACIÓN */}
      {customizingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 60
        }}>
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '20px',
            maxWidth: '420px',
            width: '100%',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>
                Personalizar {customizingItem.name}
              </h3>
              <button
                onClick={() => setCustomizingItem(null)}
                style={{ background: 'transparent', border: 'none', color: colors.textMuted, fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>🥓 Extra Panceta Crujiente</span>
                <input
                  type="checkbox"
                  checked={extras.extraBacon}
                  onChange={(e) => setExtras({ ...extras, extraBacon: e.target.checked })}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>🧀 Extra Queso Cheddar Fundido (+$1.50)</span>
                <input
                  type="checkbox"
                  checked={extras.extraCheese}
                  onChange={(e) => setExtras({ ...extras, extraCheese: e.target.checked })}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>🍟 Hazlo Combo (Papas + Bebida +$3.99)</span>
                <input
                  type="checkbox"
                  checked={extras.comboFriesDrink}
                  onChange={(e) => setExtras({ ...extras, comboFriesDrink: e.target.checked })}
                />
              </label>
            </div>

            <button
              onClick={() => {
                let extraPrice = 0;
                let summary = [];
                if (extras.extraBacon) { extraPrice += 1.80; summary.push('Extra Panceta'); }
                if (extras.extraCheese) { extraPrice += 1.50; summary.push('Extra Cheddar'); }
                if (extras.comboFriesDrink) { extraPrice += 3.99; summary.push('Combo Papas+Bebida'); }

                addToCart(customizingItem, {
                  totalPrice: customizingItem.price + extraPrice,
                  extrasSummary: summary.join(', ')
                });
              }}
              style={{
                width: '100%',
                background: colors.primaryOrange,
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Confirmar y Agregar al Carrito
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL DEL CARRITO / SIMULAR COMPRA */}
      {isCartOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 60
        }}>
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '20px',
            maxWidth: '440px',
            width: '100%',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                🛒 Carrito de Compras ({cart.length})
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ background: 'transparent', border: 'none', color: colors.textMuted, fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: colors.textMuted }}>
                Tu carrito está vacío. Agrega tus hamburguesas favoritas.
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${colors.cardBorder}` }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{item.name}</div>
                      {item.extras && <div style={{ fontSize: '0.72rem', color: colors.gold }}>+ {item.extras}</div>}
                      <div style={{ fontSize: '0.78rem', color: colors.textMuted }}>${item.price.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}

                {/* Cupón */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <input
                    type="text"
                    placeholder="Código de Cupón (ej. REY20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{
                      flex: 1,
                      background: colors.bg,
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: colors.text,
                      fontSize: '0.8rem'
                    }}
                  />
                  <button
                    onClick={applyCoupon}
                    style={{
                      background: colors.gold,
                      color: '#0b0f19',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    Aplicar
                  </button>
                </div>

                {/* Totales */}
                <div style={{ marginTop: '14px', borderTop: `1px solid ${colors.cardBorder}`, paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: colors.textMuted }}>
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#10b981' }}>
                      <span>Descuento ({discountPercent}%):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '800', marginTop: '6px' }}>
                    <span>Total a Pagar:</span>
                    <span style={{ color: colors.primaryOrange }}>${total.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            )}

            {cart.length > 0 && (
              <button
                onClick={handleCheckout}
                style={{
                  width: '100%',
                  background: colors.primaryOrange,
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 8px 16px rgba(234, 88, 12, 0.4)'
                }}
              >
                🚀 Confirmar y Simular Compra ERP &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. BOTTOM NAVIGATION BAR (Exacto a Imágenes 2 y 3: Menú, Ofertas, Órdenes, Perfil) */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '480px',
        margin: '0 auto',
        height: '65px',
        background: colors.bottomNavBg,
        borderTop: `1px solid ${colors.bottomNavBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50
      }}>
        {[
          { id: 'menu', label: 'Menú', icon: '🍔' },
          { id: 'offers', label: 'Ofertas', icon: '🏷️' },
          { id: 'orders', label: 'Órdenes', icon: '📋', badge: orders.length },
          { id: 'profile', label: 'Perfil', icon: '👤' }
        ].map(tab => {
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
                gap: '2px',
                cursor: 'pointer',
                color: isActive ? colors.primaryOrange : colors.textMuted,
                position: 'relative',
                padding: '6px 12px'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: isActive ? '800' : '600' }}>
                {tab.label}
              </span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '10px',
                  background: colors.primaryOrange,
                  color: '#fff',
                  borderRadius: '9999px',
                  fontSize: '0.62rem',
                  fontWeight: '800',
                  padding: '1px 5px'
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
