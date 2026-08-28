import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import DocumentViewer from '../../components/DocumentViewer';
import PatientAIChat from '../../components/PatientAIChat';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Layers,
  UploadCloud,
  FileCheck,
} from 'lucide-react';

const PatientClaimDetailPage = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClaim = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimsApi.getClaimById(id);
      setClaim(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load claim timeline and details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [id]);

  if (loading) {
    return (
      <SidebarLayout title="My Claims" breadcrumb="Claim Details">
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-[#006d77] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading claim timeline...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error || !claim) {
    return (
      <SidebarLayout title="My Claims" breadcrumb="Claim Details">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Claim Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'Could not find claim record.'}</p>
          <Link
            to="/patient/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006d77] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Claims History</span>
          </Link>
        </div>
      </SidebarLayout>
    );
  }

  const isApproved = claim.status === 'Approved';
  const isRejected = claim.status === 'Rejected';
  const isPending = claim.status === 'Pending' || claim.status === 'Requires Info';

  // Visual Progression Stages
  const stages = [
    { title: 'Submitted', desc: 'Claim registered and queued', done: true, date: claim.submissionDate },
    { title: 'OCR & AI Verification', desc: 'Itemized extraction completed', done: !!claim.documentProcessing?.extractedText, date: claim.documentProcessing?.processedAt || claim.submissionDate },
    { title: 'Clinical Review', desc: 'Adjudicator examining benefits', done: !isPending || !!claim.reviewedAt, active: isPending },
    {
      title: isApproved ? 'Approved & Finalized' : isRejected ? 'Claim Rejected' : 'Adjudication Decision',
      desc: isApproved ? `Approved payout: $${claim.approvedAmount?.toFixed(2)}` : isRejected ? 'Review comments attached' : 'Pending final authorization',
      done: isApproved || isRejected,
      error: isRejected,
      date: claim.reviewedAt,
    },
  ];

  return (
    <SidebarLayout title="My Claims" breadcrumb={`Claim #${claim._id.slice(-6).toUpperCase()}`}>
      <div className="max-w-4xl w-full mx-auto space-y-6 font-['Manrope',sans-serif]">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              to="/patient/dashboard"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Claim #{claim._id.slice(-6).toUpperCase()}
                </h1>
                <StatusBadge status={claim.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {claim.hospitalName || 'City General Medical Center'} • Policy: <span className="font-mono font-bold text-slate-700">{claim.policyNumber || 'POL-COMP-PLATINUM'}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requested Total</p>
            <p className="text-2xl font-black text-slate-900">${claim.claimAmount?.toFixed(2)}</p>
            {isApproved && (
              <p className="text-xs font-extrabold text-emerald-700">
                Approved Payout: ${claim.approvedAmount?.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Visual Timeline Stepper */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#006d77]" />
            Claim Processing Lifecycle
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            {stages.map((stage, sIdx) => {
              return (
                <div
                  key={sIdx}
                  className={`p-4 rounded-xl border relative transition-all ${
                    stage.done
                      ? 'bg-teal-50/60 border-teal-200 text-[#006d77]'
                      : stage.error
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : stage.active
                      ? 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      Stage 0{sIdx + 1}
                    </span>
                    {stage.done ? (
                      <CheckCircle2 className="w-4 h-4 text-[#006d77]" />
                    ) : stage.error ? (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    ) : stage.active ? (
                      <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900">{stage.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{stage.desc}</p>
                  {stage.date && (
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                      {new Date(stage.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Claim Summary & Insurer Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Claim Metadata */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Claim Form Information
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Diagnosis / Reason</span>
                <p className="font-bold text-slate-800 mt-0.5">{claim.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Submission Date</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {new Date(claim.submissionDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Healthcare Facility</span>
                  <p className="font-bold text-slate-800 mt-0.5">{claim.hospitalName || 'City General'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Insurer Feedback / AI Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#006d77]" />
              Adjudicator Notes & Status
            </h3>

            {claim.insurerComments ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Reviewer Justification:</p>
                <p className="italic">"{claim.insurerComments}"</p>
                {claim.reviewedAt && (
                  <p className="text-[10px] text-slate-400 pt-1">
                    Recorded on {new Date(claim.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-teal-50/50 border border-teal-100 rounded-xl text-xs text-slate-700 space-y-1">
                <p className="font-bold text-[#006d77] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Verification Summary:
                </p>
                <p className="text-slate-600">
                  {claim.aiAssessment?.summary ||
                    'All receipts and prescription documents are verified. Awaiting supervisor approval.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Supporting Document Viewer */}
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Attached Medical Documentation
          </h2>
          <DocumentViewer documentUrl={claim.documentUrl} />
        </div>
      </div>

      <PatientAIChat activeClaim={claim} />
    </SidebarLayout>
  );
};

export default PatientClaimDetailPage;
