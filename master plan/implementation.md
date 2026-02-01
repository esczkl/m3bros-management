# Refactoring Implementation Plan for `src/app.js`

## Goal Description
The `src/app.js` file has grown too large (2000+ lines) and handles too many responsibilities (Auth, Data Fetching, UI for multiple features). The goal is to refactor it into smaller, manageable components and extract business logic into hooks/services. This will make the codebase more efficient, easier to maintain, and ready for new features.

## Proposed Changes

### Configuration
#### [NEW] `src/config/constants.js`
- Move `BRANCHES`, `COLORS`, `PAYMENT_MODES`, `EXPENSE_CATEGORIES`, `UNIT_OPTIONS` here.

### Services / Hooks
#### [NEW] `src/hooks`
- `useAuth()`: Handle login/logout and user state.
- `useData()` or specific hooks like `useTransactions`, `useInventory`: Handle Firebase subscriptions.

### Components
#### [NEW] `src/components/auth/Login.js`
- Extract the login form.

#### [NEW] `src/components/layout/Navbar.js`
- Extract the navigation bar.
- **Update**: Apply specific colors to Inventory and Attendance buttons.

#### [NEW] `src/components/inventory/InventoryManager.js`
- Extract `renderInventory` and `renderInventoryLogs`.

#### [NEW] `src/components/transactions/TransactionForm.js`
- Extract `renderTransactionForm`.
- **Update**: Add editable `date` field (default: current date).

#### [NEW] `src/components/attendance/AttendanceTracker.js`
- Extract `renderAttendance`.

#### [NEW] `src/components/admin/AdminPanel.js`
- Extract `renderAdminPanel`.

#### [NEW] `src/components/dashboard/Dashboard.js`
- Extract `renderDashboard` and stats calculation.
- **Update**: Include `PaymentTracker` and `StaffEarnings`.

#### [NEW] `src/components/dashboard/StaffEarnings.js`
- **New Feature**: Table showing total commission per staff.
- Features: Sortable (Daily, Weekly, Monthly), Search Filter.
- **Logic**: Filter displayed staff based on selected Branch view (e.g., Elite view shows only Elite staff).

#### [NEW] `src/components/dashboard/FundTracker.js`
- **New Feature**: Visual tracker for payment methods (formerly Payment Method Tracker).
- **UI**: Ensure logos and text are aligned; support 2-row layout if needed.

#### [NEW] `src/components/admin/ServicesManager.js`
- **New Feature**: CRUD interface for Services.
- Editable Services Configuration (initially stored in constants/firebase).

### Data & Logic
- **Monthly Default**: Update initial state of date ranges to start/end of current month.
- **Service Storage**: Move hardcoded `BRANCHES` services to Firestore or a dynamic config to allow editing.

### Main Entry
#### [MODIFY] `src/app.js`
- Remove all the extracted logic.
- Import and compose the new components.
- Use the custom hooks for data.

## Verification Plan
1.  **Refactoring Check**: Verify login, navigation, and existing features work 1:1.
2.  **New Features**:
    - Check "Staff Earnings" table sorts and filters correctly.
    - Check "Fund Tracker" layout and totals.
    - Check editable Date in transactions.
    - Check Responsive Layout on different window sizes.
