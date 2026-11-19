import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { BRANCHES, PAYMENT_MODES } from '../../config/constants';
import { calculateCuts, getLocalDateString } from '../../utils/helpers';
import { getBranchStaff } from '../../utils/staff';
import { getBranchServices } from '../../utils/services';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuthContext, useDataContext, useToast } from '../../contexts';

export function TransactionForm() {
  const { user, userRole } = useAuthContext();
  const { staffList, servicesList } = useDataContext();
  const catalogFor = (branchKey) => getBranchServices(servicesList, branchKey);
  const toast = useToast();
  const [customStaff, setCustomStaff] = useState('');
  const [newTransaction, setNewTransaction] = useState({
    branch: 'elite',
    serviceType: 'Barber',
    category: 'Haircut Men and Women',
    service: '',
    staff: '',
    price: 0,
    managementCut: 0,
    staffCut: 0,
    paymentMode: 'Cash',
    date: getLocalDateString()
  });

  const handleServiceTypeChange = (value) => {
    const categories = Object.keys(catalogFor(newTransaction.branch)[value] || {});
    setNewTransaction({
      ...newTransaction,
      serviceType: value,
      category: categories[0] || '',
      service: '',
      staff: '',
      price: 0,
      managementCut: 0,
      staffCut: 0
    });
    setCustomStaff('');
  };

  const handleCategoryChange = (value) => {
    setNewTransaction({
      ...newTransaction,
      category: value,
      service: '',
      price: 0,
      managementCut: 0,
      staffCut: 0
    });
  };

  const handleServiceChange = (value) => {
    const serviceObj = catalogFor(newTransaction.branch)[newTransaction.serviceType]?.[newTransaction.category]?.find(s => s.name === value);
    const price = serviceObj?.price || 0;
    const cuts = calculateCuts(newTransaction.serviceType, price);
    setNewTransaction({
      ...newTransaction,
      service: value,
      price: price,
      managementCut: cuts.managementCut,
      staffCut: cuts.staffCut
    });
  };

  const handlePriceChange = (newPrice) => {
    const price = parseFloat(newPrice) || 0;
    const cuts = calculateCuts(newTransaction.serviceType, price);
    setNewTransaction({
      ...newTransaction,
      price: price,
      managementCut: cuts.managementCut,
      staffCut: cuts.staffCut
    });
  };

  const handleAddTransaction = async () => {
    const staffName = newTransaction.staff === 'freelancer' ? customStaff.trim() : newTransaction.staff;
    if (!newTransaction.service || !staffName) {
      toast.warn('Please fill in all fields including staff selection');
      return;
    }

    const todayStr = getLocalDateString();
    if (newTransaction.date > todayStr) {
      toast.warn('Transaction date cannot be in the future');
      return;
    }

    try {
      await addDoc(collection(db, 'transactions'), {
        ...newTransaction,
        staff: staffName,
        timestamp: new Date().toISOString(),
        createdBy: user.uid
      });

      const categories = Object.keys(catalogFor(newTransaction.branch)[newTransaction.serviceType] || {});
      setNewTransaction({
        branch: newTransaction.branch,
        serviceType: newTransaction.serviceType,
        category: categories[0] || '',
        service: '',
        staff: '',
        price: 0,
        managementCut: 0,
        staffCut: 0,
        paymentMode: 'Cash',
        date: getLocalDateString()
      });
      setCustomStaff('');
      toast.success('Transaction added successfully!');
    } catch (error) {
      toast.error('Error saving transaction: ' + error.message);
    }
  };

  const catalog = catalogFor(newTransaction.branch);
  const serviceTypes = Object.keys(catalog);
  const categories = newTransaction.serviceType ? Object.keys(catalog[newTransaction.serviceType] || {}) : [];
  const services = newTransaction.category ? catalog[newTransaction.serviceType]?.[newTransaction.category] || [] : [];
  const selectedService = services.find(s => s.name === newTransaction.service);
  const staff = getBranchStaff(staffList, newTransaction.branch)[newTransaction.serviceType] || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Add Transaction</h2>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={newTransaction.branch}
              onChange={(e) => {
                const branchKey = e.target.value;
                const newCatalog = catalogFor(branchKey);
                const sTypes = Object.keys(newCatalog);
                const cats = Object.keys(newCatalog[sTypes[0]] || {});
                setNewTransaction({
                  ...newTransaction,
                  branch: branchKey,
                  serviceType: sTypes[0],
                  category: cats[0] || '',
                  service: '',
                  staff: '',
                  price: 0,
                  managementCut: 0,
                  staffCut: 0
                });
                setCustomStaff('');
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(BRANCHES).map(([key, b]) => <option key={key} value={key}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={newTransaction.serviceType}
              onChange={(e) => handleServiceTypeChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {serviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <select
              value={newTransaction.paymentMode}
              onChange={(e) => setNewTransaction({ ...newTransaction, paymentMode: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {PAYMENT_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newTransaction.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              value={newTransaction.service}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Service...</option>
              {services.map(s => <option key={s.name} value={s.name}>{s.name} - PHP {s.price}</option>)}
            </select>
            {selectedService?.description && (
              <p className="text-xs text-gray-500 mt-1">{selectedService.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff</label>
            <select
              value={newTransaction.staff}
              onChange={(e) => {
                setNewTransaction({ ...newTransaction, staff: e.target.value });
                if (e.target.value !== 'freelancer') setCustomStaff('');
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Staff...</option>
              {staff.map(s => <option key={s} value={s}>{s}</option>)}
              <option value="freelancer">Other (Freelancer)</option>
            </select>
          </div>
        </div>

        {newTransaction.staff === 'freelancer' && (
          <div className="md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Freelancer Name</label>
            <input
              type="text"
              value={customStaff}
              onChange={(e) => setCustomStaff(e.target.value)}
              placeholder="Enter freelancer name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price {userRole === 'manager' && <span className="text-xs text-blue-600">(Editable)</span>}
            </label>
            <input
              type="number"
              value={newTransaction.price}
              onChange={(e) => handlePriceChange(e.target.value)}
              readOnly={userRole !== 'manager' && newTransaction.service}
              className={`w-full px-3 py-2 border rounded-lg ${userRole === 'manager' ? 'bg-white border-blue-300' : 'bg-gray-100'}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Management Cut</label>
            <input type="text" value={`PHP ${newTransaction.managementCut.toFixed(2)}`} readOnly className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Cut</label>
            <input type="text" value={`PHP ${newTransaction.staffCut.toFixed(2)}`} readOnly className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
          </div>
        </div>

        <div className="md:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Date
          </label>
          <input
            type="date"
            value={newTransaction.date}
            max={getLocalDateString()}
            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Select the date this transaction occurred
          </p>
        </div>

        <button
          onClick={handleAddTransaction}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" /> Add Transaction
        </button>
      </div>
    </div>
  );
}
