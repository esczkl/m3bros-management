# Master Plan: M3 Bros Management System - v2.3 Restoration & Cleanup

**Goal**: Restore the project to the stable v2.3 state (current `App.js`) and perform a strict component extraction to improve maintainability without altering functionality.

## Phase 1: Restoration Point (Current)
- [x] **State Preservation**
    - [x] Paste v2.3 code into `App.js` (Completed by User)
    - [x] Freeze this logic as the "Source of Truth"

## Phase 2: Component Extraction (Cleanup)
**Objective**: Move logic from `App.js` to dedicated files 1:1. No new features.

- [x] **Config & Utils**
    - [x] `src/config/constants.js`: Extract `BRANCHES`, `COLORS`, `PAYMENT_MODES`, etc.
    - [x] `src/utils/helpers.js`: Extract `formatCurrency`, `getMonthName`, date helpers.

- [x] **Hooks (Logic Layer)**
    - [x] `src/hooks/useAuth.js`: Extract Authentication logic.
    - [x] `src/hooks/useFirestoreData.js`: Extract real-time existing listeners.

- [x] **UI Components (View Layer)**
    - [x] `src/components/layout/Navbar.js`: Extract Navigation.
    - [x] `src/components/auth/Login.js`: Extract Login form.
    - [x] `src/components/dashboard/Dashboard.js`: Extract Dashboard, Stats, and Summary View.
    - [x] `src/components/inventory/InventoryManager.js`: Extract Inventory & Expenses logic.
    - [x] `src/components/transactions/TransactionForm.js`: Extract Transaction logic.
    - [x] `src/components/attendance/AttendanceTracker.js`: Extract Attendance logic.
    - [x] `src/components/admin/AdminPanel.js`: Extract User Management.

- [x] **Integration**
    - [x] `src/App.js`: Re-assemble using the extracted components.
    - [x] Verify application behaves *exactly* as the monolith version.

## Phase 3: Verification
- [x] Build successful
- [x] Deployed to Firebase
- [x] Application works as expected

## Phase 4: Future Features (On Hold)
- [ ] Staff Earnings (Sortable)
- [ ] Fund Tracker
- [ ] Services Dashboard

---

## Project Structure

```
src/
  App.js                              # Main app (modular, ~120 lines)
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
