const mysql = require('mysql2/promise');

// 10 Variantes Destacadas de "Hamburger Rapid"
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Rey de las Burgers',
    category: 'Especiales',
    price: 15.90,
    stock: 45,
    specialty: 'Signature Master',
    badgeColor: '#b45309',
    calories: '920 kcal',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    description: 'La corona de la casa: doble medallón 100% Angus flameado a la leña de roble, queso cheddar añejo 12 meses, cebolla caramelizada al bourbon, bacon ahumado crujiente y salsa secreta del Rey en pan brioche artesanal dorado.',
    isAvailable: true
  },
  {
    id: 2,
    name: 'Burger Real Clásica',
    category: 'Clásicas',
    price: 11.50,
    stock: 60,
    specialty: 'Edición Real',
    badgeColor: '#d97706',
    calories: '680 kcal',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
    description: 'La receta fundacional perfeccionada: medallón de res Angus a la parrilla de carbón, queso americano fundido, pepinillos encurtidos agridulces, lechuga romana tierna, rodajas de tomate maduro y aderezo imperial suave.',
    isAvailable: true
  },
  {
    id: 3,
    name: 'Burger Real Doble',
    category: 'Especiales',
    price: 14.50,
    stock: 38,
    specialty: 'Doble Corona',
    badgeColor: '#ea580c',
    calories: '890 kcal',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    description: 'Doble satisfacción: dos medallones smash de 130g con corteza caramelizada irresistible, doble capa de queso cheddar inglés derretido, cebolla crujiente frita y emulsión de mostaza Dijon antigua.',
    isAvailable: true
  },
  {
    id: 4,
    name: 'Burger Doble Especial',
    category: 'Especiales',
    price: 16.20,
    stock: 32,
    specialty: 'Gran Chef',
    badgeColor: '#c2410c',
    calories: '960 kcal',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&auto=format&fit=crop&q=80',
    description: 'Creación de autor: doble corte de picaña madurada, queso provolone ahumado fundente, mermelada artesanal de tocino al oporto, hojas de rúcula baby seleccionadas y reducción balsámica con miel.',
    isAvailable: true
  },
  {
    id: 5,
    name: 'Burger Trufa Deluxe',
    category: 'Especiales',
    price: 17.50,
    stock: 25,
    specialty: 'Gourmet Supreme',
    badgeColor: '#854d0e',
    calories: '840 kcal',
    image: 'https://images.unsplash.com/photo-1582196016295-f8c8bd4b3e99?w=800&auto=format&fit=crop&q=80',
    description: 'Experiencia de alta cocina: carne Angus prime con infusión de aceite de trufa negra melanosporum, hongos portobello salteados a la manteca francesa, queso brie fundido y rúcula fresca.',
    isAvailable: true
  },
  {
    id: 6,
    name: 'Burger BBQ Ahumada Rapid',
    category: 'Clásicas',
    price: 13.80,
    stock: 50,
    specialty: 'Smokehouse Prime',
    badgeColor: '#b45309',
    calories: '780 kcal',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&auto=format&fit=crop&q=80',
    description: 'Sabor a fogón texano: carne a la leña de nogal con salsa barbacoa artesanal de café y chipotle, queso gouda derretido, aros de cebolla crocantes y pepinillos caseros crujientes.',
    isAvailable: true
  },
  {
    id: 7,
    name: 'Burger Royal Crispy Chicken',
    category: 'Pollo Crispy',
    price: 12.90,
    stock: 45,
    specialty: 'Crispy Especial',
    badgeColor: '#059669',
    calories: '720 kcal',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800&auto=format&fit=crop&q=80',
    description: 'Suprema de pechuga marinada 24h en buttermilk y 11 hierbas aromáticas, rebozado extra crocante, ensalada coleslaw fresca con manzana verde y mayonesa emulsionada de ajo negro.',
    isAvailable: true
  },
  {
    id: 8,
    name: 'Burger Smash Cheddar Melt',
    category: 'Clásicas',
    price: 12.20,
    stock: 55,
    specialty: 'Smash Lovers',
    badgeColor: '#d97706',
    calories: '710 kcal',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&auto=format&fit=crop&q=80',
    description: 'El clásico de culto: dos patties ultrafinos prensados con cebolla juliana caramelizada en plancha de hierro, triple baño de queso cheddar fundido y salsa tártara de la casa en pan de papa suave.',
    isAvailable: true
  },
  {
    id: 9,
    name: 'Burger Spicy Chipotle Fire',
    category: 'Especiales',
    price: 13.50,
    stock: 35,
    specialty: 'Spicy Fire',
    badgeColor: '#dc2626',
    calories: '760 kcal',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&auto=format&fit=crop&q=80',
    description: 'Para amantes de la intensidad: carne Angus con sazón tex-mex picante, queso pepper jack fundido, chiles jalapeños toreados, guacamole cremoso y mayonesa chipotle ahumada.',
    isAvailable: true
  },
  {
    id: 10,
    name: 'Burger Monster Rapid XXL',
    category: 'Especiales',
    price: 18.90,
    stock: 20,
    specialty: 'Legendaria XXL',
    badgeColor: '#7c2d12',
    calories: '1250 kcal',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&auto=format&fit=crop&q=80',
    description: 'El desafío definitivo: triple medallón Angus (450g de carne), cuádruple queso americano y cheddar, doble porción de tocino glaseado en maple, huevo campero a la plancha y salsa Monster de autor.',
    isAvailable: true
  }
];

// Métricas de Consumidores / Clientes según Consumo
const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-001',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tier: 'VIP Gold',
    totalSpent: 348.50,
    ordersCount: 22,
    favoriteBurger: 'Rey de las Burgers',
    lastOrder: 'Hace 2 horas',
    segment: 'Alto Consumo'
  },
  {
    id: 'CUST-002',
    name: 'Sofía Valenzuela',
    email: 'sofia.v@techstudio.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    tier: 'VIP Gold',
    totalSpent: 289.20,
    ordersCount: 18,
    favoriteBurger: 'Burger Doble Especial',
    lastOrder: 'Ayer',
    segment: 'Alto Consumo'
  },
  {
    id: 'CUST-003',
    name: 'Mateo Rodríguez',
    email: 'mateo.dev@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tier: 'Platino',
    totalSpent: 195.40,
    ordersCount: 14,
    favoriteBurger: 'Burger Real Doble',
    lastOrder: 'Hace 2 días',
    segment: 'Consumo Medio-Alto'
  },
  {
    id: 'CUST-004',
    name: 'Valentina Herrera',
    email: 'vale.herrera@agencia.cl',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    tier: 'Platino',
    totalSpent: 168.00,
    ordersCount: 11,
    favoriteBurger: 'Burger Trufa Deluxe',
    lastOrder: 'Hace 3 días',
    segment: 'Consumo Medio-Alto'
  },
  {
    id: 'CUST-005',
    name: 'Diego Torres',
    email: 'diego.torres@startup.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    tier: 'Frecuente',
    totalSpent: 98.70,
    ordersCount: 7,
    favoriteBurger: 'Burger Real Clásica',
    lastOrder: 'Hace 4 días',
    segment: 'Consumo Regular'
  },
  {
    id: 'CUST-006',
    name: 'Camila Silva',
    email: 'camila.silva@uai.edu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    tier: 'Frecuente',
    totalSpent: 84.50,
    ordersCount: 6,
    favoriteBurger: 'Burger Royal Crispy Chicken',
    lastOrder: 'Hace 5 días',
    segment: 'Consumo Regular'
  },
  {
    id: 'CUST-007',
    name: 'Lucas Navas',
    email: 'lucas.n@freelance.net',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    tier: 'Ocasional',
    totalSpent: 35.80,
    ordersCount: 2,
    favoriteBurger: 'Burger Smash Cheddar Melt',
    lastOrder: 'Hace 1 semana',
    segment: 'Nuevo / Ocasional'
  }
];

// Órdenes simuladas iniciales
const INITIAL_ORDERS = [
  {
    id: 'HR-1092',
    customerName: 'Carlos Mendoza',
    items: [
      { name: 'Rey de las Burgers', quantity: 2, price: 15.90 },
      { name: 'Papas Rústicas Trufadas', quantity: 1, price: 4.50 }
    ],
    total: 36.30,
    status: 'Preparando en cocina 👨‍🍳',
    channel: 'PWA Mobile',
    address: 'Av. Las Condes #1240, Dpto 804',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 'HR-1091',
    customerName: 'Sofía Valenzuela',
    items: [
      { name: 'Burger Doble Especial', quantity: 1, price: 16.20 },
      { name: 'Bebida Artesanal', quantity: 1, price: 2.80 }
    ],
    total: 19.00,
    status: 'En camino con repartidor 🛵',
    channel: 'PWA Mobile',
    address: 'Calle Nueva Providencia #190',
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString()
  },
  {
    id: 'HR-1090',
    customerName: 'Mateo Rodríguez',
    items: [
      { name: 'Burger Real Doble', quantity: 1, price: 14.50 },
      { name: 'Burger Real Clásica', quantity: 1, price: 11.50 }
    ],
    total: 26.00,
    status: 'Entregado con éxito ✅',
    channel: 'Web E-commerce',
    address: 'Vitacura #3200, Of 401',
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString()
  }
];

let inMemoryProducts = [...INITIAL_PRODUCTS];
let inMemoryCustomers = [...INITIAL_CUSTOMERS];
let inMemoryOrders = [...INITIAL_ORDERS];
let pool = null;
let isConnectedToMySQL = false;
let lastDbError = null;

async function initDB() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'pablovaldivia';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'demo';
  const databaseUrl = process.env.DATABASE_URL;

  try {
    if (databaseUrl) {
      console.log(`🔄 [DB] Intentando conectar a MySQL vía DATABASE_URL...`);
      pool = mysql.createPool(databaseUrl);
    } else {
      console.log(`🔄 [DB] Intentando conectar a MySQL en ${host}:${port} con usuario "${user}" a la BD "${database}"...`);
      pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 4000
      });
    }

    const connection = await pool.getConnection();
    console.log(`✅ [DB] Conectado exitosamente a MySQL (${host || 'URL'} - BD: ${database})`);

    // Crear tabla si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        specialty VARCHAR(100),
        badgeColor VARCHAR(20),
        calories VARCHAR(50),
        image VARCHAR(500),
        description TEXT,
        isAvailable BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inicializar productos si la tabla está vacía
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      console.log('🌱 [DB] Inicializando catálogo de Hamburger Rapid (10 variantes)...');
      for (const p of INITIAL_PRODUCTS) {
        await connection.query(
          'INSERT INTO products (name, category, price, stock, specialty, badgeColor, calories, image, description, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [p.name, p.category, p.price, p.stock, p.specialty, p.badgeColor, p.calories, p.image, p.description, p.isAvailable]
        );
      }
    }

    connection.release();
    isConnectedToMySQL = true;
    lastDbError = null;
  } catch (error) {
    lastDbError = error.message;
    console.warn(`⚠️ [DB] Operando en modo In-Memory para desarrollo rápido: ${error.message}`);
    isConnectedToMySQL = false;
  }
}

async function getProducts() {
  if (!isConnectedToMySQL && (process.env.DB_HOST || process.env.DATABASE_URL)) {
    await initDB();
  }

  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM products ORDER BY id ASC');
      return rows;
    } catch (err) {
      console.error('Error consultando MySQL, recurriendo a memoria temporal:', err.message);
      lastDbError = err.message;
    }
  }
  return inMemoryProducts;
}

async function addProduct({ name, category, price, stock, specialty, badgeColor, calories, image, description }) {
  const newProduct = {
    id: Date.now(),
    name,
    category: category || 'Especiales',
    price: parseFloat(price) || 0,
    stock: parseInt(stock, 10) || 30,
    specialty: specialty || 'Chef Signature',
    badgeColor: badgeColor || '#d97706',
    calories: calories || '750 kcal',
    image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    description: description || 'Hamburguesa gourmet artesanal preparada al momento.',
    isAvailable: true
  };

  if (isConnectedToMySQL && pool) {
    try {
      const [result] = await pool.query(
        'INSERT INTO products (name, category, price, stock, specialty, badgeColor, calories, image, description, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newProduct.name, newProduct.category, newProduct.price, newProduct.stock, newProduct.specialty, newProduct.badgeColor, newProduct.calories, newProduct.image, newProduct.description, newProduct.isAvailable]
      );
      newProduct.id = result.insertId;
      return newProduct;
    } catch (err) {
      console.error('Error insertando en MySQL, guardando en memoria:', err.message);
    }
  }

  inMemoryProducts.push(newProduct);
  return newProduct;
}

async function toggleProductAvailability(id) {
  const numId = parseInt(id, 10);
  const prod = inMemoryProducts.find(p => p.id === numId);
  if (prod) {
    prod.isAvailable = !prod.isAvailable;
    return prod;
  }
  return null;
}

async function deleteProduct(id) {
  const numId = parseInt(id, 10);
  if (isConnectedToMySQL && pool) {
    try {
      await pool.query('DELETE FROM products WHERE id = ?', [numId]);
      return true;
    } catch (err) {
      console.error('Error eliminando en MySQL:', err.message);
    }
  }
  inMemoryProducts = inMemoryProducts.filter(p => p.id !== numId);
  return true;
}

async function resetProducts() {
  if (isConnectedToMySQL && pool) {
    try {
      await pool.query('TRUNCATE TABLE products');
      for (const p of INITIAL_PRODUCTS) {
        await pool.query(
          'INSERT INTO products (name, category, price, stock, specialty, badgeColor, calories, image, description, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [p.name, p.category, p.price, p.stock, p.specialty, p.badgeColor, p.calories, p.image, p.description, p.isAvailable]
        );
      }
      return;
    } catch (err) {
      console.error('Error reseteando en MySQL:', err.message);
    }
  }
  inMemoryProducts = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
}

// Métricas de Consumidores
function getConsumerMetrics() {
  const totalRevenue = inMemoryCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
  const totalOrders = inMemoryCustomers.reduce((acc, c) => acc + c.ordersCount, 0);
  const avgTicket = (totalRevenue / (totalOrders || 1)).toFixed(2);

  // Clasificación por nivel de consumo
  const segments = {
    vip: {
      label: 'Consumidores VIP (Gasto > $200)',
      count: inMemoryCustomers.filter(c => c.totalSpent > 200).length,
      revenue: inMemoryCustomers.filter(c => c.totalSpent > 200).reduce((acc, c) => acc + c.totalSpent, 0).toFixed(2),
      percent: '54%'
    },
    platinum: {
      label: 'Consumidores Platino ($100 - $200)',
      count: inMemoryCustomers.filter(c => c.totalSpent >= 100 && c.totalSpent <= 200).length,
      revenue: inMemoryCustomers.filter(c => c.totalSpent >= 100 && c.totalSpent <= 200).reduce((acc, c) => acc + c.totalSpent, 0).toFixed(2),
      percent: '31%'
    },
    regular: {
      label: 'Consumidores Frecuentes & Ocasionales (< $100)',
      count: inMemoryCustomers.filter(c => c.totalSpent < 100).length,
      revenue: inMemoryCustomers.filter(c => c.totalSpent < 100).reduce((acc, c) => acc + c.totalSpent, 0).toFixed(2),
      percent: '15%'
    }
  };

  const channelDistribution = [
    { channel: 'PWA Mobile', share: 68, label: 'App Móvil PWA (Mayor conversión)' },
    { channel: 'Web E-commerce', share: 22, label: 'Portal Web E-commerce' },
    { channel: 'Take-Away / Tienda', share: 10, label: 'Mostrador Express' }
  ];

  return {
    summary: {
      totalCustomers: inMemoryCustomers.length,
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      avgTicket,
      satisfactionRate: '98.8%',
      repeatOrderRate: '78.4%'
    },
    segments,
    topCustomers: inMemoryCustomers,
    channelDistribution
  };
}

// Simulación de Órdenes
function getOrders() {
  return inMemoryOrders;
}

function createOrder(orderData) {
  const newOrder = {
    id: `HR-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: orderData.customerName || 'Cliente PWA',
    items: orderData.items || [],
    total: parseFloat(orderData.total) || 0,
    status: 'Preparando en cocina 👨‍🍳',
    channel: 'PWA Mobile',
    address: orderData.address || 'Entrega estándar',
    coupon: orderData.coupon || null,
    createdAt: new Date().toISOString()
  };

  inMemoryOrders.unshift(newOrder);

  // Actualizar estadísticas del cliente si existe
  const existingCust = inMemoryCustomers.find(c => c.name.toLowerCase() === newOrder.customerName.toLowerCase());
  if (existingCust) {
    existingCust.totalSpent += newOrder.total;
    existingCust.ordersCount += 1;
    existingCust.lastOrder = 'Justo ahora';
  }

  return newOrder;
}

function getDbStatus() {
  return {
    mode: isConnectedToMySQL ? 'mysql' : 'in-memory',
    connected: isConnectedToMySQL,
    host: process.env.DB_HOST || (process.env.DATABASE_URL ? 'via-database-url' : '127.0.0.1 (Localhost)'),
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'hamburger_rapid_db',
    user: process.env.DB_USER || 'root',
    poolConnections: {
      active: isConnectedToMySQL ? 2 : 0,
      idle: isConnectedToMySQL ? 8 : 10,
      totalLimit: 10
    },
    latencyMs: isConnectedToMySQL ? 8 : 1,
    productsCount: inMemoryProducts.length,
    ordersCount: inMemoryOrders.length,
    customersCount: inMemoryCustomers.length,
    health: 'HEALTHY',
    lastBackup: 'Automático en vivo (WAL/Memory)',
    error: lastDbError
  };
}

module.exports = {
  initDB,
  getProducts,
  addProduct,
  toggleProductAvailability,
  deleteProduct,
  resetProducts,
  getConsumerMetrics,
  getOrders,
  createOrder,
  getDbStatus
};
