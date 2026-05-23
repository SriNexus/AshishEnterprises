/**
 * VisualEditorEntry — handles the /admin route.
 * Reads auth state from admin store (populated by AuthProvider — no extra listener).
 * Authenticated admin → redirect to / (public site in edit mode)
 * Unauthenticated   → redirect to /admin/login
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/admin-store';
import { LoadingScreen } from '@/components/loading-screen';

export default function VisualEditorEntry() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAdminStore();

  useEffect(() => {
    if (isLoading) return; // wait for AuthProvider to resolve
    if (isAuthenticated) {
      navigate('/', { replace: true }); // goes to home in edit mode
    } else {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return <LoadingScreen />;
}
