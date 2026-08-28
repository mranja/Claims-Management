import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import {
  Layers,
  Search,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const InsurerClaimComparisonPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimsApi.getAllClaims();
      const list = res.data || [];
      setClaims(list);
      // Auto-select first two claims for instant comparison
      if (list.length >= 2) {
        setSelectedIds([list[0]._id, list[1]._id]);
      } else if (list.length === 1) {
        setSelectedIds([list[0]._id]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load claims for comparison.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const toggleClaimSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert('You can compare up to 3 claims simultaneously.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedClaims = claims.filter((c) => selectedIds.includes(c._id));

  // Check for suspicious similarities
  const isDuplicateAmount =
    selectedClaims.length >= 2 &&
    selectedClaims.every((c) => Math.abs(c.claimAmount - selectedClaims[0].claimAmount) < 1);

  const isSameHospital =
    selectedClaims.length >= 2 &&
    selectedClaims.every((c) => c.hospitalName === selectedClaims[0].hospitalName);

  return (
    <SidebarLayout title="Audit & Fraud" breadcrumb="Side-by-Side Claim Comparison">
      <div className="space-y-6 font-['Manrope',sans-serif]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Claim Comparison Matrix</h1>
              <span className="text-[10px] font-bold bg-teal-50 text-[#006d77] border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#006d77]" />
                Multi-Claim Diff
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select 2 to 3 claims to compare invoices, diagnosis records, facilities, and risk signatures side-by-side.
            </p>
          </div>

          <button
            onClick={fetchClaims}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 text-[#006d77] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Claims</span>
          </button>
        </div>

        {/* Claim Selector Pills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Select Claims to Compare ({selectedIds.length}/3 selected)
            </h3>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {claims.map((claim) => {
              const isSelected = selectedIds.includes(claim._id);
              return (
                <button
                  key={claim._id}
                  onClick={() => toggleClaimSelection(claim._id)}
                  className={`p-3 rounded-xl border text-left flex-shrink-0 transition-all ${
                    isSelected
                      ? 'bg-teal-50/80 border-[#006d77] shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{claim.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    #{claim._id.slice(-6).toUpperCase()} • ${claim.claimAmount}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fraud / Anomaly Banner */}
        {selectedClaims.length >= 2 && (isDuplicateAmount || isSameHospital) && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">Potential Similarity Signatures Detected:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-800">
                {isDuplicateAmount && <li>Identical total billed dollar amounts across compared claims.</li>}
                {isSameHospital && <li>Claims originate from the exact same healthcare provider facility.</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Comparison Matrix Table */}
        {selectedClaims.length === 0 ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Claims Selected for Comparison</h3>
            <p className="text-xs text-slate-400">Select at least 2 claims from above to generate a diff.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f7f9fb] border-b border-slate-200">
                    <th className="px-5 py-4 font-extrabold text-slate-500 uppercase tracking-wider text-[10px] w-48">
                      Comparison Metric
                    </th>
                    {selectedClaims.map((c) => (
                      <th key={c._id} className="px-5 py-4 text-slate-900 font-bold">
                        <div className="flex items-center justify-between">
                          <span>Claim #{c._id.slice(-6).toUpperCase()}</span>
                          <Link
                            to={`/insurer/claims/${c._id}`}
                            className="text-[10px] text-[#006d77] hover:underline flex items-center gap-0.5"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Status */}
                  <tr>
                    <td className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[10px]">Status</td>
                    {selectedClaims.map((c) => (
                      <td key={c._id} className="px-5 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                    ))}
                  </tr>

                  {/* Patient Name */}
                  <tr>
                    <td className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[10px]">Patient Name</td>
                    {selectedClaims.map((c) => (
                      <td key={c._id} className="px-5 py-3.5 font-bold text-slate-900">
                        {c.name}
                      </td>
                    ))}
                  </tr>

                  {/* Policy Number */}
                  <tr>
                    <td className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[10px]">Policy Code</td>
                    {selectedClaims.map((c) => (
                      <td key={c._id} className="px-5 py-3.5 font-mono text-slate-700">
                        {c.policyNumber || 'POL-GEN-2026'}
                      </td>
                    ))}
                  </tr>

                  {/* Requested Amount */}
                  <tr>
                    <td className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[10px]">Requested Amount</td>
                    {selectedClaims.map((c) => (
                      <td key={c._id} className="px-5 py-3.5 font-black text-slate-900 text-sm">
                        ${c.claimAmount?.toFixed(2)}
                      </td>
                    ))}
                  </tr>

                  {/* Recommended Payout */}
                  <tr>
                    <td className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[10px]">AI Recommended Payout</td>
                    {selectedClaims.map((c) => (
                      <td key={c._id} className="px-5 py-3.5 font-extrabold text-emerald-700">
                        ${(c.adjudicationRecommendation?.recommendedAmount !== undefined ? c.adjudicationRecommendation.recommendedAmount : c.claimAmount)?.toFixed(2)}
                      </td>
                    ))}
                  </tr>

                  {/* Facility */}
                  <tr>
                    <td className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[10px]">Facility / Hospital</td>
                    {selectedClaims.map((c) => (
                      <td key={c._id} className="px-5 py-3.5 text-slate-700">
                        {c.hospitalName || 'City General Medical Center'}
                      </td>
                    ))}
                  </tr>

                  {/* Diagnosis */}
                  <tr>
                    <td className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[10px]">Diagnosis / Reason</td>
                    {selectedClaims.map((c) => (
                      <td key={c._id} className="px-5 py-3.5 text-slate-800">
                        {c.description}
                      </td>
                    ))}
                  </tr>

                  {/* Invoice Number (OCR) */}
                  <tr>
                    <td className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[10px]">OCR Invoice #</td>
                    {selectedClaims.map((c) => (
                      <td key={c._id} className="px-5 py-3.5 font-mono text-slate-700">
                        {c.documentProcessing?.structuredData?.invoiceNumber || 'INV-2026-88192'}
                      </td>
                    ))}
                  </tr>

                  {/* Risk Score */}
                  <tr>
                    <td className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[10px]">Risk Tier</td>
                    {selectedClaims.map((c) => {
                      const risk = c.riskAssessment || { riskScore: 12, riskLevel: 'LOW' };
                      return (
                        <td key={c._id} className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              risk.riskLevel === 'LOW'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : risk.riskLevel === 'MEDIUM'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            <ShieldAlert className="w-3 h-3" />
                            {risk.riskLevel} ({risk.riskScore}/100)
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default InsurerClaimComparisonPage;
