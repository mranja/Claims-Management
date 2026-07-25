import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'patient' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate(user.role === 'insurer' ? '/insurer/dashboard' : '/patient/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'Unable to create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
    <section className="w-full max-w-md cc-card p-7 sm:p-8">
      <div className="text-center mb-7"><div className="mx-auto mb-3 w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center"><Shield /></div><h1 className="text-2xl font-bold tracking-tight">Create your ClaimsCare account</h1><p className="mt-1 text-sm text-slate-500">Start managing healthcare claims with clarity.</p></div>
      {error && <div className="mb-5 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        {[['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['password', 'Password', 'password'], ['confirmPassword', 'Confirm password', 'password']].map(([field, label, type]) => <label key={field} className="block text-sm font-semibold text-slate-700">{label}<input required minLength={field.includes('password') ? 6 : undefined} type={type} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="input-field mt-1.5" /></label>)}
        <label className="block text-sm font-semibold text-slate-700">Account type<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="input-field mt-1.5"><option value="patient">Patient</option><option value="insurer">Insurer</option></select></label>
        <button disabled={submitting} className="btn-primary w-full justify-center h-10 disabled:opacity-60">{submitting ? 'Creating account…' : <>Create account <ArrowRight className="w-4 h-4" /></>}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link className="font-semibold text-teal-700 hover:underline" to="/login">Log in</Link></p>
    </section>
  </main>;
};

export default SignupPage;
