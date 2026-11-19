import React, { createContext, useContext } from 'react';
import { useFirestoreData } from '../hooks/useFirestoreData';
import { useAuthContext } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuthContext();
  const data = useFirestoreData(user);
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useDataContext must be used within DataProvider');
  return context;
}
