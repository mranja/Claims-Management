import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import PatientAIChat from '../../components/PatientAIChat';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Check,
  Trash2,
  Filter,
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Claim #88192 Approved by Adjudicator',
    description: 'Your reimbursement claim for Emergency ER Visit & Blood Work has been approved for $1,250.00.',
    category: 'CLAIMS',
    timestamp: '10 minutes ago',
    unread: true,
    claimId: 'claim-1',
  },
  {
    id: 2,
    title: 'OCR Extraction Completed',
    description: 'Your uploaded receipt for Routine Preventive Dental Cleaning was parsed with 96% confidence.',
    category: 'DOCUMENTS',
    timestamp: '2 hours ago',
    unread: true,
    claimId: 'claim-2',
  },
  {
    id: 3,
    title: 'Policy Annual Deductible Satisfied',
    description: 'You have fulfilled your annual individual deductible ($200.00) under ClaimsCare Platinum plan.',
    category: 'POLICY',
    timestamp: '1 day ago',
    unread: false,
    claimId: null,
  },
  {
    id: 4,
    title: 'Welcome to ClaimsCare Health Portal',
    description: 'Your patient account has been verified. You can now submit claims and chat with ClaimsCare AI.',
    category: 'SYSTEM',
    timestamp: '3 days ago',
    unread: false,
    claimId: null,
  },
];

const PatientNotificationsPage = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const toggleRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'UNREAD') return n.unread;
    if (activeFilter === 'CLAIMS') return n.category === 'CLAIMS';
    if (activeFilter === 'DOCUMENTS') return n.category === 'DOCUMENTS';
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <SidebarLayout title="Notifications" breadcrumb="Notification Feed">
      <div className="max-w-3xl w-full mx-auto space-y-6 font-['Manrope',sans-serif]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Centralized alerts for claim status transitions, OCR processing, and benefit approvals.
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all self-start sm:self-auto"
          >
            <Check className="w-4 h-4 text-[#006d77]" />
            <span>Mark All as Read</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex gap-2 overflow-x-auto no-scrollbar">
          {['ALL', 'UNREAD', 'CLAIMS', 'DOCUMENTS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === tab
                  ? 'bg-[#006d77] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
              <Bell className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Notifications</p>
              <p className="text-xs text-slate-400">You're all caught up with your healthcare alerts.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  item.unread
                    ? 'bg-white border-teal-200 shadow-sm'
                    : 'bg-white/80 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                      item.unread
                        ? 'bg-teal-50 text-[#006d77]'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-[#006d77]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{item.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                      <span>•</span>
                      <span className="font-semibold uppercase tracking-wider">{item.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => toggleRead(item.id)}
                    title={item.unread ? 'Mark as read' : 'Mark as unread'}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteNotification(item.id)}
                    title="Dismiss"
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <PatientAIChat />
    </SidebarLayout>
  );
};

export default PatientNotificationsPage;
