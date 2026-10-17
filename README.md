# 🍔 Hamburger Rapid &bull; Plataforma Comercial v1.0

Plataforma comercial completa para cadena gourmet de comida rápida con entrega en menos de 20 minutos, arquitectura monorepo de triple capa (Astro + React PWA + React Admin Dashboard + Node.js API + MySQL / In-Memory).

---

## 🏗️ Arquitectura del Sistema

```
scaffold_base/
├── apps/
│   ├── ecommerce/     # [Astro] Landing Page comercial con 10 variantes destacadas
│   ├── pwa/           # [React + Vite] App móvil PWA con 4 pestañas y simulador de compras
│   └── admin/         # [React + Vite] Panel de control con métricas de clientes y DB
├── server/
│   ├── public/        # Artefactos compilados estáticos sincronizados
│   └── src/
│       ├── app.js     # Servidor Express unificado
│       ├── db.js      # Conexión MySQL con fallback In-Memory automático y semillas
│       └── routes/    # API endpoints (/products, /metrics/customers, /orders, /health)
└── package.json       # Orquestador monorepo (build:all, server, install:all)
```

---

## 🌟 Componentes Implementados

### 1. `apps/ecommerce` &bull; Landing Page Comercial Oficial
- **Paleta Clara Premium:** Marfil cálido (`#faf9f6`), dorado/ámbar (`#d97706`), pizarra profundo (`#0f172a`) y bordes suaves.
- **Catálogo de 10 Variantes Destacadas:**
  1. **Rey de las Burgers** ($15.90) &bull; Badge: `👑 Signature Master`
  2. **Burger Real Clásica** ($11.50) &bull; Badge: `🏰 Edición Real`
  3. **Burger Real Doble** ($14.50) &bull; Badge: `⚡ Doble Corona`
  4. **Burger Doble Especial** ($16.20) &bull; Badge: `👨‍🍳 Gran Chef`
  5. **Burger Trufa Deluxe** ($17.50) &bull; Badge: `💎 Gourmet Supreme`
  6. **Burger BBQ Ahumada Rapid** ($13.80) &bull; Badge: `🪵 Smokehouse Prime`
  7. **Burger Royal Crispy Chicken** ($12.90) &bull; Badge: `🍗 Crispy Especial`
  8. **Burger Smash Cheddar Melt** ($12.20) &bull; Badge: `🧀 Smash Lovers`
  9. **Burger Spicy Chipotle Fire** ($13.50) &bull; Badge: `🔥 Spicy Fire`
  10. **Burger Monster Rapid XXL** ($18.90) &bull; Badge: `🏆 Legendaria XXL`
- **Filtros Interactivos:** Todas, Especiales del Chef, Clásicas & Smash, Pollo Crispy.
- **Modal Interactivo "Ver Detalles":** Desglose de ingredientes nobles, nivel de especialidad, calorías, proteínas, alérgenos y CTA directo a la app.

### 2. `apps/pwa` &bull; App Móvil con Simulador de Compra
- **Pestañas Inferiores (Bottom Navigation):**
  - 🍔 **Menú:** Catálogo de hamburguesas con buscador, filtros y personalizador de extras gourmet (extra queso, tocino ahumado, etc.).
  - 🏷️ **Ofertas:** Cupones comerciales aplicables al carrito (`RAPID2X1`, `COMBODOBLE`, `REYESPECIAL`, `DELIVERYFREE`).
  - 📦 **Ordenes:** Monitor con stepper interactivo de estado en tiempo real (1. Recibido &bull; 2. En cocina &bull; 3. En camino &bull; 4. Entregado) y botón para avanzar simulación.
  - 👤 **Perfil:** Datos de usuario, programa **Rapid Rewards Club (VIP Gold)**, dirección de entrega y métodos de pago.
- **Carrito y Checkout:** Drawer flotante con cálculo de subtotal, cupones dinámicos, propina para el repartidor y simulación de compra conectada a la API.

### 3. `apps/admin` &bull; Panel de Control y Métricas de Consumo
- **Gestión del Catálogo:** Tabla completa de las 10 hamburguesas con estado de disponibilidad (activa/pausada), modificación de stock y modal para crear nuevas recetas.
- **Métricas de Consumidores / Clientes según Consumo:**
  - Segmento VIP (Gasto > $200) &bull; 54% de facturación total.
  - Segmento Platino ($100 - $200) &bull; 31% de facturación.
  - Segmento Frecuente / Ocasional (< $100) &bull; 15% de facturación.
  - Ranking de clientes con gasto acumulado, hamburguesa favorita y recurrencia.
  - Métricas de consumo por canal (PWA Móvil 68%, Web 22%, Take-Away 10%).
- **Estado de la Base de Datos:**
  - Conexión MySQL vs modo In-Memory con fallback transparente.
  - Monitor de latencia en milisegundos con botón de Ping interactivo.
  - Pool de conexiones (activas vs límite).
  - Conteo de entidades auditadas (products, customers, orders).
  - Botón de restablecimiento de datos demo.

---

## 🚀 Comandos de Ejecución

```bash
# 1. Instalar todas las dependencias
npm run install:all

# 2. Compilar todas las aplicaciones y sincronizar en server/public
npm run build:all

# 3. Iniciar el servidor unificado
npm start
```

### URLs de Acceso Local
- **Landing Page E-commerce:** `http://localhost:3000/`
- **PWA Mobile App:** `http://localhost:3000/app/`
- **Panel Administrativo:** `http://localhost:3000/admin/`
- **API Health & DB Status:** `http://localhost:3000/api/health`
- **API Catálogo de Productos:** `http://localhost:3000/api/products`
- **API Métricas de Clientes:** `http://localhost:3000/api/metrics/customers`
- **API Órdenes:** `http://localhost:3000/api/orders`
