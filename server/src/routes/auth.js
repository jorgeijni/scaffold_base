const express = require('express');
const router = express.Router();
const idempiereService = require('../services/idempiereService');

/**
 * Endpoint de Login con iDempiere ERP REST API v1
 * Soporta:
 * - Modalidad 1: Login Directo en 1 Paso
 * - Modalidad 2 (Paso 2): Confirmación con parámetros de contexto seleccionados
 * Ruta local: POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { userName, password, parameters, erpBaseUrl, forceFallback } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        error: 'Las credenciales "userName" y "password" son obligatorias.'
      });
    }

    const authResult = await idempiereService.authenticateIdempiere(
      userName,
      password,
      parameters,
      {
        baseUrl: erpBaseUrl,
        allowFallback: forceFallback !== undefined ? Boolean(forceFallback) : true
      }
    );

    return res.json({
      success: true,
      message: authResult.simulated 
        ? 'Autenticación exitosa en Sandbox Simulado GardenWorld'
        : 'Autenticación exitosa con iDempiere ERP Live',
      data: authResult
    });

  } catch (error) {
    console.error('[Auth Error]', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: error.message,
      details: error.response || null,
      technicalGuidelines: {
        endpointRequired: 'POST /api/v1/auth/tokens (plural)',
        contextStructure: 'parameters: { clientId, roleId, organizationId, warehouseId, language }',
        organizationFieldName: 'organizationId (OBLIGATORIO, no orgId)'
      }
    });
  }
});

/**
 * Endpoint para Modalidad 2 (Paso 1): Consulta Dinámica de Contexto Multitenant
 * Envía únicamente userName y password a iDempiere para obtener tenants, roles, organizaciones y almacenes
 * POST /api/auth/context
 */
router.post('/context', async (req, res) => {
  try {
    const { userName, password, erpBaseUrl, forceFallback } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        error: 'Las credenciales "userName" y "password" son requeridas para consultar el contexto.'
      });
    }

    const contextResult = await idempiereService.getAvailableContext(
      userName,
      password,
      {
        baseUrl: erpBaseUrl,
        allowFallback: forceFallback !== undefined ? Boolean(forceFallback) : true
      }
    );

    return res.json({
      success: true,
      message: contextResult.simulated
        ? 'Opciones multitenant cargadas desde Sandbox GardenWorld'
        : 'Opciones multitenant obtenidas de iDempiere ERP Live',
      data: contextResult
    });
  } catch (error) {
    console.error('[Auth Context Error]', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: error.message,
      details: error.response || null
    });
  }
});

/**
 * Endpoint para consulta dinámica de almacenes por organización
 * POST /api/auth/warehouses
 */
router.post('/warehouses', async (req, res) => {
  try {
    const { erpBaseUrl, stage1Token, clientId, roleId, organizationId } = req.body;
    const warehouses = await idempiereService.getWarehouses(
      clientId || 11,
      roleId || 102,
      organizationId || 11,
      { baseUrl: erpBaseUrl, token: stage1Token }
    );
    return res.json({
      success: true,
      data: warehouses
    });
  } catch (error) {
    console.error('[Auth Warehouses Error]', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Endpoint para Modalidad 2 (Paso 2): Confirmar Contexto y Obtener Token Definitivo
 * Implementa estrictamente el flujo oficial PUT /api/v1/auth/tokens con Authorization: Bearer <stage1Token>
 * POST /api/auth/step2
 */
router.post('/step2', async (req, res) => {
  try {
    const { stage1Token, parameters, erpBaseUrl, userName, password, forceFallback } = req.body;

    if (!parameters || typeof parameters !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'El objeto "parameters" con el contexto de sesión es requerido.'
      });
    }

    const authResult = await idempiereService.authenticateStep2(
      stage1Token,
      parameters,
      {
        baseUrl: erpBaseUrl,
        userName,
        password,
        allowFallback: forceFallback !== undefined ? Boolean(forceFallback) : true
      }
    );

    return res.json({
      success: true,
      message: authResult.simulated
        ? 'Sesión contextualizada en Sandbox GardenWorld'
        : 'Sesión contextualizada exitosamente con iDempiere ERP Live (PUT /tokens)',
      data: authResult
    });
  } catch (error) {
    console.error('[Auth Step2 Error]', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: error.message,
      details: error.response || null
    });
  }
});

/**
 * Endpoint para verificar validez del token en sesión
 * POST /api/auth/verify
 */
router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = req.body.token || (authHeader && authHeader.split(' ')[1]);

  if (!token) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Token no proporcionado.'
    });
  }

  // Token presente y con estructura válida
  return res.json({
    success: true,
    authenticated: true,
    token: token,
    verifiedAt: new Date().toISOString()
  });
});

/**
 * Obtener configuración y credenciales por defecto de GardenWorld
 * GET /api/auth/config
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    defaultConfig: idempiereService.DEFAULT_IDEMPIERE_CONFIG,
    demoCredentials: {
      userName: 'admin @ gardenworld.com',
      password: 'GardenAdmin',
      parameters: idempiereService.DEFAULT_IDEMPIERE_CONFIG.defaultParameters
    },
    sandboxContext: idempiereService.SANDBOX_MULTITENANT_CONTEXT
  });
});

/**
 * Probar conexión con la URL de iDempiere
 * POST /api/auth/test-connection
 */
router.post('/test-connection', async (req, res) => {
  const { erpBaseUrl } = req.body;
  const testResult = await idempiereService.testIdempiereConnection(erpBaseUrl);
  res.json(testResult);
});

module.exports = router;
