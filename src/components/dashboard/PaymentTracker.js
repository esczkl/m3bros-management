import React, { useMemo } from 'react';
import { CreditCard, Banknote, Smartphone } from 'lucide-react';

const PAYMENT_CONFIG = {
  Cash: {
    color: 'bg-green-500',
    lightColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-500',
    icon: Banknote,
    gradient: 'from-green-400 to-green-600'
  },
  GCash: {
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-500',
    icon: Smartphone,
    gradient: 'from-blue-400 to-blue-600'
  },
  BDO: {
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-500',
    icon: CreditCard,
    gradient: 'from-yellow-400 to-yellow-600'
  },
  BPI: {
    color: 'bg-red-500',
    lightColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-500',
    icon: CreditCard,
    gradient: 'from-red-400 to-red-600'
  },
  PayMaya: {
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-500',
    icon: Smartphone,
    gradient: 'from-purple-400 to-purple-600'
  }
};

export function PaymentTracker({ transactions, dateRange }) {
  const paymentStats = useMemo(() => {
    const { start, end } = dateRange;
    const allTransactions = Object.values(transactions).flat();
    const filtered = allTransactions.filter(t => t.date >= start && t.date <= end);

    const stats = {};
    let totalAmount = 0;

    filtered.forEach(t => {
      const mode = t.paymentMode || 'Cash';
      if (!stats[mode]) {
        stats[mode] = { count: 0, amount: 0 };
      }
      stats[mode].count += 1;
      stats[mode].amount += t.price || 0;
      totalAmount += t.price || 0;
    });

    // Convert to array with percentages
    return Object.entries(stats).map(([mode, data]) => ({
      mode,
      count: data.count,
      amount: data.amount,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      config: PAYMENT_CONFIG[mode] || PAYMENT_CONFIG.Cash
    })).sort((a, b) => b.amount - a.amount);
  }, [transactions, dateRange]);

  const totalAmount = paymentStats.reduce((sum, p) => sum + p.amount, 0);
  const totalCount = paymentStats.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">Payment Methods</h3>
        </div>
      </div>

      <div className="p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {Object.entries(PAYMENT_CONFIG).map(([mode, config]) => {
            const stat = paymentStats.find(p => p.mode === mode) || { count: 0, amount: 0 };
            const Icon = config.icon;
            return (
              <div
                key={mode}
                className={`rounded-lg p-3 border-2 ${config.borderColor} ${config.lightColor}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded ${config.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className={`font-medium text-sm ${config.textColor}`}>{mode}</span>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  PHP {stat.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{stat.count} transactions</p>
              </div>
            );
          })}
        </div>

        {/* Progress Bar Visualization */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Payment Distribution</span>
            <span className="font-medium">Total: PHP {totalAmount.toLocaleString()}</span>
          </div>
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex">
            {paymentStats.map((stat, idx) => (
              <div
                key={stat.mode}
                className={`h-full ${stat.config.color} transition-all duration-500`}
                style={{ width: `${stat.percentage}%` }}
                title={`${stat.mode}: ${stat.percentage.toFixed(1)}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {paymentStats.map(stat => (
              <div key={stat.mode} className="flex items-center gap-1 text-xs">
                <div className={`w-3 h-3 rounded ${stat.config.color}`}></div>
                <span>{stat.mode}: {stat.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Payment Method</th>
                <th className="px-4 py-2 text-center">Transactions</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paymentStats.length > 0 ? paymentStats.map(stat => {
                const Icon = stat.config.icon;
                return (
                  <tr key={stat.mode} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${stat.config.color}`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-medium">{stat.mode}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{stat.count}</td>
                    <td className="px-4 py-3 text-right font-bold">PHP {stat.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded text-xs ${stat.config.lightColor} ${stat.config.textColor}`}>
                        {stat.percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No payment data for this period
                  </td>
                </tr>
              )}
            </tbody>
            {paymentStats.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-center">{totalCount}</td>
                  <td className="px-4 py-3 text-right">PHP {totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">100%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
