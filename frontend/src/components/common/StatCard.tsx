import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accent?: 'blue' | 'coral' | 'amber' | 'teal';
  glow?: 'cyan' | 'red' | 'emerald' | 'none';
  alert?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  accent = 'teal',
  alert = false,
}) => {
  const accentConfig = {
    blue: {
      border: 'border-l-4 border-l-blue-500 border-gray-200 dark:border-slate-800',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50',
      hoverGlow: 'hover:border-blue-300 dark:hover:border-blue-700/60',
    },
    coral: {
      border: 'border-l-4 border-l-rose-500 border-gray-200 dark:border-slate-800',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50',
      hoverGlow: 'hover:border-rose-300 dark:hover:border-rose-700/60',
    },
    amber: {
      border: 'border-l-4 border-l-amber-500 border-gray-200 dark:border-slate-800',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
      hoverGlow: 'hover:border-amber-300 dark:hover:border-amber-700/60',
    },
    teal: {
      border: 'border-l-4 border-l-teal-600 border-gray-200 dark:border-slate-800',
      iconBg: 'bg-teal-50 text-teal-700 border border-teal-100 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/50',
      hoverGlow: 'hover:border-teal-300 dark:hover:border-teal-700/60',
    },
  };

  const currentAccent = alert ? accentConfig.coral : accentConfig[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-[18px] bg-white dark:bg-slate-900/80 p-5 shadow-sm hover:shadow-card-hover transition-all duration-200 ${currentAccent.border} ${currentAccent.hoverGlow}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1 pr-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#526176] dark:text-slate-400">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#172033] dark:text-white font-sans">
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  trend.isPositive
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800'
                    : 'text-rose-700 bg-rose-50 border border-rose-200 dark:text-rose-300 dark:bg-rose-950/50 dark:border-rose-800'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-[#8492A6] dark:text-slate-400 font-normal">
              {subtext}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl transition-transform duration-200 group-hover:scale-105 shrink-0 ${
            alert ? 'animate-pulse' : ''
          } ${currentAccent.iconBg}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

