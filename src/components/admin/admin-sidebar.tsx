
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  HardDrive,
  Package,
  Briefcase,
  FolderKanban,
  Images,
  FileText,
  MessageSquareQuote,
  HelpCircle,
  Users,
  Settings,
  Search,
  LogOut,
  ChevronLeft,
  Sun,
  Menu,
  Sparkles,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAdminStore } from '@/store/admin-store';
import { signOutAdmin } from '@/firebase/auth';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Sparkles, label: 'Hero Section', path: '/admin/panel/hero' },
  { icon: Package, label: 'Products', path: '/admin/panel/products' },
  { icon: Briefcase, label: 'Services', path: '/admin/panel/services' },
  { icon: FolderKanban, label: 'Projects', path: '/admin/panel/projects' },
  { icon: Images, label: 'Gallery', path: '/admin/panel/gallery' },
  { icon: HardDrive, label: 'Media Library', path: '/admin/panel/media' },
  { icon: FileText, label: 'Blog Posts', path: '/admin/panel/blog' },
  { icon: MessageSquareQuote, label: 'Testimonials', path: '/admin/panel/testimonials' },
  { icon: HelpCircle, label: 'FAQ', path: '/admin/panel/faq' },
  { icon: UserCircle, label: 'Team', path: '/admin/panel/team' },
  { icon: Users, label: 'Leads', path: '/admin/panel/leads' },
  { icon: Search, label: 'SEO', path: '/admin/panel/seo' },
  { icon: Settings, label: 'Settings', path: '/admin/panel/settings' },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminData, logout } = useAdminStore();

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin/panel') return location.pathname === '/admin/panel';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-surface-card border-r border-line z-40 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-line">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-content-primary">Admin</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200',
                  active
                    ? 'bg-brand-primary text-white'
                    : 'text-content-secondary hover:bg-surface-secondary hover:text-content-primary'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-line p-3">
          <AnimatePresence mode="wait">
            {!collapsed && adminData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-2 mb-2"
              >
                <p className="text-sm font-medium text-content-primary truncate">
                  {adminData.displayName}
                </p>
                <p className="text-xs text-content-tertiary truncate">
                  {adminData.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
