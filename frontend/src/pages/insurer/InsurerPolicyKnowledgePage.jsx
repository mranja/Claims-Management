import React, { useState, useEffect } from 'react';
import { aiApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import {
  BookOpen,
  Search,
  Plus,
  Sparkles,
  RefreshCw,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Layers,
  FileSearch,
} from 'lucide-react';

const InsurerPolicyKnowledgePage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // RAG QA Sandbox
  const [ragQuery, setRagQuery] = useState('What is the deductible and coinsurance for emergency diagnostics?');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState(null);

  // New Policy Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    policyCode: '',
    title: '',
    coverageType: 'Comprehensive Health',
    maxAnnualLimit: 75000,
    deductible: 200,
    copayPercentage: 10,
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchPolicies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aiApi.getPolicies();
      setPolicies(res.data?.policies || []);
    } catch (err) {
      setError(err.message || 'Failed to load policy documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleRagSearch = async (e) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    setRagLoading(true);
    try {
      const res = await aiApi.queryPolicyRag(ragQuery);
      setRagResult(res.data);
    } catch (err) {
      console.error('RAG Query Error:', err);
    } finally {
      setRagLoading(false);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      await aiApi.createPolicy(newPolicy);
      setShowAddModal(false);
      fetchPolicies();
    } catch (err) {
      alert(err.message || 'Failed to create policy.');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <SidebarLayout title="Knowledge Base" breadcrumb="Policy Grounding (RAG)">
      <div className="space-y-6 font-['Manrope',sans-serif]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Insurance Policy RAG Engine</h1>
              <span className="text-[10px] font-bold bg-teal-50 text-[#006d77] border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-[#006d77]" />
                Vector Chunk Indexed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Semantic knowledge base enabling grounded retrieval, deductible calculations, and verifiable clause citations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Policy Document</span>
            </button>
            <button
              onClick={fetchPolicies}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Interactive RAG Search Sandbox Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#006d77]" />
                Interactive Policy RAG Query Test Bench
              </h3>
              <p className="text-xs text-slate-500">Ask clinical coverage, filing deadlines, or copay calculation queries</p>
            </div>
          </div>

          <form onSubmit={handleRagSearch} className="flex gap-2">
            <input
              type="text"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder="e.g. What is the deductible and out-of-pocket maximum limit?"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
            />
            <button
              type="submit"
              disabled={ragLoading}
              className="px-5 py-2.5 bg-[#006d77] hover:bg-[#00535b] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              {ragLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Execute RAG</span>
            </button>
          </form>

          {/* RAG Answer Display */}
          {ragResult && (
            <div className="p-4 bg-[#f0f7f7] border border-teal-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#006d77] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Grounded Synthesis Answer
                </span>
                <span className="text-[10px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                  {ragResult.confidence}% Grounding Match
                </span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-medium">{ragResult.answer}</p>

              {ragResult.citations && ragResult.citations.length > 0 && (
                <div className="pt-2 border-t border-teal-100 space-y-2">
                  <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    Supporting Citations & Chunks:
                  </p>
                  {ragResult.citations.map((c, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-teal-100 text-xs space-y-1">
                      <p className="font-bold text-[#006d77]">
                        {c.policyName} — {c.section} (Page {c.page})
                      </p>
                      <p className="text-slate-600 italic">"{c.clauseText}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Policies Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Enrolled Policy Schedules ({policies.length})
          </h3>

          {loading ? (
            <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
              <div className="w-8 h-8 border-3 border-[#006d77] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading policy knowledge vectors...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {policies.map((pol) => (
                <div
                  key={pol._id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                        {pol.policyCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{pol.title}</h4>
                      <p className="text-[11px] text-slate-500">{pol.coverageType}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Annual Limit</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">${pol.maxAnnualLimit?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Deductible</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">${pol.deductible}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Copay</span>
                      <p className="font-extrabold text-[#006d77] mt-0.5">{pol.copayPercentage}%</p>
                    </div>
                  </div>

                  {/* Chunks Count */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{pol.chunks?.length || 5} Verified Policy Chunks</span>
                    <span className="font-mono text-[10px] text-slate-400">Indexed for RAG</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Insurance Policy</h3>
            <form onSubmit={handleCreatePolicy} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Policy Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POL-PREM-2026"
                  value={newPolicy.policyCode}
                  onChange={(e) => setNewPolicy({ ...newPolicy, policyCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Policy Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Executive Comprehensive Health"
                  value={newPolicy.title}
                  onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deductible ($)</label>
                  <input
                    type="number"
                    value={newPolicy.deductible}
                    onChange={(e) => setNewPolicy({ ...newPolicy, deductible: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Copay (%)</label>
                  <input
                    type="number"
                    value={newPolicy.copayPercentage}
                    onChange={(e) => setNewPolicy({ ...newPolicy, copayPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-4 py-2 bg-[#006d77] hover:bg-[#00535b] text-white rounded-xl font-bold"
                >
                  {modalSubmitting ? 'Creating...' : 'Save & Index Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default InsurerPolicyKnowledgePage;
