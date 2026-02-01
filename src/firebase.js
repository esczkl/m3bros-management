import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc,
  setDoc,
  getDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyATBWY0LRonZtagf5-1lzd8v878P05Rfj4",
  authDomain: "m3brosmanagementsys.firebaseapp.com",
  projectId: "m3brosmanagementsys",
  storageBucket: "m3brosmanagementsys.firebasestorage.app",
  messagingSenderId: "1028499068114",
  appId: "1:1028499068114:web:cc9a677f96d874f11f490b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper functions
export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);