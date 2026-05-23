/**
 * AuthProvider
 * Runs exactly ONE Firebase onAuthStateChanged listener for the entire app.
 * Populates useAdminStore, which is the single source of truth for auth state.
 * Both AdminLayout and VisualEditorProvider read from this store — no duplicate listeners.
 */
import { useEffect, type ReactNode } from 'react';
import { onAuthChange, getAdminUser } from '@/firebase/auth';
import { useAdminStore } from '@/store/admin-store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setAdminData, setLoading } = useAdminStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const adminData = await getAdminUser(firebaseUser.uid);
        if (adminData) {
          setUser(firebaseUser);
          setAdminData(adminData);
        } else {
          // Authenticated in Firebase but no admin doc — treat as unauthenticated
          setUser(null);
          setAdminData(null);
        }
      } else {
        setUser(null);
        setAdminData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setAdminData, setLoading]);

  return <>{children}</>;
}
