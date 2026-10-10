import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  serverTimestamp, 
  getDocFromServer, 
  runTransaction, 
  increment, 
  arrayUnion 
} from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK with persistent IndexedDB multi-tab cache to drastically reduce reads
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Test connection strictly once per browser session
async function testConnection() {
  if (typeof window !== 'undefined' && sessionStorage.getItem('firestore_tested')) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    if (typeof window !== 'undefined') sessionStorage.setItem('firestore_tested', 'true');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore operating in offline mode or waiting for connection.");
    }
  }
}
testConnection();

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInAnonymously,
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  serverTimestamp,
  runTransaction,
  increment,
  arrayUnion
};
