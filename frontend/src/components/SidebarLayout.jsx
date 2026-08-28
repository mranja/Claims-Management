import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommandPalette from './CommandPalette';
import {
  Home,
  FileText,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Plus,
  Shield,
  ChevronRight,
  Bell,
  Menu,
  X,
  ChevronDown,
  CircleUserRound,
  ShieldAlert,
  BookOpen,
  FileSearch,
  Layers,
  HelpCircle,
  Search,
  Sparkles,
  Activity,
  ShieldCheck,
} from 'lucide-react';

const SidebarLayout = ({ children, title = 'Claims', breadcrumb = 'Overview' }) => {
  const { user, logout, isPatient, isInsurer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  // Patient Navigation items (distinct icons and labels)
  const patientNav = [
    { to: '/patient/dashboard', icon: Home, label: 'Claims History' },
    { to: '/patient/submit', icon: Plus, label: 'Submit Claim' },
    { to: '/patient/documents', icon: FileSearch, label: 'Document Center' },
    { to: '/patient/notifications', icon: Bell, label: 'Notifications' },
    { to: '/profile', icon: User, label: 'Profile & Insurance' },
    { to: '/patient/support', icon: HelpCircle, label: 'Help & FAQs' },
  ];

  // Insurer Navigation items (distinct icons and labels)
  const insurerNav = [
    { to: '/insurer/dashboard', icon: Home, label: 'Adjudication Queue' },
    { to: '/insurer/claims', icon: Layers, label: 'All Claims' },
    { to: '/insurer/high-risk', icon: ShieldAlert, label: 'High-Risk Queue' },
    { to: '/insurer/patients', icon: User, label: 'Patient Directory' },
    { to: '/insurer/ai-insights', icon: Sparkles, label: 'AI Insights' },
    { to: '/insurer/policies', icon: BookOpen, label: 'Policy Knowledge' },
    { to: '/insurer/documents', icon: FileSearch, label: 'Document Center' },
    { to: '/insurer/compare', icon: Activity, label: 'Claim Comparison' },
    { to: '/profile', icon: Settings, label: 'Settings' },
  ];

  const navItems = isPatient ? patientNav : insurerNav;

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white font-['Manrope',sans-serif]">
      {/* Sleek Brand Header */}
      <div className="px-5 h-20 flex items-center border-b border-slate-100">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00535b] to-[#006d77] flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-[#006d77] tracking-tight">ClaimsCare</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isInsurer ? 'Insurer Portal' : 'Patient Portal'}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </p>
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                active
                  ? 'bg-[#006d77] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Card & Sign Out */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
          <Link to="/profile" className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#006d77] border border-teal-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role || 'Member'}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex font-['Manrope',sans-serif]">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-[240px] flex-shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 z-30">
        <SidebarContent />
      </aside>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-[260px] bg-white h-full flex-shrink-0 shadow-2xl z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ─── Main Viewport ─── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold">{title}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-800 font-bold">{breadcrumb}</span>
            </div>
          </div>

          {/* Quick Search & Actions */}
          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 transition-all"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Quick search...</span>
              <kbd className="text-[10px] font-mono px-1 py-0.5 bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
                Ctrl+K
              </kbd>
            </button>

            {/* Notifications */}
            <Link
              to={isPatient ? '/patient/notifications' : '/insurer/ai-insights'}
              className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-600 rounded-full" />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[#006d77] flex items-center justify-center font-bold text-xs">
                  {userInitials}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <div className="p-1.5 text-xs space-y-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#006d77] rounded-xl transition-all font-medium"
                    >
                      <CircleUserRound className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>
                  </div>

                  <div className="p-1.5 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette isOpen={paletteOpen} onClose={setPaletteOpen} />
    </div>
  );
};

export default SidebarLayout;
