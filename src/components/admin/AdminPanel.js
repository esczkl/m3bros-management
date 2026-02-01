
import React, { useState } from 'react';
import { Trash2, UserPlus, Key, Shield } from 'lucide-react';
import { updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ServicesManager } from './ServicesManager';

export function AdminPanel({ usersList, user: currentUser }) {
  const [activeTab, setActiveTab] = useState('users'); // users | services
  const [newUser, setNewUser] = useState({ email: '', role: 'staff', name: '' });

  // Create user logic is actually complex in client-side app without Admin SDK (cannot create Auth user easily).
  // Typically we create a Firestore doc and let them sign up, OR use a Callable Cloud Function.
  // For this snippet, we'll assume we are managing the 'users' collection roles.

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      alert('User role updated');
    } catch (error) {
      alert('Error updating role: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Again, deleting from Auth requires Admin SDK or Cloud Function trigger.
    // We will just delete the Firestore doc for now.
    if (window.confirm('Delete user data? (Note: This does not remove Login Access, only App Data access)')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Administrator Panel</h2>

      <div className="flex gap-4 border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium ${activeTab === 'services' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('services')}
        >
          Services Dashboard
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-700">Registered Users</h3>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="font-medium text-gray-900">{u.name || 'No Name'}</div>
                    <div className="text-gray-500 text-xs">{u.email}</div>
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={u.role || 'staff'}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className={`px-2 py-1 rounded border text-xs font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' :
                          u.role === 'manager' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-green-100 text-green-800 border-green-200'
                        }`}
                      disabled={u.id === currentUser.uid} // Can't change own role
                    >
                      <option value="admin">Administrator</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff/Viewer</option>
                    </select>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === currentUser.uid}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 text-xs text-gray-500">
            Note: User creation happens via the Login Page (Auto-registration on first sign-in).
          </div>
        </div>
      ) : (
        <ServicesManager />
      )}
    </div>
  );
}
