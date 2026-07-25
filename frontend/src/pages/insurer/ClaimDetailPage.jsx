import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import DocumentViewer from '../../components/DocumentViewer';
import {
  ArrowLeft, CheckCircle2, XCircle, User, Mail, Calendar,
  AlertCircle, FileCheck, Lock, Info, DollarSign
} from 'lucide-react';

const ClaimDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [decision, setDecision] = useState('Approved');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [insurerComments, setInsurerComments] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchClaimDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimsApi.getClaimById(id);
      const fetched = res.data;
      setClaim(fetched);
      setApprovedAmount(fetched.claimAmount ? fetched.claimAmount.toString() : '');
    } catch (err) {
      setError(err.message || 'Failed to fetch claim details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (decision === 'Approved') {
      const amountNum = parseFloat(approvedAmount);
      if (isNaN(amountNum) || amountNum < 0) {
        setSubmitError('Approved amount must be a valid non-negative number');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        status: decision,
        approvedAmount: decision === 'Approved' ? parseFloat(approvedAmount) : 0,
        insurerComments,
      };
      const res = await claimsApi.updateClaimStatus(id, payload);
      setClaim(res.data);
      setSubmitSuccess(`Claim ${res.data.status} successfully.`);
    } catch (err) {
      setSubmitError(err.message || 'Failed to update claim status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout title="Claims" breadcrumb="Claim Review">
        <div className="flex-1 flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#005a60] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading claim details...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error || !claim) {
    return (
      <SidebarLayout title="Claims" breadcrumb="Claim Review">
        <div className="text-center space-y-4 py-16">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Error Loading Claim</h2>
          <p className="text-slate-500 text-sm">{error || 'Claim not found'}</p>
          <Link
            to="/insurer/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Queue
          </Link>
        </div>
      </SidebarLayout>
    );
  }

  const isPending = claim.status === 'Pending';
  const pctOfEstimated = approvedAmount && claim.claimAmount
    ? Math.round((parseFloat(approvedAmount) / claim.claimAmount) * 100)
    : 0;

  return (
    <SidebarLayout title="Claims" breadcrumb="Claim Review">
      <div className="max-w-3xl w-full mx-auto space-y-4">
        {/* Back + Status Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/insurer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#005a60] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Claim Review
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500">#{id.slice(-8).toUpperCase()}-AX</span>
            <StatusBadge status={claim.status} />
          </div>
        </div>

        {/* Main Claim Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{claim.description}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Submitted on {new Date(claim.submissionDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Total</p>
              <p className="text-3xl font-black text-slate-900 mt-1">${claim.claimAmount?.toFixed(2)}</p>
            </div>
            {claim.status === 'Rejected' && (
              <span className="text-sm font-extrabold text-rose-600 uppercase tracking-wider">Urgency: HIGH</span>
            )}
          </div>

          <hr className="border-slate-200" />

          {/* Patient + Billing Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Patient Details</h3>
              <div className="flex items-center gap-2 text-xs">
                <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700 font-semibold">Name:</span>
                <span className="text-slate-900 font-bold">{claim.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700 font-semibold">Email:</span>
                <span className="text-slate-900 font-bold">{claim.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Review Info</h3>
              {claim.reviewedBy && (
                <div className="flex items-center gap-2 text-xs">
                  <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-700 font-semibold">Reviewer:</span>
                  <span className="text-slate-900 font-bold">{claim.reviewedBy?.name || 'N/A'}</span>
                </div>
              )}
              {claim.reviewedAt && (
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-700 font-semibold">Reviewed:</span>
                  <span className="text-slate-900 font-bold">
                    {new Date(claim.reviewedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Preview */}
        <DocumentViewer documentUrl={claim.documentUrl} />

        {/* Adjudication Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#005a60]" />
              Review Action
            </h2>
            <Info className="w-4 h-4 text-slate-400" />
          </div>

          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}
          {submitSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{submitSuccess}</span>
            </div>
          )}

          {!isPending ? (
            /* Decision Already Locked */
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Lock className="w-4 h-4 text-[#005a60]" />
                <span>Decision Locked — {claim.status}</span>
              </div>
              {claim.status === 'Approved' && (
                <div>
                  <p className="text-[11px] text-slate-500 font-semibold">Approved Amount</p>
                  <p className="text-xl font-extrabold text-emerald-700">${claim.approvedAmount?.toFixed(2)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {Math.round((claim.approvedAmount / claim.claimAmount) * 100)}% of the estimated total amount.
                  </p>
                </div>
              )}
              {claim.insurerComments && (
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <p className="text-[11px] font-bold text-slate-500 mb-1">Reviewer Comments</p>
                  <p className="text-xs text-slate-700 italic">"{claim.insurerComments}"</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              {/* Approve / Reject Toggle — matching input_file_1.png */}
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setDecision('Approved'); setApprovedAmount(claim.claimAmount.toString()); }}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      decision === 'Approved'
                        ? 'bg-[#005a60] text-white border-[#005a60] shadow-sm'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-[#005a60] hover:text-[#005a60]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDecision('Rejected'); setApprovedAmount('0'); }}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      decision === 'Rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-rose-500 hover:text-rose-600'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>

              {/* Approved Amount Input */}
              {decision === 'Approved' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Approved Amount ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold">
                      $
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(e.target.value)}
                      className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#005a60] transition-all"
                    />
                  </div>
                  {pctOfEstimated > 0 && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      {pctOfEstimated}% of the estimated total amount.
                    </p>
                  )}
                </div>
              )}

              {/* Insurer Comments */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reviewer Comments
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide clinical justification for your decision..."
                  value={insurerComments}
                  onChange={(e) => setInsurerComments(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005a60] transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-sm active:scale-98 disabled:opacity-50 ${
                  decision === 'Approved'
                    ? 'bg-[#005a60] hover:bg-[#00474c]'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Submit Final Decision ▶</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-400 text-center">Decision will be logged and notification sent to provider.</p>
            </form>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ClaimDetailPage;
