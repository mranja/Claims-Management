import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  ImageUp,
  LockKeyhole,
  Moon,
  Sun,
  UserRound,
  Shield,
  Phone,
  Mail,
  Building2,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';

const apiOrigin = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
const avatarSource = (avatarUrl) =>
  avatarUrl && (avatarUrl.startsWith('http') ? avatarUrl : `${apiOrigin}${avatarUrl}`);

const ProfileSettingsPage = () => {
  const { user, updateStoredUser, isPatient } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    policyNumber: user?.policyNumber || 'POL-COMP-PLATINUM',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [theme, setTheme] = useState(() => localStorage.getItem('claims_theme') || 'light');
  const [dashboardAlerts, setDashboardAlerts] = useState(
    () => localStorage.getItem('claims_dashboard_alerts') !== 'off'
  );
  const [avatarPreview, setAvatarPreview] = useState(avatarSource(user?.avatarUrl));
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const initials = useMemo(
    () =>
      user?.name
        ?.split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U',
    [user?.name]
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('claims_theme', theme);
  }, [theme]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const response = await usersApi.updateMe(profile);
      updateStoredUser(response.data.user);
      setNotice('Profile & policy settings updated successfully.');
    } catch (requestError) {
      setError(requestError.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setError('New passwords do not match.');
    }
    try {
      await usersApi.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setNotice('Password changed successfully.');
    } catch (requestError) {
      setError(requestError.message || 'Failed to change password.');
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return setError('Please choose a JPG or PNG profile photo.');
    }
    if (file.size > 5 * 1024 * 1024) {
      return setError('Profile photos must be smaller than 5MB.');
    }
    setError('');
    setUploading(true);
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await usersApi.uploadAvatar(formData);
      updateStoredUser(response.data.user);
      setAvatarPreview(avatarSource(response.data.user.avatarUrl));
      setNotice('Profile photo updated successfully.');
    } catch (requestError) {
      setError(requestError.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SidebarLayout title="Account" breadcrumb="Profile & Insurance">
      <div className="max-w-3xl w-full mx-auto space-y-6 font-['Manrope',sans-serif]">
        {/* Title */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Settings & Benefits</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal profile, active insurance policy credentials, and security settings.
          </p>
        </div>

        {/* Feedback alerts */}
        {notice && (
          <div className="flex gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}
        {error && (
          <div className="flex gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Details Form */}
        <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <UserRound className="w-4 h-4 text-[#006d77]" />
              Personal & Member Information
            </h2>
            <span className="text-[10px] font-extrabold uppercase bg-teal-50 text-[#006d77] border border-teal-200 px-2.5 py-0.5 rounded-full">
              {user?.role === 'patient' ? 'Patient Member' : 'Claims Adjudicator'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
            <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-[#006d77] text-white flex items-center justify-center text-xl font-bold shadow-xs">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer">
                <ImageUp className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading…' : 'Change Avatar'}</span>
                <input
                  className="hidden"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={uploadAvatar}
                  disabled={uploading}
                />
              </label>
              <p className="mt-1.5 text-[10px] text-slate-400">JPG or PNG up to 5MB.</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Policy Member ID</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                  value={profile.policyNumber}
                  onChange={(e) => setProfile({ ...profile, policyNumber: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#006d77] hover:bg-[#00535b] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            >
              {saving ? 'Saving changes...' : 'Save Profile Details'}
            </button>
          </form>
        </section>

        {/* Change Password Card */}
        <form
          onSubmit={savePassword}
          className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <LockKeyhole className="w-4 h-4 text-[#006d77]" />
              Account Security & Password
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password</label>
              <input
                required
                type="password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password</label>
              <input
                required
                minLength={6}
                type="password"
                placeholder="Min 6 chars"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                required
                minLength={6}
                type="password"
                placeholder="Repeat password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            Update Password
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
};

export default ProfileSettingsPage;
