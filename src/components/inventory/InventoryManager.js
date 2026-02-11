
import React, { useState } from 'react';
import { Package, Plus, Minus, Save, X, Trash2, Edit3, DollarSign } from 'lucide-react';
import { BRANCHES, EXPENSE_CATEGORIES, UNIT_OPTIONS, isStockCategory, isExpenseCategory } from '../../config/constants';
import { collection, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';

// Helper function to get local date string (mirrors App.js)
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function InventoryManager({ inventory, inventoryLogs, user, canManage }) {
  const [editingInventory, setEditingInventory] = useState(null);
  const [newInventoryItem, setNewInventoryItem] = useState({
    name: '',
    quantity: 0,
    price: 0,
    unit: 'pcs',
    customUnit: '',
    branch: 'elite',
    category: 'inventory',
    customCategory: '',
    purchaseDate: getLocalDateString()
  });

  const [newExpenseItem, setNewExpenseItem] = useState({
    name: '', price: 0, branch: 'elite',
    customCategory: '', purchaseDate: getLocalDateString()
  });

  const handleAddStock = async () => {
    if (!newInventoryItem.name) {
      alert('Please enter item name');
      return;
    }
    if (newInventoryItem.quantity <= 0) {
      alert('Quantity must be greater than 0 for new items');
      return;
    }
    if (newInventoryItem.price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    if (newInventoryItem.unit === 'other' && !newInventoryItem.customUnit) {
      alert('Please specify the custom unit');
      return;
    }

    const finalUnit = newInventoryItem.unit === 'other' ? newInventoryItem.customUnit : newInventoryItem.unit;

    try {
      const itemRef = await addDoc(collection(db, 'inventory'), {
        name: newInventoryItem.name,
        quantity: newInventoryItem.quantity,
        price: newInventoryItem.price,
        unit: finalUnit,
        branch: newInventoryItem.branch,
        category: 'inventory',
        purchaseDate: newInventoryItem.purchaseDate,
        timestamp: new Date().toISOString(),
        createdBy: user.uid
      });

      const totalCost = newInventoryItem.quantity * newInventoryItem.price;
      await addDoc(collection(db, 'inventoryLogs'), {
        action: 'create',
        itemId: itemRef.id,
        itemName: newInventoryItem.name,
        quantity: newInventoryItem.quantity,
        unit: finalUnit,
        unitPrice: newInventoryItem.price,
        totalAmount: totalCost,
        branch: newInventoryItem.branch,
        category: 'inventory',
        date: newInventoryItem.purchaseDate,
        timestamp: new Date().toISOString(),
        userId: user.uid,
        userName: user.name || user.email,
        financialImpact: `Expense increased by PHP ${totalCost.toFixed(2)}`,
        notes: `New inventory added: ${newInventoryItem.quantity} ${finalUnit}`
      });

      setNewInventoryItem({
        name: '',
        quantity: 0,
        price: 0,
        unit: 'pcs',
        customUnit: '',
        branch: 'elite',
        category: 'inventory',
        customCategory: '',
        purchaseDate: getLocalDateString()
      });
    } catch (error) {
      alert('Error adding stock: ' + error.message);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpenseItem.name) {
      alert('Please enter expense name');
      return;
    }
    if (newExpenseItem.price <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const finalCategory = newExpenseItem.customCategory
      ? `misc: ${newExpenseItem.customCategory}`
      : 'misc';

    try {
      const itemRef = await addDoc(collection(db, 'inventory'), {
        name: newExpenseItem.name,
        quantity: 1,
        price: newExpenseItem.price,
        unit: 'bill',
        branch: newExpenseItem.branch,
        category: finalCategory,
        purchaseDate: newExpenseItem.purchaseDate,
        timestamp: new Date().toISOString(),
        createdBy: user.uid
      });

      await addDoc(collection(db, 'inventoryLogs'), {
        action: 'create',
        itemId: itemRef.id,
        itemName: newExpenseItem.name,
        quantity: 1,
        unit: 'bill',
        unitPrice: newExpenseItem.price,
        totalAmount: newExpenseItem.price,
        branch: newExpenseItem.branch,
        category: finalCategory,
        date: newExpenseItem.purchaseDate,
        timestamp: new Date().toISOString(),
        userId: user.uid,
        userName: user.name || user.email,
        financialImpact: `Expense increased by PHP ${newExpenseItem.price.toFixed(2)}`,
        notes: `Expense recorded: ${newExpenseItem.name}`
      });

      setNewExpenseItem({
        name: '', price: 0, branch: 'elite',
        customCategory: '', purchaseDate: getLocalDateString()
      });
    } catch (error) {
      alert('Error recording expense: ' + error.message);
    }
  };

  const handleUpdateInventory = async (id, quantityChange) => {
    if (!canManage) {
      alert('Permission denied');
      return;
    }
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    const newQuantity = item.quantity + quantityChange;
    if (newQuantity < 0) {
      alert('Quantity cannot be negative');
      return;
    }

    try {
      await updateDoc(doc(db, 'inventory', id), {
        quantity: newQuantity,
        lastUpdated: new Date().toISOString()
      });

      const action = quantityChange > 0 ? 'increase' : 'decrease';

      const logData = {
        action: action,
        itemId: id,
        itemName: item.name,
        quantityChange: Math.abs(quantityChange),
        newQuantity: newQuantity,
        unit: item.unit,
        branch: item.branch,
        unitPrice: item.price,
        date: getLocalDateString(),
        timestamp: new Date().toISOString(),
        userId: user.uid,
        userName: user.name || user.email,
      };

      if (action === 'increase') {
        const changeValue = Math.abs(quantityChange) * item.price;
        logData.totalAmount = changeValue;
        logData.financialImpact = `Added PHP ${changeValue.toFixed(2)} to inventory value`;
        logData.notes = `Stock increased by ${Math.abs(quantityChange)} ${item.unit}`;
      } else {
        logData.totalAmount = 0;
        logData.financialImpact = 'No financial impact - item consumed/used';
        logData.notes = `Stock decreased by ${Math.abs(quantityChange)} ${item.unit} (consumption)`;
      }

      await addDoc(collection(db, 'inventoryLogs'), logData);
    } catch (error) {
      alert('Error updating: ' + error.message);
    }
  };

  const handleDeleteInventory = async (id) => {
    if (!canManage) {
      alert('Permission denied');
      return;
    }
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    if (window.confirm(`Delete ${item.name}? This will remove the item and all its history.`)) {
      try {
        const itemLogs = inventoryLogs.filter(log => log.itemId === id);
        const batch = writeBatch(db);

        itemLogs.forEach(log => {
          const logRef = doc(db, 'inventoryLogs', log.id);
          batch.delete(logRef);
        });

        const itemRef = doc(db, 'inventory', id);
        batch.delete(itemRef);

        await batch.commit();

        alert(`${item.name} and ${itemLogs.length} related entries deleted.`);
      } catch (error) {
        alert('Error deleting: ' + error.message);
      }
    }
  };

  const startEditInventory = (item) => {
    if (!canManage) return;
    setEditingInventory({
      ...item,
      originalId: item.id
    });
  };

  const saveEditInventory = async () => {
    if (!canManage) {
      alert('Permission denied');
      return;
    }
    if (!editingInventory.name || !editingInventory.unit) {
      alert('Name and unit are required');
      return;
    }

    try {
      await updateDoc(doc(db, 'inventory', editingInventory.originalId), {
        name: editingInventory.name,
        unit: editingInventory.unit,
        category: editingInventory.category,
        lastUpdated: new Date().toISOString()
      });

      await addDoc(collection(db, 'inventoryLogs'), {
        action: 'edit',
        itemId: editingInventory.originalId,
        itemName: editingInventory.name,
        branch: editingInventory.branch,
        date: getLocalDateString(),
        timestamp: new Date().toISOString(),
        userId: user.uid,
        userName: user.name || user.email,
        financialImpact: 'No change',
        notes: 'Item details modified'
      });

      setEditingInventory(null);
    } catch (error) {
      alert('Error saving: ' + error.message);
    }
  };

  const renderLogs = () => {
    const recentLogs = inventoryLogs.slice(0, 100);
    return (
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
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
                <tr key={log.id} className={`hover:bg-gray-50 ${log.action === 'create' ? 'bg-green-50' :
                    log.action === 'delete' ? 'bg-red-50' :
                      'bg-yellow-50'
                  }`}>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.action === 'create' ? 'bg-green-200 text-green-800' :
                        log.action === 'delete' ? 'bg-red-200 text-red-800' :
                          log.action === 'increase' ? 'bg-blue-200 text-blue-800' :
                            'bg-orange-200 text-orange-800'
                      }`}>
                      {log.action === 'create' ? 'ADDED' :
                        log.action === 'delete' ? 'DELETED' :
                          log.action === 'increase' ? 'STOCK +' :
                            'STOCK -'}
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
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No inventory activity recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const stockItems = inventory.filter(item => isStockCategory(item.category));
  const expenseItems = inventory.filter(item => isExpenseCategory(item.category));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Inventory & Expenses</h2>

      {/* Section A: Current Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-green-50">
          <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
            <Package className="w-5 h-5" /> Current Inventory
          </h3>
          <span className="text-sm text-green-700">{stockItems.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Item Name</th>
                <th className="px-4 py-3 text-left">Qty</th>
                <th className="px-4 py-3 text-left">Unit</th>
                <th className="px-4 py-3 text-left">Branch</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Total Value</th>
                {canManage && <th className="px-4 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {stockItems.length > 0 ? stockItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {editingInventory?.originalId === item.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editingInventory.name}
                          onChange={(e) => setEditingInventory({ ...editingInventory, name: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-2 text-gray-500">{item.quantity}</td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editingInventory.unit}
                          onChange={(e) => setEditingInventory({ ...editingInventory, unit: e.target.value })}
                          className="w-20 px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-2 text-gray-500">{BRANCHES[item.branch]?.name || item.branch}</td>
                      <td className="px-4 py-2 text-right text-gray-500">PHP {item.price.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-gray-500">PHP {(item.quantity * item.price).toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <div className="flex justify-center gap-2">
                          <button onClick={saveEditInventory} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingInventory(null)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{item.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.unit}</td>
                      <td className="px-4 py-3 text-gray-600">{BRANCHES[item.branch]?.name || item.branch}</td>
                      <td className="px-4 py-3 text-right">PHP {item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium">PHP {(item.quantity * item.price).toFixed(2)}</td>
                      {canManage && (
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleUpdateInventory(item.id, 1)}
                              className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                              title="Increase"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateInventory(item.id, -1)}
                              className="p-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                              title="Decrease (Consumption)"
                              disabled={item.quantity <= 0}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => startEditInventory(item)}
                              className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInventory(item.id)}
                              className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              title="Delete All History"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
                    No inventory items recorded
                  </td>
                </tr>
              )}
            </tbody>
            {stockItems.length > 0 && (
              <tfoot className="bg-green-50 font-semibold">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right text-green-900">Inventory Total:</td>
                  <td className="px-4 py-3 text-right text-green-900">
                    PHP {stockItems.reduce((sum, i) => sum + (i.quantity * i.price), 0).toFixed(2)}
                  </td>
                  {canManage && <td></td>}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Section B: Two Input Forms (side-by-side on desktop) */}
      {canManage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form 1: Record Purchase / Stock In */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4 border-t-4 border-green-500">
            <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <Package className="w-5 h-5" /> Record Purchase / Stock In
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g., Shampoo, Razor Blades"
                  value={newInventoryItem.name}
                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  placeholder="Quantity (>0)"
                  min="1"
                  value={newInventoryItem.quantity || ''}
                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (PHP)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newInventoryItem.price || ''}
                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
                <select
                  value={newInventoryItem.unit}
                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, unit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {UNIT_OPTIONS.map(unit => (
                    <option key={unit} value={unit}>
                      {unit === 'other' ? 'Other (Custom)...' : unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {newInventoryItem.unit === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Unit</label>
                  <input
                    type="text"
                    placeholder="e.g., pairs, rolls"
                    value={newInventoryItem.customUnit}
                    onChange={(e) => setNewInventoryItem({ ...newInventoryItem, customUnit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  value={newInventoryItem.branch}
                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, branch: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {Object.entries(BRANCHES).map(([key, b]) => (
                    <option key={key} value={key}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={newInventoryItem.purchaseDate}
                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <button
              onClick={handleAddStock}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Stock
            </button>
          </div>

          {/* Form 2: Record Bill / Expense */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4 border-t-4 border-orange-500">
            <h3 className="text-lg font-semibold text-orange-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Record Bill / Expense
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name</label>
                <input
                  type="text"
                  placeholder="e.g., Electric Bill, Internet"
                  value={newExpenseItem.name}
                  onChange={(e) => setNewExpenseItem({ ...newExpenseItem, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PHP)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newExpenseItem.price || ''}
                  onChange={(e) => setNewExpenseItem({ ...newExpenseItem, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Electricity, Rent, Internet"
                  value={newExpenseItem.customCategory}
                  onChange={(e) => setNewExpenseItem({ ...newExpenseItem, customCategory: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  value={newExpenseItem.branch}
                  onChange={(e) => setNewExpenseItem({ ...newExpenseItem, branch: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {Object.entries(BRANCHES).map(([key, b]) => (
                    <option key={key} value={key}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newExpenseItem.purchaseDate}
                  onChange={(e) => setNewExpenseItem({ ...newExpenseItem, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <button
              onClick={handleAddExpense}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" /> Record Expense
            </button>
          </div>
        </div>
      )}

      {/* Section C: Recorded Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-orange-50">
          <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Recorded Expenses
          </h3>
          <span className="text-sm text-orange-700">{expenseItems.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Expense Name</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Branch</th>
                {canManage && <th className="px-4 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenseItems.length > 0 ? expenseItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{item.purchaseDate || '-'}</td>
                  <td className="px-4 py-3 font-medium">
                    {item.name}
                    {item.category?.startsWith('misc:') && (
                      <span className="text-xs text-gray-500 ml-2">({item.category.replace('misc: ', '').replace('misc:', '')})</span>
                    )}
                    {(item.category === 'utilities' || item.category === 'rent') && (
                      <span className="text-xs text-gray-500 ml-2">({item.category === 'utilities' ? 'Utilities' : 'Rent'})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">PHP {(item.quantity * item.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600">{BRANCHES[item.branch]?.name || item.branch}</td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDeleteInventory(item.id)}
                          className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-4 py-8 text-center text-gray-500">
                    No expenses recorded
                  </td>
                </tr>
              )}
            </tbody>
            {expenseItems.length > 0 && (
              <tfoot className="bg-orange-50 font-semibold">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right text-orange-900">Expenses Total:</td>
                  <td className="px-4 py-3 text-right text-orange-900">
                    PHP {expenseItems.reduce((sum, i) => sum + (i.quantity * i.price), 0).toFixed(2)}
                  </td>
                  <td></td>
                  {canManage && <td></td>}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Logs Section */}
      {renderLogs()}
    </div>
  );
}
