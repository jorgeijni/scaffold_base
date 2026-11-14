const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

// 10 Variantes Destacadas de "Hamburger Rapid"
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Rey de las Burgers',
    value: 'HR-BUR-001',
    category: 'Especiales',
    category_code: 'CAT-ESP',
    price: 15.90,
    stock: 45,
    specialty: 'Signature Master',
    badgeColor: '#b45309',
    calories: '920 kcal',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    description: 'La corona de la casa: doble medallón 100% Angus flameado a la leña de roble, queso cheddar añejo 12 meses, cebolla caramelizada al bourbon, bacon ahumado crujiente y salsa secreta del Rey en pan brioche artesanal dorado.',
    isAvailable: 1
  },
  {
    id: 2,
    name: 'Burger Real Clásica',
    value: 'HR-BUR-002',
    category: 'Clásicas',
    category_code: 'CAT-CLAS',
    price: 11.50,
    stock: 60,
    specialty: 'Edición Real',
    badgeColor: '#d97706',
    calories: '680 kcal',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
    description: 'La receta fundacional perfeccionada: medallón de res Angus a la parrilla de carbón, queso americano fundido, pepinillos encurtidos agridulces, lechuga romana tierna, rodajas de tomate maduro y aderezo imperial suave.',
    isAvailable: 1
  },
  {
    id: 3,
    name: 'Burger Real Doble',
    value: 'HR-BUR-003',
    category: 'Especiales',
    category_code: 'CAT-ESP',
    price: 14.50,
    stock: 38,
    specialty: 'Doble Corona',
    badgeColor: '#ea580c',
    calories: '890 kcal',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    description: 'Doble satisfacción: dos medallones smash de 130g con corteza caramelizada irresistible, doble capa de queso cheddar inglés derretido, cebolla crujiente frita y emulsión de mostaza Dijon antigua.',
    isAvailable: 1
  },
  {
    id: 4,
    name: 'Burger Doble Especial',
    value: 'HR-BUR-004',
    category: 'Especiales',
    category_code: 'CAT-ESP',
    price: 16.20,
    stock: 32,
    specialty: 'Gran Chef',
    badgeColor: '#c2410c',
    calories: '960 kcal',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&auto=format&fit=crop&q=80',
    description: 'Creación de autor: doble corte de picaña madurada, queso provolone ahumado fundente, mermelada artesanal de tocino al oporto, hojas de rúcula baby seleccionadas y reducción balsámica con miel.',
    isAvailable: 1
  },
  {
    id: 5,
    name: 'Burger Trufa Deluxe',
    value: 'HR-BUR-005',
    category: 'Especiales',
    category_code: 'CAT-ESP',
    price: 17.50,
    stock: 25,
    specialty: 'Gourmet Supreme',
    badgeColor: '#854d0e',
    calories: '840 kcal',
    image: 'https://images.unsplash.com/photo-1582196016295-f8c8bd4b3e99?w=800&auto=format&fit=crop&q=80',
    description: 'Experiencia de alta cocina: carne Angus prime con infusión de aceite de trufa negra melanosporum, hongos portobello salteados a la manteca francesa, queso brie fundido y rúcula fresca.',
    isAvailable: 1
  },
  {
    id: 6,
    name: 'Burger BBQ Ahumada Rapid',
    value: 'HR-BUR-006',
    category: 'Clásicas',
    category_code: 'CAT-CLAS',
    price: 13.80,
    stock: 50,
    specialty: 'Smokehouse Prime',
    badgeColor: '#b45309',
    calories: '780 kcal',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&auto=format&fit=crop&q=80',
    description: 'Sabor a fogón texano: carne a la leña de nogal con salsa barbacoa artesanal de café y chipotle, queso gouda derretido, aros de cebolla crocantes y pepinillos caseros crujientes.',
    isAvailable: 1
  },
  {
    id: 7,
    name: 'Burger Royal Crispy Chicken',
    value: 'HR-BUR-007',
    category: 'Pollo Crispy',
    category_code: 'CAT-POLL',
    price: 12.90,
    stock: 45,
    specialty: 'Crispy Especial',
    badgeColor: '#059669',
    calories: '720 kcal',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800&auto=format&fit=crop&q=80',
    description: 'Suprema de pechuga marinada 24h en buttermilk y 11 hierbas aromáticas, rebozado extra crocante, ensalada coleslaw fresca con manzana verde y mayonesa emulsionada de ajo negro.',
    isAvailable: 1
  },
  {
    id: 8,
    name: 'Burger Smash Cheddar Melt',
    value: 'HR-BUR-008',
    category: 'Clásicas',
    category_code: 'CAT-CLAS',
    price: 12.20,
    stock: 55,
    specialty: 'Smash Lovers',
    badgeColor: '#d97706',
    calories: '710 kcal',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&auto=format&fit=crop&q=80',
    description: 'El clásico de culto: dos patties ultrafinos prensados con cebolla juliana caramelizada en plancha de hierro, triple baño de queso cheddar fundido y salsa tártara de la casa en pan de papa suave.',
    isAvailable: 1
  },
  {
    id: 9,
    name: 'Burger Spicy Chipotle Fire',
    value: 'HR-BUR-009',
    category: 'Especiales',
    category_code: 'CAT-ESP',
    price: 13.50,
    stock: 35,
    specialty: 'Spicy Fire',
    badgeColor: '#dc2626',
    calories: '760 kcal',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&auto=format&fit=crop&q=80',
    description: 'Para amantes de la intensidad: carne Angus con sazón tex-mex picante, queso pepper jack fundido, chiles jalapeños toreados, guacamole cremoso y mayonesa chipotle ahumada.',
    isAvailable: 1
  },
  {
    id: 10,
    name: 'Burger Monster Rapid XXL',
    value: 'HR-BUR-010',
    category: 'Especiales',
    category_code: 'CAT-ESP',
    price: 18.90,
    stock: 20,
    specialty: 'Legendaria XXL',
    badgeColor: '#7c2d12',
    calories: '1250 kcal',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&auto=format&fit=crop&q=80',
    description: 'El desafío definitivo: triple medallón Angus (450g de carne), cuádruple queso americano y cheddar, doble porción de tocino glaseado en maple, huevo campero a la plancha y salsa Monster de autor.',
    isAvailable: 1
  }
];

// Categorías Maestras de Productos (M_Product_Category en iDempiere)
const INITIAL_PRODUCT_CATEGORIES = [
  {
    value: 'CAT-ESP',
    name: 'Especiales del Chef',
    description: 'Hamburguesas gourmet de autor elaboradas con cortes nobles de carne madurada y toppings premium',
    is_active: 1
  },
  {
    value: 'CAT-CLAS',
    name: 'Clásicas a la Parrilla',
    description: 'Recetas icónicas con queso cheddar americano, pepinillos encurtidos y pan brioche artesanal',
    is_active: 1
  },
  {
    value: 'CAT-POLL',
    name: 'Pollo Crispy',
    description: 'Pechugas marinadas en buttermilk con rebozado crujiente y salsas caseras',
    is_active: 1
  },
  {
    value: 'CAT-BEB',
    name: 'Bebidas Artesanales',
    description: 'Refrescos naturales, cervezas artesanales y gaseosas de la casa',
    is_active: 1
  },
  {
    value: 'CAT-ACOM',
    name: 'Acompañamientos & Loaded Fries',
    description: 'Papas rústicas trufadas, aros de cebolla crocantes y bastones de queso',
    is_active: 1
  }
];

// Listas de Precios y Versiones (M_PriceList & M_PriceList_Version en iDempiere)
const INITIAL_PRICE_LISTS = [
  {
    id: 1,
    value: 'PL-OFICIAL-2026',
    name: 'Tarifa Oficial Mostrador & PWA 2026',
    description: 'Lista de precios oficial aplicada a ventas directas por PWA, E-commerce y punto de venta',
    currency: 'PEN',
    is_active: 1,
    is_default: 1
  },
  {
    id: 2,
    value: 'PL-DELIVERY-APPS',
    name: 'Tarifa Plataformas Delivery',
    description: 'Tarifario con recargo operativo para canales de terceros y delivery express',
    currency: 'PEN',
    is_active: 1,
    is_default: 0
  },
  {
    id: 3,
    value: 'PL-CORP-MAYORISTA',
    name: 'Tarifa Corporativa Mayorista',
    description: 'Precios preferenciales para empresas, catering corporativo e instituciones',
    currency: 'PEN',
    is_active: 1,
    is_default: 0
  }
];

const INITIAL_PRICE_LIST_VERSIONS = [
  {
    id: 1,
    price_list_id: 1,
    name: 'Versión Oficial Carta 2026-Q1',
    valid_from: '2026-01-01',
    is_active: 1
  },
  {
    id: 2,
    price_list_id: 2,
    name: 'Versión Delivery Verano 2026',
    valid_from: '2026-01-15',
    is_active: 1
  },
  {
    id: 3,
    price_list_id: 3,
    name: 'Versión Convenios Empresas 2026',
    valid_from: '2026-02-01',
    is_active: 1
  }
];

// Categorías de Clientes / Grupos de Terceros (C_BP_Group en iDempiere)
const INITIAL_CUSTOMER_CATEGORIES = [
  {
    id: 1,
    value: 'VIP',
    name: 'Clientes VIP Gold',
    description: 'Consumidores de altísima fidelidad y recurrencia (> $200 acumulado). Envío gratis permanente.',
    discount_percent: 15.0,
    is_default: 0,
    is_active: 1
  },
  {
    id: 2,
    value: 'PLATINUM',
    name: 'Clientes Platino',
    description: 'Consumidores frecuentes con pedidos semanales recurrentes ($100 - $200 acumulado).',
    discount_percent: 10.0,
    is_default: 0,
    is_active: 1
  },
  {
    id: 3,
    value: 'REGULAR',
    name: 'Clientes Frecuentes',
    description: 'Clientes habituales con compras mensuales periódicas.',
    discount_percent: 5.0,
    is_default: 1,
    is_active: 1
  },
  {
    id: 4,
    value: 'OCASIONAL',
    name: 'Público Ocasional',
    description: 'Clientes esporádicos o compras de paso sin membresía activa.',
    discount_percent: 0.0,
    is_default: 0,
    is_active: 1
  },
  {
    id: 5,
    value: 'CORPORATIVO',
    name: 'Cuentas Corporativas & Empresas',
    description: 'Empresas con facturación electrónica mensual y pedidos de catering.',
    discount_percent: 12.0,
    is_default: 0,
    is_active: 1
  }
];

// Clientes / Socios del Negocio (C_BPartner en iDempiere)
const INITIAL_CUSTOMERS = [
  {
    id: 1,
    value: 'CUST-001',
    name: 'Carlos Mendoza',
    category_id: 1,
    category_name: 'Clientes VIP Gold',
    tax_id: '72498123',
    email: 'carlos.mendoza@email.com',
    phone: '+51 987 654 321',
    address: 'Av. Las Condes #1240, Dpto 804, Santiago',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tier: 'VIP Gold',
    total_spent: 348.50,
    orders_count: 22,
    favorite_burger: 'Rey de las Burgers',
    is_active: 1
  },
  {
    id: 2,
    value: 'CUST-002',
    name: 'Sofía Valenzuela',
    category_id: 1,
    category_name: 'Clientes VIP Gold',
    tax_id: '45892104',
    email: 'sofia.v@techstudio.com',
    phone: '+51 976 543 210',
    address: 'Calle Nueva Providencia #190, Dpto 501',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    tier: 'VIP Gold',
    total_spent: 289.20,
    orders_count: 18,
    favorite_burger: 'Burger Doble Especial',
    is_active: 1
  },
  {
    id: 3,
    value: 'CUST-003',
    name: 'Mateo Rodríguez',
    category_id: 2,
    category_name: 'Clientes Platino',
    tax_id: '10984532',
    email: 'mateo.dev@gmail.com',
    phone: '+51 965 432 109',
    address: 'Vitacura #3200, Of 401',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tier: 'Platino',
    total_spent: 195.40,
    orders_count: 14,
    favorite_burger: 'Burger Real Doble',
    is_active: 1
  },
  {
    id: 4,
    value: 'CUST-004',
    name: 'Valentina Herrera',
    category_id: 2,
    category_name: 'Clientes Platino',
    tax_id: '20456789',
    email: 'vale.herrera@agencia.cl',
    phone: '+51 954 321 098',
    address: 'Providencia #2124, Dpto 302',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    tier: 'Platino',
    total_spent: 168.00,
    orders_count: 11,
    favorite_burger: 'Burger Trufa Deluxe',
    is_active: 1
  },
  {
    id: 5,
    value: 'CUST-005',
    name: 'Diego Torres',
    category_id: 3,
    category_name: 'Clientes Frecuentes',
    tax_id: '30987654',
    email: 'diego.torres@startup.io',
    phone: '+51 943 210 987',
    address: 'Av. El Bosque Norte #0120',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    tier: 'Frecuente',
    total_spent: 98.70,
    orders_count: 7,
    favorite_burger: 'Burger Real Clásica',
    is_active: 1
  },
  {
    id: 6,
    value: 'CUST-006',
    name: 'Camila Silva',
    category_id: 3,
    category_name: 'Clientes Frecuentes',
    tax_id: '41239876',
    email: 'camila.silva@uai.edu',
    phone: '+51 932 109 876',
    address: 'Pedro de Valdivia #1450',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    tier: 'Frecuente',
    total_spent: 84.50,
    orders_count: 6,
    favorite_burger: 'Burger Royal Crispy Chicken',
    is_active: 1
  },
  {
    id: 7,
    value: 'CUST-007',
    name: 'Lucas Navas',
    category_id: 4,
    category_name: 'Público Ocasional',
    tax_id: '50123456',
    email: 'lucas.n@freelance.net',
    phone: '+51 921 098 765',
    address: 'Manuel Montt #450, Dpto 102',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    tier: 'Ocasional',
    total_spent: 35.80,
    orders_count: 2,
    favorite_burger: 'Burger Smash Cheddar Melt',
    is_active: 1
  }
];

// Catálogo de Impuestos Oficial (Solo Lectura en Aplicación, C_Tax en iDempiere)
const INITIAL_TAXES = [
  {
    id: 1,
    value: 'IGV-18',
    name: 'IGV 18% General',
    rate: 18.00,
    category_name: 'Impuesto al Valor Agregado',
    is_active: 1,
    description: 'Impuesto General a las Ventas de ley aplicado a alimentos y bebidas en salón y delivery'
  },
  {
    id: 2,
    value: 'EXENTO-0',
    name: 'Exonerado de Impuestos 0%',
    rate: 0.00,
    category_name: 'Exoneraciones de Ley',
    is_active: 1,
    description: 'Ventas exoneradas o inafectas de gravamen tributario según régimen especial'
  },
  {
    id: 3,
    value: 'CONSUMO-10',
    name: 'Impuesto al Servicio Gastronómico 10%',
    rate: 10.00,
    category_name: 'Recargos al Consumo',
    is_active: 1,
    description: 'Recargo legal por servicio en mesa para consumo presencial en salón'
  },
  {
    id: 4,
    value: 'ICBPER-0.5',
    name: 'ICBPER Bolsas Plásticas (S/ 0.50)',
    rate: 0.50,
    category_name: 'Tributos Ecológicos',
    is_active: 1,
    description: 'Impuesto al consumo de bolsas plásticas y empaques no biodegradables'
  }
];

// Órdenes Iniciales
const INITIAL_ORDERS = [
  {
    id: 'HR-1094',
    customerName: 'Corporativo Andino S.A.',
    items: [
      { name: 'Rey de las Burgers', quantity: 4, price: 15.90 },
      { name: 'Burger Trufa Deluxe', quantity: 2, price: 17.50 }
    ],
    total: 98.60,
    status: 'Pendiente de Aprobación ⏳',
    channel: 'PWA Preventa',
    originType: 'pwa',
    salesRep: 'Vendedor Norte (J. Pérez)',
    erpSyncStatus: 'Pendiente',
    erpDocumentNo: null,
    address: 'Av. Apoquindo #4500, Piso 12',
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString()
  },
  {
    id: 'HR-1093',
    customerName: 'Valentina Herrera',
    items: [
      { name: 'Burger Monster Rapid XXL', quantity: 1, price: 18.90 },
      { name: 'Burger Royal Crispy Chicken', quantity: 1, price: 12.90 }
    ],
    total: 31.80,
    status: 'Pendiente de Aprobación ⏳',
    channel: 'Web E-commerce',
    originType: 'ecommerce',
    salesRep: null,
    erpSyncStatus: 'Pendiente',
    erpDocumentNo: null,
    address: 'Providencia #2124, Dpto 302',
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString()
  },
  {
    id: 'HR-1092',
    customerName: 'Carlos Mendoza',
    items: [
      { name: 'Rey de las Burgers', quantity: 2, price: 15.90 },
      { name: 'Papas Rústicas Trufadas', quantity: 1, price: 4.50 }
    ],
    total: 36.30,
    status: 'Preparando en cocina 👨‍🍳',
    channel: 'PWA Preventa',
    originType: 'pwa',
    salesRep: 'Vendedor Centro (M. López)',
    erpSyncStatus: 'Sincronizado',
    erpDocumentNo: 'SO-80012',
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
    originType: 'pwa',
    salesRep: 'App Móvil Preventa',
    erpSyncStatus: 'Pendiente',
    erpDocumentNo: null,
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
    originType: 'ecommerce',
    salesRep: null,
    erpSyncStatus: 'Sincronizado',
    erpDocumentNo: 'SO-80009',
    address: 'Vitacura #3200, Of 401',
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString()
  }
];

class DatabaseManager {
  constructor() {
    this.sqliteDb = null;
    this.dbPath = null;
    this.initialized = false;
    this.initError = null;
    this.connectionTimestamp = null;
  }

  resolveDbPath() {
    if (process.env.SQLITE_DB_PATH) {
      return process.env.SQLITE_DB_PATH;
    }
    // Por defecto guarda en server/data/database.sqlite
    return path.resolve(__dirname, '../data/database.sqlite');
  }

  initDB() {
    if (this.initialized && this.sqliteDb) return this.sqliteDb;

    try {
      this.dbPath = this.resolveDbPath();

      if (this.dbPath !== ':memory:') {
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }

      console.log(`🗄️ [SQLite] Inicializando motor de base de datos relacional en "${this.dbPath}"...`);
      this.sqliteDb = new DatabaseSync(this.dbPath);

      // Optimizaciones de rendimiento de producción para SQLite
      this.sqliteDb.exec('PRAGMA journal_mode = WAL;');
      this.sqliteDb.exec('PRAGMA synchronous = NORMAL;');
      this.sqliteDb.exec('PRAGMA foreign_keys = ON;');

      this.createSchema();
      this.seedInitialData();

      this.initialized = true;
      this.connectionTimestamp = new Date().toISOString();
      console.log(`✅ [SQLite] Base de datos conectada exitosamente y lista para producción.`);
      return this.sqliteDb;
    } catch (err) {
      this.initError = err.message;
      console.error(`❌ [SQLite] Error fatal inicializando base de datos: ${err.message}`);
      throw err;
    }
  }

  createSchema() {
    const db = this.sqliteDb;

    // 1. Categorías de Productos (M_Product_Category)
    db.exec(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idempiere_id INTEGER UNIQUE,
        value TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 2. Catálogo de Productos (M_Product)
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idempiere_id INTEGER UNIQUE,
        value TEXT UNIQUE,
        name TEXT NOT NULL,
        category_id INTEGER REFERENCES product_categories(id),
        category TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        specialty TEXT,
        badgeColor TEXT,
        calories TEXT,
        image TEXT,
        description TEXT,
        isAvailable INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 3. Listas de Precios (M_PriceList)
    db.exec(`
      CREATE TABLE IF NOT EXISTS price_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idempiere_id INTEGER UNIQUE,
        value TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        currency TEXT NOT NULL DEFAULT 'PEN',
        is_active INTEGER NOT NULL DEFAULT 1,
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 4. Versiones de Lista de Precios (M_PriceList_Version)
    db.exec(`
      CREATE TABLE IF NOT EXISTS price_list_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idempiere_id INTEGER UNIQUE,
        price_list_id INTEGER NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        valid_from TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 5. Precios de Productos por Versión (M_ProductPrice)
    db.exec(`
      CREATE TABLE IF NOT EXISTS product_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version_id INTEGER NOT NULL REFERENCES price_list_versions(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        price_list REAL NOT NULL,
        price_std REAL NOT NULL,
        price_limit REAL NOT NULL,
        UNIQUE(version_id, product_id)
      );
    `);

    // 6. Categorías de Clientes / Grupos de Terceros (C_BP_Group)
    db.exec(`
      CREATE TABLE IF NOT EXISTS customer_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idempiere_id INTEGER UNIQUE,
        value TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        discount_percent REAL NOT NULL DEFAULT 0.0,
        is_default INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 7. Catálogo de Clientes / Socios de Negocio (C_BPartner)
    db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idempiere_id INTEGER UNIQUE,
        value TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category_id INTEGER REFERENCES customer_categories(id),
        category_name TEXT,
        tax_id TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        avatar TEXT,
        tier TEXT DEFAULT 'Regular',
        total_spent REAL NOT NULL DEFAULT 0.0,
        orders_count INTEGER NOT NULL DEFAULT 0,
        favorite_burger TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 8. Catálogo de Impuestos (Solo Lectura, C_Tax)
    db.exec(`
      CREATE TABLE IF NOT EXISTS taxes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idempiere_id INTEGER UNIQUE,
        value TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        rate REAL NOT NULL,
        category_name TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        description TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 9. Bandeja Central de Órdenes (PWA y E-commerce)
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        items_json TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL,
        channel TEXT NOT NULL,
        origin_type TEXT NOT NULL,
        sales_rep TEXT,
        erp_sync_status TEXT NOT NULL DEFAULT 'Pendiente',
        erp_document_no TEXT,
        erp_context_json TEXT,
        address TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 10. Historial de Auditoría y Sincronizaciones ERP
    db.exec(`
      CREATE TABLE IF NOT EXISTS sync_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        catalog_name TEXT NOT NULL,
        records_synced INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        source TEXT NOT NULL,
        details TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }

  seedInitialData() {
    const db = this.sqliteDb;

    // Seed Categorías de Productos
    const catCount = db.prepare('SELECT COUNT(*) as c FROM product_categories').get().c;
    if (catCount === 0) {
      const insCat = db.prepare(`
        INSERT INTO product_categories (value, name, description, is_active)
        VALUES (?, ?, ?, ?)
      `);
      for (const cat of INITIAL_PRODUCT_CATEGORIES) {
        insCat.run(cat.value, cat.name, cat.description, cat.is_active);
      }
    }

    // Seed Productos
    const prodCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
    if (prodCount === 0) {
      const insProd = db.prepare(`
        INSERT INTO products (id, value, name, category, price, stock, specialty, badgeColor, calories, image, description, isAvailable)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of INITIAL_PRODUCTS) {
        insProd.run(
          p.id,
          p.value,
          p.name,
          p.category,
          p.price,
          p.stock,
          p.specialty,
          p.badgeColor,
          p.calories,
          p.image,
          p.description,
          p.isAvailable ? 1 : 0
        );
      }
    }

    // Seed Listas de Precios y Versiones
    const plCount = db.prepare('SELECT COUNT(*) as c FROM price_lists').get().c;
    if (plCount === 0) {
      const insPL = db.prepare(`
        INSERT INTO price_lists (id, value, name, description, currency, is_active, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const pl of INITIAL_PRICE_LISTS) {
        insPL.run(pl.id, pl.value, pl.name, pl.description, pl.currency, pl.is_active, pl.is_default);
      }

      const insVer = db.prepare(`
        INSERT INTO price_list_versions (id, price_list_id, name, valid_from, is_active)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const v of INITIAL_PRICE_LIST_VERSIONS) {
        insVer.run(v.id, v.price_list_id, v.name, v.valid_from, v.is_active);
      }

      // Precios de productos vinculados
      const insItemPrice = db.prepare(`
        INSERT OR IGNORE INTO product_prices (version_id, product_id, price_list, price_std, price_limit)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const p of INITIAL_PRODUCTS) {
        insItemPrice.run(1, p.id, p.price * 1.1, p.price, p.price * 0.9);
        insItemPrice.run(2, p.id, p.price * 1.25, p.price * 1.15, p.price);
        insItemPrice.run(3, p.id, p.price, p.price * 0.88, p.price * 0.85);
      }
    }

    // Seed Categorías de Clientes
    const bpGrpCount = db.prepare('SELECT COUNT(*) as c FROM customer_categories').get().c;
    if (bpGrpCount === 0) {
      const insGrp = db.prepare(`
        INSERT INTO customer_categories (id, value, name, description, discount_percent, is_default, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const g of INITIAL_CUSTOMER_CATEGORIES) {
        insGrp.run(g.id, g.value, g.name, g.description, g.discount_percent, g.is_default, g.is_active);
      }
    }

    // Seed Clientes
    const custCount = db.prepare('SELECT COUNT(*) as c FROM customers').get().c;
    if (custCount === 0) {
      const insCust = db.prepare(`
        INSERT INTO customers (id, value, name, category_id, category_name, tax_id, email, phone, address, avatar, tier, total_spent, orders_count, favorite_burger, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const c of INITIAL_CUSTOMERS) {
        insCust.run(
          c.id,
          c.value,
          c.name,
          c.category_id,
          c.category_name,
          c.tax_id,
          c.email,
          c.phone,
          c.address,
          c.avatar,
          c.tier,
          c.total_spent,
          c.orders_count,
          c.favorite_burger,
          c.is_active
        );
      }
    }

    // Seed Impuestos (Solo Lectura)
    const taxCount = db.prepare('SELECT COUNT(*) as c FROM taxes').get().c;
    if (taxCount === 0) {
      const insTax = db.prepare(`
        INSERT INTO taxes (id, value, name, rate, category_name, is_active, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of INITIAL_TAXES) {
        insTax.run(t.id, t.value, t.name, t.rate, t.category_name, t.is_active, t.description);
      }
    }

    // Seed Órdenes
    const ordCount = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
    if (ordCount === 0) {
      const insOrd = db.prepare(`
        INSERT INTO orders (id, customer_name, items_json, total, status, channel, origin_type, sales_rep, erp_sync_status, erp_document_no, address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const o of INITIAL_ORDERS) {
        insOrd.run(
          o.id,
          o.customerName,
          JSON.stringify(o.items || []),
          o.total,
          o.status,
          o.channel,
          o.originType,
          o.salesRep || null,
          o.erpSyncStatus || 'Pendiente',
          o.erpDocumentNo || null,
          o.address || '',
          o.createdAt
        );
      }
    }
  }

  // ==========================================
  // 1. PRODUCTOS
  // ==========================================
  getProducts() {
    this.initDB();
    const rows = this.sqliteDb.prepare(`
      SELECT p.*, c.name as category_label
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `).all();

    return rows.map(r => ({
      ...r,
      isAvailable: Boolean(r.isAvailable),
      price: parseFloat(r.price)
    }));
  }

  getProductById(id) {
    this.initDB();
    const row = this.sqliteDb.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
    if (!row) return null;
    return {
      ...row,
      isAvailable: Boolean(row.isAvailable),
      price: parseFloat(row.price)
    };
  }

  addProduct(productData) {
    this.initDB();
    const db = this.sqliteDb;

    const sku = productData.value || `HR-BUR-${String(Date.now()).slice(-4)}`;
    const categoryName = productData.category || 'Especiales';
    let catId = productData.category_id || null;

    if (!catId) {
      const catRow = db.prepare('SELECT id FROM product_categories WHERE name LIKE ? LIMIT 1').get(`%${categoryName}%`);
      if (catRow) catId = catRow.id;
    }

    const stmt = db.prepare(`
      INSERT INTO products (value, name, category_id, category, price, stock, specialty, badgeColor, calories, image, description, isAvailable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      sku,
      productData.name,
      catId,
      categoryName,
      parseFloat(productData.price) || 0.0,
      parseInt(productData.stock, 10) || 30,
      productData.specialty || 'Signature Edition',
      productData.badgeColor || '#ea580c',
      productData.calories || '750 kcal',
      productData.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      productData.description || '',
      productData.isAvailable === false ? 0 : 1
    );

    return this.getProductById(result.lastInsertRowid);
  }

  updateProduct(id, productData) {
    this.initDB();
    const db = this.sqliteDb;
    const existing = this.getProductById(id);
    if (!existing) return null;

    const updated = {
      name: productData.name ?? existing.name,
      value: productData.value ?? existing.value,
      category: productData.category ?? existing.category,
      category_id: productData.category_id ?? existing.category_id,
      price: productData.price !== undefined ? parseFloat(productData.price) : existing.price,
      stock: productData.stock !== undefined ? parseInt(productData.stock, 10) : existing.stock,
      specialty: productData.specialty ?? existing.specialty,
      badgeColor: productData.badgeColor ?? existing.badgeColor,
      calories: productData.calories ?? existing.calories,
      image: productData.image ?? existing.image,
      description: productData.description ?? existing.description,
      isAvailable: productData.isAvailable !== undefined ? (productData.isAvailable ? 1 : 0) : (existing.isAvailable ? 1 : 0)
    };

    db.prepare(`
      UPDATE products
      SET name = ?, value = ?, category = ?, category_id = ?, price = ?, stock = ?, specialty = ?, badgeColor = ?, calories = ?, image = ?, description = ?, isAvailable = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      updated.name,
      updated.value,
      updated.category,
      updated.category_id,
      updated.price,
      updated.stock,
      updated.specialty,
      updated.badgeColor,
      updated.calories,
      updated.image,
      updated.description,
      updated.isAvailable,
      Number(id)
    );

    return this.getProductById(id);
  }

  toggleProductAvailability(id) {
    this.initDB();
    const product = this.getProductById(id);
    if (!product) return null;

    const nextState = product.isAvailable ? 0 : 1;
    this.sqliteDb.prepare('UPDATE products SET isAvailable = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(nextState, Number(id));

    return this.getProductById(id);
  }

  deleteProduct(id) {
    this.initDB();
    const product = this.getProductById(id);
    if (!product) return false;
    this.sqliteDb.prepare('DELETE FROM products WHERE id = ?').run(Number(id));
    return true;
  }

  resetProducts() {
    this.initDB();
    const db = this.sqliteDb;
    db.exec('DELETE FROM products');
    const ins = db.prepare(`
      INSERT INTO products (id, value, name, category, price, stock, specialty, badgeColor, calories, image, description, isAvailable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of INITIAL_PRODUCTS) {
      ins.run(
        p.id,
        p.value,
        p.name,
        p.category,
        p.price,
        p.stock,
        p.specialty,
        p.badgeColor,
        p.calories,
        p.image,
        p.description,
        p.isAvailable ? 1 : 0
      );
    }
    return this.getProducts();
  }

  // ==========================================
  // 2. CATEGORÍAS DE PRODUCTOS (Mantenible)
  // ==========================================
  getProductCategories() {
    this.initDB();
    const rows = this.sqliteDb.prepare(`
      SELECT c.*, COUNT(p.id) as products_count
      FROM product_categories c
      LEFT JOIN products p ON p.category_id = c.id OR p.category LIKE c.name
      GROUP BY c.id
      ORDER BY c.id ASC
    `).all();

    return rows.map(r => ({
      ...r,
      is_active: Boolean(r.is_active)
    }));
  }

  getProductCategoryById(id) {
    this.initDB();
    const row = this.sqliteDb.prepare('SELECT * FROM product_categories WHERE id = ?').get(Number(id));
    if (!row) return null;
    return { ...row, is_active: Boolean(row.is_active) };
  }

  addProductCategory(catData) {
    this.initDB();
    const value = catData.value || `CAT-${String(Date.now()).slice(-4)}`;
    const stmt = this.sqliteDb.prepare(`
      INSERT INTO product_categories (value, name, description, is_active)
      VALUES (?, ?, ?, ?)
    `);
    const res = stmt.run(
      value,
      catData.name,
      catData.description || '',
      catData.is_active === false ? 0 : 1
    );
    return this.getProductCategoryById(res.lastInsertRowid);
  }

  updateProductCategory(id, catData) {
    this.initDB();
    const existing = this.getProductCategoryById(id);
    if (!existing) return null;

    this.sqliteDb.prepare(`
      UPDATE product_categories
      SET name = ?, value = ?, description = ?, is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      catData.name ?? existing.name,
      catData.value ?? existing.value,
      catData.description ?? existing.description,
      catData.is_active !== undefined ? (catData.is_active ? 1 : 0) : (existing.is_active ? 1 : 0),
      Number(id)
    );
    return this.getProductCategoryById(id);
  }

  deleteProductCategory(id) {
    this.initDB();
    const existing = this.getProductCategoryById(id);
    if (!existing) return false;
    this.sqliteDb.prepare('DELETE FROM product_categories WHERE id = ?').run(Number(id));
    return true;
  }

  // ==========================================
  // 3. LISTAS DE PRECIOS Y VERSIONES (Mantenible)
  // ==========================================
  getPriceLists() {
    this.initDB();
    const rows = this.sqliteDb.prepare(`
      SELECT pl.*, COUNT(DISTINCT v.id) as versions_count
      FROM price_lists pl
      LEFT JOIN price_list_versions v ON v.price_list_id = pl.id
      GROUP BY pl.id
      ORDER BY pl.is_default DESC, pl.id ASC
    `).all();

    return rows.map(r => ({
      ...r,
      is_active: Boolean(r.is_active),
      is_default: Boolean(r.is_default)
    }));
  }

  getPriceListById(id) {
    this.initDB();
    const row = this.sqliteDb.prepare('SELECT * FROM price_lists WHERE id = ?').get(Number(id));
    if (!row) return null;
    const versions = this.getPriceListVersions(id);
    return {
      ...row,
      is_active: Boolean(row.is_active),
      is_default: Boolean(row.is_default),
      versions
    };
  }

  addPriceList(data) {
    this.initDB();
    const value = data.value || `PL-${String(Date.now()).slice(-4)}`;
    const res = this.sqliteDb.prepare(`
      INSERT INTO price_lists (value, name, description, currency, is_active, is_default)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      value,
      data.name,
      data.description || '',
      data.currency || 'PEN',
      data.is_active === false ? 0 : 1,
      data.is_default ? 1 : 0
    );

    // Si viene con versión inicial
    if (data.initialVersionName) {
      this.addPriceListVersion({
        price_list_id: res.lastInsertRowid,
        name: data.initialVersionName,
        valid_from: data.valid_from || new Date().toISOString().split('T')[0]
      });
    }

    return this.getPriceListById(res.lastInsertRowid);
  }

  updatePriceList(id, data) {
    this.initDB();
    const existing = this.getPriceListById(id);
    if (!existing) return null;

    if (data.is_default) {
      this.sqliteDb.prepare('UPDATE price_lists SET is_default = 0').run();
    }

    this.sqliteDb.prepare(`
      UPDATE price_lists
      SET name = ?, value = ?, description = ?, currency = ?, is_active = ?, is_default = ?
      WHERE id = ?
    `).run(
      data.name ?? existing.name,
      data.value ?? existing.value,
      data.description ?? existing.description,
      data.currency ?? existing.currency,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : (existing.is_active ? 1 : 0),
      data.is_default !== undefined ? (data.is_default ? 1 : 0) : (existing.is_default ? 1 : 0),
      Number(id)
    );

    return this.getPriceListById(id);
  }

  deletePriceList(id) {
    this.initDB();
    const existing = this.getPriceListById(id);
    if (!existing) return false;
    this.sqliteDb.prepare('DELETE FROM price_lists WHERE id = ?').run(Number(id));
    return true;
  }

  getPriceListVersions(priceListId) {
    this.initDB();
    const rows = this.sqliteDb.prepare(`
      SELECT v.*, pl.name as price_list_name, pl.currency,
             COUNT(pp.id) as products_priced_count
      FROM price_list_versions v
      JOIN price_lists pl ON v.price_list_id = pl.id
      LEFT JOIN product_prices pp ON pp.version_id = v.id
      WHERE v.price_list_id = ?
      GROUP BY v.id
      ORDER BY v.valid_from DESC
    `).all(Number(priceListId));

    return rows.map(r => ({
      ...r,
      is_active: Boolean(r.is_active)
    }));
  }

  addPriceListVersion(data) {
    this.initDB();
    const res = this.sqliteDb.prepare(`
      INSERT INTO price_list_versions (price_list_id, name, valid_from, is_active)
      VALUES (?, ?, ?, ?)
    `).run(
      Number(data.price_list_id),
      data.name,
      data.valid_from || new Date().toISOString().split('T')[0],
      data.is_active === false ? 0 : 1
    );

    const versionId = res.lastInsertRowid;

    // Clonar precios desde la lista de productos si se solicita
    const products = this.getProducts();
    const insPrice = this.sqliteDb.prepare(`
      INSERT OR IGNORE INTO product_prices (version_id, product_id, price_list, price_std, price_limit)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const p of products) {
      insPrice.run(versionId, p.id, p.price * 1.1, p.price, p.price * 0.9);
    }

    return this.sqliteDb.prepare('SELECT * FROM price_list_versions WHERE id = ?').get(versionId);
  }

  getVersionPrices(versionId) {
    this.initDB();
    return this.sqliteDb.prepare(`
      SELECT pp.*, p.name as product_name, p.category as product_category, p.image as product_image
      FROM product_prices pp
      JOIN products p ON pp.product_id = p.id
      WHERE pp.version_id = ?
      ORDER BY p.name ASC
    `).all(Number(versionId));
  }

  setProductPrice(versionId, productId, { price_list, price_std, price_limit }) {
    this.initDB();
    this.sqliteDb.prepare(`
      INSERT INTO product_prices (version_id, product_id, price_list, price_std, price_limit)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(version_id, product_id) DO UPDATE SET
        price_list = excluded.price_list,
        price_std = excluded.price_std,
        price_limit = excluded.price_limit
    `).run(
      Number(versionId),
      Number(productId),
      parseFloat(price_list),
      parseFloat(price_std),
      parseFloat(price_limit || price_std * 0.9)
    );

    return this.sqliteDb.prepare('SELECT * FROM product_prices WHERE version_id = ? AND product_id = ?')
      .get(Number(versionId), Number(productId));
  }

  // ==========================================
  // 4. CATEGORÍAS DE CLIENTES / BP_GROUPS (Mantenible)
  // ==========================================
  getCustomerCategories() {
    this.initDB();
    const rows = this.sqliteDb.prepare(`
      SELECT g.*, COUNT(c.id) as customers_count
      FROM customer_categories g
      LEFT JOIN customers c ON c.category_id = g.id
      GROUP BY g.id
      ORDER BY g.id ASC
    `).all();

    return rows.map(r => ({
      ...r,
      is_active: Boolean(r.is_active),
      is_default: Boolean(r.is_default),
      discount_percent: parseFloat(r.discount_percent || 0)
    }));
  }

  getCustomerCategoryById(id) {
    this.initDB();
    const row = this.sqliteDb.prepare('SELECT * FROM customer_categories WHERE id = ?').get(Number(id));
    if (!row) return null;
    return {
      ...row,
      is_active: Boolean(row.is_active),
      is_default: Boolean(row.is_default),
      discount_percent: parseFloat(row.discount_percent || 0)
    };
  }

  addCustomerCategory(data) {
    this.initDB();
    const value = data.value || `BPG-${String(Date.now()).slice(-4)}`;
    const res = this.sqliteDb.prepare(`
      INSERT INTO customer_categories (value, name, description, discount_percent, is_default, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      value,
      data.name,
      data.description || '',
      parseFloat(data.discount_percent || 0),
      data.is_default ? 1 : 0,
      data.is_active === false ? 0 : 1
    );
    return this.getCustomerCategoryById(res.lastInsertRowid);
  }

  updateCustomerCategory(id, data) {
    this.initDB();
    const existing = this.getCustomerCategoryById(id);
    if (!existing) return null;

    this.sqliteDb.prepare(`
      UPDATE customer_categories
      SET name = ?, value = ?, description = ?, discount_percent = ?, is_default = ?, is_active = ?
      WHERE id = ?
    `).run(
      data.name ?? existing.name,
      data.value ?? existing.value,
      data.description ?? existing.description,
      data.discount_percent !== undefined ? parseFloat(data.discount_percent) : existing.discount_percent,
      data.is_default !== undefined ? (data.is_default ? 1 : 0) : (existing.is_default ? 1 : 0),
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : (existing.is_active ? 1 : 0),
      Number(id)
    );
    return this.getCustomerCategoryById(id);
  }

  deleteCustomerCategory(id) {
    this.initDB();
    const existing = this.getCustomerCategoryById(id);
    if (!existing) return false;
    this.sqliteDb.prepare('DELETE FROM customer_categories WHERE id = ?').run(Number(id));
    return true;
  }

  // ==========================================
  // 5. CLIENTES / SOCIOS DE NEGOCIO (Mantenible)
  // ==========================================
  getCustomers() {
    this.initDB();
    const rows = this.sqliteDb.prepare(`
      SELECT c.*, g.name as category_label, g.discount_percent
      FROM customers c
      LEFT JOIN customer_categories g ON c.category_id = g.id
      ORDER BY c.total_spent DESC
    `).all();

    return rows.map(r => ({
      ...r,
      is_active: Boolean(r.is_active),
      total_spent: parseFloat(r.total_spent || 0),
      orders_count: parseInt(r.orders_count || 0, 10)
    }));
  }

  getCustomerById(id) {
    this.initDB();
    const row = this.sqliteDb.prepare(`
      SELECT c.*, g.name as category_label, g.discount_percent
      FROM customers c
      LEFT JOIN customer_categories g ON c.category_id = g.id
      WHERE c.id = ?
    `).get(Number(id));

    if (!row) return null;
    return {
      ...row,
      is_active: Boolean(row.is_active),
      total_spent: parseFloat(row.total_spent || 0),
      orders_count: parseInt(row.orders_count || 0, 10)
    };
  }

  addCustomer(data) {
    this.initDB();
    const value = data.value || `CUST-${String(Date.now()).slice(-4)}`;
    let catId = data.category_id || 3;
    let catName = data.category_name || 'Clientes Frecuentes';

    const cat = this.getCustomerCategoryById(catId);
    if (cat) catName = cat.name;

    const res = this.sqliteDb.prepare(`
      INSERT INTO customers (value, name, category_id, category_name, tax_id, email, phone, address, avatar, tier, total_spent, orders_count, favorite_burger, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      value,
      data.name,
      catId,
      catName,
      data.tax_id || '',
      data.email || '',
      data.phone || '',
      data.address || '',
      data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      data.tier || 'Regular',
      parseFloat(data.total_spent || 0),
      parseInt(data.orders_count || 0, 10),
      data.favorite_burger || 'Rey de las Burgers',
      data.is_active === false ? 0 : 1
    );

    return this.getCustomerById(res.lastInsertRowid);
  }

  updateCustomer(id, data) {
    this.initDB();
    const existing = this.getCustomerById(id);
    if (!existing) return null;

    let catName = data.category_name ?? existing.category_name;
    if (data.category_id && data.category_id !== existing.category_id) {
      const cat = this.getCustomerCategoryById(data.category_id);
      if (cat) catName = cat.name;
    }

    this.sqliteDb.prepare(`
      UPDATE customers
      SET name = ?, value = ?, category_id = ?, category_name = ?, tax_id = ?, email = ?, phone = ?, address = ?, avatar = ?, tier = ?, total_spent = ?, orders_count = ?, favorite_burger = ?, is_active = ?
      WHERE id = ?
    `).run(
      data.name ?? existing.name,
      data.value ?? existing.value,
      data.category_id ?? existing.category_id,
      catName,
      data.tax_id ?? existing.tax_id,
      data.email ?? existing.email,
      data.phone ?? existing.phone,
      data.address ?? existing.address,
      data.avatar ?? existing.avatar,
      data.tier ?? existing.tier,
      data.total_spent !== undefined ? parseFloat(data.total_spent) : existing.total_spent,
      data.orders_count !== undefined ? parseInt(data.orders_count, 10) : existing.orders_count,
      data.favorite_burger ?? existing.favorite_burger,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : (existing.is_active ? 1 : 0),
      Number(id)
    );

    return this.getCustomerById(id);
  }

  deleteCustomer(id) {
    this.initDB();
    const existing = this.getCustomerById(id);
    if (!existing) return false;
    this.sqliteDb.prepare('DELETE FROM customers WHERE id = ?').run(Number(id));
    return true;
  }

  // ==========================================
  // 6. IMPUESTOS (SOLO LECTURA EN APLICACIÓN)
  // ==========================================
  getTaxes() {
    this.initDB();
    const rows = this.sqliteDb.prepare('SELECT * FROM taxes ORDER BY rate DESC, id ASC').all();
    return rows.map(r => ({
      ...r,
      rate: parseFloat(r.rate),
      is_active: Boolean(r.is_active),
      is_readonly: true
    }));
  }

  getTaxById(id) {
    this.initDB();
    const row = this.sqliteDb.prepare('SELECT * FROM taxes WHERE id = ?').get(Number(id));
    if (!row) return null;
    return {
      ...row,
      rate: parseFloat(row.rate),
      is_active: Boolean(row.is_active),
      is_readonly: true
    };
  }

  // ==========================================
  // 7. BANDEJA DE PEDIDOS & MÉTRICAS
  // ==========================================
  getOrders(origin = 'all') {
    this.initDB();
    let query = 'SELECT * FROM orders';
    const params = [];

    if (origin && origin !== 'all') {
      query += ' WHERE origin_type = ?';
      params.push(origin);
    }
    query += ' ORDER BY datetime(created_at) DESC';

    const rows = this.sqliteDb.prepare(query).all(...params);
    return rows.map(r => ({
      id: r.id,
      customerName: r.customer_name,
      customerId: r.customer_id,
      items: JSON.parse(r.items_json || '[]'),
      total: parseFloat(r.total),
      status: r.status,
      channel: r.channel,
      originType: r.origin_type,
      salesRep: r.sales_rep,
      erpSyncStatus: r.erp_sync_status,
      erpDocumentNo: r.erp_document_no,
      erpContext: r.erp_context_json ? JSON.parse(r.erp_context_json) : null,
      address: r.address,
      createdAt: r.created_at
    }));
  }

  getOrderById(id) {
    this.initDB();
    const r = this.sqliteDb.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!r) return null;
    return {
      id: r.id,
      customerName: r.customer_name,
      customerId: r.customer_id,
      items: JSON.parse(r.items_json || '[]'),
      total: parseFloat(r.total),
      status: r.status,
      channel: r.channel,
      originType: r.origin_type,
      salesRep: r.sales_rep,
      erpSyncStatus: r.erp_sync_status,
      erpDocumentNo: r.erp_document_no,
      erpContext: r.erp_context_json ? JSON.parse(r.erp_context_json) : null,
      address: r.address,
      createdAt: r.created_at
    };
  }

  createOrder(orderData) {
    this.initDB();
    const id = orderData.id || `HR-${Math.floor(1000 + Math.random() * 9000)}`;
    const channel = orderData.channel || (orderData.originType === 'pwa' ? 'PWA Mobile' : 'Web E-commerce');
    const originType = orderData.originType || (channel.toLowerCase().includes('pwa') ? 'pwa' : 'ecommerce');
    const items = Array.isArray(orderData.items) ? orderData.items : [];
    const total = parseFloat(orderData.total || items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0));

    this.sqliteDb.prepare(`
      INSERT INTO orders (id, customer_name, customer_id, items_json, total, status, channel, origin_type, sales_rep, erp_sync_status, erp_document_no, erp_context_json, address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      orderData.customerName || 'Cliente Mostrador',
      orderData.customerId || null,
      JSON.stringify(items),
      total,
      orderData.status || 'Pendiente de Aprobación ⏳',
      channel,
      originType,
      orderData.salesRep || (originType === 'pwa' ? 'App Móvil Preventa' : null),
      orderData.erpSyncStatus || 'Pendiente',
      orderData.erpDocumentNo || null,
      orderData.erpContext ? JSON.stringify(orderData.erpContext) : null,
      orderData.address || '',
      new Date().toISOString()
    );

    return this.getOrderById(id);
  }

  updateOrder(id, fields) {
    this.initDB();
    const existing = this.getOrderById(id);
    if (!existing) return null;

    const updated = {
      status: fields.status ?? existing.status,
      erpSyncStatus: fields.erpSyncStatus ?? existing.erpSyncStatus,
      erpDocumentNo: fields.erpDocumentNo ?? existing.erpDocumentNo,
      erpContext: fields.erpContext ? JSON.stringify(fields.erpContext) : (existing.erpContext ? JSON.stringify(existing.erpContext) : null)
    };

    this.sqliteDb.prepare(`
      UPDATE orders
      SET status = ?, erp_sync_status = ?, erp_document_no = ?, erp_context_json = ?
      WHERE id = ?
    `).run(
      updated.status,
      updated.erpSyncStatus,
      updated.erpDocumentNo,
      updated.erpContext,
      id
    );

    return this.getOrderById(id);
  }

  getConsumerMetrics() {
    this.initDB();
    const customers = this.getCustomers();
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((acc, c) => acc + c.total_spent, 0);

    const vipCustomers = customers.filter(c => c.total_spent > 200);
    const platinumCustomers = customers.filter(c => c.total_spent >= 100 && c.total_spent <= 200);
    const regularCustomers = customers.filter(c => c.total_spent < 100);

    const vipRevenue = vipCustomers.reduce((acc, c) => acc + c.total_spent, 0);
    const platinumRevenue = platinumCustomers.reduce((acc, c) => acc + c.total_spent, 0);
    const regularRevenue = regularCustomers.reduce((acc, c) => acc + c.total_spent, 0);

    return {
      overview: {
        totalCustomers,
        totalRevenue: totalRevenue.toFixed(2),
        averageTicket: totalCustomers ? (totalRevenue / customers.reduce((acc, c) => acc + c.orders_count, 0) || 1).toFixed(2) : '0.00'
      },
      segments: {
        vip: {
          count: vipCustomers.length,
          revenue: vipRevenue.toFixed(2),
          percentage: totalRevenue ? Math.round((vipRevenue / totalRevenue) * 100) : 0
        },
        platinum: {
          count: platinumCustomers.length,
          revenue: platinumRevenue.toFixed(2),
          percentage: totalRevenue ? Math.round((platinumRevenue / totalRevenue) * 100) : 0
        },
        regular: {
          count: regularCustomers.length,
          revenue: regularRevenue.toFixed(2),
          percentage: totalRevenue ? Math.round((regularRevenue / totalRevenue) * 100) : 0
        }
      },
      topCustomers: customers.slice(0, 7)
    };
  }

  // ==========================================
  // 8. SINCRONIZACIÓN DE CATÁLOGOS DESDE IDEMPIERE ERP
  // ==========================================
  recordSyncEvent(catalogName, count, status, source, details = '') {
    this.initDB();
    this.sqliteDb.prepare(`
      INSERT INTO sync_history (catalog_name, records_synced, status, source, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(catalogName, count, status, source, details);
  }

  getSyncHistory(limit = 20) {
    this.initDB();
    return this.sqliteDb.prepare(`
      SELECT * FROM sync_history ORDER BY id DESC LIMIT ?
    `).all(limit);
  }

  syncProductCategoriesFromERP(records, source = 'iDempiere REST v1') {
    this.initDB();
    const db = this.sqliteDb;
    let synced = 0;

    const upsert = db.prepare(`
      INSERT INTO product_categories (idempiere_id, value, name, description, is_active, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(value) DO UPDATE SET
        idempiere_id = excluded.idempiere_id,
        name = excluded.name,
        description = excluded.description,
        is_active = excluded.is_active,
        updated_at = datetime('now')
    `);

    for (const r of records) {
      const idempiereId = r.M_Product_Category_ID ?? r.id ?? null;
      const value = r.Value ?? r.value ?? `CAT-${idempiereId}`;
      const name = r.Name ?? r.name;
      const desc = r.Description ?? r.description ?? '';
      const isActive = r.IsActive !== undefined ? (r.IsActive ? 1 : 0) : 1;

      if (name) {
        upsert.run(idempiereId, value, name, desc, isActive);
        synced++;
      }
    }

    this.recordSyncEvent('Categorías de Productos', synced, 'Exitoso', source, `Sincronizadas ${synced} categorías desde ERP`);
    return { success: true, count: synced, categories: this.getProductCategories() };
  }

  syncProductsFromERP(records, source = 'iDempiere REST v1') {
    this.initDB();
    const db = this.sqliteDb;
    let synced = 0;

    const upsert = db.prepare(`
      INSERT INTO products (idempiere_id, value, name, category, price, stock, isAvailable, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(value) DO UPDATE SET
        idempiere_id = excluded.idempiere_id,
        name = excluded.name,
        category = COALESCE(excluded.category, products.category),
        price = CASE WHEN excluded.price > 0 THEN excluded.price ELSE products.price END,
        stock = CASE WHEN excluded.stock >= 0 THEN excluded.stock ELSE products.stock END,
        isAvailable = excluded.isAvailable,
        updated_at = datetime('now')
    `);

    for (const r of records) {
      const idempiereId = r.M_Product_ID ?? r.id ?? null;
      const value = r.Value ?? r.value ?? `HR-BUR-${idempiereId}`;
      const name = r.Name ?? r.name;
      const price = parseFloat(r.PriceStd ?? r.price ?? 0);
      const stock = parseInt(r.QtyOnHand ?? r.stock ?? 30, 10);
      const isAvailable = r.IsActive !== undefined ? (r.IsActive ? 1 : 0) : 1;
      const category = r.CategoryName ?? r.category ?? 'Especiales';

      if (name) {
        upsert.run(idempiereId, value, name, category, price, stock, isAvailable);
        synced++;
      }
    }

    this.recordSyncEvent('Productos', synced, 'Exitoso', source, `Sincronizados ${synced} productos desde ERP`);
    return { success: true, count: synced, products: this.getProducts() };
  }

  syncPriceListsFromERP(records, source = 'iDempiere REST v1') {
    this.initDB();
    const db = this.sqliteDb;
    let synced = 0;

    const upsertPL = db.prepare(`
      INSERT INTO price_lists (idempiere_id, value, name, description, currency, is_active, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(value) DO UPDATE SET
        idempiere_id = excluded.idempiere_id,
        name = excluded.name,
        currency = excluded.currency,
        is_active = excluded.is_active
    `);

    for (const r of records) {
      const idempiereId = r.M_PriceList_ID ?? r.id ?? null;
      const value = r.Name ? `PL-${r.Name.toUpperCase().replace(/\s+/g, '-')}` : `PL-${idempiereId}`;
      const name = r.Name ?? r.name;
      const currency = r.C_Currency_ID === 100 ? 'USD' : (r.C_Currency_ID === 102 ? 'EUR' : 'PEN');
      const isActive = r.IsActive !== undefined ? (r.IsActive ? 1 : 0) : 1;
      const isDefault = r.IsDefault ? 1 : (synced === 0 ? 1 : 0);

      if (name) {
        upsertPL.run(idempiereId, value, name, r.Description || '', currency, isActive, isDefault);
        synced++;
      }
    }

    this.recordSyncEvent('Listas de Precios', synced, 'Exitoso', source, `Sincronizadas ${synced} listas de precios desde ERP`);
    return { success: true, count: synced, priceLists: this.getPriceLists() };
  }

  syncCustomerCategoriesFromERP(records, source = 'iDempiere REST v1') {
    this.initDB();
    const db = this.sqliteDb;
    let synced = 0;

    const upsert = db.prepare(`
      INSERT INTO customer_categories (idempiere_id, value, name, description, discount_percent, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(value) DO UPDATE SET
        idempiere_id = excluded.idempiere_id,
        name = excluded.name,
        description = excluded.description,
        is_active = excluded.is_active
    `);

    for (const r of records) {
      const idempiereId = r.C_BP_Group_ID ?? r.id ?? null;
      const value = r.Value ?? r.value ?? `BPG-${idempiereId}`;
      const name = r.Name ?? r.name;
      const desc = r.Description ?? '';
      const isActive = r.IsActive !== undefined ? (r.IsActive ? 1 : 0) : 1;

      if (name) {
        upsert.run(idempiereId, value, name, desc, 5.0, isActive);
        synced++;
      }
    }

    this.recordSyncEvent('Categorías de Clientes', synced, 'Exitoso', source, `Sincronizados ${synced} grupos de terceros desde ERP`);
    return { success: true, count: synced, categories: this.getCustomerCategories() };
  }

  syncCustomersFromERP(records, source = 'iDempiere REST v1') {
    this.initDB();
    const db = this.sqliteDb;
    let synced = 0;

    const upsert = db.prepare(`
      INSERT INTO customers (idempiere_id, value, name, tax_id, email, phone, address, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(value) DO UPDATE SET
        idempiere_id = excluded.idempiere_id,
        name = excluded.name,
        tax_id = COALESCE(excluded.tax_id, customers.tax_id),
        email = COALESCE(excluded.email, customers.email),
        phone = COALESCE(excluded.phone, customers.phone),
        address = COALESCE(excluded.address, customers.address),
        is_active = excluded.is_active
    `);

    for (const r of records) {
      const idempiereId = r.C_BPartner_ID ?? r.id ?? null;
      const value = r.Value ?? r.value ?? `CUST-${idempiereId}`;
      const name = r.Name ?? r.name;
      const taxId = r.TaxID ?? r.tax_id ?? '';
      const email = r.EMail ?? r.email ?? '';
      const phone = r.Phone ?? r.phone ?? '';
      const address = r.Address1 ?? r.address ?? '';
      const isActive = r.IsActive !== undefined ? (r.IsActive ? 1 : 0) : 1;

      if (name) {
        upsert.run(idempiereId, value, name, taxId, email, phone, address, isActive);
        synced++;
      }
    }

    this.recordSyncEvent('Clientes (Terceros)', synced, 'Exitoso', source, `Sincronizados ${synced} clientes desde ERP`);
    return { success: true, count: synced, customers: this.getCustomers() };
  }

  syncTaxesFromERP(records, source = 'iDempiere REST v1') {
    this.initDB();
    const db = this.sqliteDb;
    let synced = 0;

    const upsert = db.prepare(`
      INSERT INTO taxes (idempiere_id, value, name, rate, category_name, is_active, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(value) DO UPDATE SET
        idempiere_id = excluded.idempiere_id,
        name = excluded.name,
        rate = excluded.rate,
        category_name = excluded.category_name,
        is_active = excluded.is_active,
        description = excluded.description
    `);

    for (const r of records) {
      const idempiereId = r.C_Tax_ID ?? r.id ?? null;
      const value = r.Name ? `TAX-${r.Name.toUpperCase().replace(/\s+/g, '-')}` : `TAX-${idempiereId}`;
      const name = r.Name ?? r.name;
      const rate = parseFloat(r.Rate ?? r.rate ?? 0.0);
      const cat = r.TaxCategoryName ?? r.category_name ?? 'Impuesto Oficial';
      const isActive = r.IsActive !== undefined ? (r.IsActive ? 1 : 0) : 1;
      const desc = r.Description ?? '';

      if (name) {
        upsert.run(idempiereId, value, name, rate, cat, isActive, desc);
        synced++;
      }
    }

    this.recordSyncEvent('Impuestos (Solo Lectura)', synced, 'Exitoso', source, `Sincronizados ${synced} impuestos desde ERP`);
    return { success: true, count: synced, taxes: this.getTaxes() };
  }

  // ==========================================
  // 9. ESTADO Y MONITOREO DE BASE DE DATOS
  // ==========================================
  getDbStatus() {
    this.initDB();
    let fileSizeKb = 0;
    try {
      if (this.dbPath && this.dbPath !== ':memory:' && fs.existsSync(this.dbPath)) {
        fileSizeKb = Math.round(fs.statSync(this.dbPath).size / 1024);
      }
    } catch {
      // Ignorar lectura de stats si es efímero
    }

    const counts = {
      productCategories: this.sqliteDb.prepare('SELECT COUNT(*) as c FROM product_categories').get().c,
      products: this.sqliteDb.prepare('SELECT COUNT(*) as c FROM products').get().c,
      priceLists: this.sqliteDb.prepare('SELECT COUNT(*) as c FROM price_lists').get().c,
      priceListVersions: this.sqliteDb.prepare('SELECT COUNT(*) as c FROM price_list_versions').get().c,
      customerCategories: this.sqliteDb.prepare('SELECT COUNT(*) as c FROM customer_categories').get().c,
      customers: this.sqliteDb.prepare('SELECT COUNT(*) as c FROM customers').get().c,
      taxes: this.sqliteDb.prepare('SELECT COUNT(*) as c FROM taxes').get().c,
      orders: this.sqliteDb.prepare('SELECT COUNT(*) as c FROM orders').get().c,
      syncEvents: this.sqliteDb.prepare('SELECT COUNT(*) as c FROM sync_history').get().c
    };

    return {
      mode: 'sqlite',
      engine: 'SQLite 3 (node:sqlite Built-in)',
      status: 'healthy',
      dbPath: this.dbPath,
      fileSizeKb,
      journalMode: 'WAL (Write-Ahead Logging)',
      foreignKeys: 'ENABLED',
      connectedAt: this.connectionTimestamp,
      entityCounts: counts,
      poolConnections: {
        active: 1,
        totalLimit: 'Ilimitado (Modo WAL Concurrente)'
      },
      host: 'Local / Docker Volume Persistente',
      database: path.basename(this.dbPath)
    };
  }

  pingDb() {
    const start = Date.now();
    this.initDB();
    const result = this.sqliteDb.prepare('SELECT 1 as ping, datetime(\'now\') as now').get();
    const latencyMs = Date.now() - start;
    return {
      online: true,
      latencyMs,
      now: result.now,
      mode: 'sqlite'
    };
  }
}

const dbManager = new DatabaseManager();

module.exports = {
  initDB: () => dbManager.initDB(),
  getProducts: () => dbManager.getProducts(),
  getProductById: (id) => dbManager.getProductById(id),
  addProduct: (p) => dbManager.addProduct(p),
  updateProduct: (id, p) => dbManager.updateProduct(id, p),
  toggleProductAvailability: (id) => dbManager.toggleProductAvailability(id),
  deleteProduct: (id) => dbManager.deleteProduct(id),
  resetProducts: () => dbManager.resetProducts(),

  getProductCategories: () => dbManager.getProductCategories(),
  getProductCategoryById: (id) => dbManager.getProductCategoryById(id),
  addProductCategory: (c) => dbManager.addProductCategory(c),
  updateProductCategory: (id, c) => dbManager.updateProductCategory(id, c),
  deleteProductCategory: (id) => dbManager.deleteProductCategory(id),

  getPriceLists: () => dbManager.getPriceLists(),
  getPriceListById: (id) => dbManager.getPriceListById(id),
  addPriceList: (pl) => dbManager.addPriceList(pl),
  updatePriceList: (id, pl) => dbManager.updatePriceList(id, pl),
  deletePriceList: (id) => dbManager.deletePriceList(id),
  getPriceListVersions: (priceListId) => dbManager.getPriceListVersions(priceListId),
  addPriceListVersion: (v) => dbManager.addPriceListVersion(v),
  getVersionPrices: (versionId) => dbManager.getVersionPrices(versionId),
  setProductPrice: (versionId, productId, prices) => dbManager.setProductPrice(versionId, productId, prices),

  getCustomerCategories: () => dbManager.getCustomerCategories(),
  getCustomerCategoryById: (id) => dbManager.getCustomerCategoryById(id),
  addCustomerCategory: (g) => dbManager.addCustomerCategory(g),
  updateCustomerCategory: (id, g) => dbManager.updateCustomerCategory(id, g),
  deleteCustomerCategory: (id) => dbManager.deleteCustomerCategory(id),

  getCustomers: () => dbManager.getCustomers(),
  getCustomerById: (id) => dbManager.getCustomerById(id),
  addCustomer: (c) => dbManager.addCustomer(c),
  updateCustomer: (id, c) => dbManager.updateCustomer(id, c),
  deleteCustomer: (id) => dbManager.deleteCustomer(id),

  getTaxes: () => dbManager.getTaxes(),
  getTaxById: (id) => dbManager.getTaxById(id),

  getOrders: (origin) => dbManager.getOrders(origin),
  getOrderById: (id) => dbManager.getOrderById(id),
  createOrder: (o) => dbManager.createOrder(o),
  updateOrder: (id, f) => dbManager.updateOrder(id, f),
  getConsumerMetrics: () => dbManager.getConsumerMetrics(),

  syncProductCategoriesFromERP: (recs, src) => dbManager.syncProductCategoriesFromERP(recs, src),
  syncProductsFromERP: (recs, src) => dbManager.syncProductsFromERP(recs, src),
  syncPriceListsFromERP: (recs, src) => dbManager.syncPriceListsFromERP(recs, src),
  syncCustomerCategoriesFromERP: (recs, src) => dbManager.syncCustomerCategoriesFromERP(recs, src),
  syncCustomersFromERP: (recs, src) => dbManager.syncCustomersFromERP(recs, src),
  syncTaxesFromERP: (recs, src) => dbManager.syncTaxesFromERP(recs, src),
  getSyncHistory: (lim) => dbManager.getSyncHistory(lim),
  recordSyncEvent: (cat, cnt, st, src, det) => dbManager.recordSyncEvent(cat, cnt, st, src, det),

  getDbStatus: () => dbManager.getDbStatus(),
  pingDb: () => dbManager.pingDb()
};
