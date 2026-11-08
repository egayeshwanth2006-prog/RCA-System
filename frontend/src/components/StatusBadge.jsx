import React from 'react';

export const StatusBadge = ({ status, type = 'status', size = 'sm' }) => {
  if (!status) return null;

  const s = String(status).toLowerCase();
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  // Investigation / CAPA status
  if (['draft', 'pending'].includes(s)) {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['under investigation', 'in progress'].includes(s)) {
    colorStyles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['completed', 'approved', 'obtained'].includes(s)) {
    colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['overdue', 'ruled out'].includes(s)) {
    colorStyles = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  // Severity / Priority
  if (type === 'severity' || type === 'priority') {
    if (s === 'critical') {
      colorStyles = 'bg-red-50 text-red-700 border-red-300 font-semibold';
    } else if (s === 'high' || s === 'major') {
      colorStyles = 'bg-orange-50 text-orange-700 border-orange-200';
    } else if (s === 'medium') {
      colorStyles = 'bg-sky-50 text-sky-700 border-sky-200';
    } else if (s === 'low' || s === 'minor') {
      colorStyles = 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  // Evidence Status
  if (type === 'evidence') {
    if (s.includes('supported by evidence')) {
      colorStyles = 'bg-teal-50 text-teal-800 border-teal-300';
    } else if (s.includes('partially')) {
      colorStyles = 'bg-amber-50 text-amber-800 border-amber-300';
    } else if (s.includes('unverified') || s.includes('hypothesis')) {
      colorStyles = 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (s.includes('ruled out')) {
      colorStyles = 'bg-slate-100 text-slate-500 line-through border-slate-200';
    }
  }

  const sizeClasses = size === 'xs' 
    ? 'text-[10px] px-1.5 py-0.5' 
    : size === 'md' 
    ? 'text-xs px-2.5 py-1 font-medium' 
    : 'text-xs px-2 py-0.5 font-medium';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses} ${colorStyles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
