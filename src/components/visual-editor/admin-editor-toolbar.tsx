/**
 * AdminEditorToolbar
 * Fixed 40px bar at the very top of the viewport — only visible to logged-in admins
 * on public-facing pages. Provides: edit mode toggle, quick nav, dashboard link, logout.
 *
 * IMPORTANT: This renders as `position: fixed` with `top: 0`.
 * The Navbar receives `adminBarVisible` and offsets itself to `top: 40px`.
 * No spacer div is emitted here — spacing is handled by layout/navbar.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Edit2, Eye, LogOut, LayoutDashboard, ChevronDown, Settings, ExternalLink } from 'lucide-react';
import { useVisualEditor } from '@/store/visual-editor-context';
import { useAdminStore } from '@/store/admin-store';
import { signOutAdmin } from '@/firebase/auth';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const ADMIN_BAR_HEIGHT = 40; // px — must match h-10 = 40px

export { ADMIN_BAR_HEIGHT };

export function AdminEditorToolbar() {
  const { isAdmin, isEditMode, toggleEditMode } = useVisualEditor();
  const { user } = useAdminStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  if (!isAdmin) return null;
  if (location.pathname.startsWith('/admin')) return null;

  const handleLogout = async () => {
    await signOutAdmin();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  const quickPages = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/products', label: 'Products' },
    { path: '/projects', label: 'Projects' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/blog', label: 'Blog' },
  ];

  return (
    <div
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-3 select-none"
      style={{
        height: ADMIN_BAR_HEIGHT,
        zIndex: 9500,
        background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
        borderBottom: '1px solid rgba(251,191,36,0.2)',
      }}
    >
      {/* Left — mode indicator */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            isEditMode ? 'bg-amber-400 animate-pulse' : 'bg-green-400'
          )} />
          <span className="text-[11px] font-bold text-white/80 tracking-wide whitespace-nowrap">
            {isEditMode ? 'EDIT MODE' : 'PREVIEW'}
          </span>
        </div>
        <span className="hidden sm:block text-[10px] text-zinc-600 font-mono truncate max-w-[120px]">
          {location.pathname}
        </span>
      </div>

      {/* Center — quick page nav */}
      <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
        {quickPages.map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className={cn(
              'px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap',
              location.pathname === page.path
                ? 'bg-amber-400/20 text-amber-400'
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            )}
          >
            {page.label}
          </Link>
        ))}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Edit/Preview toggle */}
        <button
          onClick={toggleEditMode}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer',
            isEditMode
              ? 'bg-amber-400 text-black hover:bg-amber-300'
              : 'bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
          )}
        >
          {isEditMode
            ? <><Eye className="h-3 w-3" /><span className="hidden sm:inline ml-1">Preview</span></>
            : <><Edit2 className="h-3 w-3" /><span className="hidden sm:inline ml-1">Edit</span></>}
        </button>

        {/* View site fresh */}
        <Link
          to="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-[11px] text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
        </Link>

        {/* Dashboard */}
        <Link
          to="/admin/panel"
          className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LayoutDashboard className="h-3 w-3" />
          <span className="hidden sm:inline ml-1">Dashboard</span>
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="flex items-center gap-1 px-1.5 py-1 rounded text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-[9px] text-amber-400 font-bold leading-none">
              {user?.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-[#111827] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <div className="px-3 py-2.5 border-b border-white/10">
                  <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                  <p className="text-xs font-bold text-white">Admin</p>
                </div>
                <div className="p-1">
                  <Link
                    to="/admin/panel/settings"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Edit mode bottom pill indicator
 * Rendered by MainLayout (separate from toolbar) to avoid z-index nesting issues
 */
export function EditModePill() {
  const { isEditMode, isAdmin } = useVisualEditor();
  if (!isAdmin || !isEditMode) return null;
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9400] pointer-events-none">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-2xl shadow-amber-400/30 text-xs font-bold whitespace-nowrap"
        style={{ background: '#f59e0b', color: '#000' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-pulse" />
        Edit Mode — hover any section to edit
      </div>
    </div>
  );
}
