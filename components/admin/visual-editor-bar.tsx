import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3, X, LayoutDashboard, Settings, FileText, Image as ImageIcon,
  Package, FolderKanban, MessageSquareQuote, HelpCircle, LogOut, Eye,
} from 'lucide-react';
import { useAdminStore } from '@/store/admin-store';
import { signOutAdmin } from '@/firebase/auth';

const quickLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Edit3, label: 'Hero', path: '/admin/hero' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: FolderKanban, label: 'Projects', path: '/admin/projects' },
  { icon: FileText, label: 'Blog', path: '/admin/blog' },
  { icon: ImageIcon, label: 'Gallery', path: '/admin/gallery' },
  { icon: MessageSquareQuote, label: 'Testimonials', path: '/admin/testimonials' },
  { icon: HelpCircle, label: 'FAQ', path: '/admin/faq' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

/**
 * Floating admin toolbar shown on the frontend when an admin is logged in.
 * Provides quick links to edit any section without navigating to /admin first.
 */
export function VisualEditorBar() {
  const { isAuthenticated, adminData, logout } = useAdminStore();
  const [expanded, setExpanded] = useState(false);

  if (!isAuthenticated || !adminData) return null;

  const handleLogout = async () => {
    await signOutAdmin();
    logout();
  };

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      {/* Toggle button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(!expanded)}
        className="w-10 h-10 rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/30 flex items-center justify-center cursor-pointer hover:bg-brand-primary-dark transition-colors"
        title="Admin Editor"
      >
        {expanded ? <X className="w-5 h-5" /> : <Edit3 className="w-4 h-4" />}
      </motion.button>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 right-0 w-56 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(15,20,35,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
                  {adminData.displayName?.charAt(0) || 'A'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{adminData.displayName}</div>
                  <div className="text-[9px] text-white/30">Admin Editor</div>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="py-2">
              {quickLinks.map(({ icon: Icon, label, path }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="border-t border-white/[0.06] py-2">
              <Link
                to="/"
                onClick={() => setExpanded(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Website</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
