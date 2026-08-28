import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import DocumentViewer from '../../components/DocumentViewer';
import PatientAIChat from '../../components/PatientAIChat';
import {
  FileText,
  Search,
  UploadCloud,
  Eye,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Sparkles,
  FileCheck,
  FolderOpen,
} from 'lucide-react';

const PatientDocumentCenter = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [error, setError] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await claimsApi.getPatientClaims();
      setClaims(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // Map claims to document items
  const documents = claims.map((c) => {
    const docType = c.documentProcessing?.documentType || 'Medical Bill / Invoice';
    const fileName = c.documentUrl ? c.documentUrl.split('/').pop() : 'document.pdf';
    return {
      claimId: c._id,
      claimDescription: c.description,
      hospitalName: c.hospitalName || 'City General Medical Center',
      documentUrl: c.documentUrl,
      fileName,
      documentType: docType,
      submissionDate: c.submissionDate,
      ocrStatus: c.documentProcessing?.status || 'COMPLETED',
      structuredData: c.documentProcessing?.structuredData,
      amount: c.claimAmount,
    };
  });

  const categories = ['ALL', 'Medical Bill / Invoice', 'Prescription', 'Diagnostic Report', 'Receipt'];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'ALL' || doc.documentType === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      doc.fileName.toLowerCase().includes(q) ||
      doc.claimDescription.toLowerCase().includes(q) ||
      doc.hospitalName.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <SidebarLayout title="Documents" breadcrumb="Patient Document Center">
      <div className="space-y-6 font-['Manrope',sans-serif]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Document Center</h1>
              <span className="text-[10px] font-bold bg-teal-50 text-[#006d77] border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#006d77]" />
                OCR Indexed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Centralized repository for all medical bills, prescriptions, diagnostic scans, and proof of payment.
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
              <UploadCloud className="w-4 h-4" />
              <span>Upload New Document</span>
            </Link>
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents by file name, clinical condition, or hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
            />
          </div>

          {/* Categories Pill Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#006d77] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Files' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Documents Grid */}
        {loading ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-[#006d77] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Scanning patient document archive...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Documents Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload invoices or prescriptions to see them indexed in your Document Center.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc, idx) => (
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
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{doc.claimDescription}</p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1 text-slate-600">
                    <p>
                      <strong className="text-slate-800">Facility:</strong> {doc.hospitalName}
                    </p>
                    <p>
                      <strong className="text-slate-800">Claim Amount:</strong> ${doc.amount?.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Uploaded on {new Date(doc.submissionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/patient/claims/${doc.claimId}`}
                    className="text-xs font-bold text-[#006d77] hover:underline"
                  >
                    View Claim
                  </Link>

                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview File</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedDoc.fileName}</h3>
                <p className="text-xs text-slate-500">{selectedDoc.documentType}</p>
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

      <PatientAIChat />
    </SidebarLayout>
  );
};

export default PatientDocumentCenter;
