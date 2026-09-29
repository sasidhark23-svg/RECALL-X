import React from 'react';

export function SeverityBadge({ severity }) {
  const sev = (severity || 'Medium').toLowerCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  if (sev === 'critical') {
    styles = 'bg-red-950/80 text-red-300 border-red-500/40 shadow-sm shadow-red-900/30';
  } else if (sev === 'high') {
    styles = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
  } else if (sev === 'medium') {
    styles = 'bg-yellow-950/60 text-yellow-300 border-yellow-500/30';
  } else if (sev === 'low') {
    styles = 'bg-blue-950/60 text-blue-300 border-blue-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      {severity || 'Medium'}
    </span>
  );
}

export function StatusBadge({ status }) {
  const isResolved = (status || '').toLowerCase() === 'resolved';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      isResolved
        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
        : 'bg-blue-950/60 text-blue-300 border-blue-500/30'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-emerald-400' : 'bg-blue-400 animate-ping'}`} />
      {status || 'Active'}
    </span>
  );
}
