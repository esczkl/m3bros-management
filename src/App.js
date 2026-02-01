import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, DollarSign, TrendingUp, Calendar, LogOut, Plus, Trash2, Package, UserCheck, Shield, Edit2, Save, X, Database, UserPlus, Key, Download, Edit3, Minus, Banknote, Smartphone, CreditCard, Scissors } from 'lucide-react';
import { auth, db, loginUser, logoutUser, onAuthChange } from './firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc, setDoc, getDoc, where, writeBatch, getDocs } from 'firebase/firestore';

// ============================================================
// [CHECKPOINT V2.3.2] - SERVICES PANEL SEPARATION
//  Version: 2.3.2 | Separate Services panel, branch-specific types, edit fix
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
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [currentView, setCurrentView] = useState('summary');

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [dateRange, setDateRange] = useState({
    start: firstDayOfMonth.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0]
  });

  const [transactions, setTransactions] = useState({ elite: [], arellano: [], typeC: [] });
  const [inventory, setInventory] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [exportBranch, setExportBranch] = useState('all');
  const [customStaff, setCustomStaff] = useState('');
  const [editingInventory, setEditingInventory] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

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
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'manager' });
  const [showAddUser, setShowAddUser] = useState(false);

  // V2.3: Dynamic Services state
  const [services, setServices] = useState({});
  const [servicesTab, setServicesTab] = useState({ branch: 'elite', serviceType: 'Barber', category: '' });
  const [newService, setNewService] = useState({ name: '', price: 0 });
  const [newCategory, setNewCategory] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [staffEarningsSort, setStaffEarningsSort] = useState({ field: 'total', asc: false });
  const [staffSearchFilter, setStaffSearchFilter] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userDoc.data()
          });
          setUserRole(userDoc.data().role);
        } else {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            email: firebaseUser.email,
            role: 'manager',
            name: firebaseUser.email.split('@')[0],
            createdAt: new Date().toISOString()
          });
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'manager' });
          setUserRole('manager');
        }
      } else {
        setUser(null);
        setUserRole(null);
        setCurrentView('summary');
        setTransactions({ elite: [], arellano: [], typeC: [] });
        setInventory([]);
        setInventoryLogs([]);
        setAttendance([]);
        setUsersList([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const txsQuery = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
    const unsubTxs = onSnapshot(txsQuery, (snapshot) => {
      const txs = { elite: [], arellano: [], typeC: [] };
      snapshot.docs.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        if (txs[data.branch]) txs[data.branch].push(data);
      });
      setTransactions(txs);
    });

    const invQuery = query(collection(db, 'inventory'), orderBy('timestamp', 'desc'));
    const unsubInv = onSnapshot(invQuery, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const invLogsQuery = query(collection(db, 'inventoryLogs'), orderBy('timestamp', 'desc'));
    const unsubInvLogs = onSnapshot(invLogsQuery, (snapshot) => {
      setInventoryLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const attQuery = query(collection(db, 'attendance'), orderBy('date', 'desc'));
    const unsubAtt = onSnapshot(attQuery, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const usersQuery = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      setUsersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // V2.3: Services listener
    const servicesQuery = query(collection(db, 'services'));
    const unsubServices = onSnapshot(servicesQuery, (snapshot) => {
      const servicesData = {};
      snapshot.docs.forEach(docSnap => {
        const data = { id: docSnap.id, ...docSnap.data() };
        if (!servicesData[data.branch]) servicesData[data.branch] = {};
        if (!servicesData[data.branch][data.serviceType]) {
          servicesData[data.branch][data.serviceType] = {};
        }
        if (!servicesData[data.branch][data.serviceType][data.category]) {
          servicesData[data.branch][data.serviceType][data.category] = [];
        }
        servicesData[data.branch][data.serviceType][data.category].push({
          id: data.id,
          name: data.serviceName,
          price: data.price
        });
      });
      setServices(servicesData);
    });

    return () => {
      unsubTxs();
      unsubInv();
      unsubInvLogs();
      unsubAtt();
      unsubUsers();
      unsubServices();
    };
  }, [user]);

  const canManage = userRole === 'admin' || userRole === 'manager';
  const isAdmin = userRole === 'admin';

  // V2.3: Helper to get services (dynamic from Firestore or fallback to BRANCHES)
  const getActiveServices = (branchKey) => {
    if (services[branchKey] && Object.keys(services[branchKey]).length > 0) {
      return services[branchKey];
    }
    return BRANCHES[branchKey]?.services || {};
  };

  // V2.3.1: Branch-specific Staff Earnings function
  const getStaffEarnings = (branchKey) => {
    const { start, end } = dateRange;
    const branchTxs = branchKey === 'summary'
      ? [...transactions.elite, ...transactions.arellano, ...transactions.typeC]
      : transactions[branchKey] || [];
    const filtered = branchTxs.filter(tx => tx.date >= start && tx.date <= end);
    const earnings = {};

    filtered.forEach(tx => {
      if (!earnings[tx.staff]) {
        earnings[tx.staff] = { name: tx.staff, total: 0, count: 0 };
      }
      earnings[tx.staff].total += tx.staffCut || 0;
      earnings[tx.staff].count += 1;
    });

    // Filter by search and only show staff with transactions
    let result = Object.values(earnings).filter(s => s.count > 0);

    if (staffSearchFilter) {
      result = result.filter(s => s.name.toLowerCase().includes(staffSearchFilter.toLowerCase()));
    }

    // Sort
    result.sort((a, b) => {
      const aVal = staffEarningsSort.field === 'name' ? a.name :
                   staffEarningsSort.field === 'count' ? a.count : a.total;
      const bVal = staffEarningsSort.field === 'name' ? b.name :
                   staffEarningsSort.field === 'count' ? b.count : b.total;
      if (staffEarningsSort.field === 'name') {
        return staffEarningsSort.asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return staffEarningsSort.asc ? aVal - bVal : bVal - aVal;
    });

    return result;
  };

  // V2.3: Memoized Payment Method Totals
  const paymentMethodTotals = useMemo(() => {
    const { start, end } = dateRange;
    const allTxs = [...transactions.elite, ...transactions.arellano, ...transactions.typeC];
    const filtered = allTxs.filter(tx => tx.date >= start && tx.date <= end);
    const totals = {};

    PAYMENT_MODES.forEach(mode => totals[mode] = 0);
    filtered.forEach(tx => {
      totals[tx.paymentMode] = (totals[tx.paymentMode] || 0) + tx.price;
    });

    return totals;
  }, [transactions, dateRange]);

  // V2.3: Payment method icons and colors
  const paymentMethodConfig = {
    Cash: { icon: Banknote, color: 'bg-green-500', textColor: 'text-green-600' },
    GCash: { icon: Smartphone, color: 'bg-blue-500', textColor: 'text-blue-600' },
    BDO: { icon: CreditCard, color: 'bg-orange-500', textColor: 'text-orange-600' },
    BPI: { icon: CreditCard, color: 'bg-red-500', textColor: 'text-red-600' },
    PayMaya: { icon: Smartphone, color: 'bg-purple-500', textColor: 'text-purple-600' }
  };

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

  const setMonthlyRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    setDateRange({ start: `${year}-${month}-01`, end: `${year}-${month}-${lastDay}` });
  };

  // V2.3.1: Current Month button (1st of month to today)
  const setCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const today = now.toISOString().split('T')[0];
    setDateRange({ start: `${year}-${month}-01`, end: today });
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

  const handleLogin = async () => {
    try {
      await loginUser(loginForm.email, loginForm.password);
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      alert('Invalid credentials: ' + error.message);
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
    // V2.3: Use dynamic services with fallback
    const activeServices = getActiveServices(newTransaction.branch);
    const serviceObj = activeServices[newTransaction.serviceType]?.[newTransaction.category]?.find(s => s.name === value)
      || BRANCHES[newTransaction.branch].services[newTransaction.serviceType]?.[newTransaction.category]?.find(s => s.name === value);
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
      alert('Please fill in all fields including staff selection');
      return;
    }

    // V2.3.1: Validate date is not in the future
    const today = new Date().toISOString().split('T')[0];
    if (newTransaction.date > today) {
      alert('Transaction date cannot be in the future');
      return;
    }

    try {
      await addDoc(collection(db, 'transactions'), {
        ...newTransaction,
        staff: staffName,
        timestamp: new Date().toISOString(),
        createdBy: user.uid
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
    } catch (error) {
      alert('Error saving transaction: ' + error.message);
    }
  };

  const handleDeleteTransaction = async (branchKey, transactionId) => {
    if (!canManage) {
      alert('You do not have permission to delete transactions');
      return;
    }
    if (window.confirm('Delete this transaction?')) {
      try {
        await deleteDoc(doc(db, 'transactions', transactionId));
      } catch (error) {
        alert('Error deleting: ' + error.message);
      }
    }
  };

  const handleUpdateTransaction = async (transactionId, updatedData) => {
    if (!canManage) {
      alert('You do not have permission to update transactions');
      return;
    }
    try {
      await updateDoc(doc(db, 'transactions', transactionId), {
        ...updatedData,
        lastUpdated: new Date().toISOString()
      });
      setEditingTransaction(null);
    } catch (error) {
      alert('Error updating: ' + error.message);
    }
  };

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

  const cancelEditInventory = () => {
    setEditingInventory(null);
  };

  const handleAddAttendance = async () => {
    if (!canManage) {
      alert('Permission denied');
      return;
    }
    if (!newAttendance.staff) {
      alert('Please select a staff member');
      return;
    }
    const exists = attendance.find(a => a.staff === newAttendance.staff && a.date === newAttendance.date);
    if (exists) {
      alert('This staff member already has an attendance entry for this date');
      return;
    }

    try {
      await addDoc(collection(db, 'attendance'), {
        ...newAttendance,
        timestamp: new Date().toISOString(),
        createdBy: user.uid
      });
      setNewAttendance({
        staff: newAttendance.staff,
        branch: newAttendance.branch,
        status: 'present',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      alert('Error logging attendance: ' + error.message);
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (!canManage) {
      alert('Permission denied');
      return;
    }
    if (window.confirm('Remove this attendance record?')) {
      try {
        await deleteDoc(doc(db, 'attendance', id));
      } catch (error) {
        alert('Error removing: ' + error.message);
      }
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name) {
      alert('Fill all required fields');
      return;
    }

    try {
      await setDoc(doc(db, 'users', 'pending_' + Date.now()), {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: user.uid
      });
      alert('User creation request submitted. Admin must create account in Firebase Console.');
      setNewUser({ email: '', password: '', name: '', role: 'manager' });
      setShowAddUser(false);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleUpdateUser = async (userId) => {
    if (!editingUser.name) {
      alert('Name required');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        name: editingUser.name,
        role: editingUser.role,
        updatedAt: new Date().toISOString()
      });
      setEditingUser(null);
    } catch (error) {
      alert('Error updating: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user.uid) {
      alert('Cannot delete yourself');
      return;
    }
    if (window.confirm('Delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error) {
        alert('Error deleting: ' + error.message);
      }
    }
  };

  // V2.3: Service CRUD Functions
  const migrateServicesToFirestore = async () => {
    if (!window.confirm('Migrate all services from BRANCHES to Firestore? This is a one-time operation.')) return;

    try {
      const batch = writeBatch(db);
      Object.keys(BRANCHES).forEach(branchKey => {
        const branch = BRANCHES[branchKey];
        Object.keys(branch.services).forEach(serviceType => {
          Object.keys(branch.services[serviceType]).forEach(category => {
            branch.services[serviceType][category].forEach(service => {
              const docRef = doc(collection(db, 'services'));
              batch.set(docRef, {
                branch: branchKey,
                serviceType,
                category,
                serviceName: service.name,
                price: service.price,
                createdAt: new Date(),
                updatedAt: new Date()
              });
            });
          });
        });
      });
      await batch.commit();
      alert('Services migration complete!');
    } catch (error) {
      alert('Migration error: ' + error.message);
    }
  };

  const handleAddService = async () => {
    if (!newService.name || newService.price <= 0) {
      alert('Please fill service name and valid price');
      return;
    }
    if (!servicesTab.category) {
      alert('Please select or create a category first');
      return;
    }

    try {
      await addDoc(collection(db, 'services'), {
        branch: servicesTab.branch,
        serviceType: servicesTab.serviceType,
        category: servicesTab.category,
        serviceName: newService.name,
        price: parseFloat(newService.price),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setNewService({ name: '', price: 0 });
    } catch (error) {
      alert('Error adding service: ' + error.message);
    }
  };

  const handleUpdateService = async (serviceId, updates) => {
    try {
      await updateDoc(doc(db, 'services', serviceId), {
        ...updates,
        updatedAt: new Date()
      });
      setEditingService(null);
    } catch (error) {
      alert('Error updating service: ' + error.message);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await deleteDoc(doc(db, 'services', serviceId));
    } catch (error) {
      alert('Error deleting service: ' + error.message);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert('Please enter a category name');
      return;
    }

    // Just set the category in tab state - it will be created when first service is added
    setServicesTab({ ...servicesTab, category: newCategory.trim() });
    setNewCategory('');
  };

  const handleDeleteCategory = async () => {
    if (!servicesTab.category) {
      alert('Select a category first');
      return;
    }
    if (!window.confirm(`Delete entire category "${servicesTab.category}" and all its services?`)) return;

    try {
      const q = query(
        collection(db, 'services'),
        where('branch', '==', servicesTab.branch),
        where('serviceType', '==', servicesTab.serviceType),
        where('category', '==', servicesTab.category)
      );
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(docSnap => batch.delete(docSnap.ref));
      await batch.commit();
      setServicesTab({ ...servicesTab, category: '' });
    } catch (error) {
      alert('Error deleting category: ' + error.message);
    }
  };

  const getBranchExpenses = (branchKey) => {
    let expenses = 0;

    const relevantLogs = branchKey === 'all'
      ? inventoryLogs
      : inventoryLogs.filter(log => log.branch === branchKey);

    relevantLogs.forEach(log => {
      if (log.date >= dateRange.start && log.date <= dateRange.end) {
        // Only count purchases (create) and restocks (increase) as expenses
        // Decreases are consumption (using the item), not financial reversals
        if (log.action === 'create' || log.action === 'increase') {
          expenses += log.totalAmount || 0;
        }
        // Note: We no longer subtract for 'decrease' actions since consuming
        // inventory doesn't return money to the business
      }
    });

    return expenses;
  };

  const getBranchStats = (branchKey) => {
    const { start, end } = getDateRange();
    const branchTransactions = transactions[branchKey].filter(t => t.date >= start && t.date <= end);
    const totalIncome = branchTransactions.reduce((sum, t) => sum + t.price, 0);
    const totalManagementFromTransactions = branchTransactions.reduce((sum, t) => sum + t.managementCut, 0);
    const totalInventoryCost = getBranchExpenses(branchKey);

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
      totalExpenses: allStats.reduce((sum, s) => sum + s.totalExpenses, 0),
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
      ? inventoryLogs.filter(i => i.date >= start && i.date <= end)
      : inventoryLogs.filter(i => i.branch === targetBranch && i.date >= start && i.date <= end);

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

    report += 'INVENTORY/EXPENSES LEDGER\n';
    report += 'Date | Item | Action | Qty | Value | User\n';
    report += '----------------------------------------\n';

    if (relevantExpenses.length > 0) {
      relevantExpenses.forEach(e => {
        const value = e.totalAmount ? `PHP ${e.totalAmount.toFixed(2)}` : '-';
        report += `${e.date} | ${e.itemName} | ${e.action} | ${e.quantityChange || e.quantity} ${e.unit} | ${value} | ${e.userName}\n`;
      });
    } else {
      report += 'No expenses recorded\n';
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
    URL.revokeObjectURL(url);
  };

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">M3 Bros</h1>
            <p className="text-gray-600">Management System V2.3.2</p>
            <p className="text-xs text-green-600 mt-2">● Secure Cloud Connection</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="admin@m3bros.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
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
            <p>Authorized Personnel Only • Firebase Secured</p>
            <p className="mt-2 text-yellow-600">First login: Check with admin for credentials</p>
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
                            <button onClick={cancelEditInventory} className="p-1 text-red-600 hover:bg-red-50 rounded">
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
      </div>
    );
  };

  const renderTransactionForm = () => {
    const branch = BRANCHES[newTransaction.branch];
    // V2.3: Use dynamic services with fallback to BRANCHES
    const activeServices = getActiveServices(newTransaction.branch);
    const serviceTypes = Object.keys(activeServices).length > 0 ? Object.keys(activeServices) : Object.keys(branch.services);
    const categories = newTransaction.serviceType ? Object.keys(activeServices[newTransaction.serviceType] || branch.services[newTransaction.serviceType] || {}) : [];
    const servicesList = newTransaction.category ? (activeServices[newTransaction.serviceType]?.[newTransaction.category] || branch.services[newTransaction.serviceType]?.[newTransaction.category] || []) : [];
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
                {servicesList.map(s => <option key={s.name} value={s.name}>{s.name} - ₱{s.price}</option>)}
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

          {/* V2.3.1: Transaction Date (Backdating) */}
          <div className="md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date</label>
            <input
              type="date"
              value={newTransaction.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Select the date this transaction occurred</p>
          </div>

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
    const today = new Date().toISOString().split('T')[0];
    const { start, end } = attendanceTimeframe === 'daily'
      ? { start: today, end: today }
      : attendanceTimeframe === 'weekly'
        ? { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end: today }
        : { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end: today };

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

  const renderInventoryLogs = () => {
    const recentLogs = inventoryLogs.slice(0, 100);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Inventory Change Log</h2>
        </div>

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
      </div>
    );
  };

  // V2.3.2: Separate Services Panel (accessible by Manager + Admin)
  const renderServicesPanel = () => {
    // Branch-specific service types
    const availableServiceTypes = servicesTab.branch === 'elite'
      ? ['Barber', 'Salon']
      : ['Barber'];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Scissors className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Services Management</h2>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Manage services, categories, and pricing for each branch.</p>
          <button
            onClick={migrateServicesToFirestore}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
          >
            Migrate from BRANCHES
          </button>
        </div>

        {/* Branch & Type Selectors */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                value={servicesTab.branch}
                onChange={(e) => {
                  const newBranch = e.target.value;
                  const newServiceType = newBranch === 'elite' ? servicesTab.serviceType : 'Barber';
                  setServicesTab({ ...servicesTab, branch: newBranch, serviceType: newServiceType, category: '' });
                }}
                className="px-3 py-2 border rounded-lg"
              >
                {Object.entries(BRANCHES).map(([key, b]) => (
                  <option key={key} value={key}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <div className="flex gap-2">
                {availableServiceTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setServicesTab({ ...servicesTab, serviceType: type, category: '' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      servicesTab.serviceType === type ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold mb-3">Categories</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(getActiveServices(servicesTab.branch)[servicesTab.serviceType] || {}).map(cat => (
              <button
                key={cat}
                onClick={() => setServicesTab({ ...servicesTab, category: cat })}
                className={`px-3 py-2 rounded-lg text-sm ${
                  servicesTab.category === cat ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg flex-1"
            />
            <button onClick={handleAddCategory} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
              Add Category
            </button>
            {servicesTab.category && (
              <button onClick={handleDeleteCategory} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
                Delete Category
              </button>
            )}
          </div>
        </div>

        {/* Services in Selected Category */}
        {servicesTab.category && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b bg-green-50">
              <h4 className="font-semibold text-green-900">
                Services in "{servicesTab.category}"
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Service Name</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(getActiveServices(servicesTab.branch)[servicesTab.serviceType]?.[servicesTab.category] || []).map(service => (
                    <tr key={service.id || service.name} className="hover:bg-gray-50">
                      {editingService?.id && service.id && editingService.id === service.id ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editingService.name}
                              onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                              className="w-full px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              value={editingService.price}
                              onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })}
                              className="w-24 px-2 py-1 border rounded text-right"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleUpdateService(service.id, { serviceName: editingService.name, price: editingService.price })}
                              className="p-1 text-green-600 hover:bg-green-50 rounded mr-1"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingService(null)}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium">{service.name}</td>
                          <td className="px-4 py-3 text-right">₱{service.price?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            {service.id ? (
                              <>
                                <button
                                  onClick={() => setEditingService({ id: service.id, name: service.name, price: service.price })}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded mr-1"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteService(service.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">Static data - Run migration to edit</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Service */}
            <div className="px-4 py-4 bg-gray-50 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Service name"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="px-3 py-2 border rounded-lg flex-1"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newService.price || ''}
                  onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border rounded-lg w-32"
                />
                <button onClick={handleAddService} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              </div>
            </div>
          </div>
        )}
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
          Manage users in Firebase Console Authentication for security
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
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

  const renderDashboard = (branchKey) => {
    const stats = branchKey === 'summary' ? getSummaryStats() : getBranchStats(branchKey);
    const branchName = branchKey === 'summary' ? 'All Branches Summary' : BRANCHES[branchKey].name;
    const { start, end } = getDateRange();

    const branchTransactions = branchKey === 'summary'
      ? Object.values(transactions).flat().filter(t => t.date >= start && t.date <= end)
      : transactions[branchKey].filter(t => t.date >= start && t.date <= end);

    const branchExpenseLogs = branchKey === 'summary'
      ? inventoryLogs.filter(l => l.date >= start && l.date <= end)
      : inventoryLogs.filter(l => l.branch === branchKey && l.date >= start && l.date <= end);

    return (
      <div className="space-y-6">
        {/* V2.3: Current Period Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
          📅 Current Period: <span className="font-bold">
            {new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' - '}
            {new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">{branchName}</h2>

          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={setCurrentMonthRange} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-bold">📅 Current Month</button>
            <button onClick={setDailyRange} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Daily</button>
            <button onClick={setFirstHalfRange} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">1st-15th</button>
            <button onClick={setSecondHalfRange} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">16th-End</button>
            <button onClick={setMonthlyRange} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Full Month</button>
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

        {/* V2.3: Payment Method Tracker */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Method Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {PAYMENT_MODES.map(mode => {
              const config = paymentMethodConfig[mode];
              const Icon = config?.icon || CreditCard;
              return (
                <div key={mode} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${config?.color || 'bg-gray-500'} mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">{mode}</p>
                  <p className={`text-xl font-bold ${config?.textColor || 'text-gray-800'}`}>
                    ₱{(paymentMethodTotals[mode] || 0).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* V2.3.1: Staff Earnings Table - Branch-specific with search */}
        {(() => {
          const branchStaffEarnings = getStaffEarnings(branchKey);
          return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <h3 className="text-lg font-semibold">Staff Earnings</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="🔍 Search staff by name..."
                    value={staffSearchFilter}
                    onChange={(e) => setStaffSearchFilter(e.target.value)}
                    className="px-3 py-1 border rounded text-sm w-48"
                  />
                  <span className="text-sm text-gray-600">
                    Total: ₱{branchStaffEarnings.reduce((sum, s) => sum + s.total, 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => setStaffEarningsSort({ field: 'name', asc: staffEarningsSort.field === 'name' ? !staffEarningsSort.asc : true })}>
                        Staff Name {staffEarningsSort.field === 'name' && (staffEarningsSort.asc ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100"
                          onClick={() => setStaffEarningsSort({ field: 'total', asc: staffEarningsSort.field === 'total' ? !staffEarningsSort.asc : false })}>
                        Total Earnings {staffEarningsSort.field === 'total' && (staffEarningsSort.asc ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100"
                          onClick={() => setStaffEarningsSort({ field: 'count', asc: staffEarningsSort.field === 'count' ? !staffEarningsSort.asc : false })}>
                        Transactions {staffEarningsSort.field === 'count' && (staffEarningsSort.asc ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {branchStaffEarnings.length > 0 ? branchStaffEarnings.map((staff) => (
                      <tr key={staff.name} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{staff.name}</td>
                        <td className="px-4 py-3 text-right font-medium">₱{staff.total.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{staff.count}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No earnings data for selected period</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Date/Time</th>
                  {branchKey === 'summary' && <th className="px-4 py-2 text-left">Branch</th>}
                  <th className="px-4 py-2 text-left">Service</th>
                  <th className="px-4 py-2 text-left">Staff</th>
                  <th className="px-4 py-2 text-left">Payment</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  {canManage && <th className="px-4 py-2 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {branchTransactions.slice(0, 50).map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs">{new Date(t.timestamp).toLocaleString()}</td>
                    {branchKey === 'summary' && <td className="px-4 py-2 text-xs">{BRANCHES[t.branch].name}</td>}
                    <td className="px-4 py-2">{t.service}</td>
                    <td className="px-4 py-2">{t.staff}</td>
                    <td className="px-4 py-2"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{t.paymentMode}</span></td>
                    <td className="px-4 py-2 text-right">PHP {t.price.toFixed(2)}</td>
                    {canManage && (
                      <td className="px-4 py-2 text-center">
                        <button onClick={() => handleDeleteTransaction(t.branch, t.id)} className="text-red-600 hover:text-red-800 mx-1" title="Delete">
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

        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
          <div className="px-6 py-4 border-b bg-red-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-red-900">
              Expense Ledger ({branchExpenseLogs.length} entries)
            </h3>
            <span className="text-sm text-red-700 font-bold">
              Total: PHP {branchExpenseLogs.reduce((sum, l) => {
                if (l.action === 'create' || l.action === 'increase') return sum + (l.totalAmount || 0);
                return sum;
              }, 0).toLocaleString()}
            </span>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-left">Action</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-left">By</th>
                  <th className="px-4 py-2 text-left">Financial Note</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {branchExpenseLogs.length > 0 ? branchExpenseLogs.map((log) => (
                  <tr key={log.id} className={`hover:bg-gray-50 ${log.action === 'create' ? 'bg-red-50' :
                      log.action === 'delete' ? 'bg-orange-50' : ''
                    }`}>
                    <td className="px-4 py-2 text-xs">{log.date}</td>
                    <td className="px-4 py-2 font-medium">{log.itemName}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-1 rounded ${log.action === 'create' ? 'bg-green-200 text-green-800' :
                          log.action === 'delete' ? 'bg-red-200 text-red-800' :
                            log.action === 'increase' ? 'bg-blue-200 text-blue-800' :
                              'bg-yellow-200 text-yellow-800'
                        }`}>
                        {log.action?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">{log.quantityChange || log.quantity} {log.unit}</td>
                    <td className="px-4 py-2 text-right font-bold">
                      {(log.action === 'create' || log.action === 'increase') && log.totalAmount > 0 ? (
                        <span className="text-green-600">+PHP {log.totalAmount.toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs">{log.userName}</td>
                    <td className="px-4 py-2 text-xs text-gray-600">{log.financialImpact}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No inventory expenses for this period
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
              <span className="text-xs text-gray-500">v2.3.2 ● Cloud</span>
            </div>
            <button
              onClick={async () => {
                await logoutUser();
              }}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
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
              <button onClick={() => setCurrentView('services')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${currentView === 'services' ? 'bg-green-600 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                <Scissors className="w-4 h-4" /> Services
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
          currentView === 'services' && canManage ? renderServicesPanel() :
          currentView === 'transactions' && canManage ? renderTransactionForm() :
            currentView === 'inventory' ? renderInventory() :
              currentView === 'attendance' ? renderAttendance() :
                renderDashboard(currentView)}
      </div>
    </div>
  );
}