import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  FileText,
  Plus,
  BarChart3,
  BookOpen,
  User,
  ShieldAlert,
  HelpCircle,
  LogOut,
  Sparkles,
  Layers,
  ArrowRight,
  X,
  FileSearch,
} from 'lucide-react';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { user, isPatient, isInsurer, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const patientActions = [
    { label: 'Submit New Claim', path: '/patient/submit', icon: Plus, category: 'Actions' },
    { label: 'My Claims History', path: '/patient/dashboard', icon: FileText, category: 'Navigation' },
    { label: 'My Document Center', path: '/patient/documents', icon: FileSearch, category: 'Navigation' },
    { label: 'Notifications & Updates', path: '/patient/notifications', icon: Sparkles, category: 'Navigation' },
    { label: 'My Profile & Policy Details', path: '/profile', icon: User, category: 'Navigation' },
    { label: 'Help & FAQs', path: '/patient/support', icon: HelpCircle, category: 'Support' },
  ];

  const insurerActions = [
    { label: 'Adjudication Queue (Dashboard)', path: '/insurer/dashboard', icon: FileText, category: 'Navigation' },
    { label: 'All Claims Workspace', path: '/insurer/claims', icon: Layers, category: 'Navigation' },
    { label: 'High-Risk Claims Queue', path: '/insurer/high-risk', icon: ShieldAlert, category: 'Audit' },
    { label: 'Patient Directory', path: '/insurer/patients', icon: User, category: 'Management' },
    { label: 'AI Insights & Audit Logs', path: '/insurer/ai-insights', icon: Sparkles, category: 'Intelligence' },
    { label: 'Policy Knowledge Base (RAG)', path: '/insurer/policies', icon: BookOpen, category: 'Intelligence' },
    { label: 'Document Review Repository', path: '/insurer/documents', icon: FileSearch, category: 'Management' },
    { label: 'Side-by-Side Claim Comparison', path: '/insurer/compare', icon: Layers, category: 'Audit' },
    { label: 'Profile Settings', path: '/profile', icon: User, category: 'Settings' },
  ];

  const actions = isPatient ? patientActions : insurerActions;

  const filtered = actions.filter((act) =>
    act.label.toLowerCase().includes(query.toLowerCase()) ||
    act.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    onClose(false);
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 font-['Manrope',sans-serif]">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, page name, or action (Esc to close)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => onClose(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands or pages found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-teal-50/60 text-slate-700 hover:text-[#006d77] transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-[#006d77] text-slate-600 group-hover:text-white transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#006d77] transition-all transform group-hover:translate-x-1" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-xs">
              Ctrl+K
            </kbd>
          </div>
          <span>Logged in as {user?.name} ({isPatient ? 'Patient' : 'Insurer'})</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
