# M3 Bros Management System - Master Plan v2.3

**Status**: Planning Complete
**Goal**: Build v2.3 features on stable v2.2 monolith baseline.

---

## Overview

Building on top of v2.2 with four major feature additions:
1. **Staff Earnings Table** - Comprehensive commission tracking
2. **Monthly Reset** - Default to current month view
3. **Payment Method Tracker** - Cash flow breakdown by payment type
4. **Transaction Backdating** - File transactions for past dates
5. **New Elite Services** - Additional service offerings

---

## Phase 1: New Elite Services ✅ Ready to Implement

### Barber → Package Category
- [ ] HC/Shave - ₱550
- [ ] Headshave / Beardtrim - ₱550

### Salon → Nails Category
- [ ] Footspa/Pedi - ₱450
- [ ] Gel Remove - ₱150
- [ ] Mani/Pedi - ₱275

**Code Location**: BRANCHES constant (~line 12)  
**Complexity**: Low  
**Impact**: Immediate availability in transaction form

---

## Phase 2: Monthly Default Display

### Requirements
- [x] App already defaults to current month (1st through today)
- [ ] Add explicit "Current Month" button (green, prominent)
- [ ] Add period indicator banner showing selected date range

### Implementation
1. **Add setCurrentMonthRange() function** (~5 lines)
2. **Add "📅 Current Month" button** in date controls
3. **Add period indicator div** at top of dashboard

**Code Location**: ~line 306 (functions), ~line 1783 (UI)  
**Complexity**: Low  
**Impact**: Improved UX clarity

---

## Phase 3: Staff Earnings Table

### Design Specifications
✅ Clean, minimal design (no trophy, no highlight colors)  
✅ Search filter for staff names  
✅ Sortable by: Name, Total Earnings, Transaction Count  
✅ Branch-specific filtering  
✅ Only shows staff with >0 transactions

### Components
1. **State Management**
   - [ ] `staffEarningsSort`: Current sort field and direction
   - [ ] `staffSearchFilter`: Search query string

2. **Calculation Logic**
   - [ ] `getStaffEarnings(branchKey)` function
   - [ ] Branch filtering logic
   - [ ] Search filtering
   - [ ] Sorting algorithm

3. **UI Component**
   - [ ] Table header with search input
   - [ ] Sortable column headers
   - [ ] Styled rows (hover effect)
   - [ ] Empty state message

### Branch Filtering Logic
| View | Staff Shown |
|------|-------------|
| **Summary** | All staff (Elite + Arellano + TypeC) |
| **Elite** | Lito, Richard, Kevin, Vicky, Tina, Cath |
| **Arellano** | Joseph, Rowel, Jared, Rommel |
| **TypeC** | Joel, Allen |

**Code Location**: ~line 205 (state), ~line 300 (function), ~line 1830 (UI)  
**Complexity**: Medium  
**Impact**: High - Primary reporting feature

---

## Phase 4: Payment Method Tracker

### Design Specifications
- **Position**: After Gross Income stats, before Staff Earnings
- **Layout**: 5-column grid (responsive to 2 columns on mobile)
- **Payment Methods**: Cash, GCash, BDO, BPI, PayMaya

### Styling Config
| Method | Icon | Color |
|--------|------|-------|
| Cash | Banknote | Green |
| GCash | Smartphone | Blue |
| BDO | CreditCard | Orange |
| BPI | CreditCard | Red |
| PayMaya | Smartphone | Purple |

### Components
1. **Imports**
   - [ ] Add Banknote, Smartphone, CreditCard to lucide-react imports

2. **Calculation**
   - [ ] `paymentMethodTotals` useMemo hook
   - [ ] Filter transactions by date range
   - [ ] Sum by payment mode

3. **UI Component**
   - [ ] Grid container
   - [ ] Card for each payment method
   - [ ] Icon, label, and total

**Code Location**: ~line 3 (imports), ~line 300 (calculation), ~line 1833 (UI)  
**Complexity**: Low  
**Impact**: Medium - Cash flow visibility

---

## Phase 5: Transaction Backdating

### Requirements
- [ ] Date input field in transaction form
- [ ] Default to current date
- [ ] Prevent future dates (max attribute)
- [ ] Validation before submission

### Use Case
Manager forgot to log yesterday's transactions. Can now select yesterday's date and file them retroactively.

### Implementation
1. **Form Field**
   - [ ] Date input with label
   - [ ] Max attribute set to today
   - [ ] Helper text explaining feature

2. **Validation**
   - [ ] Check if date > today
   - [ ] Show alert if future date

**Code Location**: ~line 1360 (form), ~line 420 (validation)  
**Complexity**: Low  
**Impact**: Medium - Data accuracy improvement

---

## Testing Checklist

### Build Verification
```bash
npm run build
```

### Functional Testing

#### New Services
- [ ] Elite → Barber → Package shows new services
- [ ] Elite → Salon → Nails shows new services
- [ ] Prices display correctly
- [ ] Commission calculates correctly

#### Monthly Display
- [ ] App loads with Feb 1 - Feb 2, 2026 range
- [ ] "Current Month" button sets correct range
- [ ] Period indicator shows readable format

#### Staff Earnings
- [ ] Summary shows all staff from all branches
- [ ] Elite view shows only Elite staff
- [ ] Arellano view shows only Arellano staff
- [ ] TypeC view shows only TypeC staff
- [ ] Search filters correctly (case-insensitive)
- [ ] Sorting works for all columns
- [ ] Staff with 0 transactions hidden
- [ ] Empty state displays when no data

#### Payment Tracker
- [ ] All 5 payment methods display
- [ ] Icons render correctly
- [ ] Colors match specification
- [ ] Totals sum to Gross Income
- [ ] Updates when date range changes

#### Transaction Backdating
- [ ] Date field visible in form
- [ ] Defaults to today
- [ ] Can select past dates
- [ ] Cannot select future dates (HTML5 validation)
- [ ] Alert shows if future date attempted
- [ ] Backdated transaction saves correctly
- [ ] Appears in correct date range filters

---

## Code Statistics

**Total New Code**: ~175 lines  
**Files Modified**: 1 (App.js)  
**Dependencies Added**: 0  
**Breaking Changes**: None

### Line Distribution
- New Services: ~10 lines
- Monthly Default: ~15 lines
- Staff Earnings: ~90 lines
- Payment Tracker: ~40 lines
- Transaction Backdating: ~20 lines

---

## Deployment Plan

1. **Development Build**
   ```bash
   npm run build
   ```

2. **Local Testing**
   - Test all features in dev environment
   - Verify no console errors
   - Check responsive design

3. **Firebase Deployment**
   ```bash
   firebase deploy
   ```

4. **Production Verification**
   - Test on live URL
   - Verify Firestore connectivity
   - Cross-browser testing

---

## Version Information

**Current**: v2.2 (Stable baseline)  
**Target**: v2.3  
**Deployment Date**: TBD  
**URL**: https://m3brosmanagementsys.web.app
