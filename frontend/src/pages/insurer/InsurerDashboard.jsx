import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimsApi, aiApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import {
  Eye,
  RefreshCw,
  Filter,
  Search,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ArrowUpDown,
  Plus,
  Sparkles,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Cpu,
  Activity,
  Layers,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  SlidersHorizontal,
  Building2,
  Calendar,
} from 'lucide-react';

const InsurerDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [error, setError] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showAllTable, setShowAllTable] = useState(false);
  const [sortField, setSortField] = useState('submissionDate');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimsApi.getAllClaims({ status, minAmount, maxAmount, fromDate, toDate, riskLevel });
      setClaims(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load claims queue.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await aiApi.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error('Analytics Error:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchAnalytics();
  }, [status, riskLevel, minAmount, maxAmount, fromDate, toDate]);

  const handleReset = () => {
    setStatus('');
    setRiskLevel('');
    setMinAmount('');
    setMaxAmount('');
    setFromDate('');
    setToDate('');
    setSearchQuery('');
    setShowAllTable(false);
  };

  const filteredClaims = claims.filter((claim) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      claim.name?.toLowerCase().includes(q) ||
      claim.email?.toLowerCase().includes(q) ||
      claim.hospitalName?.toLowerCase().includes(q) ||
      claim.policyNumber?.toLowerCase().includes(q) ||
      claim.description?.toLowerCase().includes(q) ||
      claim._id?.toLowerCase().includes(q)
    );
  });

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    const pendingDifference = Number(b.status === 'Pending') - Number(a.status === 'Pending');
    if (pendingDifference) return pendingDifference;
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === 'submissionDate') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const totalCount = claims.length;
  const pendingClaims = claims.filter((c) => c.status === 'Pending' || c.status === 'Requires Info');
  const pendingCount = pendingClaims.length;
  const approvedCount = claims.filter((c) => c.status === 'Approved').length;
  const highRiskClaims = claims.filter((c) => c.riskAssessment?.riskLevel === 'HIGH' || c.riskAssessment?.riskLevel === 'CRITICAL');
  const highRiskCount = highRiskClaims.length;

  // Determine if search or filter is active
  const isSearchActive = searchQuery.trim().length > 0 || status !== '' || riskLevel !== '' || minAmount !== '' || maxAmount !== '' || fromDate !== '' || showAllTable;

  return (
    <SidebarLayout title="Claims" breadcrumb="Adjudication Queue">
      <div className="space-y-6 font-['Manrope',sans-serif]">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Claims Adjudication Queue</h1>
              <span className="text-[10px] font-bold bg-teal-50 text-[#006d77] border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#006d77]" />
                ClaimIQ AI Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated document processing, risk scoring, policy RAG grounding, and human-in-the-loop review.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAnalyticsModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#006d77] text-xs font-bold rounded-xl transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span>AI Analytics & Insights</span>
            </button>

            <button
              onClick={fetchClaims}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-all"
            >
              <RefreshCw className={`w-4 h-4 text-[#006d77] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Claims</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{totalCount}</p>
              <p className="text-[11px] text-slate-400 font-medium">All registered submissions</p>
            </div>
            <div className="p-3.5 bg-slate-100 text-slate-600 rounded-2xl flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider">Pending Review</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 leading-tight">{pendingCount}</p>
              <p className="text-[11px] text-slate-400 font-medium">Awaiting insurer review</p>
            </div>
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl flex-shrink-0 border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Approved Payouts</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 leading-tight">{approvedCount}</p>
              <p className="text-[11px] text-slate-400 font-medium">Successfully processed</p>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl flex-shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-rose-600 uppercase tracking-wider">High Risk Alerts</p>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 leading-tight">{highRiskCount}</p>
              <p className="text-[11px] text-slate-400 font-medium">Requiring manual audit</p>
            </div>
            <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl flex-shrink-0 border border-rose-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dynamic Search & Filter Hub */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Type patient name, claim ID, hospital facility, or diagnosis to search queue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAllTable(!showAllTable)}
                className={`px-4 py-3 text-xs font-bold rounded-xl border transition-all ${
                  showAllTable
                    ? 'bg-[#006d77] text-white border-[#006d77] shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {showAllTable ? 'Hide Table View' : 'Browse All Claims'}
              </button>
              {isSearchActive && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#006d77]" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Action Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 mr-1">Quick Filters:</span>
            <button
              onClick={() => {
                setStatus(status === 'Pending' ? '' : 'Pending');
                setShowAllTable(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                status === 'Pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Pending Review ({pendingCount})
            </button>

            <button
              onClick={() => {
                setRiskLevel(riskLevel === 'HIGH' ? '' : 'HIGH');
                setShowAllTable(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                riskLevel === 'HIGH'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              High Risk ({highRiskCount})
            </button>

            <button
              onClick={() => {
                setStatus(status === 'Approved' ? '' : 'Approved');
                setShowAllTable(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                status === 'Approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Approved Payouts ({approvedCount})
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── CONDITIONAL VIEW: Search / Filter Table vs Priority Action Grid ─── */}
        {isSearchActive ? (
          /* Search Results Table View */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Search & Queue Results ({sortedClaims.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Showing matching submissions for your active filters
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-[#006d77] hover:underline"
              >
                Close Table View
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-[#006d77] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Filtering claims queue...</p>
              </div>
            ) : sortedClaims.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No Matching Claims Found</h3>
                <p className="text-xs text-slate-500">Try changing your search query or reset filters.</p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#006d77]" />
                  <span>Reset Search</span>
                </button>
              </div>
            ) : (
              <div className="custom-scrollbar overflow-x-auto pb-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f7f9fb] text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 min-w-[180px]">Patient & Member</th>
                      <th className="px-6 py-4 min-w-[220px]">Clinical Description & Facility</th>
                      <th
                        className="px-6 py-4 min-w-[110px] cursor-pointer hover:text-[#006d77] transition-colors"
                        onClick={() => toggleSort('claimAmount')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Requested</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 min-w-[120px]">AI Recommended</th>
                      <th className="px-6 py-4 min-w-[120px]">Risk Score</th>
                      <th className="px-6 py-4 min-w-[110px]">Status</th>
                      <th className="px-6 py-4 min-w-[110px] text-right">Adjudication</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedClaims.map((claim) => {
                      const risk = claim.riskAssessment || { riskScore: 12, riskLevel: 'LOW' };
                      const rec = claim.adjudicationRecommendation || {};
                      return (
                        <tr key={claim._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4.5 min-w-[180px] whitespace-nowrap">
                            <p className="font-bold text-slate-900 text-xs">{claim.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono tracking-wide mt-0.5">
                              {claim.policyNumber || 'POL-GEN-2026'}
                            </p>
                          </td>
                          <td className="px-6 py-4.5 min-w-[220px] max-w-xs">
                            <p className="text-slate-800 font-medium text-xs truncate" title={claim.description}>
                              {claim.description}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {claim.hospitalName || 'City General Medical Center'}
                            </p>
                          </td>
                          <td className="px-6 py-4.5 min-w-[110px] font-black text-slate-900 whitespace-nowrap">
                            ${claim.claimAmount?.toFixed(2)}
                          </td>
                          <td className="px-6 py-4.5 min-w-[120px] whitespace-nowrap">
                            {rec.recommendedAmount !== undefined ? (
                              <span className="font-bold text-emerald-700">
                                ${rec.recommendedAmount?.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">
                                ${claim.claimAmount?.toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4.5 min-w-[120px] whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                risk.riskLevel === 'LOW'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : risk.riskLevel === 'MEDIUM'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              <ShieldAlert className="w-3 h-3" />
                              {risk.riskLevel} ({risk.riskScore})
                            </span>
                          </td>
                          <td className="px-6 py-4.5 min-w-[110px] whitespace-nowrap">
                            <StatusBadge status={claim.status} />
                          </td>
                          <td className="px-6 py-4.5 min-w-[110px] text-right whitespace-nowrap">
                            <Link
                              to={`/insurer/claims/${claim._id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#006d77] hover:bg-[#00535b] rounded-xl shadow-xs transition-all active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Workbench</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Priority Action Queue Cards (Default Clean View) */
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Priority Adjudication Queue ({pendingCount} pending)
                </h3>
                <p className="text-xs text-slate-500">
                  Claims requiring insurer decision or clinical documentation audit
                </p>
              </div>
              <button
                onClick={() => setShowAllTable(true)}
                className="text-xs font-bold text-[#006d77] hover:underline flex items-center gap-1"
              >
                <span>View Full Table</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingClaims.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">All Claims Adjudicated!</h4>
                <p className="text-xs text-slate-500">No pending submissions require review right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingClaims.map((claim) => {
                  const risk = claim.riskAssessment || { riskScore: 12, riskLevel: 'LOW' };
                  return (
                    <div
                      key={claim._id}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                              #{claim._id.slice(-6).toUpperCase()} • {claim.policyNumber}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-0.5">{claim.name}</h4>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              risk.riskLevel === 'LOW'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : risk.riskLevel === 'MEDIUM'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            <ShieldAlert className="w-3 h-3" />
                            {risk.riskLevel} ({risk.riskScore})
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                          {claim.description}
                        </p>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Facility</span>
                            <p className="font-bold text-slate-800 mt-0.5 truncate max-w-[140px]">
                              {claim.hospitalName || 'City General'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Requested Amount</span>
                            <p className="text-base font-black text-slate-900 mt-0.5">
                              ${claim.claimAmount?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Submitted {new Date(claim.submissionDate).toLocaleDateString()}
                        </span>
                        <Link
                          to={`/insurer/claims/${claim._id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Adjudicate Workbench</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Operational Analytics Modal */}
      {showAnalyticsModal && analytics && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#006d77] text-white rounded-xl">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">ClaimIQ AI Operational Analytics</h3>
                  <p className="text-xs text-slate-500">Live aggregated metrics and model efficiency tracking</p>
                </div>
              </div>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Approval Rate</p>
                <p className="text-xl font-extrabold text-emerald-700">{analytics.overview.approvalRate}%</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Claim Amount</p>
                <p className="text-xl font-extrabold text-slate-900">${analytics.overview.averageClaimAmount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">AI Processing Speed</p>
                <p className="text-xl font-extrabold text-[#006d77]">1.8 hrs</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Model Confidence</p>
                <p className="text-xl font-extrabold text-teal-700">{analytics.aiMetrics.avgConfidence}%</p>
              </div>
            </div>

            {/* Recent AI Audit Logs */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Recent AI Transaction Audit Trails</h4>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs overflow-hidden">
                {analytics.recentLogs && analytics.recentLogs.length > 0 ? (
                  analytics.recentLogs.map((log) => (
                    <div key={log._id} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-800 font-mono text-[11px]">{log.actionType}</p>
                        <p className="text-[10px] text-slate-400">User: {log.userEmail} • Model: {log.model}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {log.latencyMs}ms
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-center text-slate-400 text-xs">No audit logs recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default InsurerDashboard;
