/**
 * AdminEditorToolbar
 * Floating top bar shown on all PUBLIC pages when admin is logged in.
 * Provides: edit mode toggle, page navigation, dashboard link, logout.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Edit2, Eye, LogOut, LayoutDashboard, ChevronDown, Settings } from 'lucide-react';
import { useVisualEditor } from '@/store/visual-editor-context';
import { signOutAdmin } from '@/firebase/auth';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export function AdminEditorToolbar() {
  const { isAdmin, isEditMode, toggleEditMode, user } = useVisualEditor();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  // Only show on public pages when admin logged in
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
    <>
      {/* Top admin bar */}
      <div className="fixed top-0 left-0 right-0 z-[9000] h-10 flex items-center justify-between px-4 select-none"
        style={{ background: 'linear-gradient(135deg,#111827,#0d0d0d)', borderBottom: '1px solid rgba(251,191,36,0.25)' }}>

        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full', isEditMode ? 'bg-amber-400 animate-pulse' : 'bg-green-400')} />
            <span className="text-[11px] font-extrabold text-white/90 tracking-wider">
              {isEditMode ? '✏️ EDIT MODE' : '👁 PREVIEW'}
            </span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-[10px] text-zinc-500 hidden sm:block font-mono">{location.pathname}</span>
        </div>

        {/* Center: page quick nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {quickPages.map((page) => (
            <Link key={page.path} to={page.path}
              className={cn('px-2.5 py-1 rounded text-[11px] font-medium transition-colors',
                location.pathname === page.path ? 'bg-amber-400/20 text-amber-400' : 'text-zinc-500 hover:text-white hover:bg-white/5')}>
              {page.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Toggle edit mode */}
          <button onClick={toggleEditMode}
            className={cn('flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer',
              isEditMode ? 'bg-amber-400 text-black hover:bg-amber-300' : 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white')}>
            {isEditMode ? <><Eye className="h-3 w-3" /> Preview</> : <><Edit2 className="h-3 w-3" /> Edit</>}
          </button>

          {/* Dashboard */}
          <Link to="/admin/panel"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-400 hover:text-white transition-colors">
            <LayoutDashboard className="h-3 w-3" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* User menu */}
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors">
              <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-[9px] text-amber-400 font-bold">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <ChevronDown className="h-3 w-3" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                    <p className="text-xs font-bold text-white">Super Admin</p>
                  </div>
                  <div className="p-1">
                    <Link to="/admin/panel/settings" onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800">
                      <Settings className="h-3.5 w-3.5" /> Settings
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer">
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Height spacer so page content doesn't hide under bar */}
      <div className="h-10" />

      {/* Edit mode bottom indicator */}
      {isEditMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[8999] pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-black rounded-full shadow-2xl shadow-amber-400/40 text-xs font-extrabold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-black/50 animate-pulse" />
            Visual Edit Mode Active — Hover any section to edit
          </div>
        </div>
      )}
    </>
  );
}
