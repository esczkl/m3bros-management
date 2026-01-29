import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, DollarSign, TrendingUp, Calendar, LogOut, Plus, Trash2, Package, UserCheck, Shield, Edit2, Save, X, Database, UserPlus, Key, Download, Edit3, Minus } from 'lucide-react';

// ============================================================
// [CHECKPOINT V1.3] - COMPLETE MERGED RELEASE
//  Features: All V1.2 features + Inventory Categories, 
//  Custom Units, Edit Items, Branch Export, Password Fix
// ============================================================

const BRANCHES = {
  elite: {
    name: 'M3 Bros Elite Salon Branch',
    services: {
      Barber: {
        'Haircut Men and Women': [
          { name: 'Hair Cut', price: 250 },
          { name: 'Hair Cut with Shampoo Rinse and Dry', price: 300 },
          { name: 'Head Shave', price: 350 },
          { name: 'Beard Trim', price: 200 },
          { name: 'Shave', price: 300 },
          { name: 'Ladies Cut', price: 300 }
        ],
        'Hair Styling': [
          { name: 'Shampoo and Rinse', price: 120 },
          { name: 'Blow Dry Mens', price: 100 }
        ],
        'Organic Hair Color': [
          { name: 'Hair Color with Hair Cut', price: 1100 },
          { name: 'Organic Color', price: 1450 }
        ],
        'Hair Care': [
          { name: 'Revitalizing Hair Treatment', price: 980 },
          { name: 'Total Hair Treatment', price: 980 },
          { name: 'Brazilian Blowout with Hair Color', price: 2650 }
        ],
        'Scalp Care': [
          { name: 'Dandruff Control Therapy', price: 980 },
          { name: 'Metholated Scalp Treatment', price: 800 },
          { name: 'Hair Growth Therapy', price: 1600 }
        ],
        'Hair Removal': [
          { name: 'Threading or Waxing for Eyebrow or Mustache', price: 180 },
          { name: 'Eyebrow Shaping', price: 180 }
        ],
        'Massage 15 Minutes': [
          { name: 'Body Massage', price: 200 },
          { name: 'Hand Massage', price: 200 },
          { name: 'Scalp Massage', price: 200 },
          { name: 'Back Massage', price: 200 }
        ],
        'Package': [
          { name: '1 Facial and Hair Treatment', price: 2200 },
          { name: '2 Scalp Treatment and Facial and Hair Cut', price: 1600 },
          { name: '3 Facial and Hair Cut and Shave', price: 1750 }
        ]
      },
      Salon: {
        'Package': [
          { name: '1 Basic Mani Pedi Footspa', price: 575 },
          { name: '2 Gel Mani Footspa Pedi', price: 880 },
          { name: '3 Gel Mani Gel Pedi Classic Eyelash', price: 1250 },
          { name: '4 Gel Mani Footspa Pedi Classic Eyelash', price: 1150 }
        ],
        'Nail': [
          { name: 'Manicure', price: 125 },
          { name: 'Pedicure', price: 150 },
          { name: 'Foot Spa', price: 350 },
          { name: 'Hand Spa', price: 250 },
          { name: 'Foot Massage', price: 250 },
          { name: 'Hand Massage', price: 200 },
          { name: 'Gel Manicure', price: 450 },
          { name: 'Gel Pedicure', price: 500 },
          { name: 'Nail Extension', price: 999 },
          { name: 'Soft Gel', price: 250 }
        ],
        'Waxing': [
          { name: 'Under Arms', price: 250 },
          { name: 'Eyebrow', price: 150 },
          { name: 'Upper Lip', price: 150 },
          { name: 'Arm', price: 350 },
          { name: 'Half Leg', price: 450 },
          { name: 'Full Leg', price: 600 },
          { name: 'Bikini', price: 450 },
          { name: 'Brazilian', price: 500 }
        ],
        'Eyelash': [
          { name: 'Eyelash Removal', price: 150 },
          { name: 'Classic', price: 350 },
          { name: 'Cat Eye', price: 450 },
          { name: 'Wispy', price: 450 },
          { name: 'Doll Eye', price: 400 },
          { name: 'Volume', price: 600 },
          { name: 'Cat Eye Volume', price: 600 },
          { name: 'Wispy Volume', price: 700 },
          { name: 'Mega Volume', price: 700 }
        ]
      }
    },
    staff: {
      Barber: ['Lito', 'Richard', 'Kevin'],
      Salon: ['Vicky', 'Tina', 'Cath']
    }
  },
  arellano: {
    name: 'M3 Bros C Arellano Branch',
    services: {
      Barber: {
        'Haircut Men and Women': [{ name: 'Hair Cut', price: 180 }]
      }
    },
    staff: { Barber: ['Joseph', 'Rowel', 'Jared', 'Rommel'] }
  },
  typeC: {
    name: 'M3 Bros Type C Branch',
    services: {
      Barber: {
        'Haircut Men and Women': [{ name: 'Hair Cut', price: 150 }]
      }
    },
    staff: { Barber: ['Joel', 'Allen'] }
  }
};

const DEFAULT_USERS = {
  admin: { id: 'admin', username: 'admin', password: 'admin@m3bros2024', role: 'admin', name: 'System Administrator', createdAt: new Date().toISOString() },
  manager: { id: 'manager', username: 'manager', password: 'manager123', role: 'manager', name: 'Branch Manager', createdAt: new Date().toISOString() },
  owner: { id: 'owner', username: 'owner', password: 'owner123', role: 'owner', name: 'Business Owner', createdAt: new Date().toISOString() }
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const PAYMENT_MODES = ['Cash', 'GCash', 'BDO', 'BPI', 'PayMaya'];
const EXPENSE_CATEGORIES = [
  { value: 'inventory', label: 'Inventory/Supplies' },
  { value: 'utilities', label: 'Utilities (Electricity/Water)' },
  { value: 'rent', label: 'Rent/Lease' },
  { value: 'equipment', label: 'Equipment/Tools' },
  { value: 'misc', label: 'Miscellaneous' }
];
const UNIT_OPTIONS = ['pcs', 'bottles', 'boxes', 'liters', 'packs', 'sachets', 'sheets', 'sets', 'other'];

export default function App() {
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [currentView, setCurrentView] = useState('summary');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [transactions, setTransactions] = useState({ elite: [], arellano: [], typeC: [] });
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [editingInventory, setEditingInventory] = useState(null);
  const [exportBranch, setExportBranch] = useState('all');
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
    date: new Date().toISOString().split('T')[0]
  });

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

  const [attendanceTimeframe, setAttendanceTimeframe] = useState('daily');
  const [attendanceDateRange, setAttendanceDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [calendarMonth, setCalendarMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth()
  });
  const [newAttendance, setNewAttendance] = useState({
    staff: 'Lito',
    branch: 'elite',
    status: 'present',
    date: new Date().toISOString().split('T')[0]
  });

  const [adminTab, setAdminTab] = useState('users');
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'manager' });
  const [showAddUser, setShowAddUser] = useState(false);

  const canManage = user && (user.role === 'admin' || user.role === 'manager');
  const isAdmin = user && user.role === 'admin';

  const getDateRange = () => ({ start: dateRange.start, end: dateRange.end });

  const setDailyRange = () => {
    const today = new Date().toISOString().split('T')[0];
    setDateRange({ start: today, end: today });
  };

  const setFirstHalfRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setDateRange({ start: `${year}-${month}-01`, end: `${year}-${month}-15` });
  };

  const setSecondHalfRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    setDateRange({ start: `${year}-${month}-16`, end: `${year}-${month}-${lastDay}` });
  };

  const getCalendarDays = () => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return days;
  };

  const getMonthName = (m) => {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m];
  };

  const navigateMonth = (dir) => {
    setCalendarMonth(prev => {
      let nm = prev.month + dir;
      let ny = prev.year;
      if (nm > 11) { nm = 0; ny++; }
      if (nm < 0) { nm = 11; ny--; }
      return { year: ny, month: nm };
    });
  };

  const getAttendanceDateRange = () => {
    if (attendanceTimeframe === 'custom') {
      return { start: attendanceDateRange.start, end: attendanceDateRange.end };
    }
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (attendanceTimeframe === 'daily') return { start: todayStr, end: todayStr };
    if (attendanceTimeframe === 'weekly') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { start: weekAgo.toISOString().split('T')[0], end: todayStr };
    }
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return { start: monthAgo.toISOString().split('T')[0], end: todayStr };
  };

  const handleLogin = () => {
    const foundUser = Object.values(users).find(
      u => u.username === loginForm.username && u.password === loginForm.password
    );
    if (foundUser) {
      setUser(foundUser);
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Invalid credentials');
    }
  };

  const calculateCuts = (serviceType, price) => {
    if (serviceType === 'Barber') return { managementCut: price * 0.5, staffCut: price * 0.5 };
    return { managementCut: price * 0.9, staffCut: price * 0.1 };
  };

  const handleServiceTypeChange = (value) => {
    const branch = BRANCHES[newTransaction.branch];
    const categories = Object.keys(branch.services[value] || {});
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
    const branch = BRANCHES[newTransaction.branch];
    const serviceObj = branch.services[newTransaction.serviceType]?.[newTransaction.category]?.find(s => s.name === value);
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

  const handleAddTransaction = () => {
    const staffName = newTransaction.staff === 'freelancer' ? customStaff.trim() : newTransaction.staff;
    if (!newTransaction.service || !staffName) {
      alert('Please fill in all fields including staff selection');
      return;
    }

    const transaction = {
      ...newTransaction,
      staff: staffName,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };

    setTransactions({
      ...transactions,
      [newTransaction.branch]: [...transactions[newTransaction.branch], transaction]
    });

    const branch = BRANCHES[newTransaction.branch];
    const categories = Object.keys(branch.services[newTransaction.serviceType] || {});
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
      date: new Date().toISOString().split('T')[0]
    });
    setCustomStaff('');
  };

  const handleDeleteTransaction = (branchKey, transactionId) => {
    if (window.confirm('Delete this transaction?')) {
      setTransactions({
        ...transactions,
        [branchKey]: transactions[branchKey].filter(t => t.id !== transactionId)
      });
    }
  };

  const handleAddInventory = () => {
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

    const inventoryItem = { 
      ...newInventoryItem, 
      id: Date.now(),
      unit: finalUnit,
      category: finalCategory
    };
    
    setInventory([...inventory, inventoryItem]);
    
    const expense = {
      id: Date.now(),
      branch: newInventoryItem.branch,
      item: newInventoryItem.name,
      category: finalCategory,
      quantity: newInventoryItem.quantity,
      price: newInventoryItem.price,
      totalCost: newInventoryItem.price * newInventoryItem.quantity,
      date: newInventoryItem.purchaseDate,
      timestamp: new Date().toISOString()
    };
    setExpenses([...expenses, expense]);
    
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
  };

  const handleUpdateInventory = (id, quantity) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    const newQuantity = item.quantity + quantity;
    if (newQuantity < 0) {
      alert('Quantity cannot be negative');
      return;
    }
    setInventory(inventory.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const handleDeleteInventory = (id) => {
    if (window.confirm('Delete this item?')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  const startEditInventory = (item) => {
    setEditingInventory({
      ...item,
      originalId: item.id
    });
  };

  const saveEditInventory = () => {
    if (!editingInventory.name) {
      alert('Item name is required');
      return;
    }
    if (!editingInventory.unit) {
      alert('Unit is required');
      return;
    }

    setInventory(inventory.map(item => 
      item.id === editingInventory.originalId 
        ? { ...item, name: editingInventory.name, unit: editingInventory.unit, category: editingInventory.category }
        : item
    ));
    setEditingInventory(null);
  };

  const cancelEditInventory = () => {
    setEditingInventory(null);
  };

  const handleAddAttendance = () => {
    if (!newAttendance.staff) { 
      alert('Please select a staff member'); 
      return; 
    }
    const exists = attendance.find(a => a.staff === newAttendance.staff && a.date === newAttendance.date);
    if (exists) { 
      alert('This staff member already has an attendance entry for this date'); 
      return; 
    }
    
    setAttendance([...attendance, { ...newAttendance, id: Date.now() }]);
    setNewAttendance({
      staff: newAttendance.staff,
      branch: newAttendance.branch,
      status: 'present',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteAttendance = (id) => {
    if (window.confirm('Remove this attendance record?')) {
      setAttendance(attendance.filter(a => a.id !== id));
    }
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) { 
      alert('Fill all fields'); 
      return; 
    }
    if (Object.values(users).some(u => u.username === newUser.username)) { 
      alert('Username exists'); 
      return; 
    }
    const userId = 'user_' + Date.now();
    setUsers({ ...users, [userId]: { ...newUser, id: userId, createdAt: new Date().toISOString() } });
    setNewUser({ username: '', password: '', name: '', role: 'manager' });
    setShowAddUser(false);
  };

  const handleUpdateUser = (userId) => {
    if (!editingUser.username || !editingUser.name) { 
      alert('Username and name required'); 
      return; 
    }
    const exists = Object.values(users).find(u => u.username === editingUser.username && u.id !== userId);
    if (exists) { 
      alert('Username exists'); 
      return; 
    }
    setUsers({ ...users, [userId]: { ...users[userId], ...editingUser } });
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (userId === 'admin') { 
      alert('Cannot delete admin'); 
      return; 
    }
    if (userId === user.id) { 
      alert('Cannot delete yourself'); 
      return; 
    }
    if (window.confirm('Delete this user?')) {
      const newUsers = { ...users };
      delete newUsers[userId];
      setUsers(newUsers);
    }
  };

  const handleResetPassword = (userId) => {
    const newPassword = prompt('Enter new password:');
    if (newPassword && newPassword.length >= 6) {
      setUsers({ ...users, [userId]: { ...users[userId], password: newPassword } });
      alert('Password reset successfully');
    } else if (newPassword) alert('Min 6 characters');
  };

  const getBranchStats = (branchKey) => {
    const { start, end } = getDateRange();
    const branchTransactions = transactions[branchKey].filter(t => t.date >= start && t.date <= end);
    const totalIncome = branchTransactions.reduce((sum, t) => sum + t.price, 0);
    const totalManagementFromTransactions = branchTransactions.reduce((sum, t) => sum + t.managementCut, 0);
    const totalInventoryCost = inventory.filter(i => i.branch === branchKey).reduce((sum, i) => sum + (i.quantity * i.price), 0);
    
    return {
      totalIncome,
      totalExpenses: totalInventoryCost,
      totalManagementCut: totalManagementFromTransactions - totalInventoryCost,
      totalStaffCut: branchTransactions.reduce((sum, t) => sum + t.staffCut, 0),
      transactionCount: branchTransactions.length
    };
  };

  const getSummaryStats = () => {
    const allStats = Object.keys(BRANCHES).map(key => getBranchStats(key));
    return {
      totalIncome: allStats.reduce((sum, s) => sum + s.totalIncome, 0),
      totalExpenses: allStats.reduce((sum, s) => s.totalExpenses, 0),
      totalManagementCut: allStats.reduce((sum, s) => sum + s.totalManagementCut, 0),
      totalStaffCut: allStats.reduce((sum, s) => sum + s.totalStaffCut, 0),
      transactionCount: allStats.reduce((sum, s) => sum + s.transactionCount, 0)
    };
  };

  const getStaffPayouts = (branchKey) => {
    const { start, end } = getDateRange();
    const branchTransactions = branchKey === 'all' ? Object.values(transactions).flat() : transactions[branchKey];
    const filtered = branchTransactions.filter(t => t.date >= start && t.date <= end);
    const payouts = {};
    filtered.forEach(t => {
      if (!payouts[t.staff]) payouts[t.staff] = { staff: t.staff, total: 0, count: 0, branch: t.branch };
      payouts[t.staff].total += t.staffCut;
      payouts[t.staff].count += 1;
    });
    return Object.values(payouts);
  };

  const generateReport = () => {
    const { start, end } = getDateRange();
    const isAllBranches = exportBranch === 'all';
    const targetBranch = exportBranch;
    
    let relevantTransactions = [];
    if (isAllBranches) {
      relevantTransactions = Object.values(transactions).flat().filter(t => t.date >= start && t.date <= end);
    } else {
      relevantTransactions = transactions[targetBranch].filter(t => t.date >= start && t.date <= end);
    }
    
    const stats = isAllBranches ? getSummaryStats() : getBranchStats(targetBranch);
    
    const relevantExpenses = isAllBranches 
      ? expenses.filter(e => e.date >= start && e.date <= end)
      : expenses.filter(e => e.branch === targetBranch && e.date >= start && e.date <= end);

    let report = 'M3 BROS BARBERSHOP SYSTEM REPORT\n';
    report += '================================\n';
    report += `Report Type: ${isAllBranches ? 'All Branches' : BRANCHES[targetBranch].name}\n`;
    report += `Period: ${start} to ${end}\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    report += 'SUMMARY\n';
    report += `Gross Income: PHP ${stats.totalIncome.toFixed(2)}\n`;
    report += `Management Net: PHP ${stats.totalManagementCut.toFixed(2)}\n`;
    report += `Staff Commission: PHP ${stats.totalStaffCut.toFixed(2)}\n`;
    report += `Total Expenses: PHP ${stats.totalExpenses.toFixed(2)}\n`;
    report += `Transactions: ${stats.transactionCount}\n\n`;
    
    report += 'EXPENSES BREAKDOWN\n';
    if (relevantExpenses.length > 0) {
      relevantExpenses.forEach(e => {
        const catLabel = e.category.startsWith('misc:') ? e.category.replace('misc:', 'Misc:') : e.category;
        report += `${e.date} | ${catLabel} | ${e.item} | ${e.quantity} | PHP ${e.totalCost.toFixed(2)}\n`;
      });
    } else {
      report += 'No expenses recorded for this period\n';
    }
    report += `\nTotal: PHP ${relevantExpenses.reduce((sum, e) => sum + e.totalCost, 0).toFixed(2)}\n\n`;
    
    report += 'TRANSACTION DETAILS\n';
    report += 'Date/Time | Branch | Service | Staff | Price | Payment | Mgmt | Staff\n';
    report += '------------------------------------------------------------------------\n';
    
    if (relevantTransactions.length > 0) {
      relevantTransactions.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)).forEach(t => {
        report += `${new Date(t.timestamp).toLocaleString()} | ${BRANCHES[t.branch].name} | ${t.service} | ${t.staff} | ${t.price.toFixed(2)} | ${t.paymentMode} | ${t.managementCut.toFixed(2)} | ${t.staffCut.toFixed(2)}\n`;
      });
    } else {
      report += 'No transactions for selected period\n';
    }

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = isAllBranches 
      ? `M3Bros_AllBranches_${start}_to_${end}.txt`
      : `M3Bros_${targetBranch}_${start}_to_${end}.txt`;
    a.download = filename;
    a.click();
  };

  // --- RENDER COMPONENTS ---

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">M3 Bros</h1>
            <p className="text-gray-600">Management System V1.3</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                /* [CHECKPOINT V1.3] - Prevents Chrome password warning */
                autoComplete="new-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </button>
          </div>
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>Authorized Personnel Only • V1.3</p>
          </div>
        </div>
      </div>
    );
  }

  const DashboardCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const renderInventory = () => {
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
                            onChange={(e) => setEditingInventory({...editingInventory, category: e.target.value})}
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
                            onChange={(e) => setEditingInventory({...editingInventory, name: e.target.value})}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 text-gray-500">{item.quantity}</td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editingInventory.unit}
                            onChange={(e) => setEditingInventory({...editingInventory, unit: e.target.value})}
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
                            <button onClick={cancelEditInventory} className="p-1 text-red-600 hover:bg-red-50 rounded">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.category === 'inventory' ? 'bg-blue-100 text-blue-800' :
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
                                title="Decrease"
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
                                title="Delete"
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
      </div>
    );
  };

  const renderTransactionForm = () => {
    const branch = BRANCHES[newTransaction.branch];
    const serviceTypes = Object.keys(branch.services);
    const categories = newTransaction.serviceType ? Object.keys(branch.services[newTransaction.serviceType] || {}) : [];
    const services = newTransaction.category ? branch.services[newTransaction.serviceType]?.[newTransaction.category] || [] : [];
    const staff = branch.staff[newTransaction.serviceType] || [];

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
                  const newBranch = BRANCHES[branchKey];
                  const sTypes = Object.keys(newBranch.services);
                  const cats = Object.keys(newBranch.services[sTypes[0]] || {});
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
                onChange={(e) => setNewTransaction({...newTransaction, paymentMode: e.target.value})}
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
                Price {user.role === 'manager' && <span className="text-xs text-blue-600">(Editable)</span>}
              </label>
              <input
                type="number"
                value={newTransaction.price}
                onChange={(e) => handlePriceChange(e.target.value)}
                readOnly={user.role !== 'manager' && newTransaction.service}
                className={`w-full px-3 py-2 border rounded-lg ${user.role === 'manager' ? 'bg-white border-blue-300' : 'bg-gray-100'}`}
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

          <button
            onClick={handleAddTransaction}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" /> Add Transaction
          </button>
        </div>
      </div>
    );
  };

  const renderAttendance = () => {
    const { start, end } = getAttendanceDateRange();
    const filtered = attendance.filter(a => a.date >= start && a.date <= end);
    const calendarDays = getCalendarDays();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayStr = new Date().toISOString().split('T')[0];
    const getAttendanceForDate = (d) => attendance.filter(a => a.date === d);
    const monthPrefix = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}`;
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Attendance Tracking</h2>

        {canManage && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Log Attendance / Day Off</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={newAttendance.branch}
                onChange={(e) => {
                  const branchKey = e.target.value;
                  const branchStaff = Object.values(BRANCHES[branchKey].staff).flat();
                  setNewAttendance({ ...newAttendance, branch: branchKey, staff: branchStaff[0] || '' });
                }}
                className="px-3 py-2 border rounded-lg"
              >
                {Object.entries(BRANCHES).map(([key, branch]) => (
                  <option key={key} value={key}>{branch.name}</option>
                ))}
              </select>
              <select
                value={newAttendance.staff}
                onChange={(e) => setNewAttendance({ ...newAttendance, staff: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                {Object.values(BRANCHES[newAttendance.branch].staff).flat().map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={newAttendance.status}
                onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="off">Day Off / Leave</option>
              </select>
              <input
                type="date"
                value={newAttendance.date}
                onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <button
              onClick={handleAddAttendance}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> Log Entry
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h3 className="text-lg font-semibold">Attendance View</h3>
            <select
              value={attendanceTimeframe}
              onChange={(e) => setAttendanceTimeframe(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="daily">Today</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Monthly Calendar</option>
            </select>
          </div>

          <div className="flex gap-4 mb-4 text-sm">
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Present</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Absent</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> Day Off</span>
          </div>

          {attendanceTimeframe === 'monthly' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                <button onClick={() => navigateMonth(-1)} className="px-4 py-2 bg-white rounded shadow hover:bg-gray-50">← Prev</button>
                <span className="font-bold text-lg">{getMonthName(calendarMonth.month)} {calendarMonth.year}</span>
                <button onClick={() => navigateMonth(1)} className="px-4 py-2 bg-white rounded shadow hover:bg-gray-50">Next →</button>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map(d => <div key={d} className="text-center text-sm font-semibold text-gray-500 py-2">{d}</div>)}
                {calendarDays.map((dateStr, idx) => {
                  if (!dateStr) return <div key={`e-${idx}`} className="min-h-24 bg-gray-50 rounded"></div>;
                  const dayNum = parseInt(dateStr.split('-')[2]);
                  const dayAtt = getAttendanceForDate(dateStr);
                  const isToday = dateStr === todayStr;
                  return (
                    <div key={dateStr} className={`min-h-24 border rounded p-2 ${isToday ? 'border-blue-500 border-2 bg-blue-50' : 'border-gray-200'}`}>
                      <div className={`text-sm font-bold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{dayNum}</div>
                      <div className="space-y-1">
                        {dayAtt.map((a, i) => (
                          <div
                            key={i}
                            onClick={() => canManage && handleDeleteAttendance(a.id)}
                            className={`text-white text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 ${a.status === 'present' ? 'bg-green-500' : a.status === 'absent' ? 'bg-red-500' : 'bg-blue-500'}`}
                            title={`${a.staff} - ${a.status}`}
                          >
                            {a.staff}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-100 rounded-lg p-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="block text-2xl font-bold text-green-600">
                    {attendance.filter(a => a.date.startsWith(monthPrefix) && a.status === 'present').length}
                  </span>
                  <span className="text-sm text-gray-600">Present</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-red-600">
                    {attendance.filter(a => a.date.startsWith(monthPrefix) && a.status === 'absent').length}
                  </span>
                  <span className="text-sm text-gray-600">Absent</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-blue-600">
                    {attendance.filter(a => a.date.startsWith(monthPrefix) && a.status === 'off').length}
                  </span>
                  <span className="text-sm text-gray-600">Leaves</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.length > 0 ? filtered.map((a) => (
                <div
                  key={a.id}
                  onClick={() => canManage && handleDeleteAttendance(a.id)}
                  className={`px-4 py-3 rounded-lg text-white cursor-pointer hover:opacity-90 flex justify-between items-center ${a.status === 'present' ? 'bg-green-500' : a.status === 'absent' ? 'bg-red-500' : 'bg-blue-500'}`}
                >
                  <span className="font-medium">{a.staff}</span>
                  <span className="text-sm opacity-90">{a.date} • {BRANCHES[a.branch].name}</span>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">No attendance records for this period</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdminPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800 flex items-center gap-2">
          <Shield className="w-4 h-4" /> 
          Create Manager and Owner accounts below
        </p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setAdminTab('users')} className={`px-4 py-2 rounded-lg text-sm font-medium ${adminTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
          <Users className="w-4 h-4 inline mr-1" /> User Management
        </button>
        <button onClick={() => setAdminTab('data')} className={`px-4 py-2 rounded-lg text-sm font-medium ${adminTab === 'data' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
          <Database className="w-4 h-4 inline mr-1" /> Database
        </button>
      </div>

      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">System Users</h3>
            <button onClick={() => setShowAddUser(!showAddUser)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Add User
            </button>
          </div>
          
          {showAddUser && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Create New Account</h4>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="px-3 py-2 border rounded" />
                /* [CHECKPOINT V1.3] - New password field without warning */
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={newUser.password} 
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  autoComplete="new-password"
                  className="px-3 py-2 border rounded" 
                />
                <input type="text" placeholder="Full Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="px-3 py-2 border rounded" />
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="px-3 py-2 border rounded">
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddUser} className="px-4 py-2 bg-green-600 text-white rounded">Create Account</button>
                <button onClick={() => setShowAddUser(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.entries(users).map(([userId, userData]) => (
                  <tr key={userId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {editingUser?.id === userId ? (
                        <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" />
                      ) : (
                        <span className="font-medium flex items-center gap-2">
                          {userData.role === 'admin' && <Shield className="w-4 h-4 text-red-500" />}
                          {userData.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{userData.username}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${userData.role === 'admin' ? 'bg-red-100 text-red-800' : userData.role === 'manager' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {userData.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {editingUser?.id === userId ? (
                          <>
                            <button onClick={() => handleUpdateUser(userId)} className="p-1 text-green-600"><Save className="w-4 h-4" /></button>
                            <button onClick={() => setEditingUser(null)} className="p-1 text-gray-600"><X className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditingUser({ ...userData, id: userId })} className="p-1 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleResetPassword(userId)} className="p-1 text-yellow-600"><Key className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteUser(userId)} className="p-1 text-red-600" disabled={userId === 'admin'}><Trash2 className="w-4 h-4" /></button>
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
          <h3 className="text-lg font-semibold">Database Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500">Transactions</p>
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
    </div>
  );

  const renderDashboard = (branchKey) => {
    const stats = branchKey === 'summary' ? getSummaryStats() : getBranchStats(branchKey);
    const branchName = branchKey === 'summary' ? 'All Branches Summary' : BRANCHES[branchKey].name;
    const { start, end } = getDateRange();
    
    const branchTransactions = branchKey === 'summary' 
      ? Object.values(transactions).flat().filter(t => t.date >= start && t.date <= end)
      : transactions[branchKey].filter(t => t.date >= start && t.date <= end);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">{branchName}</h2>
          
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={setDailyRange} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Daily</button>
            <button onClick={setFirstHalfRange} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">1st-15th</button>
            <button onClick={setSecondHalfRange} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">16th-End</button>
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="px-2 py-1 border rounded text-sm" />
            <span className="text-gray-600">to</span>
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="px-2 py-1 border rounded text-sm" />
          </div>
        </div>

        {branchKey === 'summary' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-wrap items-center gap-4">
            <span className="font-medium text-blue-900">Export Report:</span>
            <select value={exportBranch} onChange={(e) => setExportBranch(e.target.value)} className="px-3 py-1 border rounded bg-white">
              <option value="all">All Branches</option>
              <option value="elite">Elite Salon Branch</option>
              <option value="arellano">C Arellano Branch</option>
              <option value="typeC">Type C Branch</option>
            </select>
            <button onClick={generateReport} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> 
              Export {exportBranch === 'all' ? 'All' : BRANCHES[exportBranch].name}
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <DashboardCard title="Gross Income" value={`PHP ${stats.totalIncome.toLocaleString()}`} icon={DollarSign} color="bg-blue-500" />
          <DashboardCard title="Management Net" value={`PHP ${stats.totalManagementCut.toLocaleString()}`} icon={TrendingUp} color="bg-green-500" />
          <DashboardCard title="Staff Commission" value={`PHP ${stats.totalStaffCut.toLocaleString()}`} icon={Users} color="bg-orange-500" />
          <DashboardCard title="Expenses" value={`PHP ${stats.totalExpenses.toLocaleString()}`} icon={Package} color="bg-red-500" />
          <DashboardCard title="Transactions" value={stats.transactionCount} icon={Calendar} color="bg-purple-500" />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  {branchKey === 'summary' && <th className="px-4 py-2 text-left">Branch</th>}
                  <th className="px-4 py-2 text-left">Service</th>
                  <th className="px-4 py-2 text-left">Staff</th>
                  <th className="px-4 py-2 text-left">Payment</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  {canManage && <th className="px-4 py-2 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {branchTransactions.slice(0, 50).reverse().map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs">{new Date(t.timestamp).toLocaleString()}</td>
                    {branchKey === 'summary' && <td className="px-4 py-2 text-xs">{BRANCHES[t.branch].name}</td>}
                    <td className="px-4 py-2">{t.service}</td>
                    <td className="px-4 py-2">{t.staff}</td>
                    <td className="px-4 py-2"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{t.paymentMode}</span></td>
                    <td className="px-4 py-2 text-right">PHP {t.price.toFixed(2)}</td>
                    {canManage && (
                      <td className="px-4 py-2 text-center">
                        <button onClick={() => handleDeleteTransaction(t.branch, t.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {branchTransactions.length === 0 && (
                  <tr>
                    <td colSpan={branchKey === 'summary' ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
                      No transactions for selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">M3 Bros</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                user.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Manager' : 'Owner'}
              </span>
              <span className="text-xs text-gray-500">v1.3</span>
            </div>
            <button onClick={() => { setUser(null); setCurrentView('summary'); }} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <button onClick={() => setCurrentView('inventory')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${currentView === 'inventory' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
                <Package className="w-4 h-4" /> Inventory
              </button>
              <button onClick={() => setCurrentView('attendance')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${currentView === 'attendance' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
                <UserCheck className="w-4 h-4" /> Attendance
              </button>
            </>
          )}
          {isAdmin && (
            <button onClick={() => setCurrentView('admin')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${currentView === 'admin' ? 'bg-red-600 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`}>
              <Shield className="w-4 h-4" /> Admin
            </button>
          )}
        </div>

        {currentView === 'admin' && isAdmin ? renderAdminPanel() :
         currentView === 'transactions' && canManage ? renderTransactionForm() :
         currentView === 'inventory' ? renderInventory() :
         currentView === 'attendance' ? renderAttendance() :
         renderDashboard(currentView)}
      </div>
    </div>
  );
}

// [CHECKPOINT V1.3] - END OF COMPLETE APPLICATION