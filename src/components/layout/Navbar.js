import React from 'react';
import { LogOut, Package, UserCheck, Shield, Users, Scissors } from 'lucide-react';
import { BRANCHES } from '../../config/constants';
import { useAuthContext } from '../../contexts';

export function Navbar({ currentView, setCurrentView }) {
  const { user, userRole, canManage, canManageStaff, canManageServices, isAdmin, handleLogout } = useAuthContext();

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-800">M3 Bros</h1>
                <span className="text-xs text-blue-600 font-medium">
                  Welcome, {user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${userRole === 'admin' ? 'bg-red-100 text-red-800' :
                  userRole === 'manager' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                }`}>
                {userRole === 'admin' ? 'Administrator' : userRole === 'manager' ? 'Manager' : 'Owner'}
              </span>
              <span className="text-xs text-gray-500">v2.5 ● Cloud</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-2">
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setCurrentView('summary')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${currentView === 'summary' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
            Summary
          </button>

          {Object.entries(BRANCHES).map(([key]) => (
            <button key={key} onClick={() => setCurrentView(key)} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${currentView === key ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}

          {canManage && (
            <>
              <button onClick={() => setCurrentView('transactions')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap font-medium ${currentView === 'transactions' ? 'bg-green-600 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                + Transaction
              </button>

              <button onClick={() => setCurrentView('inventory')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${currentView === 'inventory' ? 'bg-amber-600 text-white' : 'bg-white hover:bg-gray-50 text-amber-700 border border-amber-200'}`}>
                <Package className="w-4 h-4" /> Inventory
              </button>

              <button onClick={() => setCurrentView('attendance')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${currentView === 'attendance' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-50 text-indigo-700 border border-indigo-200'}`}>
                <UserCheck className="w-4 h-4" /> Attendance
              </button>
            </>
          )}

          {canManageStaff && (
            <button onClick={() => setCurrentView('staff')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${currentView === 'staff' ? 'bg-teal-600 text-white' : 'bg-white hover:bg-gray-50 text-teal-700 border border-teal-200'}`}>
              <Users className="w-4 h-4" /> Staff
            </button>
          )}

          {canManageServices && (
            <button onClick={() => setCurrentView('services')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${currentView === 'services' ? 'bg-pink-600 text-white' : 'bg-white hover:bg-gray-50 text-pink-700 border border-pink-200'}`}>
              <Scissors className="w-4 h-4" /> Services
            </button>
          )}

          {isAdmin && (
            <button onClick={() => setCurrentView('admin')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${currentView === 'admin' ? 'bg-red-600 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`}>
              <Shield className="w-4 h-4" /> Admin
            </button>
          )}
        </div>
      </div>
    </>
  );
}
