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

/**
 * Default admin credentials — used for auto-provisioning
 */
const DEFAULT_ADMIN_EMAIL = 'shreeniwas.tripathi0@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'Shree@123';

/**
 * Sign in admin user with email and password.
 * If the Firebase Auth user exists but the Firestore admin_users document does not,
 * it auto-creates the document (first-time setup).
 */
export async function signInAdmin(email: string, password: string): Promise<User> {
  let userCredential;

  try {
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (err: unknown) {
    const firebaseError = err as { code?: string };

    // If user doesn't exist in Auth yet AND it's the default admin, create them
    if (
      firebaseError.code === 'auth/user-not-found' &&
      email === DEFAULT_ADMIN_EMAIL &&
      password === DEFAULT_ADMIN_PASSWORD
    ) {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } else {
      throw err;
    }
  }

  const user = userCredential.user;

  // Ensure admin document exists in Firestore
  const adminRef = doc(db, COLLECTIONS.ADMIN_USERS, user.uid);
  const adminSnap = await getDoc(adminRef);

  if (!adminSnap.exists()) {
    // Auto-create admin document on first login
    await setDoc(adminRef, {
      email: user.email,
      displayName: user.email?.split('@')[0] || 'Admin',
      role: 'super_admin',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  } else {
    // Update last login
    await setDoc(adminRef, { lastLogin: serverTimestamp() }, { merge: true });
  }

  return user;
}

/**
 * Sign out current user
 */
export async function signOutAdmin(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get admin user document from Firestore
 */
export async function getAdminUser(uid: string): Promise<AdminUserDoc | null> {
  try {
    const userRef = doc(db, COLLECTIONS.ADMIN_USERS, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as AdminUserDoc;
    }

    // Auto-create document if user is the default admin and doc is missing
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === uid && currentUser.email === DEFAULT_ADMIN_EMAIL) {
      const adminData = {
        email: currentUser.email,
        displayName: currentUser.email?.split('@')[0] || 'Admin',
        role: 'super_admin' as const,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      await setDoc(userRef, adminData);
      return { id: uid, ...adminData } as unknown as AdminUserDoc;
    }

    return null;
  } catch (error) {
    console.error('Failed to get admin user:', error);
    return null;
  }
}

/**
 * Check if user is an admin
 */
export async function isAdmin(uid: string): Promise<boolean> {
  const adminUser = await getAdminUser(uid);
  return adminUser !== null;
}
