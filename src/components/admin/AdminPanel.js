import React, { useState } from 'react';
import { Trash2, UserPlus, Shield, Users, Database, Package, Edit2, Save, X } from 'lucide-react';
import { updateDoc, deleteDoc, doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { BRANCHES } from '../../config/constants';
import { useAuthContext, useDataContext, useToast } from '../../contexts';

export function AdminPanel() {
  const { user } = useAuthContext();
  const { usersList, transactions, inventory, attendance, inventoryLogs } = useDataContext();
  const toast = useToast();

  const [adminTab, setAdminTab] = useState('users');
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'manager' });
  const [showAddUser, setShowAddUser] = useState(false);

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name) { toast.warn('Fill all required fields'); return; }
    try {
      await setDoc(doc(db, 'users', 'pending_' + Date.now()), {
        email: newUser.email, name: newUser.name, role: newUser.role,
        status: 'pending', createdAt: new Date().toISOString(), createdBy: user.uid
      });
      toast.info('User creation request submitted. Admin must create account in Firebase Console.');
      setNewUser({ email: '', password: '', name: '', role: 'manager' });
      setShowAddUser(false);
    } catch (error) { toast.error('Error: ' + error.message); }
  };

  const handleUpdateUser = async (userId) => {
    if (!editingUser.name) { toast.warn('Name required'); return; }
    try {
      await updateDoc(doc(db, 'users', userId), {
        name: editingUser.name, role: editingUser.role, updatedAt: new Date().toISOString()
      });
      setEditingUser(null);
      toast.success('User updated!');
    } catch (error) { toast.error('Error updating: ' + error.message); }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user.uid) { toast.warn('Cannot delete yourself'); return; }
    if (window.confirm('Delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        toast.success('User deleted.');
      } catch (error) { toast.error('Error deleting: ' + error.message); }
    }
  };

  const renderInventoryLogs = () => {
    const recentLogs = inventoryLogs.slice(0, 100);
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-900">Recent Activity (Last 100 entries)</h3>
            <span className="text-sm text-blue-700">{inventoryLogs.length} total records</span>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Branch</th>
                  <th className="px-4 py-3 text-right">Qty/Value</th>
                  <th className="px-4 py-3 text-left">Financial Impact</th>
                  <th className="px-4 py-3 text-left">By</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentLogs.length > 0 ? recentLogs.map((log) => (
                  <tr key={log.id} className={`hover:bg-gray-50 ${log.action === 'create' ? 'bg-green-50' : log.action === 'delete' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.action === 'create' ? 'bg-green-200 text-green-800' : log.action === 'delete' ? 'bg-red-200 text-red-800' : log.action === 'increase' ? 'bg-blue-200 text-blue-800' : 'bg-orange-200 text-orange-800'}`}>
                        {log.action === 'create' ? 'ADDED' : log.action === 'delete' ? 'DELETED' : log.action === 'increase' ? 'STOCK +' : 'STOCK -'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{log.itemName}</td>
                    <td className="px-4 py-3 text-xs">{BRANCHES[log.branch]?.name || log.branch}</td>
                    <td className="px-4 py-3 text-right text-xs">
                      {log.quantity} {log.unit}<br />
                      {log.totalAmount > 0 && <span className="font-bold">PHP {log.totalAmount.toFixed(2)}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {log.financialImpact || '-'}
                      {log.notes && <div className="text-gray-500 italic mt-1">{log.notes}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs">{log.userName}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No inventory activity recorded yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Manage users in Firebase Console Authentication for security
        </p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setAdminTab('users')} className={`px-4 py-2 rounded-lg text-sm font-medium ${adminTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
          <Users className="w-4 h-4 inline mr-1" /> User Management
        </button>
        <button onClick={() => setAdminTab('data')} className={`px-4 py-2 rounded-lg text-sm font-medium ${adminTab === 'data' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
          <Database className="w-4 h-4 inline mr-1" /> Database
        </button>
        <button onClick={() => setAdminTab('inventory-logs')} className={`px-4 py-2 rounded-lg text-sm font-medium ${adminTab === 'inventory-logs' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
          <Package className="w-4 h-4 inline mr-1" /> Inventory Logs
        </button>
      </div>

      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">System Users ({usersList.length})</h3>
            <button onClick={() => setShowAddUser(!showAddUser)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Request New User
            </button>
          </div>

          {showAddUser && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Request New Account</h4>
              <p className="text-xs text-gray-600">Admin must create the actual login in Firebase Console after submission</p>
              <div className="grid grid-cols-2 gap-3">
                <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="px-3 py-2 border rounded" />
                <input type="text" placeholder="Full Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="px-3 py-2 border rounded" />
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="px-3 py-2 border rounded">
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddUser} className="px-4 py-2 bg-green-600 text-white rounded">Submit Request</button>
                <button onClick={() => setShowAddUser(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {usersList.map((userData) => (
                  <tr key={userData.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {editingUser?.id === userData.id ? (
                        <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" />
                      ) : (
                        <span className="font-medium flex items-center gap-2">
                          {userData.role === 'admin' && <Shield className="w-4 h-4 text-red-500" />}
                          {userData.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{userData.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${userData.role === 'admin' ? 'bg-red-100 text-red-800' : userData.role === 'manager' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {userData.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {editingUser?.id === userData.id ? (
                          <>
                            <button onClick={() => handleUpdateUser(userData.id)} className="p-1 text-green-600"><Save className="w-4 h-4" /></button>
                            <button onClick={() => setEditingUser(null)} className="p-1 text-gray-600"><X className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditingUser({ ...userData, id: userData.id })} className="p-1 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteUser(userData.id)} className="p-1 text-red-600" disabled={userData.id === user?.uid}><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'data' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Database Overview (Real-time)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{Object.values(transactions).flat().length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500">Inventory Items</p>
              <p className="text-2xl font-bold text-green-600">{inventory.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500">Attendance Records</p>
              <p className="text-2xl font-bold text-purple-600">{attendance.length}</p>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'inventory-logs' && renderInventoryLogs()}
    </div>
  );
}
