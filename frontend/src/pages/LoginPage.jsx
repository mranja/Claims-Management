import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Info, ArrowRight, Shield, AlertCircle, Sparkles, UserPlus } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (emailToUse, passwordToUse) => {
    setError('');
    setIsSubmitting(true);

    try {
      const userData = await login(emailToUse, passwordToUse);
      if (userData.role === 'patient') {
        navigate('/patient/dashboard');
      } else if (userData.role === 'insurer') {
        navigate('/insurer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }
    handleLoginSubmit(email, password);
  };

  const handleQuickDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Test@123');
    handleLoginSubmit(demoEmail, 'Test@123');
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 font-['Manrope',sans-serif]">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          {/* Brand Header Icon & Title */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center justify-center">
              <div className="w-14 h-14 bg-[#edf1f2] border border-slate-200 rounded-2xl flex items-center justify-center mx-auto text-[#006d77]">
                <Shield className="w-7 h-7" />
              </div>
            </Link>
            <h1 className="text-2xl font-extrabold text-[#006d77] tracking-tight">
              ClaimsCare
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Clinical Precision in Healthcare Insurance
            </p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Credentials Form */}
          <form className="space-y-4" onSubmit={onFormSubmit}>
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@healthcare.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] font-bold text-[#006d77] hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#006d77] hover:bg-[#00535b] transition-all shadow-sm active:scale-95 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Create Account Link Banner */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{' '}
              <Link to="/signup" className="font-bold text-[#006d77] hover:underline inline-flex items-center gap-1">
                <span>Sign up now</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>

          {/* Quick Demo Accounts Helper */}
          <div className="pt-2 space-y-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#006d77]" />
              <span>One-Click Test Accounts</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('patient1@test.com')}
                disabled={isSubmitting}
                className="py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#006d77] text-xs font-bold rounded-xl text-center transition-all"
              >
                Patient Login
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('insurer@test.com')}
                disabled={isSubmitting}
                className="py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#006d77] text-xs font-bold rounded-xl text-center transition-all"
              >
                Insurer Login
              </button>
            </div>
          </div>

          {/* Policy Links */}
          <div className="flex items-center justify-center space-x-3 text-[11px] font-semibold text-slate-500 pt-2">
            <Link to="/" className="hover:underline">Home</Link>
            <span>•</span>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline">Terms of Service</a>
          </div>
        </div>

        {/* Footer Gateway Pills */}
        <div className="flex items-center justify-center space-x-2 text-[11px] font-semibold text-slate-500">
          <span>• Provider Portal</span>
          <span>|</span>
          <span>• Patient Access</span>
          <span>|</span>
          <span>• Insurer Gateway</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
