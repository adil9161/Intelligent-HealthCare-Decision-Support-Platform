import React, { useState } from 'react';
import { Resource } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { X, RefreshCw, PackagePlus } from 'lucide-react';

interface RestockModalProps {
  isOpen: boolean;
  resource: Resource | null;
  onClose: () => void;
  onRestock: (resourceId: string, units: number, notes?: string) => Promise<void>;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  resource,
  onClose,
  onRestock,
}) => {
  const [unitsToAdd, setUnitsToAdd] = useState<number>(10);
  const [notes, setNotes] = useState('Emergency clinical replenishment');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unitsToAdd <= 0) return;

    setIsSubmitting(true);
    try {
      await onRestock(resource.resource_id, Number(unitsToAdd), notes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const newAvailable = Math.min(resource.total_capacity, resource.available_units + Number(unitsToAdd));
  const newAvailPct = Math.round((newAvailable / resource.total_capacity) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 dark:bg-clinical-500/20 dark:text-clinical-400 dark:border-clinical-500/40 flex items-center justify-center">
                <PackagePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Replenish Resource</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">{resource.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Current vs Projected */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <span className="text-gray-500 dark:text-slate-400">Current Stock</span>
                <p className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                  {resource.available_units} {resource.unit_measure}
                </p>
                <span className="text-[10px] text-gray-400 dark:text-slate-500">
                  ({Math.round(resource.availability_percentage)}% cap)
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400">Post-Restock</span>
                <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {newAvailable} {resource.unit_measure}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ({newAvailPct}% cap)
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                Units to Restock ({resource.unit_measure}) *
              </label>
              <input
                type="number"
                required
                min="1"
                max={resource.total_capacity}
                value={unitsToAdd}
                onChange={(e) => setUnitsToAdd(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Procurement / Restock Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-slate-700/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                {isSubmitting ? 'Updating Inventory...' : 'Confirm Restock'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

