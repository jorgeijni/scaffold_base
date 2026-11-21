const db = require('../src/db');

async function run() {
  console.log('--- PASO 1: Inicializando DB y Limpiando Productos ---');
  db.initDB();
  db.clearProducts();
  const prodsAfterWipe = db.getProducts();
  console.log('Productos en SQLite tras limpieza:', prodsAfterWipe.length);

  console.log('--- PASO 2: Autenticando contra lunaerp.egssmart.com ---');
  const loginRes = await fetch('https://lunaerp.egssmart.com/api/v1/auth/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      userName: 'GardenAdmin',
      password: 'GardenAdmin',
      parameters: { clientId: 11, roleId: 102, organizationId: 11, warehouseId: 103, language: 'en_US' }
    })
  });
  const { token } = await loginRes.json();
  console.log('Token obtenido exitosamente:', Boolean(token));

  console.log('--- PASO 3: Obteniendo y Sincronizando Categorías desde ERP ---');
  const catRes = await fetch('https://lunaerp.egssmart.com/api/v1/models/M_Product_Category?$top=100', {
    headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + token }
  });
  const catData = await catRes.json();
  const remoteCats = catData.records || [];
  console.log('Categorías recibidas de iDempiere:', remoteCats.length);
  const syncCatRes = db.syncProductCategoriesFromERP(remoteCats, 'iDempiere REST Live (https://lunaerp.egssmart.com)');
  console.log('Categorías en SQLite tras sincronización:', syncCatRes.count);

  console.log('--- PASO 4: Obteniendo Precios y Productos desde ERP ---');
  const pricesRes = await fetch('https://lunaerp.egssmart.com/api/v1/models/M_ProductPrice?$top=100', {
    headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + token }
  });
  const pricesData = await pricesRes.json();
  const pricesMap = {};
  if (pricesData.records) {
    for (const pr of pricesData.records) {
      const pId = pr.M_Product_ID?.id ?? pr.M_Product_ID;
      if (pId && pr.PriceStd !== undefined) {
        pricesMap[pId] = parseFloat(pr.PriceStd);
      }
    }
  }
  console.log('Tarifas de productos mapeadas:', Object.keys(pricesMap).length);

  const prodRes = await fetch('https://lunaerp.egssmart.com/api/v1/models/M_Product?$top=100', {
    headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + token }
  });
  const prodData = await prodRes.json();
  const remoteProds = prodData.records || [];
  console.log('Productos recibidos de iDempiere:', remoteProds.length);

  const syncProdRes = db.syncProductsFromERP(remoteProds, 'iDempiere REST Live (https://lunaerp.egssmart.com)', pricesMap);
  console.log('Productos sincronizados en SQLite:', syncProdRes.count);

  console.log('--- VERIFICACIÓN FINAL ---');
  const currentProds = db.getProducts();
  console.log('Total productos actuales en SQLite:', currentProds.length);
  console.log('Muestra de productos en SQLite:');
  for (let i = 0; i < Math.min(8, currentProds.length); i++) {
    const p = currentProds[i];
    console.log(` - ID ${p.id} | ERP_ID: ${p.idempiere_id} | ${p.value} | ${p.name} | Cat: ${p.category} | Precio: $${p.price.toFixed(2)} | Stock: ${p.stock}`);
  }
}

run().catch((err) => {
  console.error('Error durante la sincronización:', err);
  process.exit(1);
});
