import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'Approved': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'Rejected': return <XCircle className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  // Map to display labels matching ClaimsCare UI
  const labelMap = {
    Approved: 'Approved',
    Rejected: 'Rejected',
    Pending: 'Under Review',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${getStyle()}`}>
      {getIcon()}
      {labelMap[status] || status}
    </span>
  );
};

export default StatusBadge;
