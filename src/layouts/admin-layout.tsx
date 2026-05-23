/**
 * AdminLayout
 * Protected layout for /admin/panel/* routes.
 * Auth state comes from useAdminStore (set by AuthProvider in App.tsx).
 * No Firebase listener here — AuthProvider is the single source.
 */
import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { useAdminStore } from '@/store/admin-store';
import { cn } from '@/utils/cn';

const PAGE_TITLES: Record<string, string> = {
  '/admin/panel':              'Dashboard',
  '/admin/panel/hero':         'Hero Section',
  '/admin/panel/products':     'Products',
  '/admin/panel/services':     'Services',
  '/admin/panel/projects':     'Projects',
  '/admin/panel/gallery':      'Gallery',
  '/admin/panel/blog':         'Blog Posts',
  '/admin/panel/testimonials': 'Testimonials',
  '/admin/panel/faq':          'FAQ',
  '/admin/panel/team':         'Team',
  '/admin/panel/leads':        'Leads & Inquiries',
  '/admin/panel/seo':          'SEO Settings',
  '/admin/panel/settings':     'Settings',
  '/admin/panel/media':         'Media Library',
};

function getTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Prefix match (e.g. /admin/panel/products/123 → Products)
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path + '/')) return title;
  }
  return 'Admin';
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAdminStore();

  // While the single auth listener is resolving, show a spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-content-secondary">Verifying access…</p>
        </div>
      </div>
    );
  }

  // Not authenticated → send to login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className={cn('transition-all duration-300', collapsed ? 'ml-16' : 'ml-64')}>
        <AdminHeader title={getTitle(location.pathname)} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
