# Implementation Plan: v2.3 Feature Additions

## Goal
Build on v2.2 monolith with Staff Earnings, Payment Tracker, Monthly Reset, and Transaction Backdating.

---

## Feature 1: New Elite Services

### Services to Add

**Elite Branch Only**

#### Barber → Package
- HC/Shave - ₱550
- Headshave / Beardtrim - ₱550

#### Salon → Nails
- Footspa/Pedi - ₱450
- Gel Remove - ₱150
- Mani/Pedi - ₱275

### Code Changes

**File**: [App.js](file:///c:/Users/khaye/OneDrive%20-%20Microsoft365/Documents/m3bros-management-fixed/src/App.js)  
**Location**: Line ~12-100 (BRANCHES constant)

**Add to Line ~25 (Barber.Package)**:
```javascript
'Package': [
  { name: 'Complete', price: 300 },
  { name: 'HC/Shave', price: 550 },
  { name: 'Headshave / Beardtrim', price: 550 }
],
```

**Add to Line ~50 (Salon.Nails)**:
```javascript
'Nails': [
  { name: 'Manicure', price: 150 },
  { name: 'Pedicure', price: 175 },
  { name: 'Footspa/Pedi', price: 450 },
  { name: 'Gel Remove', price: 150 },
  { name: 'Mani/Pedi', price: 275 }
],
```

---

## Feature 2: Monthly Default Display

### Requirements
1. Current month range by default ✓ (already implemented)
2. Explicit "Current Month" button
3. Visual period indicator

### Code Changes

#### Add Function (after line ~306)

```javascript
const setCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const today = now.toISOString().split('T')[0];
  setDateRange({ start: `${year}-${month}-01`, end: today });
};
```

#### Add Button (in renderDashboard, around line ~1783)

```jsx
<div className="flex gap-2">
  <button 
    onClick={setCurrentMonthRange} 
    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-bold">
    📅 Current Month
  </button>
  <button onClick={setDailyRange} ...>Daily</button>
  {/* ... other buttons */}
</div>
```

#### Add Period Indicator (top of renderDashboard)

```jsx
<div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800 mb-4">
  📅 Current Period: <span className="font-bold">
    {new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    {' - '}
    {new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
  </span>
</div>
```

---

## Feature 3: Staff Earnings Table

### Architecture

**State** → **Calculation** → **UI Component**

### Step 1: Add State (line ~205)

```javascript
const [staffEarningsSort, setStaffEarningsSort] = useState({ field: 'total', asc: false });
const [staffSearchFilter, setStaffSearchFilter] = useState('');
```

### Step 2: Add Calculation Function (after line ~300)

```javascript
const getStaffEarnings = (branchKey) => {
  const { start, end } = dateRange;
  
  // Branch-specific filtering
  const branchTxs = branchKey === 'summary'
    ? [...transactions.elite, ...transactions.arellano, ...transactions.typeC]
    : transactions[branchKey] || [];
  
  const filtered = branchTxs.filter(tx => tx.date >= start && tx.date <= end);
  const earnings = {};

  // Calculate totals per staff
  filtered.forEach(tx => {
    if (!earnings[tx.staff]) {
      earnings[tx.staff] = { name: tx.staff, total: 0, count: 0 };
    }
    earnings[tx.staff].total += tx.staffCut || 0;
    earnings[tx.staff].count += 1;
  });

  // Filter: only staff with transactions
  let result = Object.values(earnings).filter(s => s.count > 0);

  // Apply search filter
  if (staffSearchFilter) {
    result = result.filter(s => 
      s.name.toLowerCase().includes(staffSearchFilter.toLowerCase())
    );
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
```

### Step 3: Add UI Component (in renderDashboard, after stats cards ~line 1830)

```jsx
{/* V2.3: Staff Earnings Table */}
{(() => {
  const branchStaffEarnings = getStaffEarnings(branchKey);
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header with Search */}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => setStaffEarningsSort({ 
                  field: 'name', 
                  asc: staffEarningsSort.field === 'name' ? !staffEarningsSort.asc : true 
                })}>
                Staff Name {staffEarningsSort.field === 'name' && (staffEarningsSort.asc ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100"
                onClick={() => setStaffEarningsSort({ 
                  field: 'total', 
                  asc: staffEarningsSort.field === 'total' ? !staffEarningsSort.asc : false 
                })}>
                Total Earnings {staffEarningsSort.field === 'total' && (staffEarningsSort.asc ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100"
                onClick={() => setStaffEarningsSort({ 
                  field: 'count', 
                  asc: staffEarningsSort.field === 'count' ? !staffEarningsSort.asc : false 
                })}>
                Transactions {staffEarningsSort.field === 'count' && (staffEarningsSort.asc ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {branchStaffEarnings.length > 0 ? branchStaffEarnings.map((staff) => (
              <tr key={staff.name} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{staff.name}</td>
                <td className="px-4 py-3 text-right font-medium">
                  ₱{staff.total.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">{staff.count}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No earnings data for selected period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
})()}
```

---

## Feature 4: Payment Method Tracker

### Step 1: Add Imports (line ~3)

```javascript
import { 
  Users, DollarSign, TrendingUp, Calendar, LogOut, Plus, Trash2, 
  Package, UserCheck, Shield, Edit2, Save, X, Database, UserPlus, 
  Key, Download, Edit3, Minus, Banknote, Smartphone, CreditCard 
} from 'lucide-react';
```

### Step 2: Add Calculation (after line ~300)

```javascript
// V2.3: Payment Method Totals
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

const paymentMethodConfig = {
  Cash: { icon: Banknote, color: 'bg-green-500', textColor: 'text-green-600' },
  GCash: { icon: Smartphone, color: 'bg-blue-500', textColor: 'text-blue-600' },
  BDO: { icon: CreditCard, color: 'bg-orange-500', textColor: 'text-orange-600' },
  BPI: { icon: CreditCard, color: 'bg-red-500', textColor: 'text-red-600' },
  PayMaya: { icon: Smartphone, color: 'bg-purple-500', textColor: 'text-purple-600' }
};
```

### Step 3: Add UI Component (in renderDashboard, after stats ~line 1833)

```jsx
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
```

---

## Feature 5: Transaction Backdating

### Step 1: Add Date Field (in renderTransactionForm, after Staff dropdown ~line 1360)

```jsx
{/* V2.3: Transaction Date (Backdating) */}
<div className="md:w-1/3">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Transaction Date
  </label>
  <input
    type="date"
    value={newTransaction.date}
    max={new Date().toISOString().split('T')[0]}
    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
  />
  <p className="text-xs text-gray-500 mt-1">
    Select the date this transaction occurred
  </p>
</div>
```

### Step 2: Add Validation (in handleAddTransaction, before database write ~line 420)

```javascript
// V2.3: Validate date is not in the future
const today = new Date().toISOString().split('T')[0];
if (newTransaction.date > today) {
  alert('Transaction date cannot be in the future');
  return;
}
```

---

## Testing Matrix

| Feature | Test Case | Expected Result |
|---------|-----------|-----------------|
| **New Services** | Select Elite → Barber → Package | HC/Shave and Headshave/Beardtrim appear |
| | Select Elite → Salon → Nails | New nail services appear |
| **Monthly Default** | Refresh app | Shows Feb 1 - Feb 2, 2026 |
| | Click Current Month button | Same range |
| **Staff Earnings** | View Summary | All 12 staff appear |
| | View Elite | Only 6 Elite staff |
| | View Arellano | Only 4 Arellano staff |
| | View TypeC | Only 2 TypeC staff |
| | Search "lito" | Only Lito appears |
| | Click column headers | Sorts accordingly |
| **Payment Tracker** | View Summary | 5 cards with correct totals |
| | Change date range | Totals update |
| **Backdating** | Select yesterday | Transaction saves with yesterday's date |
| | Try future date | Alert appears |

---

## Version Update Checklist

- [ ] Line 8: `// [CHECKPOINT V2.3]`
- [ ] Line 9: `//  Version: 2.3 | Staff Earnings, Payment Tracker, Backdating`
- [ ] Line ~918: `Management System V2.3`
- [ ] Line ~1968: `v2.3 ● Cloud`
