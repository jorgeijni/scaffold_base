const express = require('express');
const router = express.Router();
const idempiereService = require('../services/idempiereService');

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

module.exports = router;
