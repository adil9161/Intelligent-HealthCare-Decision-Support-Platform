import React from 'react';

interface TriageScoreBadgeProps {
  score?: number; // 0.0 to 100.0
  severity?: number; // 1 to 10
  urgency?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TriageScoreBadge: React.FC<TriageScoreBadgeProps> = ({
  score = 75,
  severity = 5.0,
  urgency = 'Urgent',
  size = 'md',
}) => {
  const isEmergency = urgency === 'Emergency' || severity >= 8.5 || score >= 90;
  const isUrgent = urgency === 'Urgent' || severity >= 6.0;

  const colorClass = isEmergency
    ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
    : isUrgent
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    : 'bg-clinical-500/20 text-clinical-300 border-clinical-500/40';

  const sizeClass = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-mono font-bold tracking-tight ${colorClass} ${sizeClass}`}
      title={`AI Decision Score: ${score.toFixed(1)}% | Clinical Severity: ${severity.toFixed(1)}/10`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isEmergency ? 'bg-red-400 animate-ping' : 'bg-current'}`} />
      <span>{score.toFixed(1)}%</span>
    </span>
  );
};

