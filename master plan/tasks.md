# M3 Bros Management System - Master Plan

**Version:** 2.4
**Last Updated:** February 2, 2026
**Status:** Complete

---

## Phase 1: Refactoring (Complete)

### 1.1 Extract Constants and Utilities
- [x] Move `BRANCHES`, `COLORS`, `PAYMENT_MODES`, `EXPENSE_CATEGORIES`, `UNIT_OPTIONS` to `src/config/constants.js`
- [x] Create `src/utils/helpers.js` with utility functions (`formatCurrency`, `getMonthName`, `calculateCuts`, etc.)

### 1.2 Extract Firebase/Service Logic
- [x] Create `src/firebase.js` with Firebase configuration and auth helpers
- [x] Create custom hooks:
  - [x] `useAuth` - Authentication state management (login, logout, user role)
  - [x] `useFirestoreData` - Combined Firestore subscriptions (transactions, inventory, attendance, users)
  - *Note: Combined hook approach is more efficient than separate hooks*

### 1.3 Component Decomposition
- [x] `src/components/auth/Login.js` - Login form
- [x] `src/components/layout/Navbar.js` - Navigation bar with branch tabs
- [x] `src/components/dashboard/Dashboard.js` - Main dashboard with stats
- [x] `src/components/dashboard/FundTracker.js` - Payment method totals
- [x] `src/components/dashboard/StaffEarnings.js` - Staff commission table
- [x] `src/components/dashboard/PaymentTracker.js` - Detailed payment breakdown
- [x] `src/components/inventory/InventoryManager.js` - Inventory CRUD
- [x] `src/components/transactions/TransactionForm.js` - Add transactions
- [x] `src/components/attendance/AttendanceTracker.js` - Attendance calendar
- [x] `src/components/admin/AdminPanel.js` - User management
- [x] `src/components/admin/ServicesManager.js` - Services catalog viewer

### 1.4 Refactor App.js
- [x] Integrate all components
- [x] Use custom hooks for state management
- [x] Clean modular structure (~120 lines vs original 800+)

---

## Phase 2: New Features (Complete)

### 2.1 Monthly View Default
- [x] Dashboard defaults to current month data
- [x] StaffEarnings supports Daily/Weekly/Monthly filters
- [x] FundTracker shows current month totals

### 2.2 Staff Earnings Table
- [x] Implemented `StaffEarnings` component
- [x] Sorting by timeframe (Daily, Weekly, Monthly)
- [x] Search filter for staff names
- [x] Branch-specific filtering (Elite staff in Elite view, etc.)

### 2.3 Fund Tracker
- [x] Implemented `FundTracker` component
- [x] Shows totals by payment method (Cash, GCash, BDO, BPI, PayMaya)
- [x] Responsive grid layout

### 2.4 Responsive UI
- [x] Desktop layout (full width)
- [x] Tablet layout (2-column grids)
- [x] Mobile layout (single column, scrollable)

### 2.5 Transaction Feature Updates
- [x] Editable date field (defaults to current date)
- [x] Freelancer/custom staff option
- [x] Price override for managers

### 2.6 Navigation Bar Updates
- [x] Amber color for Inventory button
- [x] Indigo color for Attendance button
- [x] Green for Transaction button
- [x] Red for Admin button

### 2.7 Services Dashboard
- [x] Services Catalog with search and branch filter
- [x] Collapsible categories
- [x] Service statistics (total, avg price, price range)
- [x] Staff Directory by branch
- [x] Restricted to Admin access

---

## Phase 3: Verification (Complete)

- [x] Build successful
- [x] Deployed to Firebase
- [x] All components working
- [x] Version 2.4 live

---

## Project Structure

```
src/
  App.js                              # Main app (clean, modular)
  firebase.js                         # Firebase configuration
  index.js                            # React entry point

  config/
    constants.js                      # BRANCHES, COLORS, PAYMENT_MODES, etc.

  hooks/
    index.js                          # Hook exports
    useAuth.js                        # Authentication hook
    useFirestoreData.js               # Firestore subscriptions hook

  utils/
    helpers.js                        # Utility functions

  components/
    index.js                          # Component exports
    auth/
      Login.js                        # Login form
    layout/
      Navbar.js                       # Navigation bar
    dashboard/
      Dashboard.js                    # Main dashboard
      FundTracker.js                  # Payment method tracker
      StaffEarnings.js                # Staff commission table
      PaymentTracker.js               # Detailed payment breakdown
    transactions/
      TransactionForm.js              # Add new transactions
    inventory/
      InventoryManager.js             # Inventory management
    attendance/
      AttendanceTracker.js            # Attendance calendar
    admin/
      AdminPanel.js                   # User management
      ServicesManager.js              # Services catalog
```

---

## Deployment Info

- **Hosting:** Firebase Hosting
- **Database:** Cloud Firestore
- **Auth:** Firebase Authentication
- **URL:** https://m3brosmanagementsys.web.app
