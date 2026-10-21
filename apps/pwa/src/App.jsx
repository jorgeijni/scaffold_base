import React, { useState, useEffect } from 'react';

// Catálogo completo gourmet & crispy para Hamburger Rapid PWA
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: '8 Pcs Chicken Bucket',
    category: 'Buckets',
    price: 24.99,
    tag: 'BESTSELLER',
    tagColor: '#d32f2f',
    rating: 4.8,
    reviews: 245,
    subtitle: '2 Dips + 2 Fries + 2 Drinks',
    calories: '1150 kcal',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    description: '8 piezas de pollo marinado 24h en buttermilk con rebozado extra crujiente secreto, 2 salsas a elección y papas doradas.'
  },
  {
    id: 2,
    name: 'Zinger Chicken Burger',
    category: 'Burgers',
    price: 12.49,
    tag: 'POPULAR',
    tagColor: '#ea580c',
    rating: 4.7,
    reviews: 189,
    subtitle: 'Fries + Drink',
    calories: '740 kcal',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    description: 'Pechuga crujiente picante, lechuga iceberg en juliana, mayonesa suave al limón en pan brioche artesanal tostado.'
  },
  {
    id: 3,
    name: '3 Pcs Chicken Tenders',
    category: 'Tenders',
    price: 13.99,
    tag: 'SAVE 15%',
    tagColor: '#e11d48',
    rating: 4.9,
    reviews: 156,
    subtitle: 'Fries + Dip + Drink',
    calories: '620 kcal',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
    description: 'Solomillos de pollo tierno con doble empanizado crocante, salsa BBQ al bourbon y papas rústicas con piel.'
  },
  {
    id: 4,
    name: 'Rey de las Burgers Combo',
    category: 'Burgers',
    price: 15.90,
    tag: 'SIGNATURE',
    tagColor: '#b45309',
    rating: 5.0,
    reviews: 312,
    subtitle: 'Doble Angus + Fries + Drink',
    calories: '920 kcal',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    description: 'Doble carne Angus prime a la leña, cheddar madurado 12 meses, cebolla glaseada al bourbon y salsa secreta del Rey.'
  },
  {
    id: 5,
    name: 'Burger Real Doble Melt',
    category: 'Burgers',
    price: 14.50,
    tag: 'POPULAR',
    tagColor: '#ea580c',
    rating: 4.8,
    reviews: 198,
    subtitle: 'Doble Smash + Fries',
    calories: '890 kcal',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    description: 'Doble smash patty caramelizado, triple queso cheddar fundido, pepinillos encurtidos y aderezo especial Dijon.'
  },
  {
    id: 6,
    name: 'Burger Trufa Deluxe',
    category: 'Burgers',
    price: 17.50,
    tag: 'GOURMET',
    tagColor: '#7c3aed',
    rating: 4.9,
    reviews: 142,
    subtitle: 'Papas Trufadas + Bebida',
    calories: '840 kcal',
    image: 'https://images.unsplash.com/photo-1582196016295-f8c8bd4b3e99?w=600&auto=format&fit=crop&q=80',
    description: 'Angus prime con emulsión de trufa negra, hongos portobello salteados en manteca francesa y queso brie derretido.'
  },
  {
    id: 7,
    name: '6 Pcs Crispy Hot Wings',
    category: 'Buckets',
    price: 10.99,
    tag: 'HOT & SPICY',
    tagColor: '#dc2626',
    rating: 4.7,
    reviews: 164,
    subtitle: 'Blue Cheese Dip + Apio',
    calories: '580 kcal',
    image: 'https://images.unsplash.com/photo-1527477321077-449e7bdfa35b?w=600&auto=format&fit=crop&q=80',
    description: 'Alitas crocantes bañadas en salsa búfalo picante artesanal, servidas con dip de queso azul cremoso.'
  },
  {
    id: 8,
    name: 'Papas Rapid Especiales',
    category: 'Sides',
    price: 5.50,
    tag: 'CRISPY SIDE',
    tagColor: '#f59e0b',
    rating: 4.8,
    reviews: 215,
    subtitle: 'Con Queso Cheddar & Bacon',
    calories: '490 kcal',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    description: 'Papas corte grueso extra crujientes bañadas en queso cheddar líquido tibio y trocitos de tocino ahumado.'
  },
  {
    id: 9,
    name: 'Refresco Artesanal Helado',
    category: 'Drinks',
    price: 3.20,
    tag: 'BEBIDA',
    tagColor: '#0284c7',
    rating: 4.6,
    reviews: 95,
    subtitle: 'Vaso 500ml con Hielo',
    calories: '140 kcal',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    description: 'Bebida gaseosa helada servida al momento con rodaja de lima fresca y hielo picado.'
  }
];

const CATEGORIES = [
  { id: 'All', name: 'All Items', icon: '🍽️', count: 9 },
  { id: 'Buckets', name: 'Buckets', icon: '🍗', count: 2 },
  { id: 'Burgers', name: 'Burgers', icon: '🍔', count: 4 },
  { id: 'Tenders', name: 'Tenders', icon: '🥓', count: 1 },
  { id: 'Sides', name: 'Sides', icon: '🍟', count: 1 },
  { id: 'Drinks', name: 'Drinks', icon: '🥤', count: 1 }
];

const OFFERS = [
  {
    id: 'off-1',
    code: 'RAPID2X1',
    title: '2x1 en Zinger Chicken Burger',
    discountDesc: '50% de descuento en tu segunda hamburguesa crispy',
    type: 'percent',
    amount: 15,
    tag: '⚡ Oferta Flash',
    bg: '#fff1ed',
    border: '#fed7cc'
  },
  {
    id: 'off-2',
    code: 'COMBODOBLE',
    title: 'Combo 8 Pcs Chicken Bucket',
    discountDesc: 'Descuento de $4.00 directo en combo familiar',
    type: 'fixed',
    amount: 4.0,
    tag: '👑 Bestseller',
    bg: '#fef3c7',
    border: '#fde68a'
  },
  {
    id: 'off-3',
    code: 'SPICY30',
    title: '30% OFF en Spicy Combos',
    discountDesc: 'Válido para alitas, tenders y hamburguesas picantes',
    type: 'percent',
    amount: 30,
    tag: '🔥 Spicy Deals',
    bg: '#fee2e2',
    border: '#fecaca'
  },
  {
    id: 'off-4',
    code: 'DELIVERYFREE',
    title: 'Envío Express GRATIS (20 Min)',
    discountDesc: 'Ahorra el costo de envío en órdenes mayores a $15',
    type: 'shipping',
    amount: 2.0,
    tag: '🚀 Envío Gratis',
    bg: '#dcfce7',
    border: '#bbf7d0'
  }
];

export default function App() {
  // Navigation: 'home' | 'menu' | 'ordenes' | 'ofertas' | 'perfil'
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([1, 2]);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  // Cart & Simulator State
  const [cart, setCart] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [tipPercent, setTipPercent] = useState(10);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, title: '¡30% OFF en Combos Spicy! 🔥', desc: 'Usa el cupón SPICY30 antes de medianoche.', time: 'Hace 5 min', unread: true },
    { id: 2, title: 'Orden HR-1092 en cocina 👨‍🍳', desc: 'El repartidor llegará en menos de 15 minutos.', time: 'Hace 12 min', unread: true },
    { id: 3, title: '¡Nuevo 8 Pcs Chicken Bucket! 🍗', desc: 'Receta secreta marinado en buttermilk.', time: 'Hace 1 h', unread: false }
  ]);

  // Orders State
  const [orders, setOrders] = useState([
    {
      id: 'HR-1092',
      customerName: 'Carlos Mendoza',
      items: [
        { name: '8 Pcs Chicken Bucket', quantity: 1, price: 24.99, extras: ['Extra Salsa BBQ Bourbon'] },
        { name: 'Papas Rapid Especiales', quantity: 1, price: 5.50, extras: [] }
      ],
      total: 32.49,
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

  // Sync with API if server is reachable
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          // Merge API data with rich visual properties
          const merged = data.data.map((p, i) => ({
            ...p,
            tag: p.specialty ? p.specialty.toUpperCase() : (i === 0 ? 'BESTSELLER' : 'POPULAR'),
            tagColor: i % 2 === 0 ? '#d32f2f' : '#ea580c',
            rating: p.rating || 4.8,
            reviews: p.reviews || (120 + i * 25),
            subtitle: p.subtitle || 'Combo con Papas & Bebida'
          }));
          setProducts(merged);
        }
      })
      .catch(() => console.log('Operando con catálogo visual local'));

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
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Toggle favorite
  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
      showToast('🤍 Eliminado de tus favoritos');
    } else {
      setFavorites([...favorites, id]);
      showToast('❤️ ¡Agregado a tus favoritos!');
    }
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

  // Open Customization Modal
  const handleOpenCustomization = (product, e) => {
    if (e) e.stopPropagation();
    setCustomizingProduct(product);
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
    if (!customizingProduct) return;
    const existingIndex = cart.findIndex(
      item => item.id === customizingProduct.id && JSON.stringify(item.extras) === JSON.stringify(selectedExtras)
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += modalQuantity;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          ...customizingProduct,
          extras: [...selectedExtras],
          quantity: modalQuantity
        }
      ]);
    }

    setCustomizingProduct(null);
    showToast(`🍗 ¡${customizingProduct.name} agregada al carrito!`);
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
      showToast(`🎟️ Cupón ${found.code} aplicado con éxito (-${found.amount}${found.type === 'percent' ? '%' : '$'})`);
    } else {
      showToast('❌ Cupón no válido. Prueba RAPID2X1 o SPICY30');
    }
  };

  // Checkout Simulation
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
        step: 0,
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

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const popularCombos = products.slice(0, 4);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      backgroundColor: '#fbf7f2',
      color: '#1a1614',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* ============================================================== */}
      {/* 1. MOCKUP NATIVE STATUS BAR (9:41, Cellular, Wifi, Battery) */}
      {/* ============================================================== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 22px 4px',
        fontSize: '0.82rem',
        fontWeight: '700',
        color: '#1a1614',
        userSelect: 'none',
        flexShrink: 0
      }}>
        <span>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem' }}>📶</span>
          <span style={{ fontSize: '0.8rem' }}>📡</span>
          <span style={{ fontSize: '0.9rem' }}>🔋</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TOAST NOTIFICATION */}
      {/* ============================================================== */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '48px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1a1614',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '30px',
          fontSize: '0.85rem',
          fontWeight: '700',
          zIndex: 99999,
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TOP ACTION BAR (Menu, Greeting, Bell, Bag) */}
      {/* ============================================================== */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 18px 14px',
        flexShrink: 0
      }}>
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsSideMenuOpen(true)}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #f0ebe4',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
          aria-label="Abrir menú"
        >
          <div style={{ width: '18px', height: '2.5px', background: '#1a1614', borderRadius: '2px' }}></div>
          <div style={{ width: '12px', height: '2.5px', background: '#1a1614', borderRadius: '2px', alignSelf: 'flex-start', marginLeft: '12px' }}></div>
          <div style={{ width: '18px', height: '2.5px', background: '#1a1614', borderRadius: '2px' }}></div>
        </button>

        {/* Center Greeting & Motto */}
        <div style={{ flex: 1, padding: '0 14px' }}>
          <div style={{ fontSize: '0.75rem', color: '#78716c', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Hi, Chicken Lover! <span>👋</span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1a1614', lineHeight: '1.2' }}>
            Crispy. Juicy.<br />Always Delicious.
          </div>
        </div>

        {/* Action Icons: Notification Bell & Shopping Bag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Bell with Badge */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #f0ebe4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
            aria-label="Notificaciones"
          >
            <span>🔔</span>
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: '#e03e1a',
              color: '#ffffff',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              fontSize: '0.62rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {notifications.filter(n => n.unread).length}
            </span>
          </button>

          {/* Cart Bag with Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #f0ebe4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
            aria-label="Carrito"
          >
            <span>🛍️</span>
            {totalCartItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: '#e03e1a',
                color: '#ffffff',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                fontSize: '0.62rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 4. MAIN SCROLLABLE CONTENT */}
      {/* ============================================================== */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 18px 85px',
        WebkitOverflowScrolling: 'touch'
      }} className="no-scrollbar">

        {/* ---------------- SEARCH & FILTER BAR ---------------- */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '18px'
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '12px 14px',
            border: '1px solid #f0ebe4',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <span style={{ fontSize: '1rem', color: '#78716c', marginRight: '10px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search for your favorite chicken, burger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.88rem',
                color: '#1a1614',
                fontWeight: '500'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: '#a8a29e', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Equalizer Filter Button */}
          <button
            onClick={() => setActiveTab('menu')}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: '#ffffff',
              border: '1px solid #f0ebe4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}
            aria-label="Filtros"
          >
            <span>⚙️</span>
          </button>
        </div>

        {/* ---------------- TAB ROUTING VIEW ---------------- */}
        {activeTab === 'home' && (
          <div className="fade-in">
            {/* ============================================================== */}
            {/* FEATURED HERO CAROUSEL BANNER */}
            {/* ============================================================== */}
            <div style={{
              background: 'linear-gradient(135deg, #670909 0%, #350404 100%)',
              borderRadius: '24px',
              padding: '22px 20px',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 28px rgba(103, 9, 9, 0.28)',
              marginBottom: '22px',
              minHeight: '190px'
            }}>
              {/* Radial Glow Overlay */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(224, 62, 26, 0.45) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}></div>

              {/* Banner Left Content */}
              <div style={{ position: 'relative', zIndex: 2, maxWidth: '58%' }}>
                <span style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.16)',
                  backdropFilter: 'blur(4px)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: '800',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  letterSpacing: '0.05em',
                  marginBottom: '10px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  HOT & CRISPY
                </span>

                <h2 style={{
                  fontSize: '1.35rem',
                  fontWeight: '800',
                  lineHeight: '1.15',
                  marginBottom: '6px',
                  letterSpacing: '-0.02em'
                }}>
                  Crave the<br />Crispy<br />Perfection!
                </h2>

                <p style={{
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.82)',
                  marginBottom: '16px',
                  lineHeight: '1.3'
                }}>
                  Hand-breaded. Freshly cooked. Every time.
                </p>

                <button
                  onClick={() => handleOpenCustomization(DEFAULT_PRODUCTS[0])}
                  style={{
                    background: 'linear-gradient(135deg, #e03e1a, #c43212)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(224, 62, 26, 0.4)'
                  }}
                >
                  <span>Order Now</span>
                  <span>➔</span>
                </button>
              </div>

              {/* Banner Right Food Image */}
              <div style={{
                position: 'absolute',
                right: '-15px',
                bottom: '-10px',
                width: '185px',
                height: '180px',
                zIndex: 1
              }}>
                <img
                  src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80"
                  alt="Crispy Chicken"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.6))'
                  }}
                />
              </div>

              {/* Carousel Dots */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '6px',
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3
              }}>
                <div style={{ width: '16px', height: '4px', background: '#e03e1a', borderRadius: '4px' }}></div>
                <div style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%' }}></div>
                <div style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%' }}></div>
                <div style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%' }}></div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* HORIZONTAL CATEGORY CIRCLES */}
            {/* ============================================================== */}
            <div style={{
              display: 'flex',
              gap: '14px',
              overflowX: 'auto',
              paddingBottom: '10px',
              marginBottom: '22px'
            }} className="no-scrollbar">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: isSelected ? '#feece7' : '#ffffff',
                      border: isSelected ? '2px solid #e03e1a' : '1px solid #f0ebe4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.65rem',
                      boxShadow: isSelected ? '0 4px 14px rgba(224, 62, 26, 0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease'
                    }}>
                      {cat.icon}
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? '800' : '600',
                      color: isSelected ? '#e03e1a' : '#57534e'
                    }}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ============================================================== */}
            {/* POPULAR COMBOS SECTION (Cards identical to reference) */}
            {/* ============================================================== */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1a1614', letterSpacing: '-0.02em' }}>
                  Popular Combos
                </h3>
                <button
                  onClick={() => setActiveTab('menu')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#e03e1a',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  View All ➔
                </button>
              </div>

              {/* Popular Cards Row (Horizontal Scrollable) */}
              <div style={{
                display: 'flex',
                gap: '14px',
                overflowX: 'auto',
                paddingBottom: '8px'
              }} className="no-scrollbar">
                {popularCombos.map(item => {
                  const isFav = favorites.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenCustomization(item)}
                      style={{
                        minWidth: '165px',
                        maxWidth: '175px',
                        background: '#ffffff',
                        borderRadius: '20px',
                        padding: '12px',
                        border: '1px solid #f0ebe4',
                        boxShadow: '0 4px 14px rgba(30, 20, 10, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        position: 'relative',
                        flexShrink: 0,
                        transition: 'transform 0.18s ease'
                      }}
                    >
                      {/* Top Row: Badge & Heart */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{
                          background: item.tagColor || '#d32f2f',
                          color: '#ffffff',
                          fontSize: '0.62rem',
                          fontWeight: '800',
                          padding: '3px 7px',
                          borderRadius: '6px',
                          textTransform: 'uppercase'
                        }}>
                          {item.tag || 'HOT'}
                        </span>
                        <button
                          onClick={(e) => toggleFavorite(item.id, e)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                          aria-label="Favorito"
                        >
                          {isFav ? '❤️' : '🤍'}
                        </button>
                      </div>

                      {/* Food Image */}
                      <div style={{ height: '95px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            maxHeight: '90px',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.12))'
                          }}
                        />
                      </div>

                      {/* Title & Subtitle */}
                      <div>
                        <div style={{
                          fontSize: '0.88rem',
                          fontWeight: '800',
                          color: '#1a1614',
                          lineHeight: '1.2',
                          marginBottom: '3px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.name}
                        </div>
                        <div style={{
                          fontSize: '0.68rem',
                          color: '#78716c',
                          marginBottom: '6px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.subtitle || item.description}
                        </div>

                        {/* Star Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', marginBottom: '10px' }}>
                          <span style={{ color: '#f59e0b' }}>★★★★★</span>
                          <span style={{ fontWeight: '700', color: '#1a1614' }}>{item.rating || 4.8}</span>
                          <span style={{ color: '#a8a29e' }}>({item.reviews || 180})</span>
                        </div>
                      </div>

                      {/* Price & Add (+) Button */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '6px',
                        borderTop: '1px solid #f5efe8'
                      }}>
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: '#1a1614' }}>
                          ${item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={(e) => handleOpenCustomization(item, e)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: '#e03e1a',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '1.15rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 3px 8px rgba(224, 62, 26, 0.35)'
                          }}
                          aria-label="Agregar"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ============================================================== */}
            {/* SECONDARY PROMO BANNER (Spicy Deals 30% OFF) */}
            {/* ============================================================== */}
            <div style={{
              background: '#fff2ec',
              border: '1px solid #fedecd',
              borderRadius: '22px',
              padding: '18px 20px',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 6px 18px rgba(224, 62, 26, 0.06)'
            }}>
              <div style={{ zIndex: 2, maxWidth: '62%' }}>
                <span style={{
                  color: '#e03e1a',
                  fontWeight: '800',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '4px'
                }}>
                  Spicy Deals 🔥
                </span>

                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  color: '#1a1614',
                  lineHeight: '1.15',
                  marginBottom: '4px'
                }}>
                  Up to 30% OFF
                </h3>

                <p style={{ fontSize: '0.75rem', color: '#78716c', marginBottom: '14px' }}>
                  On selected combos & burgers
                </p>

                <button
                  onClick={() => handleApplyCoupon('SPICY30')}
                  style={{
                    background: '#e03e1a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '7px 14px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 4px 10px rgba(224, 62, 26, 0.3)'
                  }}
                >
                  <span>Order Now</span>
                  <span>➔</span>
                </button>
              </div>

              {/* 30% OFF Circle Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#d32f2f',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '0.75rem',
                lineHeight: '1',
                zIndex: 3,
                boxShadow: '0 4px 10px rgba(211, 47, 47, 0.35)'
              }}>
                <span>30%</span>
                <span style={{ fontSize: '0.55rem', fontWeight: '700' }}>OFF</span>
              </div>

              {/* Burger Photo Cutout */}
              <div style={{
                position: 'absolute',
                right: '-10px',
                bottom: '-12px',
                width: '155px',
                height: '140px',
                zIndex: 1
              }}>
                <img
                  src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80"
                  alt="Spicy Burger"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAB 2: MENU CATALOG ---------------- */}
        {activeTab === 'menu' && (
          <div className="fade-in">
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a1614' }}>Menú Gourmet Completo</h2>
              <p style={{ fontSize: '0.8rem', color: '#78716c' }}>Pollo crispy, hamburguesas Angus a la leña y combos express.</p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px' }} className="no-scrollbar">
              {['All', 'Buckets', 'Burgers', 'Tenders', 'Sides', 'Drinks'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: selectedCategory === cat ? '1px solid #e03e1a' : '1px solid #f0ebe4',
                    background: selectedCategory === cat ? '#e03e1a' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#57534e',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat === 'All' ? 'Todos' : cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {filteredProducts.map(p => {
                const isFav = favorites.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleOpenCustomization(p)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      padding: '12px',
                      border: '1px solid #f0ebe4',
                      boxShadow: '0 4px 14px rgba(30,20,10,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{
                        background: p.tagColor || '#ea580c',
                        color: '#ffffff',
                        fontSize: '0.58rem',
                        fontWeight: '800',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {p.tag || p.category}
                      </span>
                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        {isFav ? '❤️' : '🤍'}
                      </button>
                    </div>

                    <div style={{ height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a1614', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#78716c', marginBottom: '6px', height: '16px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.subtitle || p.description}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #f5efe8' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1a1614' }}>
                        ${p.price.toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => handleOpenCustomization(p, e)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#e03e1a',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '1.1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- TAB 3: ORDERS TRACKING ---------------- */}
        {activeTab === 'ordenes' && (
          <div className="fade-in">
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a1614' }}>Seguimiento & Órdenes</h2>
              <p style={{ fontSize: '0.8rem', color: '#78716c' }}>Monitoreo en tiempo real con entrega garantizada en 20 minutos.</p>
            </div>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: '20px', border: '1px solid #f0ebe4' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📦</div>
                <h4 style={{ color: '#1a1614', fontWeight: '800' }}>No tienes órdenes activas</h4>
                <p style={{ color: '#78716c', fontSize: '0.85rem', margin: '8px 0 18px' }}>Descubre nuestros combos y realiza tu primera simulación.</p>
                <button
                  onClick={() => setActiveTab('home')}
                  style={{ background: '#e03e1a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Explorar Menú
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {orders.map((order, idx) => (
                  <div
                    key={order.id || idx}
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      border: '1px solid #f0ebe4',
                      padding: '18px',
                      boxShadow: '0 4px 14px rgba(30,20,10,0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1a1614' }}>Orden {order.id}</span>
                        <div style={{ fontSize: '0.72rem', color: '#78716c' }}>{order.createdAt} &bull; {order.address}</div>
                      </div>
                      <span style={{
                        background: order.step === 3 ? '#dcfce7' : '#fff1ed',
                        color: order.step === 3 ? '#166534' : '#e03e1a',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        border: `1px solid ${order.step === 3 ? '#bbf7d0' : '#fed7cc'}`
                      }}>
                        {order.statusText}
                      </span>
                    </div>

                    {/* Stepper */}
                    <div style={{ background: '#faf6f0', padding: '12px', borderRadius: '14px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.68rem', fontWeight: '700', color: '#78716c' }}>
                        <span style={{ color: order.step >= 0 ? '#e03e1a' : '#a8a29e' }}>1. Recibido</span>
                        <span style={{ color: order.step >= 1 ? '#e03e1a' : '#a8a29e' }}>2. Cocina</span>
                        <span style={{ color: order.step >= 2 ? '#e03e1a' : '#a8a29e' }}>3. En camino</span>
                        <span style={{ color: order.step >= 3 ? '#16a34a' : '#a8a29e' }}>4. Entregado</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e7ded4', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${((order.step + 1) / 4) * 100}%`,
                          height: '100%',
                          background: order.step === 3 ? '#16a34a' : 'linear-gradient(90deg, #f59e0b, #e03e1a)',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ borderTop: '1px dashed #f0ebe4', paddingTop: '10px', marginBottom: '12px' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                          <span style={{ color: '#44403c' }}>
                            <strong>{item.quantity}x</strong> {item.name} {item.extras && item.extras.length > 0 ? `(+${item.extras.join(', ')})` : ''}
                          </span>
                          <span style={{ fontWeight: '700', color: '#1a1614' }}>
                            ${((item.price || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f5efe8' }}>
                      <div>
                        <small style={{ fontSize: '0.68rem', color: '#78716c', fontWeight: '700' }}>TOTAL</small>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#e03e1a' }}>
                          ${parseFloat(order.total || 0).toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAdvanceOrderStatus(order.id)}
                        style={{
                          background: '#fbf7f2',
                          border: '1px solid #e2d9cf',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          color: '#1a1614',
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

        {/* ---------------- TAB 4: OFFERS & COUPONS ---------------- */}
        {activeTab === 'ofertas' && (
          <div className="fade-in">
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a1614' }}>Cupones & Promociones</h2>
              <p style={{ fontSize: '0.8rem', color: '#78716c' }}>Aplica descuentos comerciales directos a tu carrito.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {OFFERS.map(offer => (
                <div
                  key={offer.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: `1px solid ${offer.border}`,
                    padding: '16px',
                    boxShadow: '0 4px 12px rgba(30,20,10,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: offer.bg, color: '#9a3412', fontSize: '0.72rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${offer.border}` }}>
                      {offer.tag}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: '800', color: '#c2410c', background: '#faf6f0', padding: '2px 8px', borderRadius: '6px', border: '1px dashed #fed7cc' }}>
                      {offer.code}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1a1614', marginBottom: '4px' }}>
                    {offer.title}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#78716c', marginBottom: '14px' }}>
                    {offer.discountDesc}
                  </p>

                  <button
                    onClick={() => {
                      handleApplyCoupon(offer.code);
                      setIsCartOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: appliedCoupon?.code === offer.code ? '#16a34a' : '#e03e1a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    {appliedCoupon?.code === offer.code ? '✅ Cupón Aplicado' : '🎟️ Aplicar Cupón al Carrito'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- TAB 5: USER PROFILE ---------------- */}
        {activeTab === 'perfil' && (
          <div className="fade-in">
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #f0ebe4',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(30,20,10,0.03)',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#feece7',
                border: '2px solid #fed7cc',
                margin: '0 auto 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem'
              }}>
                👨‍💻
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1a1614' }}>{userProfile.name}</h3>
              <p style={{ fontSize: '0.8rem', color: '#78716c', marginBottom: '12px' }}>{userProfile.email}</p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#feece7',
                border: '1px solid #fed7cc',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: '800',
                color: '#c2410c'
              }}>
                <span>Rapid Rewards:</span>
                <span>{userProfile.tier}</span>
                <span>&bull; {userProfile.points} Pts</span>
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f0ebe4', padding: '16px', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a1614', marginBottom: '6px' }}>
                📍 Dirección de Entrega
              </div>
              <p style={{ fontSize: '0.82rem', color: '#57534e', marginBottom: '8px' }}>{userProfile.address}</p>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '700' }}>
                ✓ Cobertura Express en 20 Minutos Activa
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f0ebe4', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a1614', marginBottom: '6px' }}>
                💳 Método de Pago
              </div>
              <div style={{ fontSize: '0.82rem', color: '#57534e' }}>
                {userProfile.paymentMethod}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="/"
                style={{
                  background: '#ffffff',
                  border: '1px solid #f0ebe4',
                  color: '#1a1614',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>🌐 Volver a Landing E-commerce</span>
                <span>➔</span>
              </a>

              <a
                href="/admin"
                style={{
                  background: 'linear-gradient(135deg, #e03e1a, #b43010)',
                  color: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>⚙️ Panel Administrativo</span>
                <span>➔</span>
              </a>
            </div>
          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* 5. DOCKED BOTTOM NAVIGATION (Home, Menu, Orders Center, Offers, Profile) */}
      {/* ============================================================== */}
      <nav style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#ffffff',
        borderTop: '1px solid #f0ebe4',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 10px 14px',
        boxShadow: '0 -4px 18px rgba(0,0,0,0.05)',
        zIndex: 100
      }}>
        {/* Tab 1: Home */}
        <button
          onClick={() => setActiveTab('home')}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            color: activeTab === 'home' ? '#e03e1a' : '#78716c',
            flex: 1
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>🏠</span>
          <span style={{ fontSize: '0.72rem', fontWeight: activeTab === 'home' ? '800' : '600' }}>Home</span>
        </button>

        {/* Tab 2: Menu */}
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            color: activeTab === 'menu' ? '#e03e1a' : '#78716c',
            flex: 1
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>⊞</span>
          <span style={{ fontSize: '0.72rem', fontWeight: activeTab === 'menu' ? '800' : '600' }}>Menu</span>
        </button>

        {/* Tab 3: Center Elevated Orders Action */}
        <button
          onClick={() => setActiveTab('ordenes')}
          style={{
            background: activeTab === 'ordenes' ? '#e03e1a' : '#e03e1a',
            border: 'none',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ffffff',
            boxShadow: '0 6px 18px rgba(224, 62, 26, 0.45)',
            transform: 'translateY(-12px)',
            transition: 'transform 0.18s ease'
          }}
          aria-label="Órdenes"
        >
          <span style={{ fontSize: '1.3rem' }}>📄</span>
          <span style={{ fontSize: '0.58rem', fontWeight: '800' }}>Orders</span>
        </button>

        {/* Tab 4: Offers */}
        <button
          onClick={() => setActiveTab('ofertas')}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            color: activeTab === 'ofertas' ? '#e03e1a' : '#78716c',
            flex: 1
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>🏷️</span>
          <span style={{ fontSize: '0.72rem', fontWeight: activeTab === 'ofertas' ? '800' : '600' }}>Offers</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => setActiveTab('perfil')}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            color: activeTab === 'perfil' ? '#e03e1a' : '#78716c',
            flex: 1
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>👤</span>
          <span style={{ fontSize: '0.72rem', fontWeight: activeTab === 'perfil' ? '800' : '600' }}>Profile</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* 6. PRODUCT CUSTOMIZATION MODAL */}
      {/* ============================================================== */}
      {customizingProduct && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(26, 22, 20, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 500,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            borderTopLeftRadius: '26px',
            borderTopRightRadius: '26px',
            padding: '22px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '85vh',
            overflowY: 'auto'
          }} className="slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span style={{ background: '#feece7', color: '#c2410c', fontSize: '0.68rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                  {customizingProduct.tag || customizingProduct.category}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a1614', marginTop: '6px' }}>
                  {customizingProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setCustomizingProduct(null)}
                style={{ background: '#f5efe8', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#78716c', marginBottom: '18px', lineHeight: '1.4' }}>
              {customizingProduct.description}
            </p>

            {/* Extras Selection */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a1614', marginBottom: '8px' }}>
                Personaliza tus Extras Gourmet:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Extra Salsa BBQ al Bourbon', price: 1.20 },
                  { name: 'Dip de Queso Azul Cremoso', price: 1.50 },
                  { name: 'Papas Rústicas Extra Grandes', price: 2.00 },
                  { name: 'Extra Queso Cheddar Fundido', price: 1.50 }
                ].map(extra => (
                  <label
                    key={extra.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: selectedExtras.includes(extra.name) ? '1px solid #e03e1a' : '1px solid #f0ebe4',
                      background: selectedExtras.includes(extra.name) ? '#fff6f4' : '#faf7f3',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: '600', color: '#1a1614' }}>
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes(extra.name)}
                        onChange={() => toggleExtra(extra.name)}
                      />
                      <span>{extra.name}</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#e03e1a' }}>
                      +${extra.price.toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1a1614' }}>Cantidad:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #e2d9cf', background: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1a1614' }}>{modalQuantity}</span>
                <button
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #e2d9cf', background: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={confirmAddToCart}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #e03e1a, #c43212)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(224, 62, 26, 0.35)'
              }}
            >
              Añadir al Carrito &bull; ${((customizingProduct.price + selectedExtras.length * 1.50) * modalQuantity).toFixed(2)}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. CART & CHECKOUT DRAWER */}
      {/* ============================================================== */}
      {isCartOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(26, 22, 20, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 600,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            borderTopLeftRadius: '26px',
            borderTopRightRadius: '26px',
            padding: '22px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }} className="slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🛍️</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a1614' }}>Mi Carrito Express</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ background: '#f5efe8', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}
              >
                &times;
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '35px 15px' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '8px' }}>🍗</div>
                  <div style={{ fontWeight: '800', color: '#1a1614' }}>Tu carrito está vacío</div>
                  <p style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '4px' }}>Elige tus combos favoritos del menú.</p>
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
                        padding: '12px',
                        background: '#faf7f3',
                        borderRadius: '14px',
                        border: '1px solid #f0ebe4'
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: '8px' }}>
                        <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#1a1614' }}>{item.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#e03e1a', fontWeight: '700' }}>
                          ${item.price.toFixed(2)} c/u
                        </div>
                        {item.extras && item.extras.length > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#78716c' }}>
                            +{item.extras.join(', ')}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleUpdateQuantity(index, -1)}
                          style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #e2d9cf', background: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1a1614', minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(index, 1)}
                          style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #e2d9cf', background: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon Input */}
              {cart.length > 0 && (
                <div style={{ background: '#faf6f0', padding: '12px', borderRadius: '14px', border: '1px solid #f0ebe4', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1a1614', marginBottom: '6px' }}>
                    ¿Tienes un cupón de descuento?
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="Ej: SPICY30 o RAPID2X1"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid #e2d9cf',
                        fontSize: '0.82rem',
                        textTransform: 'uppercase'
                      }}
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      style={{
                        background: '#1a1614',
                        color: 'white',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Aplicar
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '700', marginTop: '6px' }}>
                      ✓ Cupón <strong>{appliedCoupon.code}</strong> aplicado con éxito
                    </div>
                  )}
                </div>
              )}

              {/* Tip Selection */}
              {cart.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78716c', marginBottom: '6px' }}>
                    Propina voluntaria para el repartidor express:
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[0, 10, 15, 20].map(pct => (
                      <button
                        key={pct}
                        onClick={() => setTipPercent(pct)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '10px',
                          border: tipPercent === pct ? '1px solid #e03e1a' : '1px solid #e2d9cf',
                          background: tipPercent === pct ? '#feece7' : '#ffffff',
                          color: tipPercent === pct ? '#e03e1a' : '#57534e',
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

              {/* Totals */}
              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid #f0ebe4', paddingTop: '10px', fontSize: '0.82rem', color: '#57534e', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '700' }}>
                      <span>Descuento ({appliedCoupon.code}):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Envío Express 20 min:</span>
                    <span>{deliveryFee === 0 ? 'GRATIS' : `$${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Propina ({tipPercent}%):</span>
                    <span>${tipAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', color: '#1a1614', paddingTop: '8px', borderTop: '1px solid #e2d9cf', marginTop: '4px' }}>
                    <span>TOTAL:</span>
                    <span style={{ color: '#e03e1a' }}>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ paddingTop: '14px' }}>
                <button
                  onClick={handleSimulateCheckout}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #e03e1a, #c43212)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(224, 62, 26, 0.4)',
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
      {/* 8. NOTIFICATIONS DRAWER */}
      {/* ============================================================== */}
      {isNotificationsOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(26, 22, 20, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 600,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            borderBottomLeftRadius: '24px',
            borderBottomRightRadius: '24px',
            padding: '22px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
          }} className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔔</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1a1614' }}>Notificaciones</h3>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                style={{ background: '#f5efe8', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map(n => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    background: n.unread ? '#fff6f4' : '#faf7f3',
                    border: n.unread ? '1px solid #fed7cc' : '1px solid #f0ebe4'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a1614' }}>{n.title}</span>
                    <span style={{ fontSize: '0.68rem', color: '#a8a29e' }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#57534e' }}>{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. SIDE MENU DRAWER */}
      {/* ============================================================== */}
      {isSideMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(26, 22, 20, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 700,
          display: 'flex',
          justifyContent: 'flex-start'
        }}>
          <div style={{
            background: '#ffffff',
            width: '80%',
            maxWidth: '320px',
            height: '100%',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '4px 0 24px rgba(0,0,0,0.15)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#feece7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    🍔
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#1a1614' }}>Hamburger Rapid</div>
                    <div style={{ fontSize: '0.7rem', color: '#e03e1a', fontWeight: '700' }}>Crispy & Gourmet</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsSideMenuOpen(false)}
                  style={{ background: '#f5efe8', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}
                >
                  &times;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => { setActiveTab('home'); setIsSideMenuOpen(false); }}
                  style={{ textAlign: 'left', background: 'transparent', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', color: '#1a1614', cursor: 'pointer', display: 'flex', gap: '10px' }}
                >
                  <span>🏠</span> Inicio
                </button>
                <button
                  onClick={() => { setActiveTab('menu'); setIsSideMenuOpen(false); }}
                  style={{ textAlign: 'left', background: 'transparent', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', color: '#1a1614', cursor: 'pointer', display: 'flex', gap: '10px' }}
                >
                  <span>⊞</span> Menú Completo
                </button>
                <button
                  onClick={() => { setActiveTab('ordenes'); setIsSideMenuOpen(false); }}
                  style={{ textAlign: 'left', background: 'transparent', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', color: '#1a1614', cursor: 'pointer', display: 'flex', gap: '10px' }}
                >
                  <span>📦</span> Mis Órdenes
                </button>
                <button
                  onClick={() => { setActiveTab('ofertas'); setIsSideMenuOpen(false); }}
                  style={{ textAlign: 'left', background: 'transparent', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', color: '#1a1614', cursor: 'pointer', display: 'flex', gap: '10px' }}
                >
                  <span>🎟️</span> Cupones & Ofertas
                </button>
                <button
                  onClick={() => { setActiveTab('perfil'); setIsSideMenuOpen(false); }}
                  style={{ textAlign: 'left', background: 'transparent', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', color: '#1a1614', cursor: 'pointer', display: 'flex', gap: '10px' }}
                >
                  <span>👤</span> Perfil de Usuario
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f0ebe4', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="/"
                style={{ textDecoration: 'none', padding: '10px', background: '#faf7f3', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '700', color: '#1a1614', textAlign: 'center' }}
              >
                🌐 Ir al Sitio E-commerce
              </a>
              <a
                href="/admin"
                style={{ textDecoration: 'none', padding: '10px', background: '#e03e1a', color: '#ffffff', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '700', textAlign: 'center' }}
              >
                ⚙️ Panel Administrativo
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
