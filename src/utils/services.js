import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { BRANCHES } from '../config/constants';

// Service types are fixed per branch because commission splits depend on them (see calculateCuts).
export const getServiceTypes = (branchKey) => Object.keys(BRANCHES[branchKey]?.services || {});

// Returns services for a branch in the original nested shape:
// { Barber: { 'Haircut Men and Women': [{ name, price, description }] } }
// Falls back to the hard-coded catalog until the services collection has been seeded.
export const getBranchServices = (servicesList, branchKey) => {
  if (!servicesList || servicesList.length === 0) return BRANCHES[branchKey]?.services || {};
  const grouped = {};
  servicesList
    .filter(s => s.branch === branchKey && s.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name))
    .forEach(s => {
      if (!grouped[s.type]) grouped[s.type] = {};
      if (!grouped[s.type][s.category]) grouped[s.type][s.category] = [];
      grouped[s.type][s.category].push({ id: s.id, name: s.name, price: s.price, description: s.description || '' });
    });
  return grouped;
};

// One-time migration of the hard-coded catalog into Firestore. Deterministic IDs make it idempotent.
export const seedServicesFromConstants = async (userId) => {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  Object.entries(BRANCHES).forEach(([branchKey, branch]) => {
    let order = 0;
    Object.entries(branch.services || {}).forEach(([type, categories]) => {
      Object.entries(categories).forEach(([category, items]) => {
        items.forEach(item => {
          const id = `${branchKey}__${type}__${category}__${item.name}`.replace(/\//g, '-');
          batch.set(doc(db, 'services', id), {
            branch: branchKey, type, category, name: item.name, price: item.price,
            description: '', active: true, order: order++,
            createdAt: now, createdBy: userId, seeded: true
          });
        });
      });
    });
  });
  await batch.commit();
};
