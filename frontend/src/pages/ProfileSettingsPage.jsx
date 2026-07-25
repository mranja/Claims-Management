import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BellRing, CheckCircle2, ImageUp, LockKeyhole, Moon, Sun, UserRound } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';

const apiOrigin = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
const avatarSource = (avatarUrl) => avatarUrl && (avatarUrl.startsWith('http') ? avatarUrl : `${apiOrigin}${avatarUrl}`);

const ProfileSettingsPage = () => {
  const { user, updateStoredUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [theme, setTheme] = useState(() => localStorage.getItem('claims_theme') || 'light');
  const [dashboardAlerts, setDashboardAlerts] = useState(() => localStorage.getItem('claims_dashboard_alerts') !== 'off');
  const [avatarPreview, setAvatarPreview] = useState(avatarSource(user?.avatarUrl));
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const initials = useMemo(() => user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'U', [user?.name]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('claims_theme', theme);
  }, [theme]);

  const saveProfile = async (event) => {
    event.preventDefault(); setError('');
    try { const response = await usersApi.updateMe(profile); updateStoredUser(response.data.user); setNotice('Profile updated successfully.'); }
    catch (requestError) { setError(requestError.message); }
  };
  const savePassword = async (event) => {
    event.preventDefault(); setError('');
    if (passwords.newPassword !== passwords.confirmPassword) return setError('New passwords do not match.');
    try { await usersApi.changePassword(passwords); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); setNotice('Password changed successfully.'); }
    catch (requestError) { setError(requestError.message); }
  };
  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) return setError('Please choose a JPG or PNG profile photo.');
    if (file.size > 5 * 1024 * 1024) return setError('Profile photos must be smaller than 5MB.');
    setError(''); setUploading(true); setAvatarPreview(URL.createObjectURL(file));
    try { const formData = new FormData(); formData.append('avatar', file); const response = await usersApi.uploadAvatar(formData); updateStoredUser(response.data.user); setAvatarPreview(avatarSource(response.data.user.avatarUrl)); setNotice('Profile photo updated successfully.'); }
    catch (requestError) { setError(requestError.message); }
    finally { setUploading(false); }
  };

  return <SidebarLayout title="Account" breadcrumb="Settings"><div className="max-w-3xl space-y-6"><div><h1 className="text-2xl font-bold tracking-tight">Settings</h1><p className="mt-1 text-sm text-slate-500">Control your profile, appearance, notifications, and account security.</p></div>
    {notice && <div className="flex gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700"><CheckCircle2 className="w-4 h-4 shrink-0" />{notice}</div>}
    {error && <div className="flex gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
    <section className="cc-card p-6 space-y-5"><h2 className="flex gap-2 items-center font-bold"><UserRound className="w-5 h-5 text-teal-700" />Profile</h2><div className="flex flex-col sm:flex-row gap-5 sm:items-center"><div className="w-20 h-20 shrink-0 rounded-full overflow-hidden bg-[#006d77] text-white flex items-center justify-center text-xl font-bold">{avatarPreview ? <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" /> : initials}</div><div><label className="btn-primary h-10 cursor-pointer"> <ImageUp className="w-4 h-4" />{uploading ? 'Uploading…' : 'Upload photo'}<input className="hidden" type="file" accept="image/png,image/jpeg" onChange={uploadAvatar} disabled={uploading} /></label><p className="mt-2 text-xs text-slate-500">JPG or PNG, up to 5MB.</p></div></div><form onSubmit={saveProfile} className="space-y-4"><label className="block text-sm font-semibold">Name<input className="input-field mt-1.5" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /></label><label className="block text-sm font-semibold">Email<input type="email" className="input-field mt-1.5" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required /></label><div className="text-sm font-semibold">Role <span className="ml-2 inline-flex rounded-full bg-teal-700/10 px-3 py-1 text-xs uppercase text-teal-700">{user?.role}</span></div><button className="btn-primary h-10">Save profile</button></form></section>
    <section className="cc-card p-6 space-y-4"><h2 className="flex gap-2 items-center font-bold"><Sun className="w-5 h-5 text-teal-700" />Appearance & alerts</h2><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold">Color mode</p><p className="text-xs text-slate-500 mt-1">Choose the workspace appearance.</p></div><div className="flex rounded-lg border border-slate-200 p-1"><button type="button" onClick={() => setTheme('light')} className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold ${theme === 'light' ? 'bg-[#006d77] text-white' : 'text-slate-600'}`}><Sun className="w-3.5 h-3.5" />Light</button><button type="button" onClick={() => setTheme('dark')} className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold ${theme === 'dark' ? 'bg-[#006d77] text-white' : 'text-slate-600'}`}><Moon className="w-3.5 h-3.5" />Dark</button></div></div><div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4"><div><p className="flex items-center gap-2 text-sm font-semibold"><BellRing className="w-4 h-4 text-teal-700" />Dashboard alerts</p><p className="text-xs text-slate-500 mt-1">Show claim-status updates in the notification bell.</p></div><button type="button" role="switch" aria-checked={dashboardAlerts} onClick={() => { const next = !dashboardAlerts; setDashboardAlerts(next); localStorage.setItem('claims_dashboard_alerts', next ? 'on' : 'off'); }} className={`relative h-6 w-11 rounded-full transition-colors ${dashboardAlerts ? 'bg-[#006d77]' : 'bg-slate-300'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${dashboardAlerts ? 'translate-x-6' : 'translate-x-1'}`} /></button></div></section>
    <form onSubmit={savePassword} className="cc-card p-6 space-y-4"><h2 className="flex gap-2 items-center font-bold"><LockKeyhole className="w-5 h-5 text-teal-700" />Change password</h2>{[['currentPassword','Current password'],['newPassword','New password'],['confirmPassword','Confirm new password']].map(([field,label]) => <label key={field} className="block text-sm font-semibold">{label}<input required minLength={field === 'currentPassword' ? undefined : 6} type="password" className="input-field mt-1.5" value={passwords[field]} onChange={(event) => setPasswords({ ...passwords, [field]: event.target.value })} /></label>)}<button className="btn-primary h-10">Update password</button></form>
  </div></SidebarLayout>;
};

export default ProfileSettingsPage;
