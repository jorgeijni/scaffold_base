# Manual Operativo y Directivas para Agentes de IA &bull; RapidFood ERP

Este archivo establece las directivas técnicas, directrices de diseño, reglas de blindaje con iDempiere ERP y protocolos de colaboración que **todo agente de IA debe consultar y mantener actualizado** al interactuar con este repositorio.

---

## 1. Identidad del Proyecto y Visión General

**RapidFood** (comercialmente *Burger Factory* / *Tasty Bites Central*) es una solución integrada de comida rápida de **3 capas** acoplada con **iDempiere ERP REST API v1**:

1. **Capa E-commerce (`apps/ecommerce`)**:
   - Portal web para compras directas de clientes desarrollado con **Astro**.
   - Catálogo de 10 creaciones de autor de hamburguesas gourmet, modales de detalle, combos y pedidos en línea.
   - Ruta de despliegue: `/`
2. **Capa PWA de Preventa (`apps/pwa`)**:
   - Aplicación móvil/offline-first desarrollada con **React + Vite**.
   - Diseñada para vendedores en terreno y clientes móviles, con navegación por pestañas (*Menú, Ofertas, Órdenes, Perfil*), switch en vivo de tema Claro/Oscuro y simulación de compra.
   - Ruta de despliegue: `/app`
3. **Capa Panel de Control & Administración (`apps/admin`)**:
   - Backoffice corporativo desarrollado con **React + Vite**.
   - Supervisa métricas de venta, catálogo, pedidos entrantes de ambas capas, clientes y gestiona la sincronización directa hacia iDempiere ERP.
   - Ruta de despliegue: `/admin`
4. **Servidor Backend & Datamart (`server`)**:
   - Servidor Node.js + Express que consolida el servicio estático de las 3 aplicaciones compiladas, provee APIs de telemetría (`/api/health`, `/api/products`), datamart SQLite local y proxy reverso anti-CORS (`/api/idempiere-proxy`).

---

## 2. Reglas de Oro y Restricciones Estrictas

> [!IMPORTANT]
> **REGLAS OBLIGATORIAS DE iDempiere REST API v1 (BLINDADO TÉCNICO)**
> 1. **Endpoint en Plural:** La emisión de tokens debe ser **siempre** `POST /api/v1/auth/tokens` (en plural: `/tokens`, NUNCA `/token` en singular) para evitar errores HTTP 404 en el dispatcher de Apache Felix OSGi.
> 2. **Cabeceras Obligatorias:** Toda petición hacia iDempiere debe incluir:
>    ```http
>    Content-Type: application/json
>    Accept: application/json
>    ```
> 3. **Estructura Anidada y "organizationId":**
>    - Los parámetros de contexto **NUNCA** deben ir planos en la raíz del payload.
>    - Deben encapsularse estrictamente en el objeto `"parameters"`.
>    - El identificador de organización debe llamarse obligatoriamente `"organizationId"` (NUNCA `"orgId"`).
>    - Estructura exacta requerida:
>      ```json
>      {
>        "userName": "admin @ gardenworld.com",
>        "password": "GardenAdmin",
>        "parameters": {
>          "clientId": 11,
>          "roleId": 102,
>          "organizationId": 11,
>          "warehouseId": 103,
>          "language": "es_PE"
>        }
>      }
>      ```
>    *Motivo técnico:* Si los parámetros se envían planos o se usa `orgId`, el motor Jackson/Gson de iDempiere falla en la deserialización de la clase Java `com.trekglobal.idempiere.rest.api.v1.auth.LoginCredential`, arrojando `HTTP 400 Bad Request`.

> [!WARNING]
> **POLÍTICA DE MODIFICACIÓN DE CAPAS**
> - Cuando el usuario solicite cambios en una capa específica (ej. "En apps/ecommerce: ..."), **NO tocar** las otras capas a menos que sea explícitamente requerido o forme parte de una sincronización multi-capa.
> - Antes de dar por terminada una tarea, verificar siempre la compilación global con `npm run build:all`.

---

## 3. Protocolo de Pruebas y Diagnóstico

### Diagnóstico de Ping ERP
- En la vista de diagnóstico de iDempiere (`IDempiereIntegrationView.jsx`), el botón **"Probar Ping"** debe enviar credenciales y parámetros válidos (`session?.password || 'GardenAdmin'`) para verificar la accesibilidad real del endpoint, garantizando una respuesta `200 OK` en condiciones normales.
- Nunca enviar contraseñas enmascaradas (como `'***'`) en peticiones reales de red.

### Bypass de CORS
- Los servidores iDempiere comunitarios (como `test.idempiere.org`) usualmente no tienen cabeceras CORS permisivas para localhost.
- Se implementaron 3 vías de resolución:
  1. **Proxy Local Node.js (`/api/idempiere-proxy?target=`)**: Canaliza la petición a través de Express en el servidor backend.
  2. **Proxy CORS Público (`https://corsproxy.io/?`)**: Alternativa directa para pruebas en navegador.
  3. **Conexión Directa**: Para entornos de producción donde el reverse proxy (Nginx/Traefik) maneje CORS en el mismo dominio.

---

## 4. Modalidades de Autenticación Soportadas

1. **Modalidad 1: Login Directo (1 Solo Paso)**:
   - Pantalla de login limpia *"Tasty Bites • Central"* (solo pide usuario y contraseña).
   - Inyecta automáticamente los parámetros configurados en el perfil de administrador (`clientId: 11, roleId: 102, organizationId: 11, warehouseId: 103, language: 'es_PE'`).
   - Envía un único `POST /api/v1/auth/tokens`.

2. **Modalidad 2: Login Asistido (2 Pasos Multi-Tenant)**:
   - Se activa mediante el switch en la vista *"Perfil de Administrador & Configuración ERP"*.
   - **Paso 1:** Envío de usuario y contraseña para validar credenciales y descubrir tenants/roles.
   - **Paso 2:** Selección interactiva del Tenant, Rol, Organización y Almacén, culminando con la emisión del token final contextualizado.

---

## 5. Comandos y Pipeline de Compilación

| Comando | Propósito |
| :--- | :--- |
| `npm run install:all` | Instala dependencias en las 4 carpetas (`ecommerce`, `pwa`, `admin`, `server`). |
| `npm run build:ecommerce` | Compila la landing Astro en `apps/ecommerce/dist`. |
| `npm run build:pwa` | Compila la PWA React con Vite en `apps/pwa/dist`. |
| `npm run build:admin` | Compila el Panel Admin React con Vite en `apps/admin/dist`. |
| `npm run build:all` | Compila las 3 apps y las sincroniza en `server/public/{ecommerce,pwa,admin}`. |
| `npm run server` / `npm start` | Inicia el backend Express en el puerto 3000 (o `PORT`). |

---

## 6. Bitácora de Evolución del Proyecto

- **2026-11-10 (v1.0)**:
  - Creación del scaffold base con CI/CD Dokploy.
  - Implementación de `authService.js` y `idempiereClient.js` con soporte estricto de directivas REST v1.
  - Implementación de `AuthGuard` y persistencia en `localStorage`/`sessionStorage`.
  - Construcción de la bandeja de gestión de pedidos 3 capas (PWA Preventa vs E-commerce).
  - Implementación de proxy anti-CORS `/api/idempiere-proxy`.
- **2026-11-10 (v1.1)**:
  - Diseño de landing page moderna para E-commerce en Astro con catálogo de 10 hamburguesas gourmet (réplica Imagen 1).
  - Implementación de PWA móvil con 4 pestañas (*Menú, Ofertas, Órdenes, Perfil*), switch de temas Dark/Light y simulación de compra (réplica Imágenes 2 y 3).
  - Creación del Dashboard Administrativo *"Hamburger Rapid"* con vistas de Resumen General (Imagen 4), Catálogo, Clientes, Base de Datos e Integración ERP (Imagen 5).
- **2026-11-10 (v1.2)**:
  - Creación del modal *"Inspector de Sesión iDempiere ERP REST"* accesible desde el botón *"Token Info"* en el sidebar (Imagen 1).
  - Corrección del error 401 en la herramienta *"Probar Ping"* de la vista ERP Live (Imagen 2).
  - Rediseño simplificado de la pantalla de login *"Tasty Bites • Central"* (Imagen 3).
  - Implementación de la vista *"Perfil de Administrador & Configuración ERP"* con conmutador de modo 1 paso vs. 2 pasos y aprovisionamiento de catálogo (Imagen 4).
  - Creación de `AGENTS.md` y `ARCHITECTURE.md`.
- **2026-11-17 (v1.3)**:
  - Replicación y homologación integral de la capa de autenticación con iDempiere ERP basada en `laboratorio1`.
  - Backend (`server`): Incorporación de `idempiereService.js` y router `/api/auth` (`/login`, `/context`, `/step2`, `/verify`, `/config`, `/test-connection`), con cliente HTTPS nativo, soporte estricto de `organizationId` anidado y fallback a Sandbox GardenWorld.
  - Frontend (`apps/admin`): Incorporación de `idempiereAuthService.js`, actualización de `AuthContext.jsx` con conmutador dinámico de canal (`proxy` vs `direct`), selectores dinámicos multitenant para el Paso 2 (Clientes, Roles, Organizaciones, Almacenes) y componente homologado `IdempiereInspectorModal.jsx`.
  - Verificación exitosa del pipeline de compilación global `npm run build:all`.
- **2026-11-17 (v1.3.1)**:
  - Corrección del fallo de montaje en `admin/` (`TypeError: ve.clearSession is not a function`): incorporación del método `clearSession()` en `AuthService` y llamado seguro a `AuthService.logout()` en `AuthContext.jsx`.
  - Recompilación y sincronización de artefactos de producción en `server/public/admin`.
- **2026-11-17 (v1.3.2)**:
  - Replicación exacta del componente de Login `LoginPage.jsx` de `laboratorio1` (Hamburguesa 🍔, "Hamburger Rapid", badge "CONTROL DE ACCESO • IDEMPIERE ERP V1", selectores de servidor `localhost:8080` vs `test.idempiere.org`, conmutador Proxy Backend vs REST Directo, Modalidad 1 vs Modalidad 2, botón "Cargar Demo GardenWorld" y botón "Acceso Rápido 1-Clic").
  - Actualización de `AuthGuard.jsx` para renderizar `LoginPage.jsx` directamente y eliminación de bloqueos de renderizado.
  - Recompilación y sincronización exitosa en `server/public/admin`.
- **2026-11-17 (v1.4)**:
  - Replicación y homologación integral de la persistencia **SQLite (`better-sqlite3`)** y sincronización de catálogos maestros desde `rapidcorporate`.
  - Servidor Backend (`server`):
    - Motor de datos SQLite en `server/data/database.sqlite` configurado con `WAL`, `synchronous = NORMAL` y claves foráneas activas (`foreign_keys = ON`).
    - Tablas locales: `product_categories`, `products`, `price_lists`, `price_list_versions`, `product_prices`, `customer_categories`, `customers`, `taxes` y `sync_logs`.
    - Preservación y sembrado inicial de las 10 hamburguesas de autor para mantener operativas las capas de E-commerce y PWA.
    - Endpoints CRUD completos para Categorías de Productos, Productos, Listas y Precios, Categorías de Clientes y Clientes.
    - Endpoint `/api/taxes` **estrictamente de solo lectura** con bloqueo 405 para mutaciones.
    - Endpoints de sincronización `/api/sync/:catalog` y auditoría `/api/sync/logs`.
  - Panel Admin (`apps/admin`):
    - Incorporación de `idempiereSyncService.js` para consumo de modelos REST v1 (`m_product_category`, `m_product`, `m_pricelist`, `m_pricelist_version`, `m_productprice`, `c_bp_group`, `c_bpartner`, `c_tax`).
    - Incorporación de vistas interactivas con funciones de mantenimiento local y sincronización ERP:
      - `ProductCategoriesView.jsx` (`M_Product_Category`)
      - `ProductsView.jsx` (`M_Product`)
      - `PriceListsView.jsx` (`M_PriceList`, `M_PriceList_Version`, `M_ProductPrice`)
      - `CustomerCategoriesView.jsx` (`C_BP_Group`)
      - `CustomersView.jsx` (`C_BPartner`)
      - `TaxesView.jsx` (`C_Tax` - Modo Solo Lectura)
      - `DatabaseStatusView.jsx` con métricas en tiempo real y botón de sincronización global.
    - Reorganización del layout y sidebar en `DashboardLayout.jsx` con grupos "OPERACIONES & VENTAS", "CATÁLOGOS ERP • SQLITE" y "SISTEMA & CONECTIVIDAD", junto con toasts reactivos.
  - Verificación exitosa del pipeline de compilación `npm run build:all`.
- **2026-11-17 (v1.5)**:
  - Réplica fiel del **Sidebar / Navbar colapsable** basado en referencias de diseño (`navbar-abierto.html`, `navbar-colapsado.html` e imágenes 1 y 2):
    - Componente modular `SidebarNavbar.jsx` con soporte bidireccional:
      - **Modo Abierto / Descolapsado (`240px`):** Company Switcher con logo verde lima `{}` ("Calzados Sh... / Demo"), botón `PanelLeftClose`, secciones temáticas (*General, Comercial, Operaciones, Finanzas, Sistema*), badges numéricos (*1/5*), chevrons de expansión y footer con *Ayuda y soporte* y selector de usuario.
      - **Modo Colapsado (`56px`):** Cabecera de 96px con logo `{}` centrado, botón `PanelLeftOpen`, botones cuadrados centrados de 40x40px, badges flotantes en la esquina superior derecha y avatares compactos.
    - Iconografía vectorial exacta extraída de los assets Lucide & Phosphor:
      - `PanelLeftClose`, `PanelLeftOpen`, `FirstStepsIcon` (Portapapeles), `HomeIcon` (Inicio activo), `StarIcon` (Favoritos), `ContactsIcon` (Contactos), `SalesIcon` (Ventas), `PurchasesIcon` (Compras), `InventoryIcon` (Inventario), `FinanceIcon` (Finanzas), `AiAgentIcon` (Enchufe / IA), `SettingsIcon` (Engranaje), `HeadphonesIcon` (Soporte) y `UserIcon` (Usuario).
    - Persistencia de estado en `localStorage` (`sidebar_collapsed`).
    - Margen reactivo fluido en el área de trabajo principal (`marginLeft: 240px` vs `56px`).
    - Verificación y compilación global exitosa con `npm run build:all`.
- **2026-11-20 (v1.6)**:
  - **Corrección de Cascada Multitenant en Login a 2 Pasos (Organización &rarr; Almacén)**:
    - Backend (`server/src/services/idempiereService.js`): En `getAvailableContext`, consulta paralela (`Promise.all`) de los almacenes para cada organización devuelta por iDempiere REST (`/api/v1/auth/warehouses?client=...&role=...&organization=...`), vinculando `{ organizationId, orgName }` a cada almacén.
    - Nuevo endpoint backend `POST /api/auth/warehouses` para consultas dinámicas y soporte de fallback seguro.
    - Frontend (`apps/admin`):
      - Incorporación de `getWarehouses` en `idempiereAuthService.js`.
      - En `LoginPage.jsx`, vinculación reactiva `handleOrganizationChange(orgId)`: al seleccionar una organización (ej. *HQ #11*), el selector de almacenes filtra inmediatamente en cascada mostrando únicamente los almacenes de dicha sucursal (ej. *HQ Warehouse #103*) y auto-seleccionando el primero disponible.
  - **Blindaje de Solo Lectura para Categorías de Productos (`M_Product_Category`) y Productos (`M_Product`)**:
    - Backend (`server/src/routes/api.js`):
      - Respuestas de `GET /api/products` y `GET /api/product-categories` marcadas con `readOnly: true`.
      - Bloqueo estricto con `HTTP 405 Method Not Allowed` en todas las rutas mutables locales (`POST`, `PUT`, `DELETE`, `/reset`), consolidando a iDempiere ERP como la **única fuente de la verdad**.
    - Frontend (`apps/admin`):
      - Refactorización de `ProductCategoriesView.jsx` y `ProductsView.jsx` a vistas de solo lectura con badge corporativo `🔒 SOLO LECTURA • MAESTRO ERP`, buscador en tiempo real, filtro por categoría y botón de sincronización directa `⚡ Sincronizar desde ERP`.
      - Eliminación de formularios y modales de edición manual local.
  - **Depuración y Repoblación de Base de Datos SQLite**:
    - Script `server/scripts/sync-erp-products.js`: Autenticación en vivo contra `https://lunaerp.egssmart.com/`, vaciado de las tablas locales `products` y `product_categories` en `server/data/database.sqlite`, y repoblación íntegra con las 14 categorías y 55 productos oficiales de iDempiere.
  - Compilación y sincronización global exitosa con `npm run build:all`.



