import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import {
  User,
  Search,
  Mail,
  Shield,
  FileText,
  DollarSign,
  Calendar,
  RefreshCw,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react';

const InsurerPatientDirectoryPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await usersApi.getAllPatients();
      setPatients(res.data?.patients || []);
    } catch (err) {
      setError(err.message || 'Failed to load patient directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filtered = patients.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.policyNumber?.toLowerCase().includes(q)
    );
  });

  const totalPatients = patients.length;
  const totalClaimsAcrossPatients = patients.reduce((sum, p) => sum + (p.totalClaims || 0), 0);
  const totalBilled = patients.reduce((sum, p) => sum + (p.totalClaimed || 0), 0);
  const totalReimbursed = patients.reduce((sum, p) => sum + (p.totalApproved || 0), 0);

  return (
    <SidebarLayout title="Directory" breadcrumb="Patient Registry">
      <div className="space-y-6 font-['Manrope',sans-serif]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Directory</h1>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {totalPatients} Members
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Search member identities, review policy enrollment, and inspect aggregated claim payout histories.
            </p>
          </div>

          <button
            onClick={fetchPatients}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 text-[#006d77] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Patients</p>
            <p className="text-2xl font-black text-slate-900">{totalPatients}</p>
            <p className="text-[11px] text-slate-400 font-medium">Enrolled member accounts</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Claims Filed</p>
            <p className="text-2xl font-black text-slate-900">{totalClaimsAcrossPatients}</p>
            <p className="text-[11px] text-slate-400 font-medium">Historical submissions</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Claim Volume</p>
            <p className="text-2xl font-black text-blue-600">${totalBilled.toFixed(2)}</p>
            <p className="text-[11px] text-slate-400 font-medium">Total requested benefits</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Approved Payouts</p>
            <p className="text-2xl font-black text-emerald-700">${totalReimbursed.toFixed(2)}</p>
            <p className="text-[11px] text-slate-400 font-medium">Reimbursed to members</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients by name, email, or policy member ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Patient Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#006d77] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading patient registry...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Patients Found</h3>
              <p className="text-xs text-slate-400">No patient accounts match your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f7f9fb] text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Patient Details</th>
                    <th className="px-6 py-3.5">Policy Number</th>
                    <th className="px-6 py-3.5">Total Claims</th>
                    <th className="px-6 py-3.5">Pending Review</th>
                    <th className="px-6 py-3.5">Total Claimed</th>
                    <th className="px-6 py-3.5">Total Approved</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{patient.name}</p>
                        <p className="text-[11px] text-slate-500">{patient.email}</p>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-slate-700">
                        {patient.policyNumber || 'POL-COMP-PLATINUM'}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900">
                        {patient.totalClaims}
                      </td>

                      <td className="px-6 py-4">
                        {patient.pendingClaims > 0 ? (
                          <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                            {patient.pendingClaims} Pending
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900">
                        ${patient.totalClaimed?.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 font-extrabold text-emerald-700">
                        ${patient.totalApproved?.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
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

      {/* Patient Profile Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#006d77] text-white flex items-center justify-center font-bold text-sm">
                  {selectedPatient.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-500">{selectedPatient.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Policy ID</p>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{selectedPatient.policyNumber || 'POL-GEN-2026'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Account Role</p>
                <p className="font-bold text-[#006d77] mt-0.5 capitalize">{selectedPatient.role}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Claims Filed</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedPatient.totalClaims} Claims</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Reimbursed Payouts</p>
                <p className="font-extrabold text-emerald-700 mt-0.5">${selectedPatient.totalApproved?.toFixed(2)}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default InsurerPatientDirectoryPage;
