import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import DashboardLayout from './components/DashboardLayout';
import OrderManagement from './components/OrderManagement';

export default function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <DashboardLayout>
          <OrderManagement />
        </DashboardLayout>
      </AuthGuard>
    </AuthProvider>
  );
}
