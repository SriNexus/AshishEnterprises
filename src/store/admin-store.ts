import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from 'firebase/auth';
import type { AdminUserDoc } from '@/types/admin';

interface AdminState {
  user: User | null;
  adminData: AdminUserDoc | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAdminData: (data: AdminUserDoc | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      user: null,
      adminData: null,
      isLoading: true,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAdminData: (adminData) => set({ adminData }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, adminData: null, isAuthenticated: false }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
