/**
 * VisualEditorContext
 * Provides edit mode state for the visual CMS frontend editor.
 * Auth state is read from useAdminStore (populated by AuthProvider) — NO second Firebase listener.
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAdminStore } from '@/store/admin-store';

interface VisualEditorContextType {
  isEditMode: boolean;
  isAdmin: boolean;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  toggleEditMode: () => void;
}

const VisualEditorContext = createContext<VisualEditorContextType | null>(null);

const DEFAULT: VisualEditorContextType = {
  isEditMode: false,
  isAdmin: false,
  isDirty: false,
  setIsDirty: () => {},
  toggleEditMode: () => {},
};

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAdminStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // When admin logs in on a public page, auto-enable edit mode
  useEffect(() => {
    if (isAuthenticated) {
      const onPublicPage = !window.location.pathname.startsWith('/admin');
      if (onPublicPage) setIsEditMode(true);
    } else {
      setIsEditMode(false);
      setIsDirty(false);
    }
  }, [isAuthenticated]);

  // Warn on page leave when dirty
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const toggleEditMode = useCallback(() => {
    if (isDirty && isEditMode) {
      if (!confirm('You have unsaved changes. Turn off edit mode anyway?')) return;
      setIsDirty(false);
    }
    setIsEditMode(v => !v);
  }, [isDirty, isEditMode]);

  return (
    <VisualEditorContext.Provider value={{
      isEditMode,
      isAdmin: isAuthenticated,
      isDirty,
      setIsDirty,
      toggleEditMode,
    }}>
      {children}
    </VisualEditorContext.Provider>
  );
}

export function useVisualEditor(): VisualEditorContextType {
  return useContext(VisualEditorContext) ?? DEFAULT;
}
