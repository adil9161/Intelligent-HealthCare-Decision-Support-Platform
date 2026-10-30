import React, { useState, useEffect } from 'react';
import { Resource } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Sliders,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface ThresholdEditModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resourceId: string, newThreshold: number, notes?: string) => Promise<void>;
}

export const ThresholdEditModal: React.FC<ThresholdEditModalProps> = ({
  resource,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [threshold, setThreshold] = useState<number>(10);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (resource) {
      setThreshold(resource.min_safety_threshold);
      setNotes('');
    }
  }, [resource]);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setIsSubmitting(true);
    try {
      await onSubmit(resource.resource_id, Number(threshold), notes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>Edit Reorder Threshold</span>
                  <Badge variant="warning" size="sm">Admin Only</Badge>
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  Adjust predictive safety margin for {resource.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!isAdmin ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 dark:bg-coral-500/10 dark:border-coral-500/30 mx-auto flex items-center justify-center text-rose-600 dark:text-coral-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Administrative Access Required</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Reorder thresholds and safety reserves can only be adjusted by authorized Hospital Administrators.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-xs font-semibold"
              >
                Close Dialog
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Resource Summary */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Resource:</span>
                  <span className="text-gray-900 dark:text-white font-bold">{resource.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Current Stock:</span>
                  <span className="text-teal-700 dark:text-cyan-400 font-bold">
                    {resource.available_units} / {resource.total_capacity} {resource.unit_measure}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Current Threshold:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    {resource.min_safety_threshold} {resource.unit_measure}
                  </span>
                </div>
              </div>

              {/* Threshold Slider & Input */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-slate-300">
                  <span>New Minimum Safety Reorder Threshold:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {threshold} {resource.unit_measure}
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min={0}
                  max={resource.total_capacity}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="mt-1.5 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="range"
                  min={0}
                  max={resource.total_capacity}
                  step={resource.total_capacity > 500 ? 50 : 1}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full mt-2 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Justification Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Modification Justification (Audit Log)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Raised threshold due to anticipated weekend surge"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-gray-500 dark:text-slate-500 font-mono">
                  Recalculates shortage alerts immediately
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Saving...' : 'Update Threshold'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

