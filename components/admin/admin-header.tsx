import { Link } from 'react-router-dom';
import { Bell, ExternalLink, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAdminStore } from '@/store/admin-store';

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { adminData } = useAdminStore();

  return (
    <header className="h-16 bg-surface-card border-b border-line flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-bold text-content-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-secondary border border-line">
          <Search className="w-4 h-4 text-content-tertiary" />
          <input
            type="text"
            placeholder="Search..."
            className="w-40 bg-transparent text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none"
          />
        </div>

        {/* View Site */}
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-content-secondary hover:bg-surface-secondary transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">View Site</span>
        </Link>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer">
          <Bell className="w-5 h-5 text-content-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar */}
        {adminData && (
          <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-bold">
            {adminData.displayName?.charAt(0).toUpperCase() || 'A'}
          </div>
        )}
      </div>
    </header>
  );
}
