
import React, { useState } from 'react';
import { Package, Plus, Minus, Save, X, Trash2, Edit3 } from 'lucide-react';
import { BRANCHES, EXPENSE_CATEGORIES, UNIT_OPTIONS } from '../../config/constants';
import { collection, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';

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
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const handleAddInventory = async () => {
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
    const finalCategory = newInventoryItem.category === 'misc' && newInventoryItem.customCategory
      ? `misc: ${newInventoryItem.customCategory}`
      : newInventoryItem.category;

    try {
      const itemRef = await addDoc(collection(db, 'inventory'), {
        name: newInventoryItem.name,
        quantity: newInventoryItem.quantity,
        price: newInventoryItem.price,
        unit: finalUnit,
        branch: newInventoryItem.branch,
        category: finalCategory,
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
        category: finalCategory,
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
        purchaseDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      alert('Error adding inventory: ' + error.message);
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

      // Prepare log data
      const logData = {
        action: action,
        itemId: id,
        itemName: item.name,
        quantityChange: Math.abs(quantityChange),
        newQuantity: newQuantity,
        unit: item.unit,
        branch: item.branch,
        unitPrice: item.price,
        date: new Date().toISOString().split('T')[0],
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
        // DECREASE: No financial impact - item is being consumed/used, not returned for refund
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
        date: new Date().toISOString().split('T')[0],
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Inventory & Expenses</h2>

      {canManage && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold">Add New Item / Expense</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newInventoryItem.category}
              onChange={(e) => setNewInventoryItem({ ...newInventoryItem, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {newInventoryItem.category === 'misc' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specify Type</label>
              <input
                type="text"
                value={newInventoryItem.customCategory}
                onChange={(e) => setNewInventoryItem({ ...newInventoryItem, customCategory: e.target.value })}
                placeholder="e.g., Electricity, Internet"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                type="text"
                placeholder="Item name"
                value={newInventoryItem.name}
                onChange={(e) => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                placeholder="Quantity (>0)"
                min="1"
                value={newInventoryItem.quantity || ''}
                onChange={(e) => setNewInventoryItem({ ...newInventoryItem, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">* Must be greater than 0 for new items</p>
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

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
            onClick={handleAddInventory}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Current Inventory & Expenses</h3>
          <span className="text-sm text-gray-500">{inventory.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Category</th>
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
              {inventory.length > 0 ? inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {editingInventory?.originalId === item.id ? (
                    <>
                      <td className="px-4 py-2">
                        <select
                          value={editingInventory.category}
                          onChange={(e) => setEditingInventory({ ...editingInventory, category: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          {EXPENSE_CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </td>
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
                      <td className="px-4 py-2 text-gray-500">{BRANCHES[item.branch].name}</td>
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
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.category === 'inventory' ? 'bg-blue-100 text-blue-800' :
                            item.category === 'utilities' ? 'bg-yellow-100 text-yellow-800' :
                              item.category === 'rent' ? 'bg-purple-100 text-purple-800' :
                                item.category?.startsWith('misc') ? 'bg-gray-100 text-gray-800' :
                                  'bg-green-100 text-green-800'
                          }`}>
                          {item.category?.startsWith('misc:') ? item.category.replace('misc:', '') :
                            EXPENSE_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{item.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.unit}</td>
                      <td className="px-4 py-3 text-gray-600">{BRANCHES[item.branch].name}</td>
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
                  <td colSpan={canManage ? 8 : 7} className="px-4 py-8 text-center text-gray-500">
                    No inventory or expenses recorded
                  </td>
                </tr>
              )}
            </tbody>
            {inventory.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right">Grand Total:</td>
                  <td className="px-4 py-3 text-right">
                    PHP {inventory.reduce((sum, i) => sum + (i.quantity * i.price), 0).toFixed(2)}
                  </td>
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
