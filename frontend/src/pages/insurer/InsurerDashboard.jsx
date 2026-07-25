import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import {
  Eye, RefreshCw, Filter, Search, RotateCcw,
  Clock, CheckCircle2, XCircle, FileText,
  AlertCircle, ArrowUpDown, Plus
} from 'lucide-react';

const InsurerDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('submissionDate');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimsApi.getAllClaims({ status, minAmount, maxAmount, fromDate, toDate });
      setClaims(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load claims queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [status, minAmount, maxAmount, fromDate, toDate]);

  const handleReset = () => {
    setStatus('');
    setMinAmount('');
    setMaxAmount('');
    setFromDate('');
    setToDate('');
    setSearchQuery('');
  };

  const filteredClaims = claims.filter((claim) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      claim.name?.toLowerCase().includes(q) ||
      claim.email?.toLowerCase().includes(q) ||
      claim.description?.toLowerCase().includes(q)
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
    if (sortField === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('desc'); }
  };

  const totalCount = claims.length;
  const pendingCount = claims.filter(c => c.status === 'Pending').length;
  const approvedCount = claims.filter(c => c.status === 'Approved').length;
  const rejectedCount = claims.filter(c => c.status === 'Rejected').length;

  return (
    <SidebarLayout title="Claims" breadcrumb="Adjudication Queue">
      <div className="space-y-5">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Claims Queue</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, filter, and adjudicate submitted insurance reimbursement claims.
            </p>
          </div>
          <button
            onClick={fetchClaims}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-[#005a60] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalCount}</p>
            </div>
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Under Review</p>
              <p className="text-xl font-extrabold text-amber-600 mt-0.5">{pendingCount}</p>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved</p>
              <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{approvedCount}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rejected</p>
              <p className="text-xl font-extrabold text-rose-600 mt-0.5">{rejectedCount}</p>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by patient name, email, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005a60]"
              />
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#005a60]" />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005a60]"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Min Amount ($)</label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005a60]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Max Amount ($)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005a60]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005a60]"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Claims Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-7 h-7 border-2 border-[#005a60] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading claims...</p>
            </div>
          ) : sortedClaims.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Claims Found</h3>
              <p className="text-xs text-slate-500">Try adjusting your filters or resetting them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Patient</th>
                    <th className="px-5 py-3.5">Description</th>
                    <th
                      className="px-5 py-3.5 cursor-pointer hover:text-[#005a60] transition-colors"
                      onClick={() => toggleSort('claimAmount')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Amount</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-5 py-3.5">Approved</th>
                    <th
                      className="px-5 py-3.5 cursor-pointer hover:text-[#005a60] transition-colors"
                      onClick={() => toggleSort('submissionDate')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Submitted</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedClaims.map((claim) => (
                    <tr key={claim._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{claim.name}</p>
                        <p className="text-[11px] text-slate-500">{claim.email}</p>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-slate-700 font-medium truncate">{claim.description}</p>
                      </td>
                      <td className="px-5 py-4 font-extrabold text-slate-900 whitespace-nowrap">
                        ${claim.claimAmount?.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {claim.approvedAmount !== null && claim.approvedAmount !== undefined ? (
                          <span className="font-bold text-emerald-700">${claim.approvedAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-600 font-medium">
                        {new Date(claim.submissionDate).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Link
                          to={`/insurer/claims/${claim._id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#005a60] hover:bg-[#00474c] rounded-xl shadow-sm transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default InsurerDashboard;
