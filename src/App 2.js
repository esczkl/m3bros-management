import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, DollarSign, TrendingUp, Calendar, LogOut, Plus, Trash2, Package, UserCheck, Download, ShoppingCart } from 'lucide-react';


const handleLogin = () => {
    const foundUser = Object.values(USERS).find(
      u => u.username === loginForm.username && u.password === loginForm.password
    );
    if (foundUser) {
      setUser(foundUser);
    } else {
      alert('Invalid credentials');
    }
  };

  const calculateCuts = (serviceType, price) => {
    if (serviceType === 'Barber') {
      return { managementCut: price * 0.5, staffCut: price * 0.5 };
    } else {
      return { managementCut: price * 0.9, staffCut: price * 0.1 };
    }
  };
  
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
          { name: 'Eyebrow Shaping', price: 180 },
          { name: 'Gray Hair Pulling', price: 1600 }
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
        'Haircut Men and Women': [
          { name: 'Hair Cut', price: 180 }
        ]
      }
    },
    staff: {
      Barber: ['Joseph', 'Rowel', 'Jared', 'Rommel']
    }
  },
  typeC: {
    name: 'M3 Bros Type C Branch',
    services: {
      Barber: {
        'Haircut Men and Women': [
          { name: 'Hair Cut', price: 150 }
        ]
      }
    },
    staff: {
      Barber: ['Joel', 'Allen']
    }
  }
};

const USERS = {
  manager: { username: 'manager', password: 'manager123', role: 'manager' },
  owner: { username: 'owner', password: 'owner123', role: 'owner' }
};

function BarbershopApp() {
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [currentView, setCurrentView] = useState('summary');
  const [timeframe, setTimeframe] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [attendanceTimeframe, setAttendanceTimeframe] = useState('daily');
  const [attendanceDateRange, setAttendanceDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [transactions, setTransactions] = useState({ elite: [], arellano: [], typeC: [] });
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    branch: 'elite',
    serviceType: 'Barber',
    category: 'Haircut Men and Women',
    service: '',
    staff: 'Lito',
    price: 0,
    managementCut: 0,
    staffCut: 0,
    date: new Date().toISOString().split('T')[0]
  });
  const [newInventoryItem, setNewInventoryItem] = useState({
    name: '',
    quantity: 0,
    price: 0,
    unit: 'pcs',
    branch: 'elite',
    purchaseDate: new Date().toISOString().split('T')[0]
  });
  const [newAttendance, setNewAttendance] = useState({
    staff: 'Lito',
    branch: 'elite',
    status: 'present',
    date: new Date().toISOString().split('T')[0]
  });

  const getDateRange = () => {
    return { start: dateRange.start, end: dateRange.end };
  };

  const getAttendanceDateRange = () => {
    if (attendanceTimeframe === 'custom') {
      return { start: attendanceDateRange.start, end: attendanceDateRange.end };
    }
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (attendanceTimeframe === 'daily') {
      return { start: todayStr, end: todayStr };
    } else if (attendanceTimeframe === 'weekly') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { start: weekAgo.toISOString().split('T')[0], end: todayStr };
    } else {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return { start: monthAgo.toISOString().split('T')[0], end: todayStr };
    }
  };

  const handleLogin = () => {
    const foundUser = Object.values(USERS).find(
      u => u.username === loginForm.username && u.password === loginForm.password
    );
    if (foundUser) {
      setUser(foundUser);
    } else {
      alert('Invalid credentials');
    }
  };

  const calculateCuts = (serviceType, price) => {
    if (serviceType === 'Barber') {
      return { managementCut: price * 0.5, staffCut: price * 0.5 };
    } else {
      return { managementCut: price * 0.9, staffCut: price * 0.1 };
    }
  };

  const handleServiceTypeChange = (value) => {
    const branch = BRANCHES[newTransaction.branch];
    const categories = Object.keys(branch.services[value] || {});
    
    setNewTransaction({
      ...newTransaction,
      serviceType: value,
      category: categories[0] || '',
      service: '',
      staff: branch.staff[value]?.[0] || '',
      price: 0,
      managementCut: 0,
      staffCut: 0
    });
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

  const handleAddTransaction = () => {
    if (!newTransaction.service || !newTransaction.staff) {
      alert('Please fill in all fields');
      return;
    }

    const transaction = {
      ...newTransaction,
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
      staff: branch.staff[newTransaction.serviceType]?.[0] || '',
      price: 0,
      managementCut: 0,
      staffCut: 0,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteTransaction = (branchKey, transactionId) => {
    setTransactions({
      ...transactions,
      [branchKey]: transactions[branchKey].filter(t => t.id !== transactionId)
    });
  };

  const handleAddInventory = () => {
    if (!newInventoryItem.name || newInventoryItem.quantity <= 0 || newInventoryItem.price <= 0) {
      alert('Please fill in all fields');
      return;
    }

    const inventoryItem = { ...newInventoryItem, id: Date.now() };
    setInventory([...inventory, inventoryItem]);
    
    const expense = {
      id: Date.now(),
      branch: newInventoryItem.branch,
      item: newInventoryItem.name,
      quantity: newInventoryItem.quantity,
      price: newInventoryItem.price,
      totalCost: newInventoryItem.price * newInventoryItem.quantity,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };
    setExpenses([...expenses, expense]);
    
    setNewInventoryItem({ 
      name: '', 
      quantity: 0, 
      price: 0, 
      unit: 'pcs', 
      branch: 'elite',
      purchaseDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleUpdateInventory = (id, quantity) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + quantity } : item
    ));
  };

  const handleDeleteInventory = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const handleAddAttendance = () => {
    if (!newAttendance.staff) {
      alert('Please select a staff member');
      return;
    }

    const existingRecord = attendance.find(
      a => a.staff === newAttendance.staff && a.date === newAttendance.date
    );

    if (existingRecord) {
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
    setAttendance(attendance.filter(a => a.id !== id));
  };

  const getBranchStats = (branchKey) => {
    const { start, end } = getDateRange();
    const branchTransactions = transactions[branchKey].filter(
      t => t.date >= start && t.date <= end
    );
    
    const totalIncome = branchTransactions.reduce((sum, t) => sum + t.price, 0);
    const totalManagementFromTransactions = branchTransactions.reduce((sum, t) => sum + t.managementCut, 0);
    const totalInventoryCost = inventory.filter(i => i.branch === branchKey).reduce((sum, i) => sum + (i.quantity * i.price), 0);
    const totalManagementCut = totalManagementFromTransactions - totalInventoryCost;
    const totalStaffCut = branchTransactions.reduce((sum, t) => sum + t.staffCut, 0);

    return {
      totalIncome,
      totalExpenses: totalInventoryCost,
      totalManagementCut,
      totalStaffCut,
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
    const branchTransactions = branchKey === 'all' 
      ? Object.values(transactions).flat()
      : transactions[branchKey];
    
    const filteredTransactions = branchTransactions.filter(t => t.date >= start && t.date <= end);
    
    const payouts = {};
    filteredTransactions.forEach(t => {
      if (!payouts[t.staff]) {
        payouts[t.staff] = { staff: t.staff, total: 0, count: 0, branch: t.branch };
      }
      payouts[t.staff].total += t.staffCut;
      payouts[t.staff].count += 1;
    });

    return Object.values(payouts);
  };

  const generateReport = () => {
    const { start, end } = getDateRange();
    const stats = getSummaryStats();
    const payouts = getStaffPayouts('all');
    
    let report = 'M3 BROS BARBERSHOP REPORT\n';
    report += 'Period: ' + start + ' to ' + end + '\n\n';
    report += 'SUMMARY\n';
    report += 'Gross Income: PHP ' + stats.totalIncome.toFixed(2) + '\n';
    report += 'Management: PHP ' + stats.totalManagementCut.toFixed(2) + '\n';
    report += 'Staff Commission: PHP ' + stats.totalStaffCut.toFixed(2) + '\n';
    report += 'Total Transactions: ' + stats.transactionCount + '\n\n';
    report += 'STAFF COMMISSION\n';
    payouts.forEach(p => {
      report += p.staff + ' (' + BRANCHES[p.branch].name + '): PHP ' + p.total.toFixed(2) + ' (' + p.count + ' services)\n';
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'M3Bros_' + timeframe + '_report_' + new Date().toISOString().split('T')[0] + '.txt';
    a.click();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">M3 Bros</h1>
            <p className="text-gray-600">Management System</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="mt-6 text-sm text-gray-600 text-center">
            <p>Demo credentials:</p>
            <p>Manager: manager / manager123</p>
            <p>Owner: owner / owner123</p>
          </div>
        </div>
      </div>
    );
  }

  const DashboardCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-3 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-sm sm:text-2xl font-bold text-gray-800 break-words">{value}</p>
        </div>
        <div className={'p-2 sm:p-3 rounded-full ml-2 flex-shrink-0 ' + color}>
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const renderDashboard = (branchKey) => {
    const stats = branchKey === 'summary' ? getSummaryStats() : getBranchStats(branchKey);
    const branchName = branchKey === 'summary' ? 'All Branches Summary' : BRANCHES[branchKey].name;
    const { start, end } = getDateRange();
    const branchTransactions = branchKey === 'summary' 
      ? Object.values(transactions).flat().filter(t => t.date >= start && t.date <= end)
      : transactions[branchKey].filter(t => t.date >= start && t.date <= end);

    const serviceTypeData = branchTransactions.reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.serviceType);
      if (existing) {
        existing.value += t.price;
      } else {
        acc.push({ name: t.serviceType, value: t.price });
      }
      return acc;
    }, []);

    const payouts = getStaffPayouts(branchKey === 'summary' ? 'all' : branchKey);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-2 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{branchName}</h2>
          <div className="flex gap-1 sm:gap-2 flex-wrap w-full sm:w-auto">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-2 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm flex-1 sm:flex-none"
            />
            <span className="flex items-center text-gray-600 text-xs sm:text-sm">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-2 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm flex-1 sm:flex-none"
            />
            {branchKey === 'summary' && (
              <button
                onClick={generateReport}
                className="px-2 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          <DashboardCard 
            title="Gross Income" 
            value={'PHP ' + stats.totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            icon={DollarSign}
            color="bg-blue-500"
          />
          <DashboardCard 
            title="Management Net Income" 
            value={'PHP ' + stats.totalManagementCut.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            icon={TrendingUp}
            color="bg-green-500"
          />
          <DashboardCard 
            title="Staff Commission" 
            value={'PHP ' + stats.totalStaffCut.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            icon={Users}
            color="bg-orange-500"
          />
          <DashboardCard 
            title="Expenses" 
            value={'PHP ' + stats.totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            icon={ShoppingCart}
            color="bg-red-500"
          />
          <DashboardCard 
            title="Transactions" 
            value={stats.transactionCount}
            icon={Calendar}
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={[
                  { name: 'Management Net Income', amount: stats.totalManagementCut },
                  { name: 'Staff Commission', amount: stats.totalStaffCut }
                ]}
                barSize={60}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => 'PHP ' + value.toLocaleString('en-PH', { minimumFractionDigits: 2 })} />
                <Bar dataKey="amount" fill="#3b82f6">
                  {[
                    { name: 'Management Net Income', amount: stats.totalManagementCut },
                    { name: 'Staff Commission', amount: stats.totalStaffCut }
                  ].map((entry, index) => (
                    <Cell key={'cell-' + index} fill={index === 0 ? COLORS[1] : COLORS[2]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {branchKey !== 'summary' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Staff Commission</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payouts.length > 0 ? payouts.map((payout, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{payout.staff}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{payout.count}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">PHP {payout.total.toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        No commission data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {branchKey !== 'summary' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price per Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventory.filter(i => i.branch === branchKey).length > 0 ? 
                    inventory.filter(i => i.branch === branchKey).map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.quantity} {item.unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">PHP {item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">PHP {(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No expenses yet
                      </td>
                    </tr>
                  )}
                  {inventory.filter(i => i.branch === branchKey).length > 0 && (
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={3} className="px-6 py-4 text-sm text-gray-900 text-right">
                        Total Expenses:
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        PHP {inventory.filter(i => i.branch === branchKey).reduce((sum, i) => sum + (i.quantity * i.price), 0).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  {branchKey === 'summary' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Management</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  {user.role === 'manager' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {branchTransactions.length > 0 ? branchTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {new Date(transaction.timestamp).toLocaleString('en-PH')}
                    </td>
                    {branchKey === 'summary' && (
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {BRANCHES[transaction.branch].name}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-900">{transaction.serviceType}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{transaction.service}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{transaction.staff}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">PHP {transaction.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">PHP {transaction.managementCut.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">PHP {transaction.staffCut.toFixed(2)}</td>
                    {user.role === 'manager' && (
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeleteTransaction(transaction.branch, transaction.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={branchKey === 'summary' ? 9 : 8} className="px-6 py-4 text-center text-gray-500">
                      No transactions yet
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

  const renderTransactionForm = () => {
    const branch = BRANCHES[newTransaction.branch];
    const serviceTypes = Object.keys(branch.services);
    const categories = newTransaction.serviceType ? Object.keys(branch.services[newTransaction.serviceType] || {}) : [];
    const services = newTransaction.category ? branch.services[newTransaction.serviceType]?.[newTransaction.category] || [] : [];
    const staff = branch.staff[newTransaction.serviceType] || [];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Transaction</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <select
                value={newTransaction.branch}
                onChange={(e) => {
                  const branchKey = e.target.value;
                  const newBranch = BRANCHES[branchKey];
                  const serviceTypes = Object.keys(newBranch.services);
                  const firstServiceType = serviceTypes[0];
                  const categories = Object.keys(newBranch.services[firstServiceType] || {});
                  
                  setNewTransaction({
                    ...newTransaction,
                    branch: branchKey,
                    serviceType: firstServiceType,
                    category: categories[0] || '',
                    service: '',
                    staff: newBranch.staff[firstServiceType]?.[0] || '',
                    price: 0,
                    managementCut: 0,
                    staffCut: 0
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(BRANCHES).map(([key, branch]) => (
                  <option key={key} value={key}>{branch.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select
                value={newTransaction.serviceType}
                onChange={(e) => handleServiceTypeChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newTransaction.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
              <select
                value={newTransaction.service}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Service</option>
                {services.map(service => (
                  <option key={service.name} value={service.name}>
                    {service.name} - PHP {service.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Staff</label>
              <select
                value={newTransaction.staff}
                onChange={(e) => setNewTransaction({ ...newTransaction, staff: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {staff.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <input
                type="text"
                value={'PHP ' + newTransaction.price.toFixed(2)}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Management Cut</label>
              <input
                type="text"
                value={'PHP ' + newTransaction.managementCut.toFixed(2)}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Staff Cut</label>
              <input
                type="text"
                value={'PHP ' + newTransaction.staffCut.toFixed(2)}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <button
            onClick={handleAddTransaction}
            className="mt-6 w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </div>
    );
  };

  const renderInventory = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Note: Inventory is only available for M3 Bros Elite Salon Branch
          </p>
        </div>
        
        {user.role === 'manager' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={newInventoryItem.name}
                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={newInventoryItem.quantity}
                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Unit</label>
                <input
                  type="number"
                  value={newInventoryItem.price}
                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <select
                  value={newInventoryItem.unit}
                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pcs">Pieces</option>
                  <option value="bottles">Bottles</option>
                  <option value="boxes">Boxes</option>
                  <option value="liters">Liters</option>
                  <option value="misc">Miscellaneous</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
              <input
                type="date"
                value={newInventoryItem.purchaseDate}
                onChange={(e) => setNewInventoryItem({ ...newInventoryItem, purchaseDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleAddInventory}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Current Inventory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price per Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  {user.role === 'manager' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.filter(item => item.branch === 'elite').length > 0 ? inventory.filter(item => item.branch === 'elite').map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">PHP {item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{BRANCHES[item.branch].name}</td>
                    {user.role === 'manager' && (
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleUpdateInventory(item.id, 1)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleUpdateInventory(item.id, -1)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleDeleteInventory(item.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={user.role === 'manager' ? 6 : 5} className="px-6 py-4 text-center text-gray-500">
                      No inventory items yet
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

  const renderAttendance = () => {
    const { start, end } = getAttendanceDateRange();
    const filteredAttendance = attendance.filter(a => a.date >= start && a.date <= end);
    
    const getDatesInRange = () => {
      const dates = [];
      const currentDate = new Date(start);
      const endDate = new Date(end);
      
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    };
    
    const allStaff = Object.entries(BRANCHES).flatMap(([branchKey, branch]) =>
      Object.values(branch.staff).flat().map(staff => ({ name: staff, branch: branchKey }))
    );
    
    const getStaffForDate = (date) => {
      return filteredAttendance.filter(a => a.date === date);
    };
    
    const dates = getDatesInRange();
    
    const getDayName = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    };
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Attendance Tracking</h2>
        
        {user.role === 'manager' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {newAttendance.status === 'off' ? 'Log Day Off' : 'Log Attendance'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <select
                  value={newAttendance.branch}
                  onChange={(e) => {
                    const branchKey = e.target.value;
                    const branchStaff = Object.values(BRANCHES[branchKey].staff).flat();
                    setNewAttendance({ 
                      ...newAttendance, 
                      branch: branchKey,
                      staff: branchStaff[0] || ''
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(BRANCHES).map(([key, branch]) => (
                    <option key={key} value={key}>{branch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Staff</label>
                <select
                  value={newAttendance.staff}
                  onChange={(e) => setNewAttendance({ ...newAttendance, staff: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(BRANCHES[newAttendance.branch].staff).flat().map(staff => (
                    <option key={staff} value={staff}>{staff}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newAttendance.status}
                  onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="off">Day Off</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newAttendance.date}
                  onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleAddAttendance}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              {newAttendance.status === 'off' ? 'Log Day Off' : 'Log Attendance'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Attendance Calendar</h3>
            <div className="flex gap-2 items-center flex-wrap">
              <select
                value={attendanceTimeframe}
                onChange={(e) => setAttendanceTimeframe(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Range</option>
              </select>
              {attendanceTimeframe === 'custom' && (
                <>
                  <input
                    type="date"
                    value={attendanceDateRange.start}
                    onChange={(e) => setAttendanceDateRange({ ...attendanceDateRange, start: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600">to</span>
                  <input
                    type="date"
                    value={attendanceDateRange.end}
                    onChange={(e) => setAttendanceDateRange({ ...attendanceDateRange, end: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="flex gap-4 mb-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Day Off</span>
              </div>
            </div>

            {attendanceTimeframe === 'daily' && (
              <div className="space-y-4">
                {dates.map(date => {
                  const dayStaff = getStaffForDate(date);
                  return (
                    <div key={date} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-3">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </h4>
                      {Object.entries(BRANCHES).map(([branchKey, branch]) => {
                        const branchStaff = dayStaff.filter(s => s.branch === branchKey);
                        return (
                          <div key={branchKey} className="mb-4">
                            <p className="text-sm font-medium text-gray-600 mb-2">{branch.name}</p>
                            <div className="flex flex-wrap gap-2">
                              {branchStaff.length > 0 ? branchStaff.map((record, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => handleDeleteAttendance(record.id)}
                                  className={'px-3 py-2 rounded text-white text-sm font-medium cursor-pointer hover:opacity-80 ' + (
                                    record.status === 'present' ? 'bg-green-500' :
                                    record.status === 'absent' ? 'bg-red-500' :
                                    'bg-blue-500'
                                  )}
                                  title="Click to remove"
                                >
                                  {record.staff}
                                </div>
                              )) : (
                                <span className="text-sm text-gray-400 italic">No data</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {attendanceTimeframe === 'weekly' && (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-2 min-w-max">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <div key={day} className="min-w-32">
                      <div className="bg-gray-100 p-2 rounded-t-lg text-center font-semibold text-sm">
                        {day}
                      </div>
                    </div>
                  ))}
                  {dates.map(date => {
                    const dayStaff = getStaffForDate(date);
                    const dayOfWeek = new Date(date).getDay();
                    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    
                    return (
                      <div
                        key={date}
                        style={{ gridColumnStart: adjustedDay + 1 }}
                        className="border border-gray-200 rounded-b-lg p-2 min-h-32"
                      >
                        <div className="text-xs text-gray-600 mb-2">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="space-y-1">
                          {dayStaff.map((record, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleDeleteAttendance(record.id)}
                              className={'px-2 py-1 rounded text-white text-xs cursor-pointer hover:opacity-80 ' + (
                                record.status === 'present' ? 'bg-green-500' :
                                record.status === 'absent' ? 'bg-red-500' :
                                'bg-blue-500'
                              )}
                              title="Click to remove"
                            >
                              {record.staff}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {attendanceTimeframe === 'monthly' && (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="bg-gray-100 p-2 rounded-lg text-center font-semibold text-sm">
                      {day}
                    </div>
                  ))}
                  {(() => {
                    const firstDate = new Date(dates[0]);
                    const startDay = firstDate.getDay();
                    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
                    const emptyDays = Array(adjustedStartDay).fill(null);
                    
                    return [...emptyDays, ...dates].map((date, idx) => {
                      if (!date) {
                        return <div key={`empty-${idx}`} className="border border-transparent p-2 min-h-24"></div>;
                      }
                      
                      const dayStaff = getStaffForDate(date);
                      
                      return (
                        <div
                          key={date}
                          className="border border-gray-200 rounded-lg p-2 min-h-24"
                        >
                          <div className="text-xs font-semibold text-gray-700 mb-1">
                            {new Date(date).getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayStaff.slice(0, 3).map((record, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleDeleteAttendance(record.id)}
                                className={'px-1 py-0.5 rounded text-white text-xs cursor-pointer hover:opacity-80 ' + (
                                  record.status === 'present' ? 'bg-green-500' :
                                  record.status === 'absent' ? 'bg-red-500' :
                                  'bg-blue-500'
                                )}
                                title="Click to remove"
                              >
                                {record.staff.substring(0, 4)}
                              </div>
                            ))}
                            {dayStaff.length > 3 && (
                              <div className="text-xs text-gray-500">+{dayStaff.length - 3}</div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {attendanceTimeframe === 'custom' && (
              <div className="space-y-4">
                {dates.map(date => {
                  const dayStaff = getStaffForDate(date);
                  return (
                    <div key={date} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-3">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </h4>
                      {Object.entries(BRANCHES).map(([branchKey, branch]) => {
                        const branchStaff = dayStaff.filter(s => s.branch === branchKey);
                        return (
                          <div key={branchKey} className="mb-4">
                            <p className="text-sm font-medium text-gray-600 mb-2">{branch.name}</p>
                            <div className="flex flex-wrap gap-2">
                              {branchStaff.length > 0 ? branchStaff.map((record, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => handleDeleteAttendance(record.id)}
                                  className={'px-3 py-2 rounded text-white text-sm font-medium cursor-pointer hover:opacity-80 ' + (
                                    record.status === 'present' ? 'bg-green-500' :
                                    record.status === 'absent' ? 'bg-red-500' :
                                    'bg-blue-500'
                                  )}
                                  title="Click to remove"
                                >
                                  {record.staff}
                                </div>
                              )) : (
                                <span className="text-sm text-gray-400 italic">No data</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">M3 Bros</h1>
              <span className="ml-2 sm:ml-4 px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm">
                {user.role === 'manager' ? 'Manager' : 'Owner'}
              </span>
            </div>
            <button
              onClick={() => setUser(null)}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-gray-700 hover:text-gray-900 text-sm"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setCurrentView('summary')}
            className={'px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap ' + (
              currentView === 'summary' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            Summary
          </button>
          {Object.entries(BRANCHES).map(([key, branch]) => (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              className={'px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap ' + (
                currentView === key ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <span className="hidden sm:inline">{branch.name}</span>
              <span className="sm:hidden">
                {key === 'elite' ? 'Elite' : key === 'arellano' ? 'Arellano' : 'Type C'}
              </span>
            </button>
          ))}
          {user.role === 'manager' && (
            <>
              <button
                onClick={() => setCurrentView('transactions')}
                className={'px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors font-semibold text-xs sm:text-base whitespace-nowrap ' + (
                  currentView === 'transactions' ? 'bg-green-600 text-white' : 'bg-green-500 text-white hover:bg-green-600'
                )}
              >
                Transactions
              </button>
              <button
                onClick={() => setCurrentView('inventory')}
                className={'px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 ' + (
                  currentView === 'inventory' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Inventory</span>
              </button>
              <button
                onClick={() => setCurrentView('attendance')}
                className={'px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 ' + (
                  currentView === 'attendance' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Attendance</span>
              </button>
            </>
          )}
        </div>

        {currentView === 'transactions' && user.role === 'manager' ? renderTransactionForm() :
         currentView === 'inventory' ? renderInventory() :
         currentView === 'attendance' ? renderAttendance() :
         renderDashboard(currentView)}
      </div>
    </div>
  );
};

export default BarbershopApp;