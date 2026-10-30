import React, { useState, useMemo } from 'react';
import { ResourceAlert } from '../../types';
import { GlassCard } from '../common/GlassCard';
import {
  AlertTriangle,
  Flame,
  X,
  ChevronDown,
  ChevronUp,
  PackagePlus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface ResourceToastStackProps {
  alerts: ResourceAlert[];
  onOpenRestock: (resourceId: string) => void;
  onSelectResource?: (resourceId: string) => void;
}

export const ResourceToastStack: React.FC<ResourceToastStackProps> = ({
  alerts,
  onOpenRestock,
  onSelectResource,
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter out dismissed alerts and sort strictly by severity: CRITICAL first, then WARNING
  const activeAlerts = useMemo(() => {
    const remaining = alerts.filter(
      (a) => !dismissedIds.includes(a.resource_id || a.code)
    );

    const severityWeight: Record<string, number> = {
      CRITICAL: 0,
      WARNING: 1,
    };

    return [...remaining].sort(
      (a, b) =>
        (severityWeight[a.severity] ?? 2) - (severityWeight[b.severity] ?? 2)
    );
  }, [alerts, dismissedIds]);

  if (activeAlerts.length === 0) return null;

  const criticalCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = activeAlerts.filter((a) => a.severity === 'WARNING').length;

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => [...prev, id]);
  };

  const handleDismissAll = () => {
    setDismissedIds(activeAlerts.map((a) => a.resource_id || a.code));
  };

  return (
    <aside aria-label="Shortage alerts" className="fixed top-20 right-4 z-40 max-w-sm sm:max-w-md w-full pointer-events-none space-y-2 select-none">
      {/* Toast Stack Header Pill */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/95 dark:bg-midnight-950/95 border border-gray-200 dark:border-slate-700 shadow-xl backdrop-blur-md pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 dark:bg-coral-500/20 dark:text-coral-400 dark:border-coral-500/40 flex items-center justify-center">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>Predictive Shortage Alert Stack</span>
              {criticalCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-coral-500 text-white font-mono text-[10px] font-black">
                  {criticalCount} Critical
                </span>
              )}
            </span>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">
              Sorted by severity • Non-blocking notification stack
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Alert Stack' : 'Collapse Alert Stack'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDismissAll}
            className="p-1.5 rounded-lg text-gray-400 hover:text-coral-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-coral-400 dark:hover:bg-slate-800 transition-colors"
            title="Dismiss All Alerts"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Toast Stack (Scrollable, Max 3 items visible) */}
      {!isCollapsed && (
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {activeAlerts.map((alert, idx) => {
            const isCritical = alert.severity === 'CRITICAL';
            const alertId = alert.resource_id || alert.code || String(idx);

            return (
              <div
                key={alertId}
                className={`p-3.5 rounded-2xl backdrop-blur-md border shadow-lg pointer-events-auto transition-all animate-in fade-in slide-in-from-right-4 duration-200 ${
                  isCritical
                    ? 'bg-white border-rose-300 dark:bg-midnight-950/95 dark:border-coral-500/60 shadow-md'
                    : 'bg-white border-amber-300 dark:bg-midnight-950/95 dark:border-amber-500/60 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-full uppercase border ${
                        isCritical
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-coral-500/20 dark:text-coral-300 dark:border-coral-500/40'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                      {alert.resource_name}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDismiss(alertId, e)}
                    className="text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Reason Message */}
                <p className="text-[11px] text-gray-700 dark:text-slate-300 mt-1.5 leading-snug">
                  {alert.message}
                </p>

                {/* Suggested Clinical Action */}
                {alert.suggested_action && (
                  <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300 space-y-0.5">
                    <span className="font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
                      Suggested Action:
                    </span>
                    <span>{alert.suggested_action}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400">
                    {alert.predicted_exhaustion_hours !== undefined
                      ? `${alert.predicted_exhaustion_hours}h to depletion`
                      : 'Threshold Breached'}
                  </span>

                  <div className="flex items-center gap-2">
                    {alert.resource_id && (
                      <button
                        onClick={() => onOpenRestock(alert.resource_id!)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                          isCritical
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                        }`}
                      >
                        <PackagePlus className="w-3 h-3" />
                        <span>Restock</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};

