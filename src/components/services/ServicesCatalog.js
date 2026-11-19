import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Scissors, Plus, Edit2, Save, X, Trash2, RotateCcw, Search } from 'lucide-react';
import { addDoc, updateDoc, collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { BRANCHES } from '../../config/constants';
import { getServiceTypes, seedServicesFromConstants } from '../../utils/services';
import { useAuthContext, useDataContext, useToast } from '../../contexts';

const clean = (str) => (str || '').trim().replace(/\s+/g, ' ');
const emptyForm = (type) => ({ type, category: '', name: '', price: '', description: '' });

export function ServicesCatalog() {
  const { user, canManageServices } = useAuthContext();
  const { servicesList, servicesLoaded } = useDataContext();
  const toast = useToast();

  const [branchKey, setBranchKey] = useState('elite');
  const types = getServiceTypes(branchKey);
  const [typeFilter, setTypeFilter] = useState(types[0]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm(types[0]));
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);           // { id, name, price, category, description }
  const [renamingCat, setRenamingCat] = useState(null);   // { from, to }
  const [showDeleted, setShowDeleted] = useState(false);
  const seeding = useRef(false);

  // One-time migration: copy the hard-coded catalog into Firestore the first time this page is opened.
  useEffect(() => {
    if (!servicesLoaded || servicesList.length > 0 || seeding.current || !canManageServices) return;
    seeding.current = true;
    seedServicesFromConstants(user.uid)
      .then(() => toast.info('Services imported from the existing price list'))
      .catch(err => { seeding.current = false; toast.error('Could not import services: ' + err.message); });
  }, [servicesLoaded, servicesList.length, canManageServices, user, toast]);

  const ready = servicesLoaded && servicesList.length > 0;
  const inScope = servicesList.filter(s => s.branch === branchKey && s.type === typeFilter);
  const active = inScope.filter(s => s.active !== false);
  const deleted = inScope.filter(s => s.active === false);
  const categories = [...new Set(active.map(s => s.category))];

  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const g = {};
    active
      .filter(s => !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name))
      .forEach(s => { (g[s.category] = g[s.category] || []).push(s); });
    return g;
  }, [active, search]);

  const changeBranch = (key) => {
    const t = getServiceTypes(key)[0];
    setBranchKey(key); setTypeFilter(t); setForm(emptyForm(t)); setEditing(null); setRenamingCat(null);
  };
  const changeType = (t) => { setTypeFilter(t); setForm(emptyForm(t)); setEditing(null); setRenamingCat(null); };

  const isDuplicate = (category, name, exceptId) => servicesList.some(s =>
    s.id !== exceptId && s.active !== false && s.branch === branchKey && s.type === typeFilter &&
    s.category.toLowerCase() === category.toLowerCase() && s.name.toLowerCase() === name.toLowerCase());

  const validate = ({ category, name, price }) => {
    if (!clean(category) || !clean(name)) { toast.warn('Category and service name are required'); return null; }
    const p = parseFloat(price);
    if (price === '' || isNaN(p) || p < 0) { toast.warn('Enter a valid price (0 or more)'); return null; }
    return p;
  };

  const handleAdd = async () => {
    if (!canManageServices) { toast.error('Permission denied'); return; }
    const price = validate(form);
    if (price === null) return;
    const category = clean(form.category), name = clean(form.name);
    if (isDuplicate(category, name)) { toast.warn(`"${name}" already exists in ${category}`); return; }
    const maxOrder = Math.max(-1, ...servicesList.filter(s => s.branch === branchKey).map(s => s.order ?? 0));
    try {
      await addDoc(collection(db, 'services'), {
        branch: branchKey, type: typeFilter, category, name, price,
        description: clean(form.description), active: true, order: maxOrder + 1,
        createdAt: new Date().toISOString(), createdBy: user.uid
      });
      toast.success(`${name} added`);
      setForm({ ...emptyForm(typeFilter), category });
    } catch (error) { toast.error('Error adding service: ' + error.message); }
  };

  const handleSave = async () => {
    if (!canManageServices) { toast.error('Permission denied'); return; }
    const price = validate(editing);
    if (price === null) return;
    const category = clean(editing.category), name = clean(editing.name);
    if (isDuplicate(category, name, editing.id)) { toast.warn(`"${name}" already exists in ${category}`); return; }
    try {
      await updateDoc(doc(db, 'services', editing.id), {
        name, category, price, description: clean(editing.description),
        updatedAt: new Date().toISOString(), updatedBy: user.uid
      });
      toast.success(`${name} updated`);
      setEditing(null);
    } catch (error) { toast.error('Error updating service: ' + error.message); }
  };

  const setActive = async (s, isActive) => {
    if (!canManageServices) { toast.error('Permission denied'); return; }
    if (!isActive && !window.confirm(`Delete "${s.name}" (PHP ${s.price})? It will no longer appear in new transactions. Past transactions are kept.`)) return;
    if (isActive && isDuplicate(s.category, s.name, s.id)) { toast.warn(`An active "${s.name}" already exists in ${s.category}`); return; }
    try {
      await updateDoc(doc(db, 'services', s.id), isActive
        ? { active: true, restoredAt: new Date().toISOString(), restoredBy: user.uid }
        : { active: false, deletedAt: new Date().toISOString(), deletedBy: user.uid });
      toast.success(isActive ? `${s.name} restored` : `${s.name} deleted`);
    } catch (error) { toast.error('Error: ' + error.message); }
  };

  const handleRenameCategory = async () => {
    const to = clean(renamingCat.to);
    if (!to) { toast.warn('Category name required'); return; }
    if (to === renamingCat.from) { setRenamingCat(null); return; }
    const batch = writeBatch(db);
    active.filter(s => s.category === renamingCat.from).forEach(s =>
      batch.update(doc(db, 'services', s.id), { category: to, updatedAt: new Date().toISOString(), updatedBy: user.uid }));
    try {
      await batch.commit();
      toast.success(`Category renamed to ${to}`);
      setRenamingCat(null);
    } catch (error) { toast.error('Error renaming category: ' + error.message); }
  };

  const input = 'px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Scissors className="w-6 h-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-gray-800">Services & Prices</h2>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} disabled={!ready}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(BRANCHES).map(([key, b]) => (
          <button key={key} onClick={() => changeBranch(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${branchKey === key ? 'bg-pink-600 text-white' : 'bg-white hover:bg-gray-50 border'}`}>
            {b.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {types.map(t => (
          <button key={t} onClick={() => changeType(t)}
            className={`px-3 py-1.5 rounded-full text-sm ${typeFilter === t ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            {t}
          </button>
        ))}
        <div className="relative ml-auto w-full md:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services…"
            className={`${input} w-full pl-9`} />
        </div>
      </div>

      {showAdd && ready && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">New {typeFilter} service — {BRANCHES[branchKey].name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input list="service-categories" value={form.category} placeholder="Category (pick or type new)"
              onChange={(e) => setForm({ ...form, category: e.target.value })} className={input} />
            <datalist id="service-categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
            <input value={form.name} placeholder="Service name" onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
            <input type="number" min="0" step="1" value={form.price} placeholder="Price (PHP)"
              onChange={(e) => setForm({ ...form, price: e.target.value })} className={input} />
            <input value={form.description} placeholder="Info / description (optional)"
              onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">Save Service</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {!ready ? (
        <p className="text-center text-gray-500 py-8">Loading services…</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-center text-gray-500 py-8">{search ? 'No services match your search' : `No ${typeFilter} services yet`}</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-3 border-b bg-gray-50 flex justify-between items-center gap-2">
                {renamingCat?.from === category ? (
                  <div className="flex gap-2 items-center flex-1">
                    <input value={renamingCat.to} onChange={(e) => setRenamingCat({ ...renamingCat, to: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleRenameCategory()}
                      className="px-2 py-1 border rounded text-sm flex-1 md:flex-none md:w-72" autoFocus />
                    <button onClick={handleRenameCategory} className="p-1 text-green-600"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setRenamingCat(null)} className="p-1 text-gray-600"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <h4 className="font-semibold flex items-center gap-2">
                    {category}
                    <button onClick={() => setRenamingCat({ from: category, to: category })} title="Rename category"
                      className="text-gray-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  </h4>
                )}
                <span className="text-sm text-gray-500 whitespace-nowrap">{items.length} service{items.length !== 1 ? 's' : ''}</span>
              </div>
              <ul className="divide-y">
                {items.map(s => editing?.id === s.id ? (
                  <li key={s.id} className="px-6 py-3 bg-blue-50 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Name" className="px-2 py-1 border rounded text-sm" />
                      <input type="number" min="0" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} placeholder="Price" className="px-2 py-1 border rounded text-sm" />
                      <input list="service-categories-edit" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Category" className="px-2 py-1 border rounded text-sm" />
                      <datalist id="service-categories-edit">{categories.map(c => <option key={c} value={c} />)}</datalist>
                      <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Info / description" className="px-2 py-1 border rounded text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center gap-1"><Save className="w-4 h-4" /> Save</button>
                      <button onClick={() => setEditing(null)} className="px-3 py-1 bg-gray-200 rounded text-sm">Cancel</button>
                    </div>
                  </li>
                ) : (
                  <li key={s.id} className="px-6 py-3 flex justify-between items-center gap-4 hover:bg-gray-50">
                    <div className="min-w-0">
                      <div className="font-medium">{s.name}</div>
                      {s.description && <div className="text-xs text-gray-500">{s.description}</div>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-gray-800">PHP {Number(s.price).toLocaleString()}</span>
                      <button onClick={() => setEditing({ id: s.id, name: s.name, price: String(s.price), category: s.category, description: s.description || '' })}
                        className="p-1 text-blue-600 hover:text-blue-800" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setActive(s, false)} className="p-1 text-red-600 hover:text-red-800" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {ready && deleted.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <button onClick={() => setShowDeleted(!showDeleted)} className="w-full px-6 py-3 text-left text-sm text-gray-600 hover:bg-gray-50">
            {showDeleted ? '▾' : '▸'} Deleted {typeFilter} services ({deleted.length})
          </button>
          {showDeleted && (
            <ul className="divide-y border-t">
              {deleted.sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                <li key={s.id} className="px-6 py-3 flex justify-between items-center text-gray-500">
                  <span>{s.name} <span className="text-xs">({s.category} · PHP {s.price})</span></span>
                  <button onClick={() => setActive(s, true)} className="text-pink-600 hover:text-pink-800 flex items-center gap-1 text-sm">
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
