import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Shield,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
  HeartHandshake,
} from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [policyNumber, setPolicyNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full legal name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirmation do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        policyNumber: policyNumber.trim(),
      });

      if (userData.role === 'insurer') {
        navigate('/insurer/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 font-['Manrope',sans-serif]">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white p-8 sm:p-9 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center justify-center">
              <div className="w-13 h-13 p-3 bg-[#edf1f2] border border-slate-200 rounded-2xl flex items-center justify-center mx-auto text-[#005a60]">
                <Shield className="w-7 h-7 text-[#006d77]" />
              </div>
            </Link>
            <h1 className="text-2xl font-extrabold text-[#005a60] tracking-tight">
              Create ClaimsCare Account
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Join the Clinical Precision Healthcare Network
            </p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection Tabs */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Account Type</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#f0f4f4] rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'patient'
                    ? 'bg-white text-[#006d77] shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Patient User</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('insurer')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'insurer'
                    ? 'bg-white text-[#006d77] shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Insurer / Adjudicator</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-3.5" onSubmit={handleSignupSubmit}>
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Full Legal Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Alex Johnson or Jane Smith"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77] transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77] transition-all"
                />
              </div>
            </div>

            {/* Optional Policy Number for Patients */}
            {role === 'patient' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Insurance Policy / Member ID <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="POL-8829-X7 (Optional)"
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77] transition-all"
                />
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Create Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77] transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#006d77] hover:bg-[#00535b] transition-all shadow-sm active:scale-95 disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-xs text-slate-600 pt-2">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-[#006d77] hover:underline">
              Log in to your account
            </Link>
          </p>
        </div>

        {/* Footer Gateway Links */}
        <div className="flex items-center justify-center space-x-3 text-[11px] font-semibold text-slate-500">
          <Link to="/" className="hover:underline">Home</Link>
          <span>•</span>
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">Privacy Policy</a>
          <span>•</span>
          <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline">Terms of Service</a>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
