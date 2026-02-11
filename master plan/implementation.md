# Implementation Plan: v2.4 Inventory Redesign

## Goal
Redesign the Inventory Tab to streamline workflow, simplify categories, and separate "Stock" (Inventory) from "Expenses" (Cash Flow).

---

## 1. UI Layout Redesign (Inventory Tab)

The new layout will follow a vertical flow:

### Section A: Current Inventory List (Top)
**Display**: A table showing **only** items falling under the "Inventory" category.
- **Columns**:
    - Item Name
    - Quantity (Current Stock)
    - Unit
    - Actions: `+` (Add Stock), `-` (Uses/Consumed), `Edit` (Details), `Delete` (Remove).
- **Behavior**: Same interactivity as the current table but filtered for Inventory only.

### Section B: Input Forms (Middle)
Two distinct forms for adding records.

#### Form 1: Stock Entry (User refers to this as "Expenses Input")
**Purpose**: To record purchases of tangible items (Stock In).
- **Fields**: Item Name, Quantity, Price, Unit, Branch.
- **Logic**: 
    - **Hidden Category**: Automatically assigned to **Category 1 (Inventory)**.
    - **Outcome**: Adds to Inventory List (Section A) and records financial impact (Cost).
    - *Note to Developer*: User requested this be "Expenses Input". Verify if label should be "Stock Purchase" for clarity, but implement adding to Inventory.

#### Form 2: Expense Entry (User refers to this as "Inventory Input")
**Purpose**: To record non-tangible costs (Bills, Fees, etc.).
- **Fields**: Expense Name (e.g., "Electricity Bill"), Amount/Price, Date, Branch.
- **Logic**:
    - **Hidden Category**: Automatically assigned to **Category 2 (Miscellaneous)**.
    - **Outcome**: Adds to Expenses List (Section C). NO Quantity field needed (or set to 1).
    - *Note to Developer*: User requested this be "Inventory Input". Verify if label should be "Log Expense" for clarity.

### Section C: Expenses List (Bottom)
**Display**: A read-only list/table of recorded expenses.
- **Columns**: Date, Expense Name, Amount, Branch.
- **Behavior**: Read-only (no stock adjustment buttons). 
- **Requirement**: "Remove the category" input from this view, as it's implicit.

### Section D: Consolidated Table?
**Decision**: The user asked if the "last table of current inventory and expenses" should exist.
- **Plan**: **REMOVE** the old combined table. Sections A and C replace this functionality with better separation.

---

## 2. Category Simplification

Update `src/config/constants.js` to reflect the new 2-category system.

| New Category | Includes Old Categories | Description |
| :--- | :--- | :--- |
| **1. Inventory** | `inventory`, `equipment` | Supplies, Equipment, Tools (Tracked by Qty) |
| **2. Miscellaneous** | `utilities`, `rent`, `misc` | Expenses, Fees, Bills (Tracked by Amount) |

**Migration Strategy (Implicit)**:
- When rendering Section A, filter for `inventory` OR `equipment` (or migrate data).
- When rendering Section C, filter for `utilities`, `rent`, `misc` (or migrate data).

---

## 3. Suggestions & Efficiency Improvements

### Database Structure
*   **Suggestion**: Split Firestore Collections.
    *   Current: Everything in `inventory` collection.
    *   Better: 
        *   `inventory` collection -> For Items with Quantity (Stock).
        *   `expenses` collection -> For One-off Costs (Bills).
    *   *Why*: Makes querying easier ("Get all inventory") without filtering. Simplifies the "Expense List" to just reading the `expenses` collection.

### Terminology (Clarification Needed)
*   **Form Labels**: The request swaps standard logical names ("Expenses Input" -> Inventory, "Inventory Input" -> Expenses). 
    *   **Recommendation**: Label them based on **ACTION**:
        *   Form 1 Label: **"Record Purchase / Stock In"** (Adds to Inventory).
        *   Form 2 Label: **"Record Bill / Expense"** (Adds to Expenses).
    *   *Why*: Avoids confusion about where the data goes.

---

## Code Changes Required

### File: `src/config/constants.js`
- Update `EXPENSE_CATEGORIES` to just the two new groups.

### File: `src/components/inventory/InventoryManager.js`
- **Render Logic**:
    - Remove the single "Add New Item / Expense" form.
    - Create `renderInventoryList()` (Top).
    - Create `renderStockEntryForm()` (Middle 1).
    - Create `renderExpenseEntryForm()` (Middle 2).
    - Create `renderExpenseList()` (Bottom).
- **State Management**:
    - Separate state for `newStockItem` and `newExpenseItem`.
- **Functions**:
    - `handleAddStock()`: Hardcodes category to 'inventory'.
    - `handleAddExpense()`: Hardcodes category to 'misc'.

---

## Verification Plan

### Manual Verification
1.  **Inventory Flow**:
    - Use the first form to add "Shampoo".
    - Check it appears in the **Top Table**.
    - Check it **does not** appear in the Bottom Table.
2.  **Expense Flow**:
    - Use the second form to add "Electric Bill".
    - Check it appears in the **Bottom Table**.
    - Check it **does not** appear in the Top Table.
3.  **Category Check**:
    - Verify old items (Equipment) appear in the Top Table.
    - Verify old items (Rent) appear in the Bottom Table.
