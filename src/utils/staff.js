import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { BRANCHES } from '../config/constants';

// Deterministic ID so seeding the original hard-coded staff is idempotent
// (safe if two people open the Staff page at the same time).
export const seedStaffId = (branch, type, name) => `${branch}__${type}__${name}`;

// Returns staff for a branch grouped by service type: { Barber: ['Lito', ...], Salon: [...] }
// Falls back to the hard-coded list in constants until the staff collection has been seeded.
export const getBranchStaff = (staffList, branchKey) => {
  if (!staffList || staffList.length === 0) return BRANCHES[branchKey]?.staff || {};
  const grouped = {};
  staffList
    .filter(s => s.branch === branchKey && s.active !== false)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(s => {
      if (!grouped[s.type]) grouped[s.type] = [];
      grouped[s.type].push(s.name);
    });
  return grouped;
};

// Copies the hard-coded staff from constants into Firestore (one-time migration).
export const seedStaffFromConstants = async (userId) => {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  Object.entries(BRANCHES).forEach(([branchKey, branch]) => {
    Object.entries(branch.staff || {}).forEach(([type, names]) => {
      names.forEach(name => {
        batch.set(doc(db, 'staff', seedStaffId(branchKey, type, name)), {
          name, branch: branchKey, type, active: true,
          createdAt: now, createdBy: userId, seeded: true
        });
      });
    });
  });
  await batch.commit();
};
