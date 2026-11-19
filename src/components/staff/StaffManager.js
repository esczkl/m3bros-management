import React, { useEffect, useRef, useState } from 'react';
import { Users, UserPlus, UserMinus, RotateCcw } from 'lucide-react';
import { addDoc, updateDoc, collection, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { BRANCHES } from '../../config/constants';
import { seedStaffFromConstants } from '../../utils/staff';
import { useAuthContext, useDataContext, useToast } from '../../contexts';

export function StaffManager() {
  const { user, canManageStaff } = useAuthContext();
  const { staffList, staffLoaded } = useDataContext();
  const toast = useToast();

  const [branchKey, setBranchKey] = useState('elite');
  const serviceTypes = Object.keys(BRANCHES[branchKey].services);
  const [newStaff, setNewStaff] = useState({ name: '', type: serviceTypes[0] });
  const [showRemoved, setShowRemoved] = useState(false);
  const seeding = useRef(false);

  // One-time migration: copy the hard-coded staff into Firestore the first time this page is opened.
  useEffect(() => {
    if (!staffLoaded || staffList.length > 0 || seeding.current || !canManageStaff) return;
    seeding.current = true;
    seedStaffFromConstants(user.uid)
      .then(() => toast.info('Staff list imported from the existing setup'))
      .catch(err => { seeding.current = false; toast.error('Could not import staff: ' + err.message); });
  }, [staffLoaded, staffList.length, canManageStaff, user, toast]);

  const ready = staffLoaded && staffList.length > 0;
  const branchStaff = staffList.filter(s => s.branch === branchKey);
  const active = branchStaff.filter(s => s.active !== false);
  const removed = branchStaff.filter(s => s.active === false);
  const byName = (a, b) => String(a.name || '').localeCompare(String(b.name || ''));

  const changeBranch = (key) => {
    setBranchKey(key);
    setNewStaff({ name: '', type: Object.keys(BRANCHES[key].services)[0] });
  };

  const handleAdd = async () => {
    if (!canManageStaff) { toast.error('Permission denied'); return; }
    const name = newStaff.name.trim().replace(/\s+/g, ' ');
    if (!name) { toast.warn('Enter a staff name'); return; }

    const match = branchStaff.find(s => s.type === newStaff.type && s.name.toLowerCase() === name.toLowerCase());
    try {
      if (match && match.active !== false) { toast.warn(`${match.name} is already listed as ${newStaff.type}`); return; }
      if (match) {
        await updateDoc(doc(db, 'staff', match.id), { active: true, restoredAt: new Date().toISOString(), restoredBy: user.uid });
        toast.success(`${match.name} restored`);
      } else {
        await addDoc(collection(db, 'staff'), {
          name, branch: branchKey, type: newStaff.type, active: true,
          createdAt: new Date().toISOString(), createdBy: user.uid
        });
        toast.success(`${name} added to ${BRANCHES[branchKey].name}`);
      }
      setNewStaff({ ...newStaff, name: '' });
    } catch (error) { toast.error('Error adding staff: ' + error.message); }
  };

  const setActive = async (s, isActive) => {
    if (!canManageStaff) { toast.error('Permission denied'); return; }
    if (!isActive && !window.confirm(`Remove ${s.name} from ${BRANCHES[s.branch].name}? Past transactions and attendance are kept.`)) return;
    try {
      await updateDoc(doc(db, 'staff', s.id), isActive
        ? { active: true, restoredAt: new Date().toISOString(), restoredBy: user.uid }
        : { active: false, removedAt: new Date().toISOString(), removedBy: user.uid });
      toast.success(isActive ? `${s.name} restored` : `${s.name} removed`);
    } catch (error) { toast.error('Error updating staff: ' + error.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-teal-600" />
        <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(BRANCHES).map(([key, b]) => (
          <button key={key} onClick={() => changeBranch(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${branchKey === key ? 'bg-teal-600 text-white' : 'bg-white hover:bg-gray-50 border'}`}>
            {b.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Add Staff</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" value={newStaff.name} placeholder="Staff name"
            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && ready && handleAdd()}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
          <select value={newStaff.type} onChange={(e) => setNewStaff({ ...newStaff, type: e.target.value })}
            className="px-3 py-2 border rounded-lg">
            {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={handleAdd} disabled={!ready}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {!ready ? (
        <p className="text-center text-gray-500 py-8">Loading staff…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceTypes.map(type => {
            const list = active.filter(s => s.type === type).sort(byName);
            return (
              <div key={type} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-3 border-b bg-gray-50 flex justify-between">
                  <h4 className="font-semibold">{type}</h4>
                  <span className="text-sm text-gray-500">{list.length} active</span>
                </div>
                <ul className="divide-y">
                  {list.length > 0 ? list.map(s => (
                    <li key={s.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50">
                      <span className="font-medium">{s.name}</span>
                      <button onClick={() => setActive(s, false)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm">
                        <UserMinus className="w-4 h-4" /> Remove
                      </button>
                    </li>
                  )) : <li className="px-6 py-6 text-center text-gray-500 text-sm">No {type.toLowerCase()} staff</li>}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {ready && removed.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <button onClick={() => setShowRemoved(!showRemoved)} className="w-full px-6 py-3 text-left text-sm text-gray-600 hover:bg-gray-50">
            {showRemoved ? '▾' : '▸'} Removed staff ({removed.length})
          </button>
          {showRemoved && (
            <ul className="divide-y border-t">
              {removed.sort(byName).map(s => (
                <li key={s.id} className="px-6 py-3 flex justify-between items-center text-gray-500">
                  <span>{s.name} <span className="text-xs">({s.type})</span></span>
                  <button onClick={() => setActive(s, true)} className="text-teal-600 hover:text-teal-800 flex items-center gap-1 text-sm">
                    <RotateCcw className="w-4 h-4" /> Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
