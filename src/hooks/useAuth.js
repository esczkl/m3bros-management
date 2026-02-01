import { useState, useEffect } from 'react';
import { db, loginUser, logoutUser, onAuthChange } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userDoc.data()
          });
          setUserRole(userDoc.data().role);
        } else {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            email: firebaseUser.email,
            role: 'manager',
            name: firebaseUser.email.split('@')[0],
            createdAt: new Date().toISOString()
          });
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'manager' });
          setUserRole('manager');
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    await loginUser(email, password);
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  const canManage = userRole === 'admin' || userRole === 'manager';
  const isAdmin = userRole === 'admin';

  return {
    user,
    userRole,
    loading,
    canManage,
    isAdmin,
    handleLogin,
    handleLogout
  };
}
