# ROL Y OBJETIVO
Actúa como un Arquitecto de Software Full-Stack y Desarrollador Web Senior especializado en Progressive Web Apps (PWA), sistemas de captura de pedidos e integración con iDempiere ERP.

Tu tarea es diseñar y generar el código completo, modular y funcional del módulo de **Autenticación y Control de Acceso al Panel de Administración** dentro de una solución integrada de 3 capas:
1. **Capa E-commerce**: Portal web para compras directas de clientes. (NO TOCAR)
2. **Capa PWA de Pedidos**: Aplicación móvil/offline-first utilizada por vendedores y personal operativo para la toma de pedidos y cotizaciones.  (NO TOCAR)
3. **Capa Panel de Administración**: Backoffice central donde se supervisan, aprueban y gestionan los pedidos generados tanto en la PWA como en el e-commerce, coordinando su sincronización hacia iDempiere ERP.

El objetivo central de este prompt es construir el acceso de la interfaz base que ya tenemos del **Panel de Administración**: se debe permitir el ingreso a **cualquier usuario con credenciales activas en iDempiere** (validación directa vía iDempiere REST API v1, sin restringir por rol específico para acceder a la consola), dejando la sesión contextualizada para administrar los pedidos entrantes.

---

## 1. REQUERIMIENTOS DEL NEGOCIO Y FLUJO DE DATOS

1. **Política de Acceso al Panel de Administración**:
   - **Autenticación Centralizada en ERP**: Basta con que la petición de login retorne exitosa (`200 OK` con un `token` válido) desde iDempiere para desbloquear el panel de administración.
   - **Contexto de Sesión**:
     - Al autenticarse, almacenar de forma persistente (`sessionStorage`/`localStorage`):
       - `token` Bearer para consumos posteriores.
       - Contexto devuelto: `userId`, `clientId`, `roleId`, `orgId`, `warehouseId`, `language`.
     - Implementar un `AuthGuard` en el frontend: si no existe token válido, redirigir al login; si existe sesión activa, renderizar la consola de administración.
     - Botón de **Cerrar Sesión** que purgue el estado local y regrese al login.

2. **Articulación de las 3 Capas en el Panel**:
   - Diseñar la sesión y el layout pensando en el flujo operativo:
     - El Panel de Administración debe reflejar la bandeja central de **Gestión de Pedidos** (filtrables por origen: *PWA Preventa / Vendedores* vs *E-commerce*).
     - El servicio `AuthService` debe ser reutilizable como librería base para la futura integración en la **PWA de Pedidos**.

3. **Manejo de CORS y Conectividad**:
   - Selector en pantalla para activar/desactivar un Proxy CORS (ej. `https://corsproxy.io/?` o proxy local) para pruebas en navegador contra servidores iDempiere que no tengan headers CORS habilitados.
   - Campo editable para el `Base URL` del API de iDempiere.

---

## 2. MODALIDADES DE AUTENTICACIÓN

El módulo de login debe permitir alternar entre 2 modalidades:

### Modalidad 1: Login Directo / 1 Paso (Acceso Rápido)
- Envío en una sola petición del usuario, contraseña y parámetros de contexto fijos (Client, Role, Org, Warehouse).

### Modalidad 2: Login Asistido en 2 Pasos (Multitenant Dinámico)
- **Paso 1**: Envío únicamente de `userName` y `password`. iDempiere valida y responde con los tenants, roles y organizaciones asignados.
- **Paso 2**: El usuario selecciona su contexto en selectores desplegables dinámicos y confirma para obtener el token definitivo.

---

## 3. ESPECIFICACIÓN DE ENDPOINTS (iDempiere REST API v1)

### REGLAS ESTRICTAS DE iDempiere REST API v1 (BLINDADO TÉCNICO)

Para evitar errores HTTP 404 (Not Found), HTTP 400 (Bad Request) o errores de deserialización Java en iDempiere (`com.trekglobal.idempiere.rest.api.v1.auth.LoginCredential`), debes cumplir OBLIGATORIAMENTE con estas directivas:

### A. Endpoint Base de Emisión de Tokens
* **Ruta Exacta:** `POST /api/v1/auth/tokens` (OBLIGATORIO en plural: `/tokens`, NUNCA `/token`).
* **Cabeceras HTTP Obligatorias:**
  - `Content-Type: application/json`
  - `Accept: application/json`

### Opción A: Autenticación en 1 Paso
- **Endpoint**: `POST {baseUrl}/api/v1/auth/tokens`
- **Headers**:
  ```http
  Content-Type: application/json
  Accept: application/json

*** 4. Ejemplo de  **Acceso Rápido Demo GardenWorld**:
   - Botón visible: **"Cargar Demo GardenWorld"** que rellene automáticamente:
     - Servidor Base: `https://test.idempiere.org:443`
     - Usuario: `admin @ gardenworld.com`
     - Contraseña: `GardenAdmin`
     - Parámetros: Client ID `11` (GardenWorld), Role ID `102` (Admin), Org ID `11` (HQ), Warehouse ID `103` (HQ Warehouse), Idioma `en_US`.

### Estructura Exacta del Payload JSON (Login Directo / 1 Paso)
El cuerpo de la petición DEBE contener los parámetros de contexto dentro de un objeto `"parameters"` (NUNCA en la raíz plana). El campo de organización DEBE llamarse `"organizationId"` (NUNCA `"orgId"`):
```json
{
  "userName": "admin @ gardenworld.com",
  "password": "GardenAdmin",
  "parameters": {
    "clientId": 11,
    "roleId": 102,
    "organizationId": 11,
    "warehouseId": 103,
    "language": "en_US"
  }
}


---