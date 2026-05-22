/**
 * VisualEditorEntryPage
 * Handles /admin route:
 * - If admin authenticated → redirect to home in edit mode
 * - If not authenticated → redirect to login
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthChange, getAdminUser } from '@/firebase/auth';
import { LoadingScreen } from '@/components/loading-screen';

export default function VisualEditorEntryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        const adminData = await getAdminUser(user.uid);
        if (adminData) {
          // Admin authenticated — go to homepage in edit mode
          navigate('/', { replace: true });
        } else {
          navigate('/admin/panel/login', { replace: true });
        }
      } else {
        navigate('/admin/panel/login', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return <LoadingScreen />;
}
