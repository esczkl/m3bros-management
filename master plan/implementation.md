# Implementation Plan: v2.3 Component Extraction

## Goal
Decompose the monolithic `v2.3` App.js into modular components to improve code manageability, while ensuring **zero functional changes**.

## Source of Truth
- **`src/App.js`** (Current File): All logic must be extracted exactly as is from here.

## Execution Steps

### 1. Configuration & Constants
- Move constant objects `BRANCHES`, `COLORS`, `PAYMENT_MODES`, `EXPENSE_CATEGORIES`, `UNIT_OPTIONS` to `src/config/constants.js`.

### 2. Utilities
- Move helper functions `formatCurrency`, `getMonthName`, `getCalendarDays`, `navigateMonth` logic to `src/utils/helpers.js`.

### 3. Custom Hooks
- **`useAuth`**: Extract `user`, `userRole`, `loading`, `loginForm` state and `onAuthChange` effect.
- **`useFirestoreData`**: Extract listeners for `transactions`, `inventory`, `inventoryLogs`, `attendance`, `usersList`.

### 4. Component Extraction
Create the following components in `src/components/`, ensuring they receive necessary props:

| Component | Path | Responsibilities |
|-----------|------|------------------|
| **Login** | `auth/Login.js` | Login form UI & handler. |
| **Navbar** | `layout/Navbar.js` | Top navigation, logout, role display. |
| **Dashboard** | `dashboard/Dashboard.js` | Stats cards, charts, summary blocks. |
| **InventoryManager** | `inventory/InventoryManager.js` | Inventory CRUD, consumption logic (`renderInventory`). |
| **TransactionForm** | `transactions/TransactionForm.js` | Add transaction form (`renderTransactionForm`). |
| **AttendanceTracker** | `attendance/AttendanceTracker.js` | Attendance logging & calendar (`renderAttendance`). |
| **AdminPanel** | `admin/AdminPanel.js` | User management (`renderAdmin`). |

### 5. Config/App.js Refactor
- Import all hooks and components into `App.js`.
- Pass state and handlers as props.
- Ensure the `switch/case` logic for `currentView` remains identical.

## Verification
- App must build without errors.
- Navigation between tabs must work.
- "Add Transaction" must work exactly as before.
- Inventory "Decrease" button must function as "Consumption" (no financial deduction), consistent with v2.2/2.3 logic.
