# AGENTS.md — Guía Operativa y Convenciones del Proyecto

> **Regla de mantenimiento obligatorio:** Conforme avance el proyecto, todo agente o desarrollador que implemente mejoras, nuevas funcionalidades o modifique rutas, variables de entorno, módulos de interfaz, reglas de autenticación, endpoints, datos o flujos de despliegue **debe actualizar OBLIGATORIAMENTE ambos archivos — este [`AGENTS.md`](AGENTS.md) y [`ARCHITECTURE.md`](ARCHITECTURE.md) — de forma sincronizada** antes de dar por cerrada cada tarea.

---

## 1. Visión Rápida del Proyecto

**Hamburger Rapid** es una plataforma comercial y operativa en arquitectura monorepo compuesta por **3 frontends** unificados bajo un **backend Node.js/Express** listo para CI/CD con Docker / Dokploy:

| Capa | Ruta Pública | Directorio | Tecnología | Puerto Dev |
| :--- | :--- | :--- | :--- | :--- |
| **Portal E-commerce** | `/` | `apps/ecommerce/` | Astro 4 (`output: 'static'`) | `4321` (Astro CLI) |
| **App Móvil PWA** | `/app` | `apps/pwa/` | React 18 + Vite + Service Worker | `5173` |
| **Panel de Administración** | `/admin` | `apps/admin/` | React 18 + Vite | `5174` |
| **Backend API & Static Server** | `/api/*`, `/api/idempiere/*` | `server/` | Express `4.19.2` + `mysql2` | `3000` |

En producción, `npm run build:all` (o `Dockerfile`) compila los 3 frontends y los copia a:
- `server/public/ecommerce`
- `server/public/pwa`
- `server/public/admin`

(`server/public` está excluido en `.gitignore`; no versionar artefactos compilados en Git).

---

## 2. Reglas Estrictas de Autenticación, White-Label e Integración ERP

### A. Privacidad y Experiencia del Login Público (`apps/admin`)
1. **Cero exposición de infraestructura en la pantalla pública de login**:
   - [`apps/admin/src/components/LoginPage.jsx`](apps/admin/src/components/LoginPage.jsx), [`apps/admin/src/components/TwoStepContextForm.jsx`](apps/admin/src/components/TwoStepContextForm.jsx) y [`apps/admin/src/components/AuthGuard.jsx`](apps/admin/src/components/AuthGuard.jsx) **NO deben mostrar** referencias visibles a `iDempiere`, `ERP`, `GardenWorld`, endpoints REST (`/api/v1/auth/tokens`), URLs del servidor backend ni parámetros técnicos de conexión (`clientId`, `organizationId`, CORS, etc.).
   - Tampoco exponer nombres internos o errores técnicos de proveedor en [`apps/admin/src/services/AuthService.js`](apps/admin/src/services/AuthService.js) al lanzar excepciones de UI (`buildHttpError`, `buildNetworkError`). Usar mensajes neutros orientados al usuario final.
2. **Gobierno centralizado desde el Backoffice autenticado**:
   - La URL base del servidor, activación del Proxy CORS, selección del modo de autenticación en login (`enableMultiTenantLogin`: 1 paso vs 2 pasos) y parámetros predeterminados (`defaultParameters`) se configuran únicamente dentro de la pestaña autenticada **Perfil & Conexión ERP** ([`ProfileErpSettingsView.jsx`](apps/admin/src/components/ProfileErpSettingsView.jsx)) y se persisten en `localStorage` vía `AuthService`.

### B. Blindaje Técnico iDempiere REST API v1 (Protocolo Interno)
Tanto en [`apps/admin/src/services/AuthService.js`](apps/admin/src/services/AuthService.js) como en [`server/src/services/idempiereService.js`](server/src/services/idempiereService.js):
1. **Endpoint plural obligatorio**: usar `POST /api/v1/auth/tokens` (NUNCA `/token` en singular).
2. **Cabeceras obligatorias**: `Content-Type: application/json` y `Accept: application/json`.
3. **Estructura Login Directo (1 Paso)**: encapsular el contexto dentro de `"parameters"` (nunca plano en raíz) y nombrar el campo de organización `"organizationId"` (nunca `"orgId"`), para garantizar compatibilidad con `LoginCredential` en iDempiere:
   ```json
   {
     "userName": "...",
     "password": "...",
     "parameters": {
       "clientId": 11,
       "roleId": 102,
       "organizationId": 11,
       "warehouseId": 103,
       "language": "en_US"
     }
   }
   ```
4. **Flujo Asistido (2 Pasos)**:
   - Paso 1: `POST /api/v1/auth/tokens` con `{ userName, password }`.
   - Consultas dependientes con `Bearer <tempToken>`: `/api/v1/auth/roles`, `/api/v1/auth/organizations`, `/api/v1/auth/warehouses`, `/api/v1/auth/language`.
   - Paso 2: `PUT /api/v1/auth/tokens` con `Authorization: Bearer <tempToken>` y `{ clientId, roleId, organizationId, warehouseId, language }`.
5. **Política de acceso**: cualquier usuario con credenciales activas que obtenga `200 OK` + `token` válido queda autorizado para ingresar al Panel de Administración.
6. **Reutilización**: `AuthService` no depende de React (`window`/`fetch`/`Storage` estándar) para poder reutilizarse directamente en futuras integraciones con `apps/pwa`.

---

## 3. Convenciones de Código por Módulo

- **`apps/ecommerce`**:
  - Mantener las 10 variantes de hamburguesas destacadas (incluyendo *Rey de las Burgers*, *Burger Real Clásica*, *Burger Real Doble* y *Burger Doble Especial*), precios, badges de especialidad, filtros y modal `#detailModal` con CTA **Ver Detalles** en [`apps/ecommerce/src/pages/index.astro`](apps/ecommerce/src/pages/index.astro).
- **`apps/pwa`**:
  - Preservar `base: '/app/'` en [`apps/pwa/vite.config.js`](apps/pwa/vite.config.js) y las rutas en [`apps/pwa/public/sw.js`](apps/pwa/public/sw.js) y [`apps/pwa/public/manifest.json`](apps/pwa/public/manifest.json).
  - La navegación móvil consta de 5 pestañas (`home`, `menu`, `ordenes`, `ofertas`, `perfil`).
  - Las categorías se calculan dinámicamente desde los productos activos (`/api/products` o respaldo offline `DEFAULT_PRODUCTS`) para compatibilidad con categorías de backend (`Especiales`, `Clásicas`, `Pollo Crispy`).
  - Las órdenes creadas desde la PWA deben enviar `channel: 'PWA Mobile'` a `POST /api/orders`.
- **`apps/admin`**:
  - Preservar `base: '/admin/'` en [`apps/admin/vite.config.js`](apps/admin/vite.config.js).
  - Estilos mediante CSS vanilla ([`apps/admin/src/index.css`](apps/admin/src/index.css)) y estilos inline estructurados con tipografía `Plus Jakarta Sans`.
  - Mantener la modularidad por vistas/componentes en `apps/admin/src/components/` (`AdminSidebar`, `OrdersInbox`, `IdempiereErpView`, `ErpStatusModal`, `ProfileErpSettingsView`, `LoginPage`, `TwoStepContextForm`, `AuthGuard`).
- **`server`**:
  - El servidor funciona con MySQL si `DB_HOST` o `DATABASE_URL` están configurados y accesibles; de lo contrario, degrada automáticamente a estado In-Memory en [`server/src/db.js`](server/src/db.js) para desarrollo local rápido.
  - Al agregar métodos en `server/src/db.js`, verificar los exports en `module.exports` (por ejemplo `db.getProducts()`, no `getAllProducts`).

---

## 4. Comandos Clave de Desarrollo y Build

```bash
# Instalar dependencias de las 4 carpetas
npm run install:all

# Compilar por capa o completo (sincroniza automáticamente hacia server/public/*)
npm run build:ecommerce
npm run build:pwa
npm run build:admin
npm run build:all

# Iniciar servidor backend unificado (puerto 3000 por defecto)
npm start
```

### Notas de entorno (Windows / Sandbox)
- En **PowerShell 5.1**, no usar `&&` entre comandos; ejecutar cada instrucción en comandos separados o usar `;`.
- Al compilar `apps/ecommerce` en entornos sin escritura sobre `%APPDATA%` de Astro Telemetry, definir `ASTRO_TELEMETRY_DISABLED=1` antes de ejecutar `npm run build:ecommerce`.
- Tener presente que `fs.cpSync` en `package.json` copia sobre `server/public/<app>` sin borrar hashes JS/CSS antiguos; al inspeccionar artefactos compilados, leer siempre la etiqueta `<script src="...">` desde el `index.html` generado.

---

## 5. Estado Actual Registrado (Bitácora de Arquitectura)

- **Landing E-commerce**: completa con 10 creaciones, filtros, modal `#detailModal` y botones `Ver Detalles` + enlace `/app`.
- **PWA Móvil**: 5 pestañas funcionales, categorías sincronizadas dinámicamente con `/api/products`, carrito con cupones y seguimiento de órdenes, Service Worker `nextcollege-pwa-v2`.
- **Panel Admin**:
  - Layout con barra lateral [`AdminSidebar.jsx`](apps/admin/src/components/AdminSidebar.jsx) (`Resumen General`, `Catálogo Hamburguesas`, `Bandeja Pedidos`, `Métricas de Clientes`, `Estado Base de Datos`, `iDempiere ERP`, `Perfil & Conexión ERP`).
  - Bandeja central de pedidos de 3 capas ([`OrdersInbox.jsx`](apps/admin/src/components/OrdersInbox.jsx)) con filtros PWA vs E-commerce y sincronización `C_Order`.
  - Vista técnica ERP ([`IdempiereErpView.jsx`](apps/admin/src/components/IdempiereErpView.jsx)) e Inspector modal Bearer ([`ErpStatusModal.jsx`](apps/admin/src/components/ErpStatusModal.jsx)).
  - Vista de Perfil & Configuración ([`ProfileErpSettingsView.jsx`](apps/admin/src/components/ProfileErpSettingsView.jsx)) con control de modo login (1 paso / 2 pasos), URL corporativa, Proxy CORS, parámetros por defecto (`es_PE` incluido) y endpoints de aprovisionamiento/sincronización de catálogo (`/api/idempiere/catalog/seed`, `/catalog/sync-sqlite`, `/catalog/history`).
  - Pantalla de Login pública white-label ([`LoginPage.jsx`](apps/admin/src/components/LoginPage.jsx)) sin menciones visibles a infraestructura interna ni iDempiere.

