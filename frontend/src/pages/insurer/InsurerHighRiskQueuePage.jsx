import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import {
  ShieldAlert,
  AlertTriangle,
  Eye,
  RefreshCw,
  Search,
  DollarSign,
  Layers,
  Sparkles,
  ArrowRight,
  Building2,
  Calendar,
  Clock,
} from 'lucide-react';

const InsurerHighRiskQueuePage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [error, setError] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimsApi.getAllClaims();
      setClaims(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load high risk claims queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // Filter high risk and critical claims or claims with flags
  const highRiskClaims = claims.filter((c) => {
    const score = c.riskAssessment?.riskScore || 0;
    const isDup = c.riskAssessment?.isDuplicate;
    const level = c.riskAssessment?.riskLevel;
    return score >= 25 || isDup || level === 'HIGH' || level === 'CRITICAL' || level === 'MEDIUM';
  });

  const filtered = highRiskClaims.filter((c) => {
    const level = c.riskAssessment?.riskLevel || 'LOW';
    if (tierFilter === 'CRITICAL' && level !== 'CRITICAL') return false;
    if (tierFilter === 'HIGH' && level !== 'HIGH') return false;
    if (tierFilter === 'DUPLICATES' && !c.riskAssessment?.isDuplicate) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.hospitalName?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.policyNumber?.toLowerCase().includes(q)
    );
  });

  const totalAtRiskAmount = highRiskClaims.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
  const criticalCount = highRiskClaims.filter((c) => c.riskAssessment?.riskLevel === 'CRITICAL').length;
  const duplicateCount = highRiskClaims.filter((c) => c.riskAssessment?.isDuplicate).length;

  return (
    <SidebarLayout title="Risk Intelligence" breadcrumb="High-Risk Queue">
      <div className="space-y-6 font-['Manrope',sans-serif]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">High-Risk Claims Queue</h1>
              <span className="text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-600" />
                Prioritized Audit Queue
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Claims flagged by rule-based heuristic engines, duplicate match algorithms, and anomaly detection models.
            </p>
          </div>

          <button
            onClick={fetchClaims}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 text-[#006d77] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Risk Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Risk Exposure</p>
            <p className="text-2xl font-black text-rose-600">${totalAtRiskAmount.toFixed(2)}</p>
            <p className="text-[11px] text-slate-400 font-medium">Across {highRiskClaims.length} flagged claims</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical Risk Claims</p>
            <p className="text-2xl font-black text-slate-900">{criticalCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Score &gt; 70 requiring senior approval</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Potential Duplicates</p>
            <p className="text-2xl font-black text-amber-600">{duplicateCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Matched identical invoices or amounts</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search flagged claims by patient, hospital, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {['ALL', 'CRITICAL', 'HIGH', 'DUPLICATES'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    tierFilter === tier
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Flagged Claims Cards List */}
        {loading ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Scanning claims risk matrices...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Elevated Risk Claims</h3>
            <p className="text-xs text-slate-400">All submitted claims are within normal risk parameters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((claim) => {
              const risk = claim.riskAssessment || { riskScore: 35, riskLevel: 'MEDIUM', ruleFlags: [] };
              const flags = risk.ruleFlags || [];
              return (
                <div
                  key={claim._id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-bold text-slate-900">
                          {claim.name} — #{claim._id.slice(-6).toUpperCase()}
                        </h3>
                        <StatusBadge status={claim.status} />
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            risk.riskLevel === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : risk.riskLevel === 'HIGH'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {risk.riskLevel} Risk ({risk.riskScore}/100)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {claim.hospitalName} • Policy: <span className="font-mono font-bold text-slate-700">{claim.policyNumber}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Claimed Amount</p>
                        <p className="text-xl font-black text-slate-900">${claim.claimAmount?.toFixed(2)}</p>
                      </div>
                      <Link
                        to={`/insurer/claims/${claim._id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Adjudicate</span>
                      </Link>
                    </div>
                  </div>

                  {/* Triggered Flags List */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Triggered Risk Factors:</p>
                    {flags.length > 0 ? (
                      flags.map((f, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-900"
                        >
                          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">{f.title}:</span> {f.explanation}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-600 italic">
                        {risk.explanation || 'Elevated risk threshold assigned based on composite clinical & financial indicators.'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default InsurerHighRiskQueuePage;
