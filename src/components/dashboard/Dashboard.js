import React from 'react';
import { DollarSign, TrendingUp, Calendar, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, getMonthName } from '../../utils/helpers';
import { FundTracker } from './FundTracker';
import { StaffEarnings } from './StaffEarnings';

export function Dashboard({ currentView, transactions, userRole }) {
  // 1. Data Processing for Dashboard
  const getBranchData = () => {
    let rawData = [];
    if (currentView === 'summary') {
      Object.values(transactions).forEach(txs => rawData.push(...txs));
    } else {
      rawData = transactions[currentView] || [];
    }

    // Default to Monthly View for calculations
    const today = new Date();
    const currentMonthPrefix = today.toISOString().slice(0, 7); // YYYY-MM

    const monthlyData = rawData.filter(t => (t.date || t.timestamp).startsWith(currentMonthPrefix));

    // Stats calculation
    const totalSales = monthlyData.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const totalTransactions = monthlyData.length;
    const managementShare = monthlyData.reduce((acc, curr) => acc + (curr.managementCut || 0), 0);
    const staffCommission = monthlyData.reduce((acc, curr) => acc + (curr.staffCut || 0), 0);

    return { monthlyData, totalSales, totalTransactions, managementShare, staffCommission };
  };

  const { monthlyData, totalSales, totalTransactions, managementShare, staffCommission } = getBranchData();

  // Chart Data Preparation (Daily Sales for Current Month)
  const chartData = React.useMemo(() => {
    const data = {};
    monthlyData.forEach(tx => {
      const day = (tx.date || tx.timestamp).split('T')[0].split('-')[2]; // Extract day DD
      if (!data[day]) data[day] = { name: day, sales: 0 };
      data[day].sales += (tx.price || 0);
    });
    return Object.values(data).sort((a, b) => parseInt(a.name) - parseInt(b.name));
  }, [monthlyData]);

  // Recent Transactions (Last 5)
  const recentTransactions = [...monthlyData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {currentView === 'summary' ? 'Overview Summary' : `${currentView.charAt(0).toUpperCase() + currentView.slice(1)} Branch`}
          </h2>
          <p className="text-gray-500 text-sm">
            Data for {getMonthName(new Date().getMonth())} {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totalSales)}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Management Share</p>
              <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(managementShare)}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Transactions</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalTransactions}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Staff Commission</p>
              <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(staffCommission)}</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* New Features Components */}
      <FundTracker transactions={transactions} currentView={currentView} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Sales Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff Earnings Table */}
        <StaffEarnings transactions={transactions} currentView={currentView} />
      </div>

      {/* Recent Transactions List (Fallback/Simplified) */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Staff</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.length > 0 ? recentTransactions.map((tx, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="font-medium text-gray-900">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(tx.date || tx.timestamp).split('T')[0]}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {tx.service} <span className="text-xs text-gray-400">({tx.paymentMode})</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                      {tx.staff}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(tx.price)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No transactions this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
