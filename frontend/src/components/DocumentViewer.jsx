import React from 'react';
import { FileText, ExternalLink, Download, Image as ImageIcon } from 'lucide-react';

const DocumentViewer = ({ documentUrl }) => {
  if (!documentUrl) {
    return (
      <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs">
        No document attached to this claim.
      </div>
    );
  }

  const fullUrl = documentUrl.startsWith('http') ? documentUrl : documentUrl;
  const isPdf = documentUrl.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(documentUrl);

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          {isPdf ? (
            <FileText className="w-4 h-4 text-rose-500" />
          ) : (
            <ImageIcon className="w-4 h-4 text-blue-500" />
          )}
          <span>Supporting Documentation</span>
        </div>

        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#005a60] bg-[#005a60]/10 hover:bg-[#005a60]/20 border border-[#005a60]/30 rounded-xl transition-all"
        >
          <span>View Document</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center min-h-[250px] max-h-[400px]">
        {isPdf ? (
          <iframe
            src={fullUrl}
            title="Document Preview"
            className="w-full h-[350px] border-0"
          />
        ) : isImage ? (
          <img
            src={fullUrl}
            alt="Claim Document"
            className="max-w-full max-h-[350px] object-contain p-2"
          />
        ) : (
          <div className="p-8 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 font-semibold">Document attached (DOC/DOCX)</p>
            <a
              href={fullUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Document
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
