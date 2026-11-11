const express = require('express');
const router = express.Router();
const db = require('../db');
const dns = require('dns').promises;
const os = require('os');
const net = require('net');

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

// List products
router.get('/products', async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new product
router.post('/products', async (req, res) => {
  try {
    const { name, category, price, stock, image, description } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Nombre y precio son requeridos.' });
    }
    const product = await db.addProduct({ name, category, price, stock, image, description });
    res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle product availability
router.patch('/products/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.toggleProductAvailability(id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    res.json({ success: true, message: 'Disponibilidad actualizada', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteProduct(id);
    res.json({ success: true, message: `Producto ${id} eliminado.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Consumer / Customer Metrics according to consumption
router.get('/metrics/customers', (req, res) => {
  try {
    const metrics = db.getConsumerMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Orders (PWA Preventa, E-commerce & Admin tracking)
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
    res.status(201).json({ success: true, message: 'Orden creada con éxito', data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'El campo "status" es obligatorio.' });
    }
    const updated = db.updateOrder(id, {
      status,
      approvedBy: approvedBy || null
    });
    if (!updated) {
      return res.status(404).json({ success: false, error: `Orden ${id} no encontrada.` });
    }
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

// Reset initial products
router.post('/reset', async (req, res) => {
  try {
    await db.resetProducts();
    res.json({ success: true, message: 'Datos demo de Hamburger Rapid restablecidos.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper for socket testing
function checkTcpPort(host, port = 3306, timeout = 300) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.once('connect', () => {
      socket.destroy();
      resolve({ host, port, open: true });
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve({ host, port, open: false, reason: 'timeout' });
    });
    socket.once('error', (err) => {
      resolve({ host, port, open: false, reason: err.code || err.message });
    });
    socket.connect(port, host);
  });
}

// Diagnostic network endpoint
router.get('/debug-network', async (req, res) => {
  const hostsToTest = [
    process.env.DB_HOST,
    '172.18.0.1',
    '172.17.0.1',
    '127.0.0.1'
  ].filter(Boolean);

  const dnsResults = {};
  for (const host of hostsToTest) {
    try {
      const lookup = await dns.lookup(host);
      dnsResults[host] = { ok: true, ip: lookup.address };
    } catch (err) {
      dnsResults[host] = { ok: false, error: err.message };
    }
  }

  const candidateTargets = ['172.18.0.1', '172.17.0.1'];
  for (let i = 2; i <= 30; i++) {
    candidateTargets.push(`172.18.0.${i}`);
  }

  const portScans = await Promise.all(candidateTargets.map(ip => checkTcpPort(ip, 3306, 250)));
  const open3306 = portScans.filter(p => p.open);

  res.json({
    hostname: os.hostname(),
    interfaces: os.networkInterfaces(),
    environment: {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      HAS_PASSWORD: !!process.env.DB_PASSWORD,
      HAS_DATABASE_URL: !!process.env.DATABASE_URL
    },
    dns_tests: dnsResults,
    open_mysql_ports_found: open3306,
    db_status: db.getDbStatus()
  });
});

module.exports = router;
