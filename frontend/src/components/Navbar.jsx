import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, PlusCircle, LayoutDashboard, LogOut, Activity, User, Building2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isPatient, isInsurer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Badge */}
          <div className="flex items-center space-x-3">
            <Link to={isPatient ? '/patient/dashboard' : '/insurer/dashboard'} className="flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 text-white group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  HealthShield <span className="text-cyan-400 font-medium">Claims</span>
                </span>
              </div>
            </Link>

            <span className="h-4 w-px bg-slate-800 hidden sm:block" />

            {/* Portal Role Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm shadow-sm">
              {isPatient ? (
                <span className="flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  <User className="w-3 h-3" />
                  <span>Patient Portal</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
                  <Building2 className="w-3 h-3" />
                  <span>Insurer Portal</span>
                </span>
              )}
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center space-x-3">
            {isPatient && (
              <>
                <Link
                  to="/patient/dashboard"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/patient/dashboard'
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/patient/submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Claim</span>
                </Link>
              </>
            )}

            {isInsurer && (
              <Link
                to="/insurer/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  location.pathname.startsWith('/insurer/dashboard')
                    ? 'bg-slate-800 text-purple-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Claims Adjudication Queue</span>
              </Link>
            )}

            <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

            {/* Profile Info & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-200 leading-tight">{user.name}</span>
                <span className="text-[11px] text-slate-400 leading-tight">{user.email}</span>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
