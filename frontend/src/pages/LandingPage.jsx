import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, FileCheck, Clock, ChevronRight, CheckCircle,
  ArrowRight, BarChart3, Bell, Lock, Star, Users, Zap
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <FileCheck className="w-6 h-6 text-[#006d77]" />,
      title: 'Streamlined Submissions',
      desc: 'Submit claims with all supporting documentation in minutes. Automated validation ensures completeness before submission.',
    },
    {
      icon: <Clock className="w-6 h-6 text-[#006d77]" />,
      title: 'Real-Time Tracking',
      desc: 'Monitor every claim through the adjudication pipeline with live status updates and transparent processing timelines.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-[#006d77]" />,
      title: 'Intelligent Analytics',
      desc: 'Gain insights into approval rates, processing times, and claim patterns through comprehensive dashboards.',
    },
    {
      icon: <Bell className="w-6 h-6 text-[#006d77]" />,
      title: 'Instant Notifications',
      desc: 'Automated alerts keep providers and patients informed at every decision point — no more chasing status updates.',
    },
    {
      icon: <Lock className="w-6 h-6 text-[#006d77]" />,
      title: 'HIPAA-Grade Security',
      desc: 'End-to-end encryption and role-based access control ensure patient data and claim details stay protected.',
    },
    {
      icon: <Zap className="w-6 h-6 text-[#006d77]" />,
      title: '3–5 Day Processing',
      desc: 'Our streamlined adjudication engine reduces average processing time by 60% compared to legacy claim systems.',
    },
  ];

  const stats = [
    { value: '98.4%', label: 'Approval Accuracy' },
    { value: '3.2 Days', label: 'Avg. Processing Time' },
    { value: '$2.4B+', label: 'Claims Processed' },
    { value: '500+', label: 'Healthcare Providers' },
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Chief Medical Officer, St. Jude Medical Center',
      text: 'ClaimsCare reduced our claim rejection rate by 40% in the first quarter. The clarity and precision of the platform is unmatched.',
      initials: 'SC',
    },
    {
      name: 'Marcus Thornton',
      role: 'Claims Supervisor, Nexus Insurance',
      text: 'The adjudication queue is clean, fast, and gives our reviewers exactly what they need without any noise. Our team is more productive than ever.',
      initials: 'MT',
    },
    {
      name: 'Elena Rodriguez',
      role: 'Patient, Verified User',
      text: 'I submitted my prescription receipts and had an approved payout within 4 days. The status tracking kept me fully informed throughout.',
      initials: 'ER',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-['Manrope',sans-serif]">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e0e3e5]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006d77] flex items-center justify-center text-white font-black text-sm shadow-sm">
              CC
            </div>
            <span className="text-xl font-bold text-[#006d77] tracking-tight">ClaimsCare</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#3e494a]">
            <a href="#features" className="hover:text-[#006d77] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#006d77] transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-[#006d77] transition-colors">Why ClaimsCare</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold text-[#006d77] border border-[#006d77] rounded-lg hover:bg-[#006d77]/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#006d77] rounded-lg hover:bg-[#00535b] transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-[#3e494a] hover:bg-[#eceef0] transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-current transition-all" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#e0e3e5] px-6 py-4 space-y-4">
            <a href="#features" className="block text-sm font-medium text-[#3e494a] hover:text-[#006d77]">Features</a>
            <a href="#how-it-works" className="block text-sm font-medium text-[#3e494a] hover:text-[#006d77]">How It Works</a>
            <a href="#stats" className="block text-sm font-medium text-[#3e494a] hover:text-[#006d77]">Why ClaimsCare</a>
            <div className="flex gap-3 pt-2 border-t border-[#e0e3e5]">
              <Link to="/login" className="flex-1 py-2.5 text-center text-sm font-semibold text-[#006d77] border border-[#006d77] rounded-lg">
                Sign In
              </Link>
              <Link to="/signup" className="flex-1 py-2.5 text-center text-sm font-semibold text-white bg-[#006d77] rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f7f9fb] via-[#e8f4f5] to-[#f7f9fb] pt-20 pb-24 px-6">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006d77]/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#006d77]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#006d77]/10 text-[#006d77] text-xs font-bold px-4 py-2 rounded-full border border-[#006d77]/20 mb-8">
            <Shield className="w-3.5 h-3.5" />
            <span>HIPAA-Grade Healthcare Insurance Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#191c1e] tracking-tight leading-tight mb-6">
            Clinical Precision in
            <br />
            <span className="text-[#006d77]">Healthcare Claims</span>
          </h1>
          <p className="text-lg text-[#3e494a] max-w-2xl mx-auto leading-relaxed mb-10">
            A single platform for patients to submit claims and insurers to adjudicate them —
            with full transparency, real-time tracking, and enterprise-grade security.
          </p>

          {/* CTA Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/login"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#006d77] hover:bg-[#00535b] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <span>Start Managing Claims</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#006d77] text-sm font-bold rounded-xl border border-[#006d77]/30 hover:border-[#006d77] transition-all"
            >
              See How It Works
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-xs text-[#6f797a] font-semibold flex-wrap">
            {['HIPAA Compliant', 'SOC 2 Type II', 'AES-256 Encryption', 'No Credit Card Required'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#006d77]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Mockup Preview */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-[0px_24px_48px_rgba(0,0,0,0.1)] overflow-hidden">
            {/* Fake browser chrome */}
            <div className="bg-[#f2f4f6] border-b border-[#e0e3e5] px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="flex-1 mx-4 h-6 bg-white rounded border border-[#e0e3e5] flex items-center px-3">
                <span className="text-[11px] text-[#6f797a]">app.claimscare.io/patient/claims</span>
              </div>
            </div>

            {/* Mock Dashboard UI */}
            <div className="flex h-72 overflow-hidden">
              {/* Sidebar mockup */}
              <div className="w-48 bg-[#f7f9fb] border-r border-[#e0e3e5] p-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-lg bg-[#006d77] flex items-center justify-center text-white text-[10px] font-black">CC</div>
                  <span className="text-sm font-bold text-[#006d77]">ClaimsCare</span>
                </div>
                <div className="space-y-1">
                  {['Dashboard', 'Claims', 'Messages', 'Profile'].map((item, idx) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${idx === 1 ? 'bg-[#006d77]/10 text-[#006d77] border-l-2 border-[#006d77]' : 'text-[#6f797a]'}`}
                    >
                      <div className={`w-3 h-3 rounded-sm ${idx === 1 ? 'bg-[#006d77]' : 'bg-[#bec8ca]'}`} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Mockup */}
              <div className="flex-1 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="h-5 w-32 bg-[#191c1e] rounded-md mb-1.5" />
                    <div className="h-3 w-48 bg-[#e0e3e5] rounded" />
                  </div>
                  <div className="h-9 w-36 bg-[#006d77] rounded-xl" />
                </div>
                <div className="bg-white border border-[#e0e3e5] rounded-xl overflow-hidden">
                  <div className="bg-[#f7f9fb] border-b border-[#e0e3e5] grid grid-cols-4 px-5 py-2.5">
                    {['Description', 'Amount', 'Status', ''].map((h) => (
                      <div key={h} className="h-3 w-16 bg-[#bec8ca] rounded" />
                    ))}
                  </div>
                  {[
                    { color: 'bg-amber-200', label: 'Annual Physical & Bloodwork', amount: '$420.00' },
                    { color: 'bg-emerald-200', label: 'Emergency Dental Procedure', amount: '$1,250.00' },
                    { color: 'bg-rose-200', label: 'Pharmacy - Prescription Medication', amount: '$85.20' },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-4 items-center px-5 py-3 border-b border-[#f2f4f6]">
                      <div className="h-3 w-40 bg-[#e0e3e5] rounded" />
                      <div className="h-3 w-14 bg-[#bec8ca] rounded" />
                      <div className={`h-5 w-16 ${row.color} rounded-full opacity-70`} />
                      <div className="h-6 w-14 bg-[#f2f4f6] rounded-lg ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section id="stats" className="bg-[#006d77] py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-extrabold text-white mb-2">{stat.value}</p>
              <p className="text-sm font-semibold text-[#9becf7] uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="py-20 px-6 bg-[#f7f9fb]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block text-xs font-bold text-[#006d77] uppercase tracking-widest bg-[#006d77]/10 px-4 py-1.5 rounded-full mb-4">
              Platform Features
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#191c1e] tracking-tight">
              Everything you need to manage claims
            </h2>
            <p className="text-[#3e494a] mt-3 max-w-xl mx-auto">
              Purpose-built for healthcare providers and insurance adjusters who need clarity, speed, and precision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-[0px_4px_12px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-[#006d77]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#006d77]/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-[#191c1e] mb-2">{f.title}</h3>
                <p className="text-sm text-[#3e494a] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-20 px-6 bg-white border-y border-[#e0e3e5]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block text-xs font-bold text-[#006d77] uppercase tracking-widest bg-[#006d77]/10 px-4 py-1.5 rounded-full mb-4">
              Workflow
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#191c1e] tracking-tight">
              How ClaimsCare works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Patient Submits',
                desc: 'Patient logs in, fills the claim form with clinical details, and uploads receipts or prescription PDFs.',
                color: 'bg-[#006d77]',
              },
              {
                step: '02',
                title: 'Insurer Reviews',
                desc: 'The insurer receives the claim in their adjudication queue, reviews the documentation, and makes an approve/reject decision.',
                color: 'bg-[#50607a]',
              },
              {
                step: '03',
                title: 'Decision Logged',
                desc: 'Patient is notified instantly. The approved payout amount and reviewer comments are recorded and visible in their dashboard.',
                color: 'bg-[#713d10]',
              },
            ].map((step, idx) => (
              <div key={step.step} className="flex flex-col items-center text-center relative">
                <div className={`w-14 h-14 ${step.color} text-white rounded-2xl flex items-center justify-center text-lg font-black mb-5 shadow-md`}>
                  {step.step}
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-[#e0e3e5]" />
                )}
                <h3 className="text-base font-bold text-[#191c1e] mb-2">{step.title}</h3>
                <p className="text-sm text-[#3e494a] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20 px-6 bg-[#f7f9fb]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006d77] uppercase tracking-widest bg-[#006d77]/10 px-4 py-1.5 rounded-full mb-4">
              <Star className="w-3.5 h-3.5" />
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#191c1e] tracking-tight">
              Trusted by healthcare professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#3e494a] leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#006d77] text-white flex items-center justify-center text-sm font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#191c1e]">{t.name}</p>
                    <p className="text-xs text-[#6f797a]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#006d77] to-[#00535b]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to modernize your claims workflow?
          </h2>
          <p className="text-[#9becf7] mb-8 text-base">
            Join 500+ healthcare providers already managing claims with clinical precision.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#006d77] text-sm font-bold rounded-xl hover:bg-[#f0fafb] transition-all shadow-lg active:scale-95"
          >
            Get Started — It's Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#191c1e] text-[#6f797a] py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#006d77] flex items-center justify-center text-white font-black text-xs">CC</div>
            <span className="text-base font-bold text-white">ClaimsCare</span>
          </div>
          <p className="text-sm text-center">
            © {new Date().getFullYear()} ClaimsCare Platform. Built for job interview take-home assignment.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <span>•</span>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
