/**
 * VisualEditorContext — global state for visual CMS editing mode
 * Only active when admin is authenticated and browsing public pages
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { onAuthChange, getAdminUser } from '@/firebase/auth';

interface VisualEditorContextType {
  isEditMode: boolean;
  isAdmin: boolean;
  activeSection: string | null;
  setActiveSection: (id: string | null) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  savingSection: string | null;
  setSavingSection: (id: string | null) => void;
  toggleEditMode: () => void;
  user: { email?: string | null; uid: string } | null;
}

const VisualEditorContext = createContext<VisualEditorContextType | null>(null);

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [user, setUser] = useState<{ email?: string | null; uid: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const adminData = await getAdminUser(firebaseUser.uid);
        if (adminData) {
          setIsAdmin(true);
          setUser({ email: firebaseUser.email, uid: firebaseUser.uid });
          // Auto-enable edit mode on public pages
          if (!window.location.pathname.startsWith('/admin')) {
            setIsEditMode(true);
          }
        } else {
          setIsAdmin(false);
          setIsEditMode(false);
          setUser(null);
        }
      } else {
        setIsAdmin(false);
        setIsEditMode(false);
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Warn before leaving if unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const toggleEditMode = useCallback(() => {
    if (isDirty && isEditMode) {
      if (!confirm('You have unsaved changes. Disable edit mode anyway?')) return;
      setIsDirty(false);
    }
    setIsEditMode(prev => !prev);
  }, [isDirty, isEditMode]);

  return (
    <VisualEditorContext.Provider value={{
      isEditMode, isAdmin, activeSection, setActiveSection,
      isDirty, setIsDirty, savingSection, setSavingSection,
      toggleEditMode, user,
    }}>
      {children}
    </VisualEditorContext.Provider>
  );
}

export function useVisualEditor(): VisualEditorContextType {
  const ctx = useContext(VisualEditorContext);
  if (!ctx) {
    return {
      isEditMode: false, isAdmin: false, activeSection: null,
      setActiveSection: () => {}, isDirty: false, setIsDirty: () => {},
      savingSection: null, setSavingSection: () => {},
      toggleEditMode: () => {}, user: null,
    };
  }
  return ctx;
}
