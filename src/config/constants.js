export const BRANCHES = {
  elite: {
    name: 'M3 Bros Elite Salon Branch',
    services: {
      Barber: {
        'Haircut Men and Women': [
          { name: 'Hair Cut', price: 250 },
          { name: 'Hair Cut with Shampoo Rinse and Dry', price: 300 },
          { name: 'Head Shave', price: 350 },
          { name: 'Beard Trim', price: 200 },
          { name: 'Shave', price: 300 },
          { name: 'Ladies Cut', price: 300 }
        ],
        'Hair Styling': [
          { name: 'Shampoo and Rinse', price: 120 },
          { name: 'Blow Dry Mens', price: 100 }
        ],
        'Organic Hair Color': [
          { name: 'Hair Color with Hair Cut', price: 1100 },
          { name: 'Organic Color', price: 1450 }
        ],
        'Hair Care': [
          { name: 'Revitalizing Hair Treatment', price: 980 },
          { name: 'Total Hair Treatment', price: 980 },
          { name: 'Brazilian Blowout with Hair Color', price: 2650 }
        ],
        'Scalp Care': [
          { name: 'Dandruff Control Therapy', price: 980 },
          { name: 'Metholated Scalp Treatment', price: 800 },
          { name: 'Hair Growth Therapy', price: 1600 }
        ],
        'Hair Removal': [
          { name: 'Threading or Waxing for Eyebrow or Mustache', price: 180 },
          { name: 'Eyebrow Shaping', price: 180 }
        ],
        'Massage 15 Minutes': [
          { name: 'Body Massage', price: 200 },
          { name: 'Hand Massage', price: 200 },
          { name: 'Scalp Massage', price: 200 },
          { name: 'Back Massage', price: 200 }
        ],
        'Package': [
          { name: '1 Facial and Hair Treatment', price: 2200 },
          { name: '2 Scalp Treatment and Facial and Hair Cut', price: 1600 },
          { name: '3 Facial and Hair Cut and Shave', price: 1750 }
        ]
      },
      Salon: {
        'Package': [
          { name: '1 Basic Mani Pedi Footspa', price: 575 },
          { name: '2 Gel Mani Footspa Pedi', price: 880 },
          { name: '3 Gel Mani Gel Pedi Classic Eyelash', price: 1250 },
          { name: '4 Gel Mani Footspa Pedi Classic Eyelash', price: 1150 }
        ],
        'Nail': [
          { name: 'Manicure', price: 125 },
          { name: 'Pedicure', price: 150 },
          { name: 'Foot Spa', price: 350 },
          { name: 'Hand Spa', price: 250 },
          { name: 'Foot Massage', price: 250 },
          { name: 'Hand Massage', price: 200 },
          { name: 'Gel Manicure', price: 450 },
          { name: 'Gel Pedicure', price: 500 },
          { name: 'Nail Extension', price: 999 },
          { name: 'Soft Gel', price: 250 }
        ],
        'Waxing': [
          { name: 'Under Arms', price: 250 },
          { name: 'Eyebrow', price: 150 },
          { name: 'Upper Lip', price: 150 },
          { name: 'Arm', price: 350 },
          { name: 'Half Leg', price: 450 },
          { name: 'Full Leg', price: 600 },
          { name: 'Bikini', price: 450 },
          { name: 'Brazilian', price: 500 }
        ],
        'Eyelash': [
          { name: 'Eyelash Removal', price: 150 },
          { name: 'Classic', price: 350 },
          { name: 'Cat Eye', price: 450 },
          { name: 'Wispy', price: 450 },
          { name: 'Doll Eye', price: 400 },
          { name: 'Volume', price: 600 },
          { name: 'Cat Eye Volume', price: 600 },
          { name: 'Wispy Volume', price: 700 },
          { name: 'Mega Volume', price: 700 }
        ]
      }
    },
    staff: {
      Barber: ['Lito', 'Richard', 'Kevin'],
      Salon: ['Vicky', 'Tina', 'Cath']
    }
  },
  arellano: {
    name: 'M3 Bros C Arellano Branch',
    services: {
      Barber: {
        'Haircut Men and Women': [{ name: 'Hair Cut', price: 180 }]
      }
    },
    staff: { Barber: ['Joseph', 'Rowel', 'Jared', 'Rommel'] }
  },
  typeC: {
    name: 'M3 Bros Type C Branch',
    services: {
      Barber: {
        'Haircut Men and Women': [{ name: 'Hair Cut', price: 150 }]
      }
    },
    staff: { Barber: ['Joel', 'Allen'] }
  }
};

export const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const PAYMENT_MODES = ['Cash', 'GCash', 'BDO', 'BPI', 'PayMaya'];

export const EXPENSE_CATEGORIES = [
  { value: 'inventory', label: 'Inventory/Supplies' },
  { value: 'misc', label: 'Miscellaneous' }
];

// Backward-compatible category helpers
export const isStockCategory = (cat) => cat === 'inventory' || cat === 'equipment';
export const isExpenseCategory = (cat) => cat === 'utilities' || cat === 'rent' || (cat && cat.startsWith('misc'));

export const UNIT_OPTIONS = ['pcs', 'bottles', 'boxes', 'liters', 'packs', 'sachets', 'sheets', 'sets', 'other'];
