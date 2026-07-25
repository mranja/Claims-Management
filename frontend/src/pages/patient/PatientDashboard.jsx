import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import DocumentViewer from '../../components/DocumentViewer';
import { Plus, FileText, DollarSign, Clock, CheckCircle2, RefreshCw, Eye, MessageSquare, AlertCircle } from 'lucide-react';

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
  const pendingCount = claims.filter((c) => c.status === 'Pending').length;

  return (
    <SidebarLayout title="Claims" breadcrumb="My Claims Queue">
      <div className="space-y-6">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Claims History</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Precision medical reimbursement tracking and processing status for patients.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchClaims}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/patient/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005a60] hover:bg-[#00474c] text-white text-xs font-bold rounded-full shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Claim</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Total Submitted</span>
              <FileText className="w-4 h-4 text-[#005a60]" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{totalClaims}</p>
            <p className="text-[11px] text-slate-500">Submitted claims</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Pending Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-amber-600">{pendingCount}</p>
            <p className="text-[11px] text-slate-500">Under review</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Total Requested</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">${totalClaimedAmount.toFixed(2)}</p>
            <p className="text-[11px] text-slate-500">Total claimed amount</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Total Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-700">${totalApprovedAmount.toFixed(2)}</p>
            <p className="text-[11px] text-slate-500">Total approved payouts</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Claims Table Matching ClaimsCare Table View */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#005a60]" />
              <span>Claims History</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">Total: {claims.length} records</span>
          </div>

          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-7 h-7 border-3 border-[#005a60] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-medium">Fetching claims...</p>
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#005a60] text-white text-xs font-bold rounded-full shadow-sm hover:bg-[#00474c] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Your First Claim</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Submission Date</th>
                    <th className="px-6 py-3.5">Description</th>
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

                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-slate-900 font-bold truncate">{claim.description}</p>
                        {claim.insurerComments && (
                          <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <MessageSquare className="w-3.5 h-3.5 text-[#005a60] flex-shrink-0 mt-0.5" />
                            <span><strong className="text-slate-800">Insurer:</strong> {claim.insurerComments}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                        ${claim.claimAmount?.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {claim.approvedAmount !== null && claim.approvedAmount !== undefined ? (
                          <span className="font-bold text-emerald-700">
                            ${claim.approvedAmount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Under Review</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={claim.status} />
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedClaimDoc(claim)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#005a60] bg-[#005a60]/10 hover:bg-[#005a60]/20 border border-[#005a60]/30 rounded-xl transition-all"
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
