import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { resourceService } from '../../services/resourceService';
import { X, Flame, AlertTriangle, ShieldCheck, Play, Sparkles } from 'lucide-react';

interface SurgeSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshResources: () => void;
}

export const SurgeSimulatorModal: React.FC<SurgeSimulatorModalProps> = ({
  isOpen,
  onClose,
  onRefreshResources,
}) => {
  const [scenario, setScenario] = useState('MASS_CASUALTY_INCIDENT');
  const [traumaCount, setTraumaCount] = useState<number>(15);
  const [icuCount, setIcuCount] = useState<number>(5);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await resourceService.simulateSurge({
        scenario_type: scenario,
        additional_trauma_patients: Number(traumaCount),
        additional_icu_need: Number(icuCount),
      });
      setSimulationResult(res);
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40 flex items-center justify-center">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Mass Casualty & Surge Stress-Test Sandbox</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Simulate emergency patient influx & evaluate AI shortage forecasting</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {/* Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Surge Scenario</label>
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="MASS_CASUALTY_INCIDENT">Highway MCI (Level 2)</option>
                  <option value="PANDEMIC_SURGE">Respiratory Influx (ARDS)</option>
                  <option value="POWER_OUTAGE_OXYGEN_RUN">Critical Resource Strain</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Trauma Arrivals (+)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={traumaCount}
                  onChange={(e) => setTraumaCount(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Critical ICU Influx (+)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={icuCount}
                  onChange={(e) => setIcuCount(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isSimulating ? 'Evaluating Stress-Test...' : 'Execute Surge Stress-Test'}</span>
              </button>
            </div>

            {/* Results Presentation */}
            {simulationResult && (
              <div className="mt-5 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/90 border border-gray-200 dark:border-slate-700/80 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Forecasted Shortage Breaches: {simulationResult.critical_shortages_forecasted}
                  </span>
                  <span className="text-[11px] font-mono text-gray-500 dark:text-slate-400">
                    Scenario: {simulationResult.scenario}
                  </span>
                </div>

                {simulationResult.triggered_shortages.length > 0 ? (
                  <div className="space-y-1.5">
                    {simulationResult.triggered_shortages.map((t: string, idx: number) => (
                      <p
                        key={idx}
                        className="text-xs font-semibold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-500/30 flex items-start gap-2"
                      >
                        <span className="text-rose-600 dark:text-red-400 font-bold">•</span>
                        <span>{t}</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-4 h-4" /> Hospital reserves adequate for this surge volume.
                  </p>
                )}

                {/* AI Recommendations */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-clinical-400" /> AI Automated Surge Actions
                  </p>
                  <ul className="space-y-1 text-xs text-gray-600 dark:text-slate-300 list-disc list-inside">
                    {simulationResult.ai_recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700/60 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-semibold text-xs transition-colors"
            >
              Close Simulator
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

