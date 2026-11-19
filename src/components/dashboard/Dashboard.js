import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Calendar, Users, Package, Trash2, Banknote, Smartphone, CreditCard, FileText } from 'lucide-react';
import { BRANCHES, PAYMENT_MODES } from '../../config/constants';
import { getLocalDateString } from '../../utils/helpers';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuthContext, useDataContext, useToast } from '../../contexts';
import { PaymentTracker } from './PaymentTracker';
import { generatePdfReport } from '../../utils/generatePdfReport';

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

export function Dashboard({ branchKey }) {
  const { canManage } = useAuthContext();
  const { transactions, inventoryLogs } = useDataContext();
  const toast = useToast();

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [dateRange, setDateRange] = useState({
    start: getLocalDateString(firstDayOfMonth),
    end: getLocalDateString(today)
  });
  const [exportBranch, setExportBranch] = useState('all');
  const [staffEarningsSort, setStaffEarningsSort] = useState({ field: 'total', asc: false });
  const [staffSearchFilter, setStaffSearchFilter] = useState('');

  // Date range presets
  const setDailyRange = () => {
    const t = getLocalDateString();
    setDateRange({ start: t, end: t });
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
  const setCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setDateRange({ start: `${year}-${month}-01`, end: getLocalDateString(now) });
  };

  // Expense calculation
  const getBranchExpenses = (bKey) => {
    let expenses = 0;
    const relevantLogs = bKey === 'all'
      ? inventoryLogs
      : inventoryLogs.filter(log => log.branch === bKey);
    relevantLogs.forEach(log => {
      if (log.date >= dateRange.start && log.date <= dateRange.end) {
        if (log.action === 'create' || log.action === 'increase') {
          expenses += log.totalAmount || 0;
        }
      }
    });
    return expenses;
  };

  const getBranchStats = (bKey) => {
    const branchTransactions = transactions[bKey].filter(t => t.date >= dateRange.start && t.date <= dateRange.end);
    const totalIncome = branchTransactions.reduce((sum, t) => sum + t.price, 0);
    const totalManagementFromTransactions = branchTransactions.reduce((sum, t) => sum + t.managementCut, 0);
    const totalInventoryCost = getBranchExpenses(bKey);
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

  const stats = branchKey === 'summary' ? getSummaryStats() : getBranchStats(branchKey);
  const branchName = branchKey === 'summary' ? 'All Branches Summary' : BRANCHES[branchKey].name;

  const branchTransactions = branchKey === 'summary'
    ? Object.values(transactions).flat().filter(t => t.date >= dateRange.start && t.date <= dateRange.end)
    : transactions[branchKey].filter(t => t.date >= dateRange.start && t.date <= dateRange.end);

  const branchExpenseLogs = branchKey === 'summary'
    ? inventoryLogs.filter(l => l.date >= dateRange.start && l.date <= dateRange.end)
    : inventoryLogs.filter(l => l.branch === branchKey && l.date >= dateRange.start && l.date <= dateRange.end);

  // Payment method breakdown
  const paymentMethodConfig = {
    Cash: { icon: Banknote, color: 'bg-green-500', textColor: 'text-green-600' },
    GCash: { icon: Smartphone, color: 'bg-blue-500', textColor: 'text-blue-600' },
    BDO: { icon: CreditCard, color: 'bg-orange-500', textColor: 'text-orange-600' },
    BPI: { icon: CreditCard, color: 'bg-red-500', textColor: 'text-red-600' },
    PayMaya: { icon: Smartphone, color: 'bg-purple-500', textColor: 'text-purple-600' }
  };

  const paymentMethodTotals = useMemo(() => {
    const allTxs = branchKey === 'summary'
      ? [...transactions.elite, ...transactions.arellano, ...transactions.typeC]
      : transactions[branchKey] || [];
    const filtered = allTxs.filter(tx => tx.date >= dateRange.start && tx.date <= dateRange.end);
    const totals = {};
    PAYMENT_MODES.forEach(mode => totals[mode] = 0);
    filtered.forEach(tx => { totals[tx.paymentMode] = (totals[tx.paymentMode] || 0) + tx.price; });
    return totals;
  }, [transactions, dateRange, branchKey]);

  // Staff earnings
  const getStaffEarnings = () => {
    const branchTxs = branchKey === 'summary'
      ? [...transactions.elite, ...transactions.arellano, ...transactions.typeC]
      : transactions[branchKey] || [];
    const filtered = branchTxs.filter(tx => tx.date >= dateRange.start && tx.date <= dateRange.end);
    const earnings = {};
    filtered.forEach(tx => {
      if (!earnings[tx.staff]) earnings[tx.staff] = { name: tx.staff, total: 0, count: 0 };
      earnings[tx.staff].total += tx.staffCut || 0;
      earnings[tx.staff].count += 1;
    });
    let result = Object.values(earnings).filter(s => s.count > 0);
    if (staffSearchFilter) {
      result = result.filter(s => s.name.toLowerCase().includes(staffSearchFilter.toLowerCase()));
    }
    result.sort((a, b) => {
      const aVal = staffEarningsSort.field === 'name' ? a.name : staffEarningsSort.field === 'count' ? a.count : a.total;
      const bVal = staffEarningsSort.field === 'name' ? b.name : staffEarningsSort.field === 'count' ? b.count : b.total;
      if (staffEarningsSort.field === 'name') return staffEarningsSort.asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return staffEarningsSort.asc ? aVal - bVal : bVal - aVal;
    });
    return result;
  };

  const handleDeleteTransaction = async (txBranch, transactionId) => {
    if (!canManage) { toast.error('You do not have permission to delete transactions'); return; }
    if (window.confirm('Delete this transaction?')) {
      try {
        await deleteDoc(doc(db, 'transactions', transactionId));
        toast.success('Transaction deleted.');
      } catch (error) { toast.error('Error deleting: ' + error.message); }
    }
  };

  const branchStaffEarnings = getStaffEarnings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{branchName}</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={setCurrentMonthRange} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-bold">Current Month</button>
          <button onClick={setDailyRange} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Daily</button>
          <button onClick={setFirstHalfRange} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">1st-15th</button>
          <button onClick={setSecondHalfRange} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">16th-End</button>
          <button onClick={setMonthlyRange} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">Monthly</button>
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="px-2 py-1 border rounded text-sm" />
          <span className="text-gray-600">to</span>
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="px-2 py-1 border rounded text-sm" />
        </div>
      </div>

      {/* Period Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
        Current Period: <span className="font-bold">
          {new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' - '}
          {new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Export Report */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-wrap items-center gap-4">
        <span className="font-medium text-blue-900">Export Report:</span>
        {branchKey === 'summary' && (
          <select value={exportBranch} onChange={(e) => setExportBranch(e.target.value)} className="px-3 py-1 border rounded bg-white">
            <option value="all">All Branches</option>
            <option value="elite">Elite Salon Branch</option>
            <option value="arellano">C Arellano Branch</option>
            <option value="typeC">Type C Branch</option>
          </select>
        )}
        <button
          onClick={() => {
            if (branchKey !== 'summary') setExportBranch(branchKey);
            // Use setTimeout to let state update for non-summary branches
            setTimeout(() => {
              generatePdfReport({
                exportBranch: branchKey === 'summary' ? exportBranch : branchKey,
                dateRange,
                transactions,
                inventoryLogs,
                getBranchStats,
                getSummaryStats,
              });
              toast.success('PDF report downloaded!');
            }, 0);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium shadow"
        >
          <FileText className="w-4 h-4" />
          Export PDF {branchKey !== 'summary' && `- ${BRANCHES[branchKey].name}`}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <DashboardCard title="Gross Income" value={`PHP ${stats.totalIncome.toLocaleString()}`} icon={DollarSign} color="bg-blue-500" />
        <DashboardCard title="Management Net" value={`PHP ${stats.totalManagementCut.toLocaleString()}`} icon={TrendingUp} color="bg-green-500" />
        <DashboardCard title="Staff Commission" value={`PHP ${stats.totalStaffCut.toLocaleString()}`} icon={Users} color="bg-orange-500" />
        <DashboardCard title="Expenses" value={`PHP ${stats.totalExpenses.toLocaleString()}`} icon={Package} color="bg-red-500" />
        <DashboardCard title="Transactions" value={stats.transactionCount} icon={Calendar} color="bg-purple-500" />
      </div>

      {/* Payment Method Breakdown */}
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
                  PHP {(paymentMethodTotals[mode] || 0).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Tracker (detailed) */}
      <PaymentTracker transactions={transactions} dateRange={dateRange} />

      {/* Staff Earnings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h3 className="text-lg font-semibold">Staff Earnings</h3>
          <div className="flex items-center gap-4">
            <input type="text" placeholder="Search staff..." value={staffSearchFilter} onChange={(e) => setStaffSearchFilter(e.target.value)} className="px-3 py-1 border rounded text-sm w-48" />
            <span className="text-sm text-gray-600">Total: PHP {branchStaffEarnings.reduce((sum, s) => sum + s.total, 0).toLocaleString()}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => setStaffEarningsSort({ field: 'name', asc: staffEarningsSort.field === 'name' ? !staffEarningsSort.asc : true })}>
                  Staff Name {staffEarningsSort.field === 'name' && (staffEarningsSort.asc ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => setStaffEarningsSort({ field: 'total', asc: staffEarningsSort.field === 'total' ? !staffEarningsSort.asc : false })}>
                  Total Earnings {staffEarningsSort.field === 'total' && (staffEarningsSort.asc ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => setStaffEarningsSort({ field: 'count', asc: staffEarningsSort.field === 'count' ? !staffEarningsSort.asc : false })}>
                  Transactions {staffEarningsSort.field === 'count' && (staffEarningsSort.asc ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {branchStaffEarnings.length > 0 ? branchStaffEarnings.map((staff) => (
                <tr key={staff.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{staff.name}</td>
                  <td className="px-4 py-3 text-right font-medium">PHP {staff.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{staff.count}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No earnings data for selected period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b"><h3 className="text-lg font-semibold">Recent Transactions</h3></div>
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
                  {branchKey === 'summary' && <td className="px-4 py-2 text-xs">{BRANCHES[t.branch]?.name || t.branch}</td>}
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
                <tr><td colSpan={branchKey === 'summary' ? 7 : 6} className="px-4 py-8 text-center text-gray-500">No transactions for selected period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Ledger */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        <div className="px-6 py-4 border-b bg-red-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-red-900">Expense Ledger ({branchExpenseLogs.length} entries)</h3>
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
                <tr key={log.id} className={`hover:bg-gray-50 ${log.action === 'create' ? 'bg-red-50' : log.action === 'delete' ? 'bg-orange-50' : ''}`}>
                  <td className="px-4 py-2 text-xs">{log.date}</td>
                  <td className="px-4 py-2 font-medium">{log.itemName}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-1 rounded ${log.action === 'create' ? 'bg-green-200 text-green-800' : log.action === 'delete' ? 'bg-red-200 text-red-800' : log.action === 'increase' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'}`}>
                      {log.action?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">{log.quantityChange || log.quantity} {log.unit}</td>
                  <td className="px-4 py-2 text-right font-bold">
                    {(log.action === 'create' || log.action === 'increase') && log.totalAmount > 0 ? (
                      <span className="text-green-600">+PHP {log.totalAmount.toFixed(2)}</span>
                    ) : (<span className="text-gray-400">-</span>)}
                  </td>
                  <td className="px-4 py-2 text-xs">{log.userName}</td>
                  <td className="px-4 py-2 text-xs text-gray-600">{log.financialImpact}</td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No inventory expenses for this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
