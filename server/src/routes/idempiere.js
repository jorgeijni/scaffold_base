const express = require('express');
const router = express.Router();
const idempiereService = require('../services/idempiereService');

/**
 * POST /api/idempiere/authenticate
 * Paso 1 del flujo iDempiere:
 * Valida usuario y contraseña. Si son incorrectos, devuelve HTTP 401.
 * Si son válidos, devuelve los perfiles, empresas, organizaciones y almacenes disponibles
 * para desplegar la ventana "Selecionar Perfil".
 */
router.post('/authenticate', async (req, res) => {
  try {
    const { userName, password, baseUrl, allowFallback } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        error: 'Los campos "userName" y "password" son obligatorios.'
      });
    }

    const result = await idempiereService.authenticate({
      userName,
      password,
      baseUrl,
      allowFallback: allowFallback !== false
    });

    if (result.success) {
      return res.json(result);
    } else {
      return res.status(result.status || 401).json(result);
    }
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
 * Paso 2 del flujo iDempiere:
 * Emite la solicitud final a POST /api/v1/auth/tokens con los parámetros de contexto
 * seleccionados en la ventana "Selecionar Perfil" (clientId, roleId, organizationId, warehouseId, language).
 */
router.post('/login', async (req, res) => {
  try {
    const { userName, password, parameters, baseUrl, allowFallback } = req.body;

    if (!userName || !password) {
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
      allowFallback: allowFallback !== false
    });

    if (result.success) {
      return res.json(result);
    } else {
      return res.status(result.status || 401).json(result);
    }
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
  } else {
    return res.status(401).json({ success: false, ...verification });
  }
});

/**
 * POST /api/idempiere/logout
 * Cierre de sesión de iDempiere
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Sesión de iDempiere finalizada exitosamente en el servidor.'
  });
});

module.exports = router;
