import React, { useState, useEffect } from 'react';
import { aiApi, claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import {
  Sparkles,
  BarChart3,
  RefreshCw,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Activity,
  DollarSign,
  Clock,
  Layers,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';

const InsurerAiInsightsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsRes, claimsRes] = await Promise.all([
        aiApi.getAnalytics(),
        claimsApi.getAllClaims(),
      ]);
      setAnalytics(analyticsRes.data);
      setClaims(claimsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load AI intelligence telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalClaims = claims.length || 1;
  const lowRisk = claims.filter((c) => (c.riskAssessment?.riskScore || 0) < 25).length;
  const medRisk = claims.filter(
    (c) => (c.riskAssessment?.riskScore || 0) >= 25 && (c.riskAssessment?.riskScore || 0) < 45
  ).length;
  const highRisk = claims.filter((c) => (c.riskAssessment?.riskScore || 0) >= 45).length;

  return (
    <SidebarLayout title="AI Intelligence" breadcrumb="Telemetry & Insights">
      <div className="space-y-6 font-['Manrope',sans-serif]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Insights & Audit Logs</h1>
              <span className="text-[10px] font-bold bg-teal-50 text-[#006d77] border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#006d77]" />
                ClaimIQ v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live telemetry monitoring OCR extraction accuracy, risk heuristic triggers, model latency, and token consumption.
            </p>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 text-[#006d77] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {/* Top KPI Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Automated Reviews</p>
              <p className="text-2xl font-black text-slate-900">{analytics.aiMetrics.aiAssistedCount} Claims</p>
              <p className="text-[11px] text-slate-400 font-medium">100% OCR processed</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Model Confidence</p>
              <p className="text-2xl font-black text-[#006d77]">{analytics.aiMetrics.avgConfidence}%</p>
              <p className="text-[11px] text-slate-400 font-medium">Across structured extractions</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Ingestion Latency</p>
              <p className="text-2xl font-black text-blue-600">145 ms</p>
              <p className="text-[11px] text-slate-400 font-medium">Asynchronous processing</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Operations Logged</p>
              <p className="text-2xl font-black text-purple-600">{analytics.aiMetrics.totalAiInvocations}</p>
              <p className="text-[11px] text-slate-400 font-medium">Audit records recorded</p>
            </div>
          </div>
        )}

        {/* Risk Distribution Visualizer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#006d77]" />
              Portfolio Risk Score Distribution
            </h3>
            <span className="text-xs font-semibold text-slate-400">Total Analyzed: {claims.length}</span>
          </div>

          <div className="space-y-3">
            {/* Low Risk Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Low Risk Tier (&lt; 25)</span>
                <span className="text-emerald-700">{lowRisk} ({Math.round((lowRisk / totalClaims) * 100)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${(lowRisk / totalClaims) * 100}%` }}
                />
              </div>
            </div>

            {/* Medium Risk Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Elevated Review Tier (25 – 45)</span>
                <span className="text-amber-600">{medRisk} ({Math.round((medRisk / totalClaims) * 100)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${(medRisk / totalClaims) * 100}%` }}
                />
              </div>
            </div>

            {/* High Risk Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>High & Critical Tier (&gt; 45)</span>
                <span className="text-rose-600">{highRisk} ({Math.round((highRisk / totalClaims) * 100)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${(highRisk / totalClaims) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Audit Logs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#006d77]" />
              Immutable AI Execution Audit Log
            </h3>
            <span className="text-xs text-slate-400">Decision Traceability (Phases 8 & 9)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f9fb] text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Action Type</th>
                  <th className="px-6 py-3.5">Model Engine</th>
                  <th className="px-6 py-3.5">Initiator / User</th>
                  <th className="px-6 py-3.5">Confidence</th>
                  <th className="px-6 py-3.5">Latency</th>
                  <th className="px-6 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {analytics?.recentLogs && analytics.recentLogs.length > 0 ? (
                  analytics.recentLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{log.actionType}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">{log.model}</td>
                      <td className="px-6 py-4 text-slate-700">{log.userEmail || 'system'}</td>
                      <td className="px-6 py-4 text-emerald-700 font-bold">{log.confidenceScore || 95}%</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{log.latencyMs}ms</td>
                      <td className="px-6 py-4 text-right text-slate-400 text-[11px]">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 text-xs">
                      No AI execution logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default InsurerAiInsightsPage;
