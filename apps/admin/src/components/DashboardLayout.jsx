import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SidebarNavbar from './SidebarNavbar';
import OrderManagement from './OrderManagement';
import GeneralSummaryView from './GeneralSummaryView';
import IDempiereIntegrationView from './IDempiereIntegrationView';
import BurgerCatalogView from './BurgerCatalogView';
import CustomerMetricsView from './CustomerMetricsView';
import DatabaseStatusView from './DatabaseStatusView';
import ProfileConfigView from './ProfileConfigView';
import TokenInfoModal from './TokenInfoModal';

// Catálogos Maestros Sincronizables iDempiere ERP
import ProductCategoriesView from './ProductCategoriesView';
import ProductsView from './ProductsView';
import PriceListsView from './PriceListsView';
import CustomerCategoriesView from './CustomerCategoriesView';
import CustomersView from './CustomersView';
import TaxesView from './TaxesView';

export default function DashboardLayout() {
  const { session, logout } = useAuth();
  
  // Vista activa: 'summary' | 'catalog' | 'orders' | 'customers' | 'erp_customers' | 'product_categories' | 'products' | 'prices' | 'taxes' | 'database' | 'idempiere' | 'profile' | 'first-steps'
  const [activeView, setActiveView] = useState('summary');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Estado colapsado del Sidebar (persiste en localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Toast Notification Flotante */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 99999,
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '0.88rem',
          fontWeight: '600',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          background: notification.type === 'error' ? '#ef4444' : notification.type === 'warning' ? '#f59e0b' : '#10b981',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span>{notification.type === 'error' ? '❌' : notification.type === 'warning' ? '⚠️' : '✅'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* 1. SIDEBAR NAVBAR (Abierto 240px / Colapsado 56px) */}
      <SidebarNavbar
        activeView={activeView}
        onSelectView={setActiveView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        session={session}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
        onLogout={logout}
      />

      {/* 2. ÁREA PRINCIPAL DERECHA CON MARGEN DINÁMICO */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        marginLeft: isSidebarCollapsed ? '56px' : '240px',
        transition: 'margin-left 200ms ease-in-out'
      }}>
        {/* Top Header Bar */}
        <header style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
              {activeView === 'summary' && 'Panel de Inicio & Resumen'}
              {activeView === 'first-steps' && 'Primeros Pasos & Configuración iDempiere'}
              {activeView === 'catalog' && 'Catálogo de Favoritos & Hamburguesas (10)'}
              {activeView === 'orders' && 'Bandeja Central de Gestión de Pedidos'}
              {activeView === 'customers' && 'Segmentación & Métricas de Clientes'}
              {activeView === 'erp_customers' && 'Directorio de Contactos & Clientes (C_BPartner)'}
              {activeView === 'product_categories' && 'Categorías de Compras (M_Product_Category)'}
              {activeView === 'products' && 'Inventario Maestro de Productos (M_Product)'}
              {activeView === 'prices' && 'Listas de Tarifas & Precios (M_PriceList)'}
              {activeView === 'customer_categories' && 'Grupos de Clientes (C_BP_Group)'}
              {activeView === 'taxes' && 'Finanzas & Catálogo de Impuestos (C_Tax) [Solo Lectura]'}
              {activeView === 'database' && 'Estado del Datamart SQLite & Servidor'}
              {activeView === 'idempiere' && 'Agente de IA & Integración iDempiere ERP Live'}
              {activeView === 'profile' && 'Configuración de Usuario & Parámetros ERP'}
            </h1>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Plataforma comercial y operacional &bull; Sincronización ERP iDempiere &bull; SQLite Datamart
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Pill Usuario y Rol */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              padding: '5px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem'
            }}>
              <span style={{ color: '#0284c7' }}>👤 {session?.userName || 'admin@gardenworld.com'}</span>
              <span style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.68rem',
                fontWeight: '700'
              }}>
                {session?.roleName || 'Demo'}
              </span>
            </div>

            {/* Pill SQLite Datamart */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f7fee7',
              border: '1px solid #d9f99d',
              color: '#4d7c0f',
              padding: '5px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: '700'
            }}>
              ⚡ SQLite WAL Activo
            </div>

            {/* Botón Refrescar */}
            <button
              onClick={handleRefresh}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              🔄 Refrescar
            </button>

            {/* Botón Salir */}
            <button
              onClick={logout}
              style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#dc2626',
                cursor: 'pointer'
              }}
            >
              🚪 Salir
            </button>
          </div>
        </header>

        {/* 3. CONTENIDO SEGÚN LA VISTA SELECCIONADA */}
        <main key={refreshKey} style={{ flex: 1, padding: '24px 28px', maxWidth: '1440px', width: '100%' }}>
          {activeView === 'summary' && (
            <GeneralSummaryView onNavigate={setActiveView} />
          )}

          {activeView === 'first-steps' && (
            <ProfileConfigView />
          )}

          {activeView === 'catalog' && (
            <BurgerCatalogView />
          )}

          {activeView === 'orders' && (
            <OrderManagement />
          )}

          {activeView === 'customers' && (
            <CustomerMetricsView />
          )}

          {/* Vistas de Catálogos Maestros ERP con SQLite */}
          {activeView === 'erp_customers' && (
            <CustomersView
              session={session}
              onNotify={showNotification}
            />
          )}

          {activeView === 'product_categories' && (
            <ProductCategoriesView
              session={session}
              onNotify={showNotification}
            />
          )}

          {activeView === 'products' && (
            <ProductsView
              session={session}
              onNotify={showNotification}
            />
          )}

          {activeView === 'prices' && (
            <PriceListsView
              session={session}
              onNotify={showNotification}
            />
          )}

          {activeView === 'customer_categories' && (
            <CustomerCategoriesView
              session={session}
              onNotify={showNotification}
            />
          )}

          {activeView === 'taxes' && (
            <TaxesView
              session={session}
              onNotify={showNotification}
            />
          )}

          {/* Vistas de Sistema & Configuración */}
          {activeView === 'database' && (
            <DatabaseStatusView
              session={session}
              onNotify={showNotification}
              onGlobalSyncSuccess={() => showNotification('success', 'Todos los catálogos se han sincronizado con SQLite.')}
            />
          )}

          {activeView === 'idempiere' && (
            <IDempiereIntegrationView />
          )}

          {activeView === 'profile' && (
            <ProfileConfigView />
          )}
        </main>
      </div>

      {/* Modal Inspector de Sesión iDempiere ERP REST */}
      <TokenInfoModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
      />
    </div>
  );
}
