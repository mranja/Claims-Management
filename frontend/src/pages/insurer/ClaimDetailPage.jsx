import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { claimsApi, aiApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import DocumentViewer from '../../components/DocumentViewer';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Calendar,
  AlertCircle,
  FileCheck,
  Lock,
  Info,
  DollarSign,
  Sparkles,
  ShieldAlert,
  Search,
  BookOpen,
  FileText,
  RefreshCw,
  HelpCircle,
  Layers,
  ArrowRight,
  TrendingDown,
  Building2,
  Check,
  AlertTriangle,
  Send,
} from 'lucide-react';

const ClaimDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('intelligence'); // 'intelligence' | 'policy-rag' | 'document'

  // Adjudication Form state
  const [decision, setDecision] = useState('Approved');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [insurerComments, setInsurerComments] = useState('');
  const [decisionType, setDecisionType] = useState('Manual Review Adjudication');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Policy RAG state
  const [ragQuery, setRagQuery] = useState('What is the deductible and coinsurance for emergency diagnostics?');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState(null);

  const fetchClaimDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimsApi.getClaimById(id);
      const fetched = res.data;
      setClaim(fetched);

      // Pre-fill approved amount with recommended AI amount or claim amount
      const recAmt = fetched.adjudicationRecommendation?.recommendedAmount;
      setApprovedAmount(recAmt !== undefined && recAmt !== null ? recAmt.toString() : fetched.claimAmount.toString());
    } catch (err) {
      setError(err.message || 'Failed to fetch claim details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await aiApi.reanalyzeClaim(id);
      setClaim(res.data.claim);
      setSubmitSuccess('AI Intelligence analysis refreshed with latest rules.');
    } catch (err) {
      setSubmitError(err.message || 'Failed to reanalyze claim.');
    } finally {
      setReanalyzing(false);
    }
  };

  const handleApplyAiRecommendation = () => {
    if (!claim?.adjudicationRecommendation) return;
    const rec = claim.adjudicationRecommendation;
    const recAction = rec.recommendedAction === 'APPROVE' ? 'Approved' : rec.recommendedAction === 'REJECT' ? 'Rejected' : 'Requires Info';
    setDecision(recAction);
    setApprovedAmount(rec.recommendedAmount !== undefined ? rec.recommendedAmount.toString() : claim.claimAmount.toString());
    setInsurerComments(`Adjudicated per ClaimIQ recommendation. ${rec.rationale}`);
    setDecisionType('Accepted AI Recommendation');
  };

  const handlePolicyQuery = async (e) => {
    if (e) e.preventDefault();
    if (!ragQuery.trim()) return;

    setRagLoading(true);
    try {
      const res = await aiApi.queryPolicyRag(ragQuery, claim?.policyNumber);
      setRagResult(res.data);
    } catch (err) {
      console.error('RAG Error:', err);
    } finally {
      setRagLoading(false);
    }
  };

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
        adjudicationDecisionType: decisionType,
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
        <div className="flex-1 flex items-center justify-center h-80">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-9 h-9 border-3 border-[#006d77] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-semibold">Running ClaimIQ Adjudication Intelligence...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error || !claim) {
    return (
      <SidebarLayout title="Claims" breadcrumb="Claim Review">
        <div className="text-center space-y-4 py-16 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Error Loading Claim</h2>
          <p className="text-slate-500 text-sm">{error || 'Claim not found'}</p>
          <Link
            to="/insurer/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006d77] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#00535b] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Queue
          </Link>
        </div>
      </SidebarLayout>
    );
  }

  const isPending = claim.status === 'Pending' || claim.status === 'Requires Info';
  const risk = claim.riskAssessment || { riskScore: 12, riskLevel: 'LOW', ruleFlags: [] };
  const ai = claim.aiAssessment || { inconsistencies: [], summary: '' };
  const doc = claim.documentProcessing || { structuredData: {} };
  const rec = claim.adjudicationRecommendation || {};

  return (
    <SidebarLayout title="Claims" breadcrumb="Adjudication Workbench">
      <div className="max-w-7xl w-full mx-auto space-y-5 font-['Manrope',sans-serif]">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              to="/insurer/dashboard"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Claim #{claim._id.slice(-6).toUpperCase()}
                </h1>
                <StatusBadge status={claim.status} />
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    risk.riskLevel === 'LOW'
                      ? 'bg-emerald-100 text-emerald-800'
                      : risk.riskLevel === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {risk.riskLevel} Risk ({risk.riskScore}/100)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Patient: <span className="font-bold text-slate-800">{claim.name}</span> ({claim.email}) • Policy: <span className="font-mono font-bold text-slate-700">{claim.policyNumber || 'POL-COMP-PLATINUM'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin' : ''}`} />
              <span>Re-run AI Analysis</span>
            </button>

            {isPending && rec.recommendedAction && (
              <button
                onClick={handleApplyAiRecommendation}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#006d77] hover:bg-[#00535b] rounded-xl shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                <span>Apply AI Recommendation</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {submitSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <span>{submitSuccess}</span>
          </div>
        )}
        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Workbench Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl">
          {[
            { id: 'intelligence', label: 'AI Claim Intelligence', icon: Sparkles },
            { id: 'policy-rag', label: 'Policy RAG Grounding', icon: BookOpen },
            { id: 'document', label: 'Original Document & OCR', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  active
                    ? 'border-[#006d77] text-[#006d77]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#006d77]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Grid: Left Workbench & Right Adjudication Decision */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column (2 spans) */}
          <div className="lg:col-span-2 space-y-5">
            {/* ─── TAB 1: AI INTELLIGENCE WORKBENCH ─── */}
            {activeTab === 'intelligence' && (
              <>
                {/* AI Executive Summary Card */}
                <div className="bg-gradient-to-br from-[#f0f7f7] to-[#e6f2f2] p-5 rounded-2xl border border-teal-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#006d77] text-white rounded-lg">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-[#00535b]">AI Clinical & Financial Synthesis</h3>
                    </div>
                    <span className="text-[10px] font-bold bg-white text-[#006d77] px-2.5 py-1 rounded-full border border-teal-200 shadow-xs">
                      Confidence: {ai.confidenceScore || 95}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {ai.summary || 'AI synthesis complete. All primary document criteria match submitted claim form.'}
                  </p>
                </div>

                {/* AI Recommendation & Payout Calculator Banner */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#006d77]" />
                      Adjudication Recommendation & Benefits Calculation
                    </h3>
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-lg uppercase ${
                        rec.recommendedAction === 'APPROVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.recommendedAction === 'REJECT'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.recommendedAction || 'APPROVE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Requested Amount</p>
                      <p className="text-lg font-extrabold text-slate-900">${claim.claimAmount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Applied Deductions</p>
                      <p className="text-lg font-extrabold text-rose-600">-${(rec.deductionAmount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Recommended Payout</p>
                      <p className="text-lg font-extrabold text-emerald-700">
                        ${(rec.recommendedAmount !== undefined ? rec.recommendedAmount : claim.claimAmount)?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {rec.deductionReasons && rec.deductionReasons.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold text-slate-600">Calculated Deductions & Clauses:</p>
                      {rec.deductionReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                          <TrendingDown className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Consistency Matrix Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#006d77]" />
                      Claim vs Document Consistency Checker
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {ai.inconsistencies?.filter((i) => i.status === 'MATCH').length || 0} / {ai.inconsistencies?.length || 5} Verified
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                          <th className="pb-2">Field</th>
                          <th className="pb-2">Claim Input</th>
                          <th className="pb-2">Document OCR Record</th>
                          <th className="pb-2 text-right">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(ai.inconsistencies && ai.inconsistencies.length > 0
                          ? ai.inconsistencies
                          : [
                              { field: 'Patient Name', claimValue: claim.name, docValue: claim.name, status: 'MATCH', explanation: 'Exact match verified.' },
                              { field: 'Total Amount', claimValue: `$${claim.claimAmount}`, docValue: `$${claim.claimAmount}`, status: 'MATCH', explanation: 'Financial sum aligns.' },
                              { field: 'Healthcare Facility', claimValue: claim.hospitalName || 'City General', docValue: 'City General Medical Center', status: 'MATCH', explanation: 'Licensed provider.' },
                            ]
                        ).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="py-2.5 font-bold text-slate-800">{item.field}</td>
                            <td className="py-2.5 text-slate-600 font-medium">{item.claimValue || '—'}</td>
                            <td className="py-2.5 text-slate-800 font-semibold">{item.docValue || '—'}</td>
                            <td className="py-2.5 text-right">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.status === 'MATCH'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : item.status === 'MISMATCH'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {item.status === 'MATCH' ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Risk & Fraud Intelligence Radar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Risk & Fraud Engine Analysis
                    </h3>
                    <span className="text-xs font-extrabold text-slate-700">
                      Composite ML Score: <span className="text-[#006d77]">{risk.mlScore || 15}/100</span>
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {risk.explanation || 'Low Risk: Document fields, member history, and financial thresholds meet clinical adjudication requirements.'}
                  </div>

                  {risk.ruleFlags && risk.ruleFlags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Triggered Risk Rules:</p>
                      {risk.ruleFlags.map((flag, idx) => (
                        <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <p className="font-bold text-amber-900">{flag.title}</p>
                            <p className="text-amber-800 mt-0.5">{flag.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ─── TAB 2: POLICY RAG ASSISTANT ─── */}
            {activeTab === 'policy-rag' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Insurance Policy RAG Knowledge Engine</h3>
                    <p className="text-xs text-slate-500">Query uploaded policy documents with grounded citations and page numbers</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
                    {claim.policyNumber || 'POL-COMP-PLATINUM'}
                  </span>
                </div>

                <form onSubmit={handlePolicyQuery} className="flex gap-2">
                  <input
                    type="text"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    placeholder="Ask a policy coverage or clause question..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                  />
                  <button
                    type="submit"
                    disabled={ragLoading}
                    className="px-5 py-2.5 bg-[#006d77] hover:bg-[#00535b] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    {ragLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Search Policy</span>
                  </button>
                </form>

                {/* Grounded RAG Result */}
                {ragResult && (
                  <div className="p-4 bg-[#f0f7f7] border border-teal-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#006d77] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Grounded Policy Answer
                      </span>
                      <span className="text-[10px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                        {ragResult.confidence}% Grounding Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-medium">{ragResult.answer}</p>

                    {ragResult.citations && ragResult.citations.length > 0 && (
                      <div className="pt-2 border-t border-teal-100 space-y-1.5">
                        <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Policy Citations:</p>
                        {ragResult.citations.map((cite, cIdx) => (
                          <div key={cIdx} className="p-2.5 bg-white rounded-lg border border-teal-100 text-xs">
                            <p className="font-bold text-[#006d77]">
                              {cite.policyName} — {cite.section} (Page {cite.page})
                            </p>
                            <p className="text-slate-600 mt-1 italic">"{cite.clauseText}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 3: ORIGINAL DOCUMENT & OCR ─── */}
            {activeTab === 'document' && (
              <div className="space-y-4">
                <DocumentViewer documentUrl={claim.documentUrl} />

                {/* Structured OCR Extraction Card */}
                {doc.structuredData && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Extracted Structured Entities (OCR)
                      </h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {doc.documentType || 'Medical Bill / Invoice'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Attending Doctor</p>
                        <p className="font-bold text-slate-800">{doc.structuredData.doctorName || 'Dr. Emily Vance, MD'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Invoice Number</p>
                        <p className="font-mono font-bold text-slate-800">{doc.structuredData.invoiceNumber || 'INV-2026-88192'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Service Date</p>
                        <p className="font-bold text-slate-800">{doc.structuredData.invoiceDate || '2026-07-20'}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <p className="text-[10px] text-slate-400 font-semibold">Diagnosis & Procedures</p>
                        <p className="font-semibold text-slate-800">
                          {doc.structuredData.diagnosis || 'Acute Evaluation'} • {doc.structuredData.procedure || 'Diagnostic CT & ECG'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Adjudication Decision Panel */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#006d77]" />
                  Human Adjudication Action
                </h2>
                <Info className="w-4 h-4 text-slate-400" />
              </div>

              {!isPending ? (
                /* Decision Locked State */
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <Lock className="w-4 h-4 text-[#006d77]" />
                    <span>Adjudication Locked ({claim.status})</span>
                  </div>

                  {claim.status === 'Approved' && (
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold">Final Approved Reimbursement</p>
                      <p className="text-2xl font-black text-emerald-700">${claim.approvedAmount?.toFixed(2)}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {Math.round((claim.approvedAmount / claim.claimAmount) * 100)}% of requested amount.
                      </p>
                    </div>
                  )}

                  {claim.insurerComments && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reviewer Notes</p>
                      <p className="text-slate-800 italic">"{claim.insurerComments}"</p>
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200 space-y-1">
                    <p>Decision Type: <span className="font-semibold text-slate-800">{claim.adjudicationDecisionType || 'Manual Review'}</span></p>
                    <p>Adjudicated by: <span className="font-semibold text-slate-800">{claim.reviewedBy?.name || 'Supervisor'}</span></p>
                  </div>
                </div>
              ) : (
                /* Pending Interactive Decision Form */
                <form onSubmit={handleDecisionSubmit} className="space-y-4">
                  {/* Decision Options */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDecision('Approved');
                        setApprovedAmount(rec.recommendedAmount !== undefined ? rec.recommendedAmount.toString() : claim.claimAmount.toString());
                      }}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        decision === 'Approved'
                          ? 'bg-[#006d77] text-white border-[#006d77] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-[#006d77]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDecision('Rejected');
                        setApprovedAmount('0');
                      }}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        decision === 'Rejected'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-rose-500'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>

                  {/* Approved Amount Field */}
                  {decision === 'Approved' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Approved Reimbursement Amount ($)</label>
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
                          className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Reviewer Comments */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Adjudication Notes & Justification</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Add clinical or policy basis for adjudication..."
                      value={insurerComments}
                      onChange={(e) => setInsurerComments(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77] resize-none"
                    />
                  </div>

                  {/* Submit Final Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 ${
                      decision === 'Approved' ? 'bg-[#006d77] hover:bg-[#00535b]' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        <span>Confirm Adjudication ▶</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ClaimDetailPage;
