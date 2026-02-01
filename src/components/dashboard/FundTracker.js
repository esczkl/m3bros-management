import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/helpers';

export function FundTracker({ transactions, currentView }) {

    const fundTotals = useMemo(() => {
        const totals = { 'Cash': 0, 'GCash': 0, 'BDO': 0, 'BPI': 0, 'PayMaya': 0 };

        // Flatten transactions logic
        let allTxs = [];
        if (currentView === 'summary') {
            Object.values(transactions).forEach(txs => allTxs.push(...txs));
        } else {
            allTxs = transactions[currentView] || [];
        }

        // Filter for current month default (or matches dashboard filter if passed prop - assuming monthly default for now as per req)
        const today = new Date();
        const currentMonth = today.toISOString().slice(0, 7);

        allTxs.forEach(tx => {
            const txDate = tx.date || tx.timestamp.split('T')[0];
            if (txDate.startsWith(currentMonth) && totals.hasOwnProperty(tx.paymentMode)) {
                totals[tx.paymentMode] += (tx.price || 0);
            }
        });
        return totals;
    }, [transactions, currentView]);

    const getLogoColor = (mode) => {
        switch (mode) {
            case 'GCash': return 'bg-blue-500 text-white'; // GCash Blue
            case 'PayMaya': return 'bg-green-500 text-white'; // Maya Green
            case 'BDO': return 'bg-blue-800 text-white';
            case 'BPI': return 'bg-red-700 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                Fund Tracker <span className="text-xs font-normal text-gray-500">(Current Month)</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(fundTotals).map(([mode, amount]) => (
                    <div key={mode} className="flex flex-col items-center p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${getLogoColor(mode)}`}>
                            {mode.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{mode}</span>
                        <span className="text-sm font-bold text-gray-800">{formatCurrency(amount)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
