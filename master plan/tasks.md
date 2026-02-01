# M3 Bros Management System - Task List (v2.3.2 Services Refactor)

**Status**: Planning
**Goal**: Separate Services panel, fix branch-specific service types, and resolve edit errors.

## 1. Separate Services Panel from Admin
- [ ] Create `renderServicesPanel()` function
- [ ] Extract entire Services UI from Admin Panel (lines 2033-2217)
- [ ] Remove Services tab button from Admin Panel tabs
- [ ] Add Services navigation button (after Attendance, before Admin)
- [ ] Make button visible to `canManage` (Manager + Admin)
- [ ] Update render logic to handle `currentView === 'services'`
- [ ] Restore Admin Panel access to `isAdmin` only
- [ ] Update Admin button navigation to `isAdmin`

## 2. Branch-Specific Service Types
- [ ] Add conditional logic for service type buttons
- [ ] **Elite branch**: Show Barber AND Salon
- [ ] **Arellano branch**: Show ONLY Barber
- [ ] **TypeC branch**: Show ONLY Barber
- [ ] Auto-switch serviceType to 'Barber' when selecting Arellano/TypeC
- [ ] Test service creation for each branch type

## 3. Fix Edit Services Runtime Error

### Root Cause Identified
- [x] Static BRANCHES services have no `.id` property
- [x] Firestore services have `.id` from document ID
- [x] Edit comparison `editingService.id === service.id` fails when both undefined
- [x] Causes multiple services to enter edit mode simultaneously

### Fixes Required
- [ ] Add safety check: `editingService?.id && service.id && ...`
- [ ] Prevent edit mode activation for services without IDs
- [ ] Update "Static (migrate first)" message to be more descriptive
- [ ] Test edit functionality only works on migrated services
- [ ] Verify no runtime errors when viewing static services

## 4. Testing & Verification
- [ ] Run `npm run build`
- [ ] **Navigation Test**:
  - [ ] Manager sees Services button (after Attendance)
  - [ ] Manager can access Services panel
  - [ ] Manager sees Admin button (admin-only features)
  - [ ] Admin sees both Services and Admin buttons
  - [ ] Staff sees neither Services nor Admin
- [ ] **Branch Types Test**:
  - [ ] Elite → both Barber and Salon visible
  - [ ] Arellano → only Barber visible
  - [ ] TypeC → only Barber visible
- [ ] **Edit Fix Test**:
  - [ ] Static services show "Static data - Run migration to edit"
  - [ ] Edit/Delete buttons don't work on static services
  - [ ] After migration → edit works correctly
  - [ ] Only clicked service enters edit mode (not others)

---

## Changes Summary

### New Structure:
```
Navigation: Summary | Elite | Arellano | TypeC | + Transaction | Inventory | Attendance | Services | Admin
                                                                                            ↑          ↑
                                                                                       canManage  isAdmin
```

### Access Control:
- **Services Panel**: Manager + Admin (`canManage`)
- **Admin Panel**: Admin only (`isAdmin`)

### Service Types by Branch:
- **Elite**: Barber, Salon
- **Arellano**: Barber only
- **TypeC**: Barber only

### Code Changes:
1. Extract `renderServicesPanel()` function (~180 lines)
2. Add Services navigation button (~8 lines)
3. Update render logic (~2 lines)
4. Conditional service type rendering (~10 lines)
5. Fix edit safety checks (~5 lines)
6. Restore admin access control (~2 lines)

**Total**: ~207 lines (mostly extraction, minimal new code)
