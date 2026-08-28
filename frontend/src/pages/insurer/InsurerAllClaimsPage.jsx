import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import DocumentViewer from '../../components/DocumentViewer';
import {
  Search,
  RotateCcw,
  RefreshCw,
  Filter,
  Eye,
  FileText,
  ShieldAlert,
  Building2,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  FolderOpen,
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

const InsurerAllClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  // View Mode: 'grid' (Document Center Cards style) or 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimsApi.getAllClaims({
        status: statusFilter,
        minAmount,
        maxAmount,
        fromDate,
        riskLevel: riskFilter,
      });
      setClaims(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter, riskFilter, minAmount, maxAmount, fromDate]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setStatusFilter('');
    setRiskFilter('');
    setMinAmount('');
    setMaxAmount('');
    setFromDate('');
    setCurrentPage(1);
  };

  const categories = [
    { id: 'ALL', label: 'All Claims' },
    { id: 'PENDING', label: 'Pending Review' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'HIGH_RISK', label: 'High Risk' },
  ];

  // Filter claims
  const filtered = claims.filter((c) => {
    // Category pill filter
    if (selectedCategory === 'PENDING' && c.status !== 'Pending' && c.status !== 'Requires Info') return false;
    if (selectedCategory === 'APPROVED' && c.status !== 'Approved') return false;
    if (selectedCategory === 'REJECTED' && c.status !== 'Rejected') return false;
    if (selectedCategory === 'HIGH_RISK') {
      const risk = c.riskAssessment?.riskLevel;
      if (risk !== 'HIGH' && risk !== 'CRITICAL') return false;
    }

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.hospitalName?.toLowerCase().includes(q) ||
      c.policyNumber?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c._id?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <SidebarLayout title="Claims Workspace" breadcrumb="All Claims Repository">
      <div className="space-y-6 font-['Manrope',sans-serif]">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">All Claims Workspace</h1>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {claims.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Search, filter, preview attached medical documentation, and open adjudication workbenches.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid' ? 'bg-white text-[#006d77] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'table' ? 'bg-white text-[#006d77] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table List View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                showAdvancedFilters
                  ? 'bg-teal-50 border-teal-200 text-[#006d77]'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Advanced Filters"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#006d77]" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            <button
              onClick={fetchClaims}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-[#006d77] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Category Pills Bar (Patient Document Center Style) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search claims by patient name, email, policy ID, hospital, or medical diagnosis..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
              />
            </div>
            {(searchQuery || selectedCategory !== 'ALL' || statusFilter || riskFilter) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#006d77]" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#006d77] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Advanced Multi-Filters (collapsible) */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 animate-in fade-in">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Risk Tier
                </label>
                <select
                  value={riskFilter}
                  onChange={(e) => {
                    setRiskFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                >
                  <option value="">All Risk Tiers</option>
                  <option value="LOW">Low Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="HIGH">High Risk</option>
                  <option value="CRITICAL">Critical Risk</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Min Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Max Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="10000.00"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Submitted After
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── GRID CARDS VIEW (Matches Patient Document Center layout) ─── */}
        {loading ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-[#006d77] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Scanning claims workspace...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Claims Found</h3>
            <p className="text-xs text-slate-400">No claim records match your active search filters.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((claim) => {
              const risk = claim.riskAssessment || { riskScore: 12, riskLevel: 'LOW' };
              const fileName = claim.documentUrl ? claim.documentUrl.split('/').pop() : 'claim-document.pdf';
              const docType = claim.documentProcessing?.documentType || 'Medical Bill / Invoice';

              return (
                <div
                  key={claim._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Icon & Badge Row */}
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-teal-50 text-[#006d77] rounded-xl flex-shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <StatusBadge status={claim.status} />
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            risk.riskLevel === 'LOW'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : risk.riskLevel === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {risk.riskLevel} ({risk.riskScore})
                        </span>
                      </div>
                    </div>

                    {/* Claim & Patient Title */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate" title={fileName}>
                        {fileName}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate" title={claim.description}>
                        {claim.description}
                      </p>
                    </div>

                    {/* Info Box (Facility, Amount, Date) */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1.5 text-slate-600">
                      <p className="truncate">
                        <strong className="text-slate-800">Facility:</strong> {claim.hospitalName || 'City General Medical Center'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span>
                          <strong className="text-slate-800">Claim Amount:</strong> ${claim.claimAmount?.toFixed(2)}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {claim.policyNumber || 'POL-GEN-2026'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Uploaded on {new Date(claim.submissionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/insurer/claims/${claim._id}`}
                      className="text-xs font-bold text-[#006d77] hover:underline"
                    >
                      View Claim
                    </Link>

                    <div className="flex items-center gap-1.5">
                      {claim.documentUrl && (
                        <button
                          onClick={() => setSelectedDoc(claim)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#006d77]" />
                          <span>Preview File</span>
                        </button>
                      )}
                      <Link
                        to={`/insurer/claims/${claim._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                      >
                        <span>Workbench</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE LIST VIEW (Optional toggle) */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#f7f9fb] text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 min-w-[180px]">Patient & Policy</th>
                    <th className="px-6 py-4 min-w-[220px]">Diagnosis / Procedure</th>
                    <th className="px-6 py-4 min-w-[160px]">Facility</th>
                    <th className="px-6 py-4 min-w-[110px]">Requested</th>
                    <th className="px-6 py-4 min-w-[120px]">Risk Tier</th>
                    <th className="px-6 py-4 min-w-[110px]">Status</th>
                    <th className="px-6 py-4 min-w-[110px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((claim) => {
                    const risk = claim.riskAssessment || { riskScore: 12, riskLevel: 'LOW' };
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
                        </td>
                        <td className="px-6 py-4.5 min-w-[160px] text-slate-600 whitespace-nowrap">
                          {claim.hospitalName || 'City General Medical'}
                        </td>
                        <td className="px-6 py-4.5 min-w-[110px] font-black text-slate-900 whitespace-nowrap">
                          ${claim.claimAmount?.toFixed(2)}
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
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedDoc.documentUrl ? selectedDoc.documentUrl.split('/').pop() : 'claim-document.pdf'}
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: {selectedDoc.name} • {selectedDoc.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <DocumentViewer documentUrl={selectedDoc.documentUrl} />
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default InsurerAllClaimsPage;
