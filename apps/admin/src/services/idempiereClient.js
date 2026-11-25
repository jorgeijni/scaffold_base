/**
 * iDempiere Client - Helper para consumos autenticados a la REST API de iDempiere
 * Utiliza el token Bearer y la configuracion guardada en la sesion
 */
import { AuthService } from './authService';

export class IDempiereClient {
  /**
   * Realiza una peticion autenticada a la API REST de iDempiere
   * @param {string} endpoint - Ejemplo: '/api/v1/models/c_order'
   * @param {Object} options - Opciones de fetch (method, body, etc.)
   * @returns {Promise<any>}
   */
  static async request(endpoint, options = {}) {
    const session = AuthService.getSession();
    if (!session || !session.token) {
      throw new Error('No hay sesion activa en iDempiere. Debe iniciar sesion primero.');
    }

    const config = AuthService.getStoredConfig() || {};
    const url = AuthService.buildUrl(
      session.baseUrl || config.baseUrl,
      endpoint,
      config.proxyConfig
    );

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${session.token}`,
      ...(options.headers || {})
    };

    const fetchOptions = {
      ...options,
      headers
    };

    if (options.body && typeof options.body === 'object') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const err = new Error(
        data?.detail || data?.message || `Error iDempiere HTTP ${response.status}: ${response.statusText}`
      );
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  /**
   * Simula o realiza la sincronizacion de una orden hacia el modelo C_Order de iDempiere
   * @param {Object} order - Pedido de PWA o E-commerce
   * @returns {Promise<Object>}
   */
  static async syncOrderToERP(order) {
    const session = AuthService.getSession();
    if (!session) {
      throw new Error('Sesion no disponible para sincronizar.');
    }

    // Estructura oficial del Modelo C_Order de iDempiere
    const cOrderPayload = {
      AD_Client_ID: { id: session.clientId },
      AD_Org_ID: { id: session.organizationId },
      M_Warehouse_ID: { id: session.warehouseId },
      C_DocTypeTarget_ID: { id: 1000030 }, // Standard Order
      Description: `[${order.origin.toUpperCase()}] Pedido #${order.id} - ${order.customerName}`,
      DateOrdered: new Date(order.date).toISOString().split('T')[0],
      C_BPartner_ID: { id: order.bPartnerId || 1000000 },
      C_PaymentTerm_ID: { id: 1000000 },
      M_PriceList_ID: { id: 1000000 },
      lines: (order.items || []).map((item, index) => ({
        Line: (index + 1) * 10,
        M_Product_ID: { id: item.productId || 1000001 },
        QtyOrdered: item.qty || 1,
        PriceActual: item.price || 0,
        PriceEntered: item.price || 0
      }))
    };

    try {
      const result = await this.request('/api/v1/models/c_order', {
        method: 'POST',
        body: cOrderPayload
      });
      return { success: true, result, payload: cOrderPayload };
    } catch (err) {
      // Retornar detalle descriptivo para poder depurar visualmente
      return { 
        success: false, 
        error: err.message, 
        payload: cOrderPayload,
        status: err.status 
      };
    }
  }
}

