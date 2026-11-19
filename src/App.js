import React, { useState } from 'react';
import { useAuthContext } from './contexts';
import { Login } from './components/auth/Login';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './components/dashboard/Dashboard';
import { TransactionForm } from './components/transactions/TransactionForm';
import { InventoryManager } from './components/inventory/InventoryManager';
import { AttendanceTracker } from './components/attendance/AttendanceTracker';
import { AdminPanel } from './components/admin/AdminPanel';
import { StaffManager } from './components/staff/StaffManager';
import { ServicesCatalog } from './components/services/ServicesCatalog';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const { user, loading, canManage, canManageStaff, canManageServices, isAdmin } = useAuthContext();
  const [currentView, setCurrentView] = useState('summary');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading M3 Bros System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    if (currentView === 'admin' && isAdmin) return <AdminPanel />;
    if (currentView === 'staff' && canManageStaff) return <StaffManager />;
    if (currentView === 'services' && canManageServices) return <ServicesCatalog />;
    if (currentView === 'transactions' && canManage) return <TransactionForm />;
    if (currentView === 'inventory') return <InventoryManager />;
    if (currentView === 'attendance') return <AttendanceTracker />;
    return <Dashboard branchKey={currentView} />;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorBoundary key={currentView}>{renderView()}</ErrorBoundary>
      </div>
    </div>
  );
}
