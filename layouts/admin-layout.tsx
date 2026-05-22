import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { useAdminStore } from '@/store/admin-store';
import { onAuthChange, getAdminUser } from '@/firebase/auth';
import { cn } from '@/utils/cn';

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/hero': 'Hero Section',
  '/admin/products': 'Products',
  '/admin/services': 'Services',
  '/admin/projects': 'Projects',
  '/admin/gallery': 'Gallery',
  '/admin/blog': 'Blog Posts',
  '/admin/testimonials': 'Testimonials',
  '/admin/faq': 'FAQ',
  '/admin/team': 'Team',
  '/admin/leads': 'Leads & Inquiries',
  '/admin/seo': 'SEO Settings',
  '/admin/settings': 'Settings',
};

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();
  const { isAuthenticated, setUser, setAdminData, setLoading } = useAdminStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        setUser(user);
        // getAdminUser auto-creates the Firestore doc for the default admin
        const adminData = await getAdminUser(user.uid);
        if (adminData) {
          setAdminData(adminData);
        } else {
          // Authenticated but not an admin — block access
          setUser(null);
          setAdminData(null);
        }
      } else {
        setUser(null);
        setAdminData(null);
      }
      setLoading(false);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [setUser, setAdminData, setLoading]);

  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location.pathname === path || location.pathname.startsWith(path + '/')) {
        return title;
      }
    }
    return 'Admin';
  };

  // Show loading while auth check is in progress
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-content-secondary">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className={cn('transition-all duration-300', collapsed ? 'ml-16' : 'ml-64')}>
        <AdminHeader title={getPageTitle()} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
