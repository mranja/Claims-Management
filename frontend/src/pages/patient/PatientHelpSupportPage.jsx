import React, { useState } from 'react';
import SidebarLayout from '../../components/SidebarLayout';
import PatientAIChat from '../../components/PatientAIChat';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Mail,
  Phone,
  Clock,
  Shield,
  FileQuestion,
  Sparkles,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

const FAQS = [
  {
    category: 'Filing Claims',
    question: 'What documents are required to submit an insurance claim?',
    answer:
      'You will need an itemized medical bill or official tax invoice showing the patient’s full name, attending physician credentials, diagnosis, itemized services/medicines, and date of service. For pharmacy expenses, an attached doctor prescription is required.',
  },
  {
    category: 'Filing Claims',
    question: 'How quickly will my claim be reviewed?',
    answer:
      'With ClaimsCare AI-powered OCR processing, document verification occurs in real-time upon submission. An insurer adjudicator typically completes final review and authorization within 24 to 48 hours.',
  },
  {
    category: 'Reimbursement',
    question: 'How is my reimbursable payout amount calculated?',
    answer:
      'Payout is determined based on your policy benefits: Total Eligible Medical Expenses minus your annual policy deductible, then minus any coinsurance copay (e.g., 10% copay under Comprehensive Platinum plan).',
  },
  {
    category: 'Reimbursement',
    question: 'What happens if my claim is marked "Requires Info"?',
    answer:
      'If additional documentation is needed (e.g., itemized pharmacy breakdown or physician discharge note), the system flags the missing items. You can view the request on your claim page and upload the required files directly.',
  },
  {
    category: 'Policy & Deductible',
    question: 'Where can I find my active policy deductible balance?',
    answer:
      'You can check your policy terms in the Profile & Insurance section or ask the ClaimsCare AI Assistant by clicking the floating assistant button in the bottom right corner.',
  },
];

const PatientHelpSupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarLayout title="Support" breadcrumb="Help & Knowledge Base">
      <div className="max-w-4xl w-full mx-auto space-y-6 font-['Manrope',sans-serif]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#006d77] to-[#00535b] p-8 rounded-3xl text-white shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
              ClaimsCare Help Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">How can we assist your healthcare claim?</h1>
          <p className="text-xs text-teal-100 max-w-xl leading-relaxed">
            Find immediate answers regarding claim filing guidelines, eligible reimbursement rules, and document OCR verification.
          </p>

          <div className="relative max-w-lg pt-2">
            <Search className="w-4 h-4 absolute left-3.5 top-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search help articles, deductible rules, or reimbursement questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none shadow-md"
            />
          </div>
        </div>

        {/* Support Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="p-2.5 bg-teal-50 text-[#006d77] rounded-xl w-fit">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Email Adjudication Support</h4>
            <p className="text-[11px] text-slate-500">support@claimscare.healthcare</p>
            <p className="text-[10px] text-slate-400">Response within 1 business day</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Patient Helpline</h4>
            <p className="text-[11px] text-slate-500">1-800-555-CLAIMS (2524)</p>
            <p className="text-[10px] text-slate-400">Mon-Fri: 8:00 AM – 8:00 PM EST</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-fit">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Interactive AI Assistant</h4>
            <p className="text-[11px] text-slate-500">Available 24/7 in chat</p>
            <p className="text-[10px] text-slate-400">Real-time answers on active claims</p>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-[#006d77]" />
              Frequently Asked Questions
            </h3>
            <span className="text-xs font-semibold text-slate-400">{filteredFaqs.length} Articles</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 group"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#006d77] tracking-wider block mb-0.5">
                        {faq.category}
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-[#006d77] transition-colors">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#006d77]' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="pt-2.5 text-xs text-slate-600 leading-relaxed animate-in fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <PatientAIChat />
    </SidebarLayout>
  );
};

export default PatientHelpSupportPage;
