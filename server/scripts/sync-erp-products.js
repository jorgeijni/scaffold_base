/**
 * Script para limpiar productos y categorías locales en SQLite
 * y poblarlos directamente desde iDempiere ERP (https://lunaerp.egssmart.com/)
 */

const https = require('https');
const path = require('path');
const db = require('../src/db');

const ERP_URL = 'https://lunaerp.egssmart.com';

function httpRequest(url, method, headers, payload) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: method,
      headers: headers,
      rejectUnauthorized: false
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout en petición a ' + url));
    });

    if (payload) req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('=== INICIANDO SINCRONIZACIÓN Y POBLACIÓN DESDE IDEMPIERE ERP ===');
  console.log(`Servidor ERP: ${ERP_URL}`);

  // 1. Obtener Token
  console.log('\n1. Autenticando en iDempiere...');
  const loginPayload = JSON.stringify({
    userName: 'GardenAdmin',
    password: 'GardenAdmin',
    parameters: {
      clientId: 11,
      roleId: 102,
      organizationId: 11,
      warehouseId: 103,
      language: 'es_PE'
    }
  });

  const authRes = await httpRequest(
    `${ERP_URL}/api/v1/auth/tokens`,
    'POST',
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(loginPayload)
    },
    loginPayload
  );

  if (authRes.statusCode !== 200 || !authRes.data?.token) {
    throw new Error(`Fallo de autenticación: HTTP ${authRes.statusCode} - ${JSON.stringify(authRes.data)}`);
  }

  const token = authRes.data.token;
  console.log('✓ Token de autenticación obtenido exitosamente.');

  const authHeaders = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Obtener Categorías de Productos
  console.log('\n2. Consultando Categorías de Productos (m_product_category)...');
  const catRes = await httpRequest(`${ERP_URL}/api/v1/models/m_product_category`, 'GET', authHeaders);
  const categories = catRes.data?.records || (Array.isArray(catRes.data) ? catRes.data : []);
  console.log(`✓ Se recuperaron ${categories.length} categorías desde iDempiere.`);

  // 3. Obtener Productos
  console.log('\n3. Consultando Productos (m_product)...');
  const prodRes = await httpRequest(`${ERP_URL}/api/v1/models/m_product`, 'GET', authHeaders);
  const products = prodRes.data?.records || (Array.isArray(prodRes.data) ? prodRes.data : []);
  console.log(`✓ Se recuperaron ${products.length} productos desde iDempiere.`);

  // 4. Limpiar tablas en SQLite
  console.log('\n4. Limpiando productos y categorías existentes en SQLite...');
  const sqlite = db.getDatabase();
  sqlite.exec('DELETE FROM products;');
  sqlite.exec('DELETE FROM product_categories;');
  console.log('✓ Tablas products y product_categories vaciadas correctamente.');

  // 5. Poblar Categorías
  console.log('\n5. Insertando categorías en SQLite...');
  const catResult = db.syncCatalogFromERP('product_categories', categories);
  console.log(`✓ ${catResult.count} categorías insertadas exitosamente.`);

  // 6. Poblar Productos
  console.log('\n6. Insertando productos en SQLite...');
  const prodResult = db.syncCatalogFromERP('products', products);
  console.log(`✓ ${prodResult.count} productos insertados exitosamente.`);

  // 7. Resumen final de la base de datos
  const status = db.getDbStatus();
  console.log('\n=== ESTADO FINAL DE LA BASE DE DATOS SQLITE ===');
  console.log(JSON.stringify(status, null, 2));
}

run().catch(err => {
  console.error('ERROR EN PROCESO:', err);
  process.exit(1);
});
