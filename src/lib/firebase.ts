import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const auth = getAuth(app);

// Connect to named database from config
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export function getDeviceId(): string {
  let id = localStorage.getItem('koratrust_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('koratrust_device_id', id);
  }
  return id;
}

// Ensure anonymous auth or local device fallback for seamless low-friction access
export function initAuth(onUserChanged: (user: User | null) => void) {
  const deviceUid = getDeviceId();
  const fallbackUser = { uid: deviceUid } as User;

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      try {
        const cred = await signInAnonymously(auth);
        onUserChanged(cred.user);
      } catch (err: any) {
        // If anonymous auth is restricted (e.g. auth/admin-restricted-operation)
        // fallback smoothly to persistent device session
        console.warn('Anonymous auth restricted/unavailable, using persistent device ID session:', err?.code || err);
        onUserChanged(fallbackUser);
      }
    } else {
      onUserChanged(user);
    }
  });
}

export {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
};
