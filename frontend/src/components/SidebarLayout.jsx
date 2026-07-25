import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { claimsApi } from '../services/api';
import {
  Home, FileText, Settings, LogOut, Plus, ChevronRight, Bell, Menu, X,
  ChevronDown
} from 'lucide-react';

const SidebarLayout = ({ children, title = 'Claims', breadcrumb = 'Overview' }) => {
  const { user, logout, isPatient, isInsurer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      if (localStorage.getItem('claims_dashboard_alerts') === 'off') {
        setNotifications([]);
        return;
      }
      try {
        const response = isInsurer ? await claimsApi.getAllClaims() : await claimsApi.getPatientClaims();
        const claims = response.data || [];
        const nextNotifications = isInsurer
          ? claims.filter((claim) => claim.status === 'Pending').map((claim) => ({
              id: claim._id,
              title: 'Claim awaiting review',
              message: `${claim.name || claim.email || 'A patient'} submitted a claim for $${Number(claim.claimAmount || 0).toFixed(2)}.`,
              to: `/insurer/claims/${claim._id}`,
              read: false,
            }))
          : claims.filter((claim) => claim.status !== 'Pending').map((claim) => ({
              id: claim._id,
              title: `Claim ${claim.status.toLowerCase()}`,
              message: `${claim.description} has been ${claim.status.toLowerCase()}.`,
              to: '/patient/dashboard',
              read: false,
            }));
        setNotifications(nextNotifications.slice(0, 5));
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [isInsurer]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const settingsRoute = '/profile';

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Patient nav items
  const patientNav = [
    { to: '/patient/dashboard', icon: FileText, label: 'Claims' },
    { to: '/patient/submit', icon: Plus, label: 'Submit a claim' },
  ];

  // Insurer nav items
  const insurerNav = [
    { to: '/insurer/dashboard', icon: Home, label: 'Dashboard' },
  ];

  const navItems = isPatient ? patientNav : insurerNav;

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';
  const avatarSource = user?.avatarUrl && (user.avatarUrl.startsWith('http')
    ? user.avatarUrl
    : `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')}${user.avatarUrl}`);
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const markNotificationsRead = () => setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo — clicking goes to landing */}
      <div className="px-5 h-16 flex items-center border-b border-[#e0e3e5]">
        <Link to={isPatient ? '/patient/dashboard' : '/insurer/dashboard'} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#006d77] flex items-center justify-center text-white font-black text-sm shadow-sm">
            CC
          </div>
          <div>
            <p className="text-base font-bold text-[#006d77] leading-tight tracking-tight">ClaimsCare</p>
            {isInsurer && (
              <span className="text-[10px] font-bold text-white bg-[#006d77] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                INSURER
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, badge }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all border-l-2 ${
                active
                  ? 'bg-[#006d77]/10 text-[#006d77] border-[#006d77] font-bold'
                  : 'text-[#3e494a] border-transparent hover:bg-[#eceef0] hover:text-[#191c1e] font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#006d77]' : 'text-[#6f797a]'}`} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: Settings + Logout */}
      <div className="px-3 py-4 border-t border-[#e0e3e5] space-y-0.5">
        <Link
          to={settingsRoute}
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all border-l-2 ${
            isActive(settingsRoute)
              ? 'bg-[#006d77]/10 text-[#006d77] border-[#006d77] font-bold'
              : 'text-[#3e494a] border-transparent hover:bg-[#eceef0] font-medium'
          }`}
        >
          <Settings className="w-4 h-4 text-[#6f797a] flex-shrink-0" />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition-all font-medium border-l-2 border-transparent"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex font-['Manrope',sans-serif]">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-[260px] flex-shrink-0 bg-white border-r border-[#e0e3e5] h-screen sticky top-0 z-30">
        <SidebarContent />
      </aside>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-[260px] bg-white h-full flex-shrink-0 shadow-2xl z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6f797a] hover:bg-[#eceef0]"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* ─── Top Bar ─── */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#e0e3e5] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-[#3e494a] hover:bg-[#eceef0] transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-[#6f797a]">
              <span className="font-medium">{title}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#191c1e] font-semibold">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Patient: Submit New Claim button */}
            {isPatient && location.pathname !== '/patient/submit' && (
              <Link
                to="/patient/submit"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit New Claim</span>
              </Link>
            )}

            <div className="relative">
              <button
                type="button"
                aria-label="Open notifications"
                onClick={() => setNotificationsOpen((isOpen) => !isOpen)}
                className="relative p-2 rounded-lg hover:bg-[#eceef0] text-[#3e494a] transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && <span className="absolute top-1.5 right-1.5 min-w-2 h-2 px-0.5 bg-rose-500 rounded-full" />}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#e0e3e5] bg-white shadow-[0px_8px_24px_rgba(0,0,0,0.1)] z-50">
                  <div className="flex items-center justify-between border-b border-[#e0e3e5] px-4 py-3">
                    <p className="text-sm font-bold text-[#191c1e]">Notifications</p>
                    {unreadNotifications > 0 && <button onClick={markNotificationsRead} className="text-xs font-semibold text-[#006d77] hover:underline">Mark all read</button>}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-[#6f797a]">You are all caught up.</p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <Link key={notification.id} to={notification.to} onClick={() => { markNotificationsRead(); setNotificationsOpen(false); }} className={`block border-b border-[#e0e3e5] px-4 py-3 last:border-0 hover:bg-[#f7f9fb] ${notification.read ? '' : 'bg-[#006d77]/5'}`}>
                          <p className="text-sm font-semibold text-[#191c1e]">{notification.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-[#6f797a]">{notification.message}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#eceef0] transition-all"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#006d77] text-white flex items-center justify-center font-bold text-xs">
                  {avatarSource ? <img src={avatarSource} alt="" className="w-full h-full object-cover" /> : userInitials}
                </div>
                <span className="hidden sm:block max-w-32 truncate text-sm font-semibold text-[#191c1e]">{user?.name || 'Profile'}</span>
                <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-[#6f797a] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#e0e3e5] rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.1)] z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-[#e0e3e5] bg-[#f7f9fb]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#006d77] text-white flex items-center justify-center font-bold text-sm">
                        {avatarSource ? <img src={avatarSource} alt="" className="w-full h-full object-cover" /> : userInitials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#191c1e]">{user?.name}</p>
                        <p className="text-xs text-[#6f797a]">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] font-bold text-white bg-[#006d77] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {isPatient ? 'Patient' : 'Insurer'}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to={settingsRoute}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#3e494a] hover:bg-[#f2f4f6] transition-all"
                    >
                      <Settings className="w-4 h-4 text-[#6f797a]" />
                      Profile Settings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="px-2 pb-2 border-t border-[#e0e3e5] pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── Page Body ─── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
