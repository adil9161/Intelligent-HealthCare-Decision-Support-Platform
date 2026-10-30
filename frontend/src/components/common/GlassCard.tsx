import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'red' | 'emerald' | 'coral' | 'teal' | 'none';
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  onClick,
}) => {
  const glowClasses = {
    none: '',
    cyan: 'hover:shadow-md dark:hover:shadow-glow-cyan border-clinical-500/20 dark:border-clinical-500/30',
    red: 'hover:shadow-md dark:hover:shadow-glow-red border-red-500/20 dark:border-red-500/30',
    emerald: 'hover:shadow-md dark:hover:shadow-glow-emerald border-emerald-500/20 dark:border-emerald-500/30',
    coral: 'hover:shadow-md dark:hover:shadow-glow-coral border-coral-500/20 dark:border-coral-500/30',
    teal: 'hover:shadow-md dark:hover:shadow-glow-teal border-teal-500/20 dark:border-teal-500/30',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/70 border border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-glass transition-all duration-300 ${glowClasses[glow]} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/[0.01] dark:from-white/[0.04] to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
