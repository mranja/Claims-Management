import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import {
  FileUp,
  FileText,
  User,
  Mail,
  AlertCircle,
  UploadCloud,
  X,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Shield,
  Sparkles,
} from 'lucide-react';

const SubmitClaimPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [hospitalName, setHospitalName] = useState('City General Medical Center');
  const [policyNumber, setPolicyNumber] = useState(user?.policyNumber || 'POL-COMP-PLATINUM');
  const [claimAmount, setClaimAmount] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const [validationError, setValidationError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setValidationError('File size exceeds 5MB limit.');
        return;
      }
      setValidationError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setServerError('');

    if (!claimAmount || parseFloat(claimAmount) <= 0) {
      setValidationError('Please enter a valid claim amount greater than $0.00');
      return;
    }
    if (!description.trim()) {
      setValidationError('Please provide a clinical description / diagnosis details.');
      return;
    }
    if (!file) {
      setValidationError('Please upload supporting documentation (receipt, invoice, or prescription).');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('hospitalName', hospitalName);
      formData.append('policyNumber', policyNumber);
      formData.append('claimAmount', claimAmount);
      formData.append('description', description);
      formData.append('file', file);

      await claimsApi.submitClaim(formData);
      setSuccess(true);
    } catch (err) {
      setServerError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setClaimAmount('');
    setDescription('');
    setFile(null);
    setValidationError('');
    setServerError('');
  };

  return (
    <SidebarLayout title="Claims" breadcrumb="New Submission">
      <div className="max-w-2xl w-full mx-auto space-y-5 font-['Manrope',sans-serif]">
        {/* Page Title */}
        <div>
          <Link
            to="/patient/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#006d77] transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Claims Queue</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Submit Medical Claim
            </h1>
            <span className="text-[10px] font-bold bg-teal-50 text-[#006d77] border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#006d77]" />
              AI Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated OCR extraction, consistency checking, and benefits estimation.
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Claim Processed & Registered!</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your claim for <span className="font-bold text-[#006d77]">${parseFloat(claimAmount).toFixed(2)}</span> has undergone initial OCR verification and is now queued for insurer adjudication.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/patient/dashboard"
                className="px-5 py-2.5 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                View My Claims
              </Link>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
              >
                Submit Another Claim
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            {/* Errors */}
            {(validationError || serverError) && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{validationError || serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Patient Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Patient legal name"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                  />
                </div>
              </div>

              {/* Facility & Policy Number Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Healthcare Facility / Provider</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="e.g. City General Medical Center"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Policy / Member ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      placeholder="e.g. POL-COMP-PLATINUM"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                    />
                  </div>
                </div>
              </div>

              {/* Claim Amount */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Claim Requested Amount (USD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                    $
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Clinical Justification & Diagnosis</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Provide diagnosis, symptom summary, or reason for emergency visit..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d77] resize-none"
                />
              </div>

              {/* Supporting Documentation Upload */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Supporting Documentation (Itemized Bill, Receipt, or Prescription)
                </label>

                {!file ? (
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-[#006d77] rounded-xl p-6 text-center transition-all bg-slate-50 group cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#006d77] mx-auto mb-2 transition-colors" />
                    <p className="text-xs font-bold text-slate-700">Click to upload or drag & drop</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF, PNG, JPG up to 5MB</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#006d77]/5 border border-[#006d77]/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#006d77]/10 text-[#006d77]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-xs">{file.name}</p>
                        <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB • Ready for OCR</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <Link
                  to="/patient/dashboard"
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#006d77] hover:bg-[#00535b] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      <span>Submit Claim for AI Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default SubmitClaimPage;
