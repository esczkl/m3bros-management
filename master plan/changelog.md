# Changelog

All notable changes to the M3 Bros Management System will be documented in this file.

## [v2.4] - 2026-02-11 (Current)

### Added
- **Inventory/Expense Separation**: Split the combined Inventory & Expenses tab into two distinct sections with their own tables and forms.
- **Current Inventory Table** (green-tinted): Shows stock items (shampoo, tools, etc.) with +/- quantity controls, inline editing, and delete.
- **Recorded Expenses Table** (orange-tinted): Shows bills/expenses as read-only records with delete-only actions.
- **Two Purpose-Built Forms**: "Record Purchase / Stock In" (green) for inventory items and "Record Bill / Expense" (orange) for expenses, displayed side-by-side on desktop.
- **Backward-Compatible Category Helpers**: `isStockCategory()` and `isExpenseCategory()` handle all 5 old category values without data migration.

### Changed
- **Simplified Categories**: Reduced from 5 categories to 2 (Inventory/Supplies, Miscellaneous). Old data (equipment, utilities, rent) is handled transparently by helper functions.
- **No Dashboard Impact**: `getBranchExpenses()` still reads from the same Firestore collections with the same action types.

---

## [v2.3.2] - 2026-02-05

### Fixed
- **Dashboard Date Defaults**: Corrected an issue where the dashboard would show "January 31" as the default start date due to UTC timezone usage. All dashboards now correctly default to "February 1" (or current month) in Phillippine time.
- **Tasks Deletion**: Removed outdated `tasks.md` file from master plan.

## [v2.3] - 2026-02-05
- **Transaction Backdating**: Ability to file transactions for past dates.
- **New Services**: Added packages for Elite Barber and Salon Nails.
- **Changelog**: Added this file for version tracking.

### Changed
- **Dashboard Date Logic**:
    - Dashboard now respects the global date range selector instead of forcing a current-month view.
    - Fixed timezone issues where dates would default to "yesterday" during morning hours.
- **Documentation**: Updated master plan documents to reflect v2.3 changes.

### Fixed
- Fixed an issue where the dashboard was showing the previous month's end date (e.g., Jan 31) when it should show the current month start.

---

## [v2.2] - 2026-01-15

### Added
- Cloud-based architecture transition.
- Basic attendance tracking.
- Inventory management basics.
