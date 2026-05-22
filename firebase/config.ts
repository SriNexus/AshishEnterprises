import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAbjWZl9idHrb5-h_B2VE-LtY-mfdL0Uc0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ashish-enterprises-881f4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ashish-enterprises-881f4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ashish-enterprises-881f4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1098970770157",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1098970770157:web:d896e960586c6c76e57ae4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XVKPG27L2R",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set persistent auth — sessions survive page refreshes and browser restarts
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Analytics
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}
export { analytics };

export default app;
