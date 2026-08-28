import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import DocumentViewer from '../../components/DocumentViewer';
import {
  FileSearch,
  Search,
  Eye,
  RefreshCw,
  FileText,
  Building2,
  Calendar,
  Sparkles,
  Layers,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';

const InsurerDocumentCenterPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [error, setError] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimsApi.getAllClaims();
      setClaims(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load claims documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const documents = claims.map((c) => {
    const docType = c.documentProcessing?.documentType || 'Medical Bill / Invoice';
    const fileName = c.documentUrl ? c.documentUrl.split('/').pop() : 'document.pdf';
    return {
      claimId: c._id,
      patientName: c.name,
      patientEmail: c.email,
      hospitalName: c.hospitalName || 'City General Medical Center',
      description: c.description,
      amount: c.claimAmount,
      documentUrl: c.documentUrl,
      fileName,
      documentType: docType,
      confidence: c.documentProcessing?.classificationConfidence || 95,
      date: c.submissionDate,
      ocrStatus: c.documentProcessing?.status || 'COMPLETED',
    };
  });

  const types = ['ALL', 'Medical Bill / Invoice', 'Prescription', 'Diagnostic Report', 'Receipt'];

  const filtered = documents.filter((doc) => {
    const matchesType = selectedType === 'ALL' || doc.documentType === selectedType;
    if (!searchQuery) return matchesType;
    const q = searchQuery.toLowerCase();
    return (
      matchesType &&
      (doc.patientName?.toLowerCase().includes(q) ||
        doc.hospitalName?.toLowerCase().includes(q) ||
        doc.fileName?.toLowerCase().includes(q) ||
        doc.description?.toLowerCase().includes(q))
    );
  });

  return (
    <SidebarLayout title="Documents" breadcrumb="Insurer Document Repository">
      <div className="space-y-6 font-['Manrope',sans-serif]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Claim Document Repository</h1>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {documents.length} Files
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Centralized adjudication archive for all uploaded claim receipts, invoices, prescriptions, and diagnostic scans.
            </p>
          </div>

          <button
            onClick={fetchClaims}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 text-[#006d77] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Files</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name, facility, diagnosis, or file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  selectedType === t
                    ? 'bg-[#006d77] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t === 'ALL' ? 'All Document Types' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-[#006d77] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Scanning insurer document repository...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Documents Found</h3>
            <p className="text-xs text-slate-400">No claim documents match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doc, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-teal-50 text-[#006d77] rounded-xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {doc.documentType}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 truncate" title={doc.fileName}>
                      {doc.fileName}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Patient: <strong className="text-slate-800">{doc.patientName}</strong>
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1 text-slate-600">
                    <p className="truncate">
                      <strong className="text-slate-800">Facility:</strong> {doc.hospitalName}
                    </p>
                    <p>
                      <strong className="text-slate-800">Claim Amount:</strong> ${doc.amount?.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{new Date(doc.date).toLocaleDateString()}</span>
                      <span className="text-emerald-700 font-bold">OCR: {doc.confidence}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/insurer/claims/${doc.claimId}`}
                    className="text-xs font-bold text-[#006d77] hover:underline"
                  >
                    Adjudication View
                  </Link>

                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedDoc.fileName}</h3>
                <p className="text-xs text-slate-500">
                  {selectedDoc.patientName} • {selectedDoc.documentType}
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

export default InsurerDocumentCenterPage;
