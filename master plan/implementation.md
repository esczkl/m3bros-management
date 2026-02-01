# Implementation Plan: v2.3.2 Services Refactor

## Goal
Separate Services into standalone panel, implement branch-specific service types, and fix edit runtime errors.

---

## Change 1: Separate Services Panel

### Current Architecture
- Services exists as a tab within Admin Panel
- Access: `adminTab === 'services'` 
- Admin Panel uses `canManage` (Manager + Admin)

### Target Architecture
- Services becomes standalone panel (like Inventory, Attendance)
- Access: `currentView === 'services'` with `canManage`
- Admin Panel restricted to `isAdmin` only

### Implementation Steps

#### Step 1: Create `renderServicesPanel()` Function

**Location**: [App.js](file:///c:/Users/khaye/OneDrive%20-%20Microsoft365/Documents/m3bros-management-fixed/src/App.js) (around line 2030)

**Action**: Extract lines 2035-2217 into new function

```javascript
const renderServicesPanel = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Services Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage service categories and pricing across all branches
          </p>
        </div>
        <button
          onClick={migrateServicesToFirestore}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
        >
          Migrate from BRANCHES
        </button>
      </div>

      {/* Branch & Type Selectors */}
      <div className="bg-white rounded-lg shadow p-4">
        {/* ... existing selector UI ... */}
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg shadow p-4">
        {/* ... existing categories UI ... */}
      </div>

      {/* Services Table */}
      {servicesTab.category && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* ... existing table UI ... */}
        </div>
      )}
    </div>
  );
};
```

#### Step 2: Remove Services from Admin Panel

**Delete**:
- Lines ~1882-1884: Services tab button
- Lines ~2033-2217: Services tab content

**Result**: Admin Panel only has Users, Data, Inventory Logs tabs.

#### Step 3: Add Services Navigation Button

**Location**: Line ~2537 (after Attendance, before Admin)

```javascript
{canManage && (
  <button 
    onClick={() => setCurrentView('services')} 
    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${
      currentView === 'services' ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-50'
    }`}
  >
    <Scissors className="w-4 h-4" /> Services
  </button>
)}
```

#### Step 4: Update Render Logic

**Location**: Line 2549

**Before**:
```javascript
{currentView === 'admin' && canManage ? renderAdminPanel() :
```

**After**:
```javascript
{currentView === 'admin' && isAdmin ? renderAdminPanel() :
  currentView === 'services' && canManage ? renderServicesPanel() :
```

#### Step 5: Restore Admin-Only Access

**Location**: Line 2540

**Change**:
```javascript
{isAdmin && (  // Changed from canManage
  <button onClick={() => setCurrentView('admin')} ...>
    <Shield className="w-4 h-4" /> Admin
  </button>
)}
```

---

## Change 2: Branch-Specific Service Types

### Business Rules
- **Elite**: Barber + Salon (full service spa)
- **Arellano**: Barber only (men's grooming)
- **TypeC**: Barber only (men's grooming)

### Implementation

**Location**: `renderServicesPanel()` function, service type selector (around line 2065)

**Current Code**:
```javascript
<div className="flex gap-2">
  {['Barber', 'Salon'].map(type => (
    <button key={type} onClick={() => setServicesTab({ ...servicesTab, serviceType: type, category: '' })}>
      {type}
    </button>
  ))}
</div>
```

**Updated Code**:
```javascript
<div className="flex gap-2">
  {(() => {
    // Branch-specific service types
    const availableTypes = servicesTab.branch === 'elite' 
      ? ['Barber', 'Salon'] 
      : ['Barber'];
    
    return availableTypes.map(type => (
      <button
        key={type}
        onClick={() => setServicesTab({ ...servicesTab, serviceType: type, category: '' })}
        className={`px-4 py-2 rounded-lg text-sm font-medium ${
          servicesTab.serviceType === type 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        {type}
      </button>
    ));
  })()}
</div>
```

**Also Update**: Branch selector onChange (line 2055)

```javascript
<select
  value={servicesTab.branch}
  onChange={(e) => {
    const newBranch = e.target.value;
    // Force Barber type for Arellano/TypeC if Salon was selected
    const newServiceType = (newBranch === 'arellano' || newBranch === 'typeC') 
      ? 'Barber' 
      : servicesTab.serviceType;
    
    setServicesTab({ 
      branch: newBranch, 
      serviceType: newServiceType, 
      category: '' 
    });
  }}
  className="px-3 py-2 border rounded-lg"
>
  {Object.entries(BRANCHES).map(([key, b]) => (
    <option key={key} value={key}>{b.name}</option>
  ))}
</select>
```

---

## Change 3: Fix Edit Services Runtime Error

### Problem Analysis

**Scenario**: User has NOT migrated services yet (still using static BRANCHES data)

**What Happens**:
1. Services table renders with `service.id = undefined` (static data)
2. User clicks Edit button
3. `setEditingService({ id: undefined, name: ..., price: ... })`
4. Next render: `editingService.id === service.id` → `undefined === undefined` → TRUE
5. **BUG**: All static services enter edit mode, not just the clicked one

**Root Cause**: Unsafe comparison with undefined values.

### Solution

**Prevent editing static services entirely** - force migration first.

#### Fix 1: Edit Mode Condition (Line 2137)

**Before**:
```javascript
{editingService?.id === service.id ? (
  // Edit mode
) : (
  // Display mode
)}
```

**After**:
```javascript
{editingService?.id && service.id && editingService.id === service.id ? (
  // Edit mode (only for Firestore services)
) : (
  // Display mode
)}
```

This ensures edit mode ONLY activates when:
- `editingService` has an ID (truthy)
- `service` has an ID (truthy)  
- IDs match

#### Fix 2: Actions Column (Lines 2175-2190)

**Current** (already correct, just improve messaging):
```javascript
{service.id ? (
  <>
    <button onClick={() => setEditingService({ id: service.id, name: service.name, price: service.price })}>
      <Edit2 className="w-4 h-4" />
    </button>
    <button onClick={() => handleDeleteService(service.id)}>
      <Trash2 className="w-4 h-4" />
    </button>
  </>
) : (
  <span className="text-xs text-gray-400">Static (migrate first)</span>
)}
```

**Improved**:
```javascript
{service.id ? (
  <>
    <button 
      onClick={() => setEditingService({ id: service.id, name: service.name, price: service.price })}
      className="p-1 text-blue-600 hover:bg-blue-50 rounded mr-1"
      title="Edit service"
    >
      <Edit2 className="w-4 h-4" />
    </button>
    <button 
      onClick={() => handleDeleteService(service.id)}
      className="p-1 text-red-600 hover:bg-red-50 rounded"
      title="Delete service"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </>
) : (
  <span className="text-xs text-gray-400 italic">
    Static data - Click "Migrate from BRANCHES" to enable editing
  </span>
)}
```

---

## Testing Plan

### Build Verification
```bash
npm run build
```

### Feature Testing

#### 1. Services Panel Separation

**As Manager**:
- [ ] Services button visible in nav (green, after Attendance)
- [ ] Click Services → opens standalone panel
- [ ] Panel shows: Branch selector, Type buttons, Categories, Table
- [ ] Admin button visible
- [ ] Click Admin → opens Admin Panel
- [ ] Admin Panel shows: Users, Data, Inventory Logs (NO Services)

**As Admin**:
- [ ] Both Services and Admin buttons visible
- [ ] Services panel functional
- [ ] Admin panel accessible

**As Staff**:
- [ ] Neither Services nor Admin button visible

#### 2. Branch-Specific Service Types

- [ ] Select **Elite** → Barber AND Salon buttons visible
- [ ] Select **Arellano** → ONLY Barber button visible
- [ ] Select **TypeC** → ONLY Barber button visible
- [ ] Switch from Elite (Salon selected) to Arellano → auto-switches to Barber
- [ ] Create service in Arellano with Barber type → success

#### 3. Edit Services Fix

**Before Migration**:
- [ ] View Elite services (static data, no IDs)
- [ ] Actions column shows: "Static data - Click 'Migrate from BRANCHES' to enable editing"
- [ ] No Edit/Delete buttons visible
- [ ] No runtime errors in console

**After Migration**:
- [ ] Click "Migrate from BRANCHES" button
- [ ] Wait for success alert
- [ ] Services table reloads with IDs
- [ ] Edit and Delete buttons now visible
- [ ] Click Edit on "Hair Cut" → ONLY "Hair Cut" row enters edit mode
- [ ] Change price 250 → 280 → Click Save → updates successfully
- [ ] Click Edit on "Beard Trim" → ONLY "Beard Trim" enters edit mode
- [ ] Cancel → exits edit mode cleanly
- [ ] No errors in console

---

## Summary

### Navigation Changes:
```
BEFORE: Summary | ... | Attendance | Admin (Services inside)
AFTER:  Summary | ... | Attendance | Services | Admin
                                        ↑          ↑
                                   canManage  isAdmin
```

### Service Type Availability:
| Branch | Barber | Salon |
|--------|--------|-------|
| Elite | ✅ | ✅ |
| Arellano | ✅ | ❌ |
| TypeC | ✅ | ❌ |

### Bug Fixes:
- ✅ Edit mode no longer activates for multiple services
- ✅ Static services cannot be edited (migration required)
- ✅ Clear messaging for users

### Code Impact:
- **Extract**: ~180 lines (Services UI → renderServicesPanel)
- **Add**: ~15 lines (nav button, render logic, branch filtering)
- **Modify**: ~10 lines (access control, safety checks)
- **Total**: ~205 lines affected, minimal risk

---

## Version Update

Update version markers after deployment:
- Line 7: `// [CHECKPOINT V2.3.2] - SERVICES PANEL & BRANCH TYPES`
- Line 8: `//  Version: 2.3.2 | Standalone Services, Branch-specific types, Edit fix`
- Line 1153: `Management System V2.3.2`
- Line 2504: `v2.3.2 ● Cloud`
