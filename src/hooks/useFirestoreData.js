import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export function useFirestoreData(user) {
  const [transactions, setTransactions] = useState({ elite: [], arellano: [], typeC: [] });
  const [inventory, setInventory] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [staffLoaded, setStaffLoaded] = useState(false);
  const [servicesList, setServicesList] = useState([]);
  const [servicesLoaded, setServicesLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setTransactions({ elite: [], arellano: [], typeC: [] });
      setInventory([]);
      setInventoryLogs([]);
      setAttendance([]);
      setUsersList([]);
      setStaffList([]);
      setStaffLoaded(false);
      setServicesList([]);
      setServicesLoaded(false);
      return;
    }

    const txsQuery = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
    const unsubTxs = onSnapshot(txsQuery, (snapshot) => {
      const txs = { elite: [], arellano: [], typeC: [] };
      snapshot.docs.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        if (txs[data.branch]) txs[data.branch].push(data);
      });
      setTransactions(txs);
    });

    const invQuery = query(collection(db, 'inventory'), orderBy('timestamp', 'desc'));
    const unsubInv = onSnapshot(invQuery, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const invLogsQuery = query(collection(db, 'inventoryLogs'), orderBy('timestamp', 'desc'));
    const unsubInvLogs = onSnapshot(invLogsQuery, (snapshot) => {
      setInventoryLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const attQuery = query(collection(db, 'attendance'), orderBy('date', 'desc'));
    const unsubAtt = onSnapshot(attQuery, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const usersQuery = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      setUsersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      setStaffList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setStaffLoaded(true);
    });

    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServicesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setServicesLoaded(true);
    });

    return () => {
      unsubServices();
      unsubStaff();
      unsubTxs();
      unsubInv();
      unsubInvLogs();
      unsubAtt();
      unsubUsers();
    };
  }, [user]);

  return {
    transactions,
    inventory,
    inventoryLogs,
    attendance,
    usersList,
    staffList,
    staffLoaded,
    servicesList,
    servicesLoaded
  };
}
