import React from 'react';

export function Badge({ type, label, size = 'md' }) {
  const normalized = (type || label || '').toUpperCase();

  const styles = {
    LOST: 'bg-rose-50 text-rose-700 border-rose-200',
    FOUND: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ACTIVE: 'bg-blue-50 text-blue-700 border-blue-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-slate-100 text-slate-600 border-slate-300',
    CLAIMED: 'bg-purple-50 text-purple-700 border-purple-200',
    RETURNED: 'bg-teal-50 text-teal-700 border-teal-200',
    RESOLVED: 'bg-slate-100 text-slate-700 border-slate-300',
    POTENTIAL: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    ADMIN: 'bg-indigo-900 text-white border-transparent',
    STUDENT: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const styleClass = styles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs tracking-wide';

  return (
    <span className={`inline-flex items-center font-medium rounded border ${sizeClass} ${styleClass}`}>
      {label || normalized}
    </span>
  );
}
