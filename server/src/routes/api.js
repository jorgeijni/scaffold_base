const express = require('express');
const router = express.Router();
const db = require('../db');
const os = require('os');

// Health Check Endpoint (For Dokploy Health Checks)
router.get('/health', (req, res) => {
  const dbStatus = db.getDbStatus();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    platform: 'Dokploy CI/CD Live Demo',
    database: dbStatus
  });
});

// Ping DB Latency
router.get('/db/ping', (req, res) => {
  try {
    const ping = db.pingDb();
    res.json({ success: true, data: ping });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 1. PRODUCTOS (Mantenible)
// ==========================================
router.get('/products', (req, res) => {
  try {
    const products = db.getProducts();
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/products/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/products', (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Nombre y precio son requeridos.' });
    }
    const product = db.addProduct(req.body);
    res.status(201).json({ success: true, message: 'Producto creado exitosamente en SQLite', data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/products/:id', (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    res.json({ success: true, message: 'Producto actualizado exitosamente', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/products/:id/toggle', (req, res) => {
  try {
    const updated = db.toggleProductAvailability(req.params.id);
    if (!updated) return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    res.json({ success: true, message: 'Disponibilidad actualizada', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/products/:id', (req, res) => {
  try {
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    res.json({ success: true, message: `Producto ${req.params.id} eliminado.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/reset', (req, res) => {
  try {
    const products = db.resetProducts();
    res.json({ success: true, message: 'Datos de catálogo restablecidos en SQLite.', count: products.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. CATEGORÍAS DE PRODUCTOS (Mantenible)
// ==========================================
router.get('/categories', (req, res) => {
  try {
    const categories = db.getProductCategories();
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/categories/:id', (req, res) => {
  try {
    const category = db.getProductCategoryById(req.params.id);
    if (!category) return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/categories', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'El nombre de categoría es obligatorio.' });
    const category = db.addProductCategory(req.body);
    res.status(201).json({ success: true, message: 'Categoría creada exitosamente', data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/categories/:id', (req, res) => {
  try {
    const updated = db.updateProductCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
    res.json({ success: true, message: 'Categoría actualizada exitosamente', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/categories/:id', (req, res) => {
  try {
    const deleted = db.deleteProductCategory(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. LISTAS DE PRECIOS & VERSIONES (Mantenible)
// ==========================================
router.get('/pricelists', (req, res) => {
  try {
    const lists = db.getPriceLists();
    res.json({ success: true, count: lists.length, data: lists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pricelists/:id', (req, res) => {
  try {
    const list = db.getPriceListById(req.params.id);
    if (!list) return res.status(404).json({ success: false, error: 'Lista de precios no encontrada' });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/pricelists', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'El nombre de lista es obligatorio.' });
    const list = db.addPriceList(req.body);
    res.status(201).json({ success: true, message: 'Lista de precios creada', data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/pricelists/:id', (req, res) => {
  try {
    const updated = db.updatePriceList(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Lista de precios no encontrada' });
    res.json({ success: true, message: 'Lista de precios actualizada', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/pricelists/:id', (req, res) => {
  try {
    const deleted = db.deletePriceList(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Lista de precios no encontrada' });
    res.json({ success: true, message: 'Lista de precios eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pricelists/:id/versions', (req, res) => {
  try {
    const versions = db.getPriceListVersions(req.params.id);
    res.json({ success: true, count: versions.length, data: versions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/pricelists/:id/versions', (req, res) => {
  try {
    const { name, valid_from } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'El nombre de versión es obligatorio.' });
    const version = db.addPriceListVersion({
      price_list_id: req.params.id,
      name,
      valid_from
    });
    res.status(201).json({ success: true, message: 'Versión de lista creada', data: version });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pricelists/versions/:versionId/prices', (req, res) => {
  try {
    const prices = db.getVersionPrices(req.params.versionId);
    res.json({ success: true, count: prices.length, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/pricelists/versions/:versionId/prices', (req, res) => {
  try {
    const { product_id, price_std, price_list, price_limit } = req.body;
    if (!product_id || price_std === undefined) {
      return res.status(400).json({ success: false, error: 'product_id y price_std son requeridos.' });
    }
    const price = db.setProductPrice(req.params.versionId, product_id, {
      price_std,
      price_list: price_list ?? price_std,
      price_limit: price_limit ?? price_std * 0.9
    });
    res.json({ success: true, message: 'Precio de producto actualizado en la versión', data: price });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. CATEGORÍAS DE CLIENTES / BP_GROUPS (Mantenible)
// ==========================================
router.get('/customer-categories', (req, res) => {
  try {
    const categories = db.getCustomerCategories();
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/customer-categories/:id', (req, res) => {
  try {
    const cat = db.getCustomerCategoryById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, error: 'Categoría de cliente no encontrada' });
    res.json({ success: true, data: cat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/customer-categories', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'El nombre de grupo de cliente es obligatorio.' });
    const cat = db.addCustomerCategory(req.body);
    res.status(201).json({ success: true, message: 'Grupo de clientes creado', data: cat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/customer-categories/:id', (req, res) => {
  try {
    const updated = db.updateCustomerCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Categoría de cliente no encontrada' });
    res.json({ success: true, message: 'Grupo de clientes actualizado', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/customer-categories/:id', (req, res) => {
  try {
    const deleted = db.deleteCustomerCategory(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Categoría de cliente no encontrada' });
    res.json({ success: true, message: 'Grupo de clientes eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. CLIENTES / SOCIOS DE NEGOCIO (Mantenible)
// ==========================================
router.get('/customers', (req, res) => {
  try {
    const customers = db.getCustomers();
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/customers/:id', (req, res) => {
  try {
    const customer = db.getCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/customers', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'El nombre del cliente es obligatorio.' });
    const customer = db.addCustomer(req.body);
    res.status(201).json({ success: true, message: 'Cliente registrado exitosamente', data: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/customers/:id', (req, res) => {
  try {
    const updated = db.updateCustomer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    res.json({ success: true, message: 'Cliente actualizado exitosamente', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/customers/:id', (req, res) => {
  try {
    const deleted = db.deleteCustomer(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    res.json({ success: true, message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 6. IMPUESTOS (SOLO LECTURA EN APLICACIÓN)
// ==========================================
router.get('/taxes', (req, res) => {
  try {
    const taxes = db.getTaxes();
    res.json({
      success: true,
      readonly: true,
      message: 'Catálogo oficial de impuestos de solo lectura (mantenido exclusivamente desde ERP)',
      count: taxes.length,
      data: taxes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/taxes/:id', (req, res) => {
  try {
    const tax = db.getTaxById(req.params.id);
    if (!tax) return res.status(404).json({ success: false, error: 'Impuesto no encontrado' });
    res.json({ success: true, readonly: true, data: tax });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rechazo explícito a mutaciones manuales de impuestos
router.all(['/taxes', '/taxes/:id'], (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())) {
    return res.status(405).json({
      success: false,
      error: 'Operación no permitida: El catálogo de impuestos es de SOLO LECTURA en esta aplicación y se sincroniza exclusivamente desde iDempiere ERP.'
    });
  }
  next();
});

// ==========================================
// 7. CONSUMER METRICS & ORDERS
// ==========================================
router.get('/metrics/customers', (req, res) => {
  try {
    const metrics = db.getConsumerMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/orders', (req, res) => {
  try {
    const origin = req.query.origin || 'all';
    const orders = db.getOrders(origin);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/orders', (req, res) => {
  try {
    const newOrder = db.createOrder(req.body);
    res.status(201).json({ success: true, message: 'Orden creada con éxito en SQLite', data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'El campo "status" es obligatorio.' });
    const updated = db.updateOrder(id, { status });
    if (!updated) return res.status(404).json({ success: false, error: `Orden ${id} no encontrada.` });
    res.json({ success: true, message: 'Estado de orden actualizado', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/orders/:id/sync-erp', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization || '';
    const token = req.body.token || (authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Se requiere un token Bearer activo de iDempiere para coordinar la sincronización.'
      });
    }

    const order = db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: `Orden ${id} no encontrada.` });
    }

    const ctx = req.body.context || {};
    const baseUrl = (req.body.baseUrl || '').trim().replace(/\/+$/, '');
    const orgId = ctx.organizationId ?? ctx.orgId ?? 11;

    const erpPayload = {
      AD_Client_ID: ctx.clientId ?? 11,
      AD_Org_ID: orgId,
      M_Warehouse_ID: ctx.warehouseId ?? 103,
      DocumentNo: order.id,
      Description: `[${order.channel}] Cliente: ${order.customerName} | Items: ${(order.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}`,
      GrandTotal: order.total,
      IsSOTrx: true,
      ...(ctx.userId ? { SalesRep_ID: ctx.userId } : {})
    };

    let syncedLive = false;
    let erpDocumentNo = `SO-${order.id}`;
    let remoteStatus = null;
    let remoteDetail = null;

    if (baseUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const erpRes = await fetch(`${baseUrl}/api/v1/models/C_Order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(erpPayload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        remoteStatus = erpRes.status;
        const text = await erpRes.text();
        let parsed = {};
        try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { message: text }; }

        if (erpRes.ok) {
          syncedLive = true;
          erpDocumentNo = parsed.DocumentNo || (parsed.id ? `SO-${parsed.id}` : erpDocumentNo);
          remoteDetail = parsed;
        } else {
          remoteDetail = parsed.detail || parsed.message || parsed;
        }
      } catch (err) {
        remoteDetail = err.message;
      }
    }

    const updated = db.updateOrder(id, {
      erpSyncStatus: syncedLive ? 'Sincronizado' : 'Coordinado (Cola ERP)',
      erpDocumentNo: syncedLive ? erpDocumentNo : null,
      erpContext: {
        userId: ctx.userId ?? null,
        clientId: ctx.clientId ?? null,
        roleId: ctx.roleId ?? null,
        orgId,
        warehouseId: ctx.warehouseId ?? null
      }
    });

    res.json({
      success: true,
      syncedLive,
      remoteStatus,
      message: syncedLive
        ? `Sincronizado en vivo con iDempiere C_Order (${erpDocumentNo}).`
        : `Sincronización coordinada con contexto ERP (Client #${erpPayload.AD_Client_ID}, Org #${erpPayload.AD_Org_ID}). Respuesta remota C_Order: HTTP ${remoteStatus || 'N/A'} (${typeof remoteDetail === 'string' ? remoteDetail : JSON.stringify(remoteDetail)}).`,
      erpPayload,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Diagnóstico de Infraestructura y Base de Datos
router.get('/debug-network', (req, res) => {
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    uptime: process.uptime(),
    db_status: db.getDbStatus()
  });
});

module.exports = router;
