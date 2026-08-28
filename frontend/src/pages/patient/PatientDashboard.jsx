import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import DocumentViewer from '../../components/DocumentViewer';
import PatientAIChat from '../../components/PatientAIChat';
import {
  Plus,
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  RefreshCw,
  Eye,
  MessageSquare,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building2,
} from 'lucide-react';

const PatientDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClaimDoc, setSelectedClaimDoc] = useState(null);

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimsApi.getPatientClaims();
      setClaims(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch claims history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const totalClaims = claims.length;
  const totalClaimedAmount = claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
  const totalApprovedAmount = claims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0);
  const pendingCount = claims.filter((c) => c.status === 'Pending' || c.status === 'Requires Info').length;

  const latestClaim = claims[0] || null;

  return (
    <SidebarLayout title="Claims" breadcrumb="My Claims Queue">
      <div className="space-y-6 font-['Manrope',sans-serif]">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Claims History</h1>
              <span className="text-[10px] font-bold bg-teal-50 text-[#006d77] border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#006d77]" />
                AI-Assisted
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Precision medical reimbursement tracking and AI-powered document verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchClaims}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/patient/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Claim</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Submitted</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{totalClaims}</p>
              <p className="text-[11px] text-slate-400 font-medium">Submitted medical claims</p>
            </div>
            <div className="p-3.5 bg-slate-100 text-[#006d77] rounded-2xl flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider">Pending Review</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 leading-tight">{pendingCount}</p>
              <p className="text-[11px] text-slate-400 font-medium">Under adjudication</p>
            </div>
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl flex-shrink-0 border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">Total Requested</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">${totalClaimedAmount.toFixed(2)}</p>
              <p className="text-[11px] text-slate-400 font-medium">Total claimed amount</p>
            </div>
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl flex-shrink-0 border border-blue-100">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Total Approved</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 leading-tight">${totalApprovedAmount.toFixed(2)}</p>
              <p className="text-[11px] text-slate-400 font-medium">Total approved payouts</p>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl flex-shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Claims Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#006d77]" />
              <span>Claims History</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">Total: {claims.length} records</span>
          </div>

          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#006d77] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-medium">Fetching claims and AI analysis...</p>
            </div>
          ) : claims.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Claims Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Submit medical receipts and prescriptions to request reimbursement.
              </p>
              <Link
                to="/patient/submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#006d77] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#00535b] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Your First Claim</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f7f9fb] text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Submission Date</th>
                    <th className="px-6 py-3.5">Clinical Details & Facility</th>
                    <th className="px-6 py-3.5">Claim Amount</th>
                    <th className="px-6 py-3.5">Approved Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Document</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claims.map((claim) => (
                    <tr key={claim._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                        {new Date(claim.submissionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4 max-w-sm">
                        <p className="text-slate-900 font-bold truncate">{claim.description}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{claim.hospitalName || 'City General Medical Center'}</span>
                        </p>
                        {claim.insurerComments && (
                          <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <MessageSquare className="w-3.5 h-3.5 text-[#006d77] flex-shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-slate-800">Insurer:</strong> {claim.insurerComments}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                        ${claim.claimAmount?.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {claim.approvedAmount !== null && claim.approvedAmount !== undefined ? (
                          <span className="font-bold text-emerald-700 text-sm">
                            ${claim.approvedAmount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Under Adjudication</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={claim.status} />
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedClaimDoc(claim)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#006d77] bg-[#006d77]/10 hover:bg-[#006d77]/20 border border-[#006d77]/30 rounded-xl transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Doc</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Floating Patient AI Assistant Chat */}
      <PatientAIChat activeClaim={latestClaim} />

      {/* Document View Modal */}
      {selectedClaimDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Document — {selectedClaimDoc.description}
              </h3>
              <button
                onClick={() => setSelectedClaimDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <DocumentViewer documentUrl={selectedClaimDoc.documentUrl} />
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default PatientDashboard;
