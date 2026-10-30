import React from 'react';
import { ResourceAlert } from '../../types';
import { AlertTriangle, AlertOctagon, BellRing, ArrowRight } from 'lucide-react';

interface ShortageAlertBannerProps {
  alerts: ResourceAlert[];
  onOpenRestock?: (resourceId: string) => void;
}

export const ShortageAlertBanner: React.FC<ShortageAlertBannerProps> = ({
  alerts,
  onOpenRestock,
}) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => {
        const isCritical = alert.severity === 'CRITICAL';
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
              isCritical
                ? 'bg-rose-50 border-rose-200 text-rose-900 shadow-sm dark:bg-red-950/60 dark:border-red-500/50 dark:text-red-200 dark:shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'bg-amber-50 border-amber-200 text-amber-900 shadow-sm dark:bg-amber-950/50 dark:border-amber-500/40 dark:text-amber-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl border mt-0.5 ${
                  isCritical ? 'bg-rose-100 border-rose-300 text-rose-600 dark:bg-red-500/20 dark:border-red-500/40 dark:text-red-400' : 'bg-amber-100 border-amber-300 text-amber-600 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-400'
                }`}
              >
                {isCritical ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider font-mono">
                    [{alert.code}]
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white/70 dark:bg-black/40 border border-current font-bold">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold mt-1 leading-snug text-gray-900 dark:text-white">
                  {alert.message}
                </p>
              </div>
            </div>

            {alert.resource_id && onOpenRestock && (
              <button
                onClick={() => onOpenRestock(alert.resource_id!)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl font-bold text-xs border transition-colors flex items-center gap-1.5 ${
                  isCritical
                    ? 'bg-red-600 hover:bg-red-500 text-white border-red-400'
                    : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400'
                }`}
              >
                <span>Restock Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

