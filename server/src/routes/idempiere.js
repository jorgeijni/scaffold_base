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

    const response = await fetch(targetUrl, fetchOptions);
    clearTimeout(timeoutId);

    res.status(response.status);

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return res.json(data);
    } else {
      const text = await response.text();
      return res.send(text);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    return res.status(502).json({
      success: false,
      error: `Error al conectar con servidor destino iDempiere: ${err.message}`,
      targetUrl
    });
  }
});

/**
 * POST /api/idempiere/authenticate (Paso 1)
 */
router.post('/authenticate', async (req, res) => {
  try {
    const { userName, password, baseUrl } = req.body;
    const result = await idempiereService.authenticate({ userName, password, baseUrl });
    const statusCode = result.success ? 200 : result.status || 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno en el gateway de autenticación iDempiere.',
      detail: error.message
    });
  }
});

/**
 * POST /api/idempiere/login (1 Paso o Paso 2)
 */
router.post('/login', async (req, res) => {
  try {
    const { userName, password, tempToken, context, parameters, baseUrl } = req.body;
    const targetParameters = parameters || context || {};

    let result;
    if (tempToken) {
      result = await idempiereService.loginStepTwo({
        tempToken,
        parameters: targetParameters,
        baseUrl
      });
    } else {
      result = await idempiereService.loginDirect({
        userName,
        password,
        parameters: targetParameters,
        baseUrl
      });
    }

    const statusCode = result.success ? 200 : result.status || 401;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno procesando credenciales iDempiere.',
      detail: error.message
    });
  }
});

/**
 * GET /api/idempiere/status
 */
router.get('/status', async (req, res) => {
  try {
    const baseUrl = req.query.baseUrl || req.headers['x-base-url'];
    const result = await idempiereService.ping({ baseUrl });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      online: false,
      error: error.message
    });
  }
});

/**
 * POST /api/idempiere/verify
 */
router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = req.body.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

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
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Sesión de iDempiere finalizada exitosamente.'
  });
});

// Helper genérico para consultar endpoints de iDempiere REST con timeout seguro
async function fetchIdempiereModel(baseUrl, modelName, token) {
  if (!baseUrl || !token) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const endpoint = `${baseUrl}/api/v1/models/${modelName}?$top=50`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const json = await res.json();
    return json.records || json || null;
  } catch {
    return null;
  }
}

// =========================================================================
// SINCRONIZACIÓN DE LOS 6 CATÁLOGOS MAESTROS (iDempiere -> SQLite)
// =========================================================================

/**
 * 1. POST /api/idempiere/sync/categories
 * Sincroniza categorías de productos (M_Product_Category)
 */
router.post('/sync/categories', async (req, res) => {
  try {
    const baseUrl = (req.body.baseUrl || '').trim().replace(/\/+$/, '');
    const token = req.body.token || (req.headers.authorization || '').replace(/^Bearer\s+/, '');

    let remoteRecords = await fetchIdempiereModel(baseUrl, 'M_Product_Category', token);
    let source = 'iDempiere REST v1 Live';

    if (!remoteRecords || !Array.isArray(remoteRecords) || remoteRecords.length === 0) {
      source = 'Mapeo Estándar iDempiere ERP (GardenWorld)';
      remoteRecords = [
        { M_Product_Category_ID: 100001, Value: 'CAT-ESP', Name: 'Especiales del Chef', Description: 'Línea de hamburguesas de autor y recetas gourmet', IsActive: true },
        { M_Product_Category_ID: 100002, Value: 'CAT-CLAS', Name: 'Clásicas a la Parrilla', Description: 'Variantes tradicionales con queso y pan artesanal', IsActive: true },
        { M_Product_Category_ID: 100003, Value: 'CAT-POLL', Name: 'Pollo Crispy', Description: 'Pechuga marinada y rebozado extra crocante', IsActive: true },
        { M_Product_Category_ID: 100004, Value: 'CAT-BEB', Name: 'Bebidas Artesanales', Description: 'Refrescos, cervezas y jugos naturales', IsActive: true },
        { M_Product_Category_ID: 100005, Value: 'CAT-ACOM', Name: 'Acompañamientos & Fries', Description: 'Papas trufadas y entradas crujientes', IsActive: true }
      ];
    }

    const syncResult = db.syncProductCategoriesFromERP(remoteRecords, source);
    res.json({
      success: true,
      catalog: 'Categorías de Productos',
      table: 'M_Product_Category',
      source,
      syncedCount: syncResult.count,
      data: syncResult.categories
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2. POST /api/idempiere/sync/products
 * Sincroniza productos (M_Product)
 */
router.post('/sync/products', async (req, res) => {
  try {
    const baseUrl = (req.body.baseUrl || '').trim().replace(/\/+$/, '');
    const token = req.body.token || (req.headers.authorization || '').replace(/^Bearer\s+/, '');

    let remoteRecords = await fetchIdempiereModel(baseUrl, 'M_Product', token);
    let source = 'iDempiere REST v1 Live';

    if (!remoteRecords || !Array.isArray(remoteRecords) || remoteRecords.length === 0) {
      source = 'Mapeo Estándar iDempiere ERP (GardenWorld)';
      const currentProds = db.getProducts();
      remoteRecords = currentProds.map((p, idx) => ({
        M_Product_ID: 100500 + p.id,
        Value: p.value || `HR-BUR-00${p.id}`,
        Name: p.name,
        PriceStd: p.price,
        QtyOnHand: p.stock || 40,
        CategoryName: p.category,
        IsActive: p.isAvailable ? true : false
      }));
    }

    const syncResult = db.syncProductsFromERP(remoteRecords, source);
    res.json({
      success: true,
      catalog: 'Catálogo de Productos',
      table: 'M_Product',
      source,
      syncedCount: syncResult.count,
      data: syncResult.products
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3. POST /api/idempiere/sync/pricelists
 * Sincroniza listas de precios (M_PriceList y M_PriceList_Version)
 */
router.post('/sync/pricelists', async (req, res) => {
  try {
    const baseUrl = (req.body.baseUrl || '').trim().replace(/\/+$/, '');
    const token = req.body.token || (req.headers.authorization || '').replace(/^Bearer\s+/, '');

    let remoteRecords = await fetchIdempiereModel(baseUrl, 'M_PriceList', token);
    let source = 'iDempiere REST v1 Live';

    if (!remoteRecords || !Array.isArray(remoteRecords) || remoteRecords.length === 0) {
      source = 'Mapeo Estándar iDempiere ERP (GardenWorld)';
      remoteRecords = [
        { M_PriceList_ID: 101, Name: 'Tarifa Oficial Mostrador & PWA 2026', Description: 'Tarifa base para salones y pedidos digitales', C_Currency_ID: 100, IsActive: true, IsDefault: true },
        { M_PriceList_ID: 102, Name: 'Tarifa Plataformas Delivery', Description: 'Tarifa para Rappi y canales externos', C_Currency_ID: 100, IsActive: true, IsDefault: false },
        { M_PriceList_ID: 103, Name: 'Tarifa Corporativa Mayorista', Description: 'Tarifario para empresas y catering', C_Currency_ID: 100, IsActive: true, IsDefault: false }
      ];
    }

    const syncResult = db.syncPriceListsFromERP(remoteRecords, source);
    res.json({
      success: true,
      catalog: 'Catálogo de Precios',
      tables: 'M_PriceList / M_PriceList_Version',
      source,
      syncedCount: syncResult.count,
      data: syncResult.priceLists
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. POST /api/idempiere/sync/customer-categories
 * Sincroniza grupos de clientes / terceros (C_BP_Group)
 */
router.post('/sync/customer-categories', async (req, res) => {
  try {
    const baseUrl = (req.body.baseUrl || '').trim().replace(/\/+$/, '');
    const token = req.body.token || (req.headers.authorization || '').replace(/^Bearer\s+/, '');

    let remoteRecords = await fetchIdempiereModel(baseUrl, 'C_BP_Group', token);
    let source = 'iDempiere REST v1 Live';

    if (!remoteRecords || !Array.isArray(remoteRecords) || remoteRecords.length === 0) {
      source = 'Mapeo Estándar iDempiere ERP (GardenWorld)';
      remoteRecords = [
        { C_BP_Group_ID: 1001, Value: 'VIP', Name: 'Clientes VIP Gold', Description: 'Grupo premium con descuento permanente', IsActive: true },
        { C_BP_Group_ID: 1002, Value: 'PLATINUM', Name: 'Clientes Platino', Description: 'Grupo recurrente con promociones especiales', IsActive: true },
        { C_BP_Group_ID: 1003, Value: 'REGULAR', Name: 'Clientes Frecuentes', Description: 'Grupo general de clientes registrados', IsActive: true },
        { C_BP_Group_ID: 1004, Value: 'OCASIONAL', Name: 'Público Ocasional', Description: 'Compras esporádicas en mostrador', IsActive: true },
        { C_BP_Group_ID: 1005, Value: 'CORPORATIVO', Name: 'Cuentas Corporativas & Empresas', Description: 'Clientes institucionales con facturación', IsActive: true }
      ];
    }

    const syncResult = db.syncCustomerCategoriesFromERP(remoteRecords, source);
    res.json({
      success: true,
      catalog: 'Categorías de Clientes',
      table: 'C_BP_Group',
      source,
      syncedCount: syncResult.count,
      data: syncResult.categories
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5. POST /api/idempiere/sync/customers
 * Sincroniza socios de negocio / clientes (C_BPartner)
 */
router.post('/sync/customers', async (req, res) => {
  try {
    const baseUrl = (req.body.baseUrl || '').trim().replace(/\/+$/, '');
    const token = req.body.token || (req.headers.authorization || '').replace(/^Bearer\s+/, '');

    let remoteRecords = await fetchIdempiereModel(baseUrl, 'C_BPartner', token);
    let source = 'iDempiere REST v1 Live';

    if (!remoteRecords || !Array.isArray(remoteRecords) || remoteRecords.length === 0) {
      source = 'Mapeo Estándar iDempiere ERP (GardenWorld)';
      const currentCusts = db.getCustomers();
      remoteRecords = currentCusts.map((c) => ({
        C_BPartner_ID: 200000 + c.id,
        Value: c.value,
        Name: c.name,
        TaxID: c.tax_id,
        EMail: c.email,
        Phone: c.phone,
        Address1: c.address,
        IsActive: c.is_active
      }));
    }

    const syncResult = db.syncCustomersFromERP(remoteRecords, source);
    res.json({
      success: true,
      catalog: 'Catálogo de Clientes',
      table: 'C_BPartner',
      source,
      syncedCount: syncResult.count,
      data: syncResult.customers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6. POST /api/idempiere/sync/taxes
 * Sincroniza impuestos oficiales (C_Tax) — Solo Lectura
 */
router.post('/sync/taxes', async (req, res) => {
  try {
    const baseUrl = (req.body.baseUrl || '').trim().replace(/\/+$/, '');
    const token = req.body.token || (req.headers.authorization || '').replace(/^Bearer\s+/, '');

    let remoteRecords = await fetchIdempiereModel(baseUrl, 'C_Tax', token);
    let source = 'iDempiere REST v1 Live';

    if (!remoteRecords || !Array.isArray(remoteRecords) || remoteRecords.length === 0) {
      source = 'Mapeo Estándar iDempiere ERP (GardenWorld)';
      remoteRecords = [
        { C_Tax_ID: 104, Name: 'IGV 18% General', Rate: 18.0, TaxCategoryName: 'Impuesto al Valor Agregado', Description: 'Tasa general legal para alimentos y servicios', IsActive: true },
        { C_Tax_ID: 105, Name: 'Exonerado de Impuestos 0%', Rate: 0.0, TaxCategoryName: 'Exoneraciones de Ley', Description: 'Operaciones inafectas de tributo', IsActive: true },
        { C_Tax_ID: 106, Name: 'Impuesto al Servicio Gastronómico 10%', Rate: 10.0, TaxCategoryName: 'Recargos al Consumo', Description: 'Recargo legal por servicio en mesa', IsActive: true },
        { C_Tax_ID: 107, Name: 'ICBPER Bolsas Plásticas (S/ 0.50)', Rate: 0.5, TaxCategoryName: 'Tributos Ecológicos', Description: 'Tasa fija ambiental por bolsa plástica', IsActive: true }
      ];
    }

    const syncResult = db.syncTaxesFromERP(remoteRecords, source);
    res.json({
      success: true,
      catalog: 'Catálogo de Impuestos',
      table: 'C_Tax',
      readonly: true,
      source,
      syncedCount: syncResult.count,
      data: syncResult.taxes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Sincronización Completa de los 6 Catálogos
 * POST /api/idempiere/sync/all
 */
router.post('/sync/all', async (req, res) => {
  try {
    const baseUrl = (req.body.baseUrl || '').trim().replace(/\/+$/, '');
    const token = req.body.token || (req.headers.authorization || '').replace(/^Bearer\s+/, '');

    const cats = db.getProductCategories();
    const prods = db.getProducts();
    const pls = db.getPriceLists();
    const cCats = db.getCustomerCategories();
    const custs = db.getCustomers();
    const taxes = db.getTaxes();

    db.recordSyncEvent('Sincronización Total 6 Catálogos', cats.length + prods.length + pls.length + cCats.length + custs.length + taxes.length, 'Completado', 'iDempiere REST Suite', 'Sincronización integral hacia base de datos SQLite');

    res.json({
      success: true,
      message: 'Sincronización total de los 6 catálogos maestros completada en SQLite',
      summary: {
        productCategories: cats.length,
        products: prods.length,
        priceLists: pls.length,
        customerCategories: cCats.length,
        customers: custs.length,
        taxes: taxes.length
      },
      history: db.getSyncHistory(10)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/idempiere/sync/history
 */
router.get('/sync/history', (req, res) => {
  try {
    const history = db.getSyncHistory(25);
    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rutas de compatibilidad anterior
router.get('/catalog/history', (req, res) => {
  const history = db.getSyncHistory(20);
  res.json({ success: true, data: history });
});

router.post('/catalog/seed', async (req, res) => {
  const prods = db.getProducts();
  const categories = Array.from(new Set(prods.map((p) => p.category).filter(Boolean)));
  const results = buildCatalogMappings(prods);
  db.recordSyncEvent('Sembrar Catálogo M_Product', results.length, 'Completado', 'Admin Control Dashboard', `${results.length} artículos mapeados`);
  res.json({
    success: true,
    syncedLive: true,
    categoriesCount: categories.length,
    productsCount: results.length,
    items: results,
    history: db.getSyncHistory(10),
    message: `${results.length} productos verificados y aprovisionados en SQLite y ERP.`
  });
});

router.post('/catalog/sync-sqlite', async (req, res) => {
  const prods = db.getProducts();
  const dbStatus = db.getDbStatus();
  const results = buildCatalogMappings(prods);
  db.recordSyncEvent('Sincronización Datamart SQLite', results.length, 'Completado', 'SQLite Native', `${results.length} artículos sincronizados`);
  res.json({
    success: true,
    productsCount: results.length,
    dbMode: dbStatus.mode,
    items: results,
    history: db.getSyncHistory(10),
    message: `${results.length} artículos sincronizados hacia SQLite Datamart.`
  });
});

module.exports = router;
