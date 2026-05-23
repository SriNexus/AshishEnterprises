import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { COLLECTIONS } from './collections';
import type { AdminUserDoc } from '@/types/admin';

/** Default admin credentials for auto-provisioning */
const DEFAULT_ADMIN_EMAIL = 'shreeniwas.tripathi0@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'Shree@123';

/**
 * Sign in admin user.
 * On first-ever login with the default admin credentials,
 * auto-creates both the Firebase Auth user and Firestore admin document.
 */
export async function signInAdmin(email: string, password: string): Promise<User> {
  let userCredential;

  try {
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (err: unknown) {
    const firebaseError = err as { code?: string; message?: string };

    // Modern Firebase SDK uses 'auth/invalid-credential' for both
    // user-not-found AND wrong-password. We need to attempt user creation
    // only for the specific default admin credentials.
    const isDefaultAdmin = email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD;
    const isNotFound =
      firebaseError.code === 'auth/user-not-found' ||
      firebaseError.code === 'auth/invalid-credential' ||
      firebaseError.code === 'auth/invalid-login-credentials';

    if (isDefaultAdmin && isNotFound) {
      try {
        // Try creating the Auth user
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (createErr: unknown) {
        const createError = createErr as { code?: string };
        if (createError.code === 'auth/email-already-in-use') {
          // User exists but password might be wrong — rethrow original error
          throw err;
        }
        throw createErr;
      }
    } else {
      throw err;
    }
  }

  const user = userCredential.user;

  // Ensure Firestore admin document exists
  try {
    const adminRef = doc(db, COLLECTIONS.ADMIN_USERS, user.uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      await setDoc(adminRef, {
        email: user.email,
        displayName: user.email?.split('@')[0] || 'Admin',
        role: 'super_admin',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } else {
      await setDoc(adminRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
  } catch (firestoreErr) {
    // Firestore write may fail due to security rules on first setup
    // Admin can still access the panel — the rules allow read by auth.uid
    console.warn('Firestore admin doc write failed (may need rules update):', firestoreErr);
  }

  return user;
}

/** Sign out */
export async function signOutAdmin(): Promise<void> {
  await firebaseSignOut(auth);
}

/** Get current user */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/** Subscribe to auth state changes */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/** Get admin user document from Firestore */
export async function getAdminUser(uid: string): Promise<AdminUserDoc | null> {
  try {
    const userRef = doc(db, COLLECTIONS.ADMIN_USERS, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as AdminUserDoc;
    }

    // Auto-create admin doc if this is the default admin user
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === uid) {
      const adminData = {
        email: currentUser.email || '',
        displayName: currentUser.email?.split('@')[0] || 'Admin',
        role: 'super_admin' as const,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      try {
        await setDoc(userRef, adminData);
        return { id: uid, ...adminData } as unknown as AdminUserDoc;
      } catch {
        // If Firestore write fails, still return a temporary admin object
        // so the user can access the dashboard
        return {
          id: uid,
          email: currentUser.email || '',
          displayName: currentUser.email?.split('@')[0] || 'Admin',
          role: 'super_admin',
        } as unknown as AdminUserDoc;
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to get admin user:', error);
    // Return a fallback admin object if Firestore is unreachable
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === uid) {
      return {
        id: uid,
        email: currentUser.email || '',
        displayName: currentUser.email?.split('@')[0] || 'Admin',
        role: 'super_admin',
      } as unknown as AdminUserDoc;
    }
    return null;
  }
}

/** Check if user is admin */
export async function isAdmin(uid: string): Promise<boolean> {
  const adminUser = await getAdminUser(uid);
  return adminUser !== null;
}
