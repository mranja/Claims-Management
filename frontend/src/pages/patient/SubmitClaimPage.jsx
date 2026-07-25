import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { claimsApi } from '../../services/api';
import SidebarLayout from '../../components/SidebarLayout';
import { FileUp, FileText, User, Mail, AlertCircle, UploadCloud, X, CheckCircle2, ArrowLeft } from 'lucide-react';

const SubmitClaimPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
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
      setValidationError('Please provide a claim description / diagnosis details.');
      return;
    }
    if (!file) {
      setValidationError('Please upload supporting documentation (receipt or prescription).');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
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
      <div className="max-w-2xl w-full mx-auto space-y-5">

        {/* Page Title */}
        <div>
          <Link
            to="/patient/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#005a60] transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Claims</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Submit a Claim
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Precision medical reimbursement processing for providers.
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Claim Submitted Successfully!</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Your claim for <span className="font-bold text-[#005a60]">${parseFloat(claimAmount).toFixed(2)}</span> has been registered and is now under review by the insurer.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/patient/dashboard"
                className="px-5 py-2.5 bg-[#005a60] hover:bg-[#00474c] text-white text-xs font-bold rounded-full shadow-sm transition-all"
              >
                View My Claims
              </Link>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full border border-slate-200 transition-all"
              >
                Submit Another
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
            {/* Errors */}
            {(validationError || serverError) && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{validationError || serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Patient Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Patient Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005a60] transition-all"
                  />
                </div>
              </div>

              {/* Claim Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Claim Amount (USD)
                </label>
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
                    className="w-full pl-8 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005a60] transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Details / Diagnosis Description
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Provide clinical justification details for this claim..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005a60] transition-all resize-none"
                />
              </div>

              {/* Supporting Documentation Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Supporting Documentation (PDF, PNG, JPG — max 5MB)
                </label>

                {!file ? (
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-[#005a60] rounded-xl p-6 text-center transition-all bg-slate-50 group cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#005a60] mx-auto mb-2 transition-colors" />
                    <p className="text-xs font-semibold text-slate-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supports PDF, PNG, JPG up to 5MB
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#005a60]/5 border border-[#005a60]/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#005a60]/10 text-[#005a60]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-xs">{file.name}</p>
                        <p className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
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
              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  to="/patient/dashboard"
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#005a60] hover:bg-[#00474c] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      <span>Submit Claim</span>
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
