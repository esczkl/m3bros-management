import React, { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { BRANCHES } from '../../config/constants';
import { formatCurrency } from '../../utils/helpers';

export function StaffEarnings({ transactions, currentView }) {
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [searchTerm, setSearchTerm] = useState('');

  // 1 Filter transactions by time
  const getFilteredTransactions = () => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
    // Calculate week start (Sunday)
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekStart = firstDayOfWeek.toISOString().split('T')[0];
    const todayDate = new Date().toISOString().split('T')[0];

    // Combine all transactions if 'summary', else specific branch
    let allTxs = [];
    if (currentView === 'summary') {
      Object.values(transactions).forEach(txs => allTxs.push(...txs));
    } else {
      allTxs = transactions[currentView] || [];
    }

    return allTxs.filter(tx => {
      const txDate = tx.date || tx.timestamp.split('T')[0];
      if (timeFilter === 'daily') return txDate === todayDate;
      if (timeFilter === 'weekly') return txDate >= weekStart;
      if (timeFilter === 'monthly') return txDate.startsWith(currentMonth);
      return true; // all time
    });
  };

  const filteredTxs = getFilteredTransactions();

  // 2. Aggregate Earnings by Staff
  const staffEarnings = useMemo(() => {
    const earnings = {};

    filteredTxs.forEach(tx => {
      // Filter by Branch View if not summary
      if (currentView !== 'summary' && tx.branch !== currentView) return;

      const staffName = tx.staff;
      if (!earnings[staffName]) {
        earnings[staffName] = {
          name: staffName,
          branch: tx.branch, // record branch for filtering
          commission: 0,
          servicesCount: 0
        };
      }
      earnings[staffName].commission += (tx.staffCut || 0);
      earnings[staffName].servicesCount += 1;
    });

    return Object.values(earnings).sort((a, b) => b.commission - a.commission);
  }, [filteredTxs, currentView]);

  // 3. Search Filter
  const displayedStaff = staffEarnings.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-purple-50">
        <div>
          <h3 className="text-lg font-semibold text-purple-900">Staff Earnings</h3>
          <p className="text-xs text-purple-700">Commission Totals ({timeFilter})</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 border rounded text-sm w-32 md:w-auto"
          />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">Staff Name</th>
              <th className="px-4 py-3 text-left">Branch</th>
              <th className="px-4 py-3 text-center">Services</th>
              <th className="px-4 py-3 text-right">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {displayedStaff.length > 0 ? displayedStaff.map((staff, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{staff.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{BRANCHES[staff.branch]?.name || staff.branch}</td>
                <td className="px-4 py-3 text-center">{staff.servicesCount}</td>
                <td className="px-4 py-3 text-right font-bold text-green-600">
                  {formatCurrency(staff.commission)}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No earnings found for this period/filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
