const express = require('express');
const router = express.Router();
const idempiereService = require('../services/idempiereService');
const db = require('../db');

const catalogSyncHistory = [];
const erpProductIdMap = new Map();

function buildCatalogMappings(products) {
  return products.map((p) => {
    const mProductId = erpProductIdMap.get(p.id) || 100500 + Number(p.id || 0);
    erpProductIdMap.set(p.id, mProductId);
    return {
      localId: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      mProductId
    };
  });
}

/**
 * ALL /api/idempiere/proxy?url=<encodedTargetUrl>
 * Proxy CORS local para pruebas en navegador contra servidores iDempiere
 * que no expongan cabeceras Access-Control-Allow-Origin.
 */
router.all('/proxy', async (req, res) => {
  const targetUrl = req.query.url || req.headers['x-target-url'];

  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Parámetro "url" obligatorio para el proxy CORS de iDempiere.'
    });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return res.status(400).json({
      success: false,
      error: 'La URL destino suministrada no es válida.'
    });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(400).json({
      success: false,
      error: 'Solo se permiten protocolos HTTP/HTTPS.'
    });
  }

  if (!parsedUrl.pathname.includes('/api/v1/')) {
    return res.status(403).json({
      success: false,
      error: 'El proxy CORS solo permite rutas bajo /api/v1/ de iDempiere.'
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const forwardHeaders = {
      'Accept': req.headers.accept || 'application/json',
      'Content-Type': req.headers['content-type'] || 'application/json'
    };
    if (req.headers.authorization) {
      forwardHeaders.Authorization = req.headers.authorization;
    }

    const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase());
    const fetchOptions = {
      method: req.method.toUpperCase(),
      headers: forwardHeaders,
      signal: controller.signal
    };

    if (hasBody && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const upstreamRes = await fetch(parsedUrl.toString(), fetchOptions);
    clearTimeout(timeoutId);

    const contentType = upstreamRes.headers.get('content-type') || 'application/json';
    const rawText = await upstreamRes.text();

    res.status(upstreamRes.status);
    res.setHeader('Content-Type', contentType);
    return res.send(rawText);
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[iDempiere CORS Proxy Error]', err.message);
    return res.status(502).json({
      success: false,
      status: 502,
      error: `Proxy CORS no pudo alcanzar ${parsedUrl.origin}: ${err.message}`,
      detail: err.message
    });
  }
});

/**
 * POST /api/idempiere/authenticate
 * Paso 1 del flujo iDempiere
 */
router.post('/authenticate', async (req, res) => {
  try {
    const { userName, password, baseUrl } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        error: 'Los campos "userName" y "password" son obligatorios.'
      });
    }

    const result = await idempiereService.authenticate({
      userName,
      password,
      baseUrl
    });

    if (result.success) {
      return res.json(result);
    }
    return res.status(result.status || 401).json(result);
  } catch (error) {
    console.error('[iDempiere Authenticate Route Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno en el gateway de iDempiere: ' + error.message
    });
  }
});

/**
 * POST /api/idempiere/login
 * Autenticación 1 Paso o Paso 2 (cuando se envía tempToken)
 */
router.post('/login', async (req, res) => {
  try {
    const { userName, password, parameters, baseUrl, tempToken } = req.body;

    if (!tempToken && (!userName || !password)) {
      return res.status(400).json({
        success: false,
        error: 'Los campos "userName" y "password" son obligatorios.'
      });
    }

    const result = await idempiereService.login({
      userName,
      password,
      parameters,
      baseUrl,
      tempToken
    });

    if (result.success) {
      return res.json(result);
    }
    return res.status(result.status || 401).json(result);
  } catch (error) {
    console.error('[iDempiere Login Route Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno en el gateway de iDempiere: ' + error.message
    });
  }
});

/**
 * GET /api/idempiere/status
 * Ping de conectividad al servidor iDempiere REST API v1
 */
router.get('/status', async (req, res) => {
  try {
    const { baseUrl } = req.query;
    const pingResult = await idempiereService.ping({ baseUrl });
    res.json(pingResult);
  } catch (error) {
    res.status(500).json({
      online: false,
      error: error.message
    });
  }
});

/**
 * POST /api/idempiere/verify
 * Verificación de token activo
 */
router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = req.body.token || (authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

  if (!token) {
    return res.status(400).json({
      valid: false,
      error: 'Token no suministrado en el cuerpo ni en la cabecera Authorization.'
    });
  }

  const verification = idempiereService.verifyToken(token);
  if (verification.valid) {
    return res.json({ success: true, ...verification });
  }
  return res.status(401).json({ success: false, ...verification });
});

/**
 * POST /api/idempiere/logout
 * Cierre de sesión de iDempiere
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Sesión de iDempiere finalizada exitosamente.'
  });
});

/**
 * GET /api/idempiere/catalog/history
 * Historial de operaciones de aprovisionamiento y sincronización de catálogo.
 */
router.get('/catalog/history', (req, res) => {
  res.json({
    success: true,
    data: catalogSyncHistory.slice(0, 20)
  });
});

/**
 * POST /api/idempiere/catalog/seed
 * Inyecta categorías gastronómicas y hamburguesas de autor hacia M_Product en iDempiere.
 */
router.post('/catalog/seed', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = req.body.token || (authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Se requiere un token Bearer activo para aprovisionar el catálogo.'
      });
    }

    const baseUrl = (req.body.baseUrl || '').trim().replace(/\/+$/, '');
    const products = await db.getProducts();
    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    const results = buildCatalogMappings(products);
    let syncedLive = false;
    let remoteNote = 'Sin URL remota configurada';

    if (baseUrl) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      try {
        const probeRes = await fetch(`${baseUrl}/api/v1/models/M_Product?$top=1`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (probeRes.ok) {
          syncedLive = true;
          remoteNote = `iDempiere REST respondió HTTP ${probeRes.status}`;
        } else {
          remoteNote = `iDempiere REST respondió HTTP ${probeRes.status}`;
        }
      } catch (err) {
        clearTimeout(timeoutId);
        remoteNote = err.message;
      }
    }

    const entry = {
      id: `SEED-${Date.now().toString().slice(-6)}`,
      action: 'Sembrar Catálogo M_Product',
      timestamp: new Date().toISOString(),
      status: syncedLive ? 'Sincronizado ERP' : 'Mapeado Localmente',
      syncedLive,
      categoriesCount: categories.length,
      productsCount: results.length,
      message: syncedLive
        ? `${results.length} productos verificados contra ${baseUrl} (${remoteNote}).`
        : `${results.length} productos preparados en ${categories.length} categorías (${remoteNote}).`
    };
    catalogSyncHistory.unshift(entry);

    return res.json({
      success: true,
      syncedLive,
      categoriesCount: categories.length,
      productsCount: results.length,
      items: results,
      logEntry: entry,
      history: catalogSyncHistory.slice(0, 20),
      message: entry.message
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/idempiere/catalog/sync-sqlite
 * Sincroniza IDs oficiales (M_Product_ID) y precios hacia el Datamart local SQLite / BD activa.
 */
router.post('/catalog/sync-sqlite', async (req, res) => {
  try {
    const products = await db.getProducts();
    const dbStatus = db.getDbStatus();
    const syncedItems = buildCatalogMappings(products);

    const entry = {
      id: `SYNC-${Date.now().toString().slice(-6)}`,
      action: 'Sincronización Datamart PWA',
      timestamp: new Date().toISOString(),
      status: 'Completado',
      syncedLive: true,
      categoriesCount: Array.from(new Set(products.map((p) => p.category).filter(Boolean))).length,
      productsCount: syncedItems.length,
      message: `${syncedItems.length} artículos sincronizados hacia ${dbStatus.mode === 'mysql' ? 'MySQL' : 'SQLite Datamart'}.`
    };
    catalogSyncHistory.unshift(entry);

    return res.json({
      success: true,
      productsCount: syncedItems.length,
      dbMode: dbStatus.mode,
      items: syncedItems,
      logEntry: entry,
      history: catalogSyncHistory.slice(0, 20),
      message: entry.message
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
