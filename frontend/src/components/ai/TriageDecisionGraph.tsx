import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TriageEvaluationResponse } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import {
  Sparkles,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Brain,
  Activity,
  HeartPulse,
  Info,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface TriageDecisionGraphProps {
  evaluation: TriageEvaluationResponse;
  patientSymptoms: string[];
  patientVitals?: {
    bp?: string;
    heart_rate?: number;
    spo2?: number;
    temperature?: number;
  };
}

export const TriageDecisionGraph: React.FC<TriageDecisionGraphProps> = ({
  evaluation,
  patientSymptoms,
  patientVitals,
}) => {
  const [activeStage, setActiveStage] = useState<number | null>(4); // Default to final recommendation

  const primary = evaluation.primary_recommendation;
  const pathway = evaluation.search_pathway;
  const rules = evaluation.rule_engine_trace || [];
  const comparison = evaluation.search_comparison;

  // Stages of the AI Reasoning Pipeline
  const stages = [
    {
      num: 1,
      id: 'input',
      title: 'Clinical Presentation',
      subtitle: `${patientSymptoms.length} Symptoms • Vitals Ingested`,
      icon: <Activity className="w-4 h-4 text-teal-600" />,
      accentColor: 'border-teal-300 bg-teal-50/60 text-teal-800',
    },
    {
      num: 2,
      id: 'rules',
      title: 'Rule Screening Engine',
      subtitle: `${rules.length} Heuristic Rules Fired`,
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      accentColor: 'border-amber-300 bg-amber-50/60 text-amber-800',
    },
    {
      num: 3,
      id: 'cf',
      title: 'Uncertainty Calculus',
      subtitle: `CF: +${primary?.certainty_factor?.toFixed(2) || '0.90'} • Fuzzy Urgency`,
      icon: <Brain className="w-4 h-4 text-purple-600" />,
      accentColor: 'border-purple-300 bg-purple-50/60 text-purple-800',
    },
    {
      num: 4,
      id: 'graph',
      title: 'A* Decision Graph',
      subtitle: `${pathway?.total_path_cost || 22}m Transit • Admissible`,
      icon: <GitCommit className="w-4 h-4 text-blue-600" />,
      accentColor: 'border-blue-300 bg-blue-50/60 text-blue-800',
    },
    {
      num: 5,
      id: 'dest',
      title: 'Terminal Intervention',
      subtitle: `${primary?.department || 'Cardiology'} (${primary?.decision_score?.toFixed(1) || 94}%)`,
      icon: <Stethoscope className="w-4 h-4 text-emerald-600" />,
      accentColor: 'border-emerald-300 bg-emerald-50/60 text-emerald-800',
    },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
      {/* Header with Title and Explanatory Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Interactive Clinical Decision Reasoning Pipeline</span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Click any stage node to inspect real-time mathematical derivations and inference evidence.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge variant="success">Human-in-the-Loop</Badge>
          <Badge variant="info">Unit 4 AI Engine</Badge>
        </div>
      </div>

      {/* Horizontal Flow Diagram with Connectors */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative z-10">
          {stages.map((stage) => {
            const isSelected = activeStage === stage.num;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.num)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative group ${
                  isSelected
                    ? `${stage.accentColor} ring-2 ring-teal-500/30 shadow-sm font-semibold -translate-y-0.5`
                    : 'bg-gray-50/70 hover:bg-gray-100/80 border-gray-200 text-gray-700 dark:bg-slate-800/40 dark:border-slate-700/60 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-2xs border border-gray-200/60 dark:border-slate-700">
                    {stage.icon}
                  </div>
                  <span className="font-mono text-[10px] text-gray-400 font-bold">
                    0{stage.num}
                  </span>
                </div>

                <div className="mt-2.5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {stage.title}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                    {stage.subtitle}
                  </p>
                </div>

                {isSelected && (
                  <motion.div
                    layoutId="activeReasoningStageIndicator"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-teal-600 rotate-45 rounded-xs"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Detailed Inspector Panel */}
      <AnimatePresence mode="wait">
        {activeStage && (
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-xl bg-gray-50/90 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/80 text-xs"
          >
            {/* Stage 1: Clinical Presentation */}
            {activeStage === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Stage 1: Patient Ingestion Evidence</span>
                  </h5>
                  <span className="text-gray-500 font-mono text-[11px]">Forward-Chaining Input Facts</span>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Active Chief Symptoms:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {patientSymptoms.map((sym, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-medium text-xs shadow-2xs"
                      >
                        ✓ {sym}
                      </span>
                    ))}
                  </div>
                </div>

                {patientVitals && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-200/80">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200/60 text-center">
                      <span className="text-[10px] text-gray-400 block">Blood Pressure</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{patientVitals.bp || '120/80'}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200/60 text-center">
                      <span className="text-[10px] text-gray-400 block">Heart Rate</span>
                      <span className="font-mono font-bold text-teal-700">{patientVitals.heart_rate || 75} bpm</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200/60 text-center">
                      <span className="text-[10px] text-gray-400 block">Oxygen Saturation</span>
                      <span className="font-mono font-bold text-blue-600">{patientVitals.spo2 || 98}% SpO2</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200/60 text-center">
                      <span className="text-[10px] text-gray-400 block">Body Temperature</span>
                      <span className="font-mono font-bold text-amber-600">{patientVitals.temperature || 98.6}°F</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stage 2: Rule Screening Engine */}
            {activeStage === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Stage 2: Deterministic Rule-Based Heuristic Evaluation</span>
                  </h5>
                  <span className="text-gray-500 font-mono text-[11px]">Rete Forward-Chaining</span>
                </div>

                {rules.length > 0 ? (
                  <div className="space-y-2">
                    {rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 text-xs shadow-2xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            {rule.name}
                          </span>
                          <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Fired
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-slate-300 text-[11px] leading-relaxed">
                          {rule.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No acute clinical exclusion rules triggered for this presentation profile.</p>
                )}
              </div>
            )}

            {/* Stage 3: Buchanan & Shortliffe Uncertainty Calculus */}
            {activeStage === 3 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span>Stage 3: Buchanan & Shortliffe Certainty Factor (CF) Calculus</span>
                  </h5>
                  <span className="text-gray-500 font-mono text-[11px]">Unit 4 AI Reasoning</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 shadow-2xs text-center">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Composite Certainty Factor</span>
                    <span className="text-2xl font-black font-mono text-purple-700 dark:text-purple-300 mt-1 block">
                      +{primary?.certainty_factor?.toFixed(2) || '0.92'}
                    </span>
                    <span className="text-[10px] text-gray-500">Range [-1.0, +1.0]</span>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 shadow-2xs text-center">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Fuzzy Severity Membership</span>
                    <span className="text-2xl font-black font-mono text-amber-600 mt-1 block">
                      {primary?.severity_compatibility ? `${primary.severity_compatibility}%` : `${((primary?.fuzzy_severity_degree || 0.85) * 100).toFixed(0)}%`}
                    </span>
                    <span className="text-[10px] text-gray-500">Continuous μ(x) Degree</span>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 shadow-2xs text-center">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Urgency Readiness</span>
                    <span className="text-2xl font-black font-mono text-emerald-600 mt-1 block">
                      {primary?.urgency_compatibility ? `${primary.urgency_compatibility}%` : `${((primary?.fuzzy_urgency_degree || 0.90) * 100).toFixed(0)}%`}
                    </span>
                    <span className="text-[10px] text-gray-500">ESI Acuity Compatibility</span>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-gray-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900 p-2.5 rounded-lg border border-gray-200/80">
                  Formula: CF_combined = CF1 + CF2 × (1 - CF1) • Gracefully degrades recommendations under incomplete symptomatic data.
                </p>
              </div>
            )}

            {/* Stage 4: A* Decision Graph Routing */}
            {activeStage === 4 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <GitCommit className="w-4 h-4 text-blue-600" />
                    <span>Stage 4: A* Heuristic Decision Graph Traversal</span>
                  </h5>
                  <span className="text-gray-500 font-mono text-[11px]">f(n) = g(n) + h(n)</span>
                </div>

                {pathway && (
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 dark:text-white">Selected Optimal Route:</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Total Delay: {pathway.total_path_cost} mins
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
                      {pathway.optimal_path_labels.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <span className="px-2 py-0.5 rounded bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 font-semibold">
                            {step}
                          </span>
                          {idx < pathway.optimal_path_labels.length - 1 && (
                            <span className="text-blue-600 font-bold">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {comparison?.algorithms && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {Object.entries(comparison.algorithms).map(([key, algo]: [string, any]) => (
                      <div
                        key={key}
                        className={`p-2 rounded-lg border text-[11px] ${
                          algo.is_optimal
                            ? 'bg-teal-50 border-teal-300 font-semibold'
                            : 'bg-white dark:bg-slate-900 border-gray-200 text-gray-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{key}</span>
                          {algo.is_optimal && <span className="text-[9px] text-teal-700 font-bold uppercase">Optimal</span>}
                        </div>
                        <div className="mt-1 space-y-0.5 font-mono text-[10px]">
                          <div>Cost: {algo.total_path_cost_min}m</div>
                          <div>Nodes: {algo.nodes_expanded}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stage 5: Terminal Clinical Action */}
            {activeStage === 5 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <span>Stage 5: Final Specialized Clinical Route</span>
                  </h5>
                  <span className="text-gray-500 font-mono text-[11px]">Human-in-the-Loop Sign-off</span>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-300 text-gray-900 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold text-emerald-800">
                        Primary Clinical Destination
                      </span>
                      <h4 className="text-base font-black text-emerald-950 mt-0.5">
                        {primary?.department || 'Cardiology Care Center'}
                      </h4>
                      <p className="text-xs text-emerald-800 mt-1 font-body">
                        {primary?.clinical_rationale || 'Prioritized based on acute ischemic symptom triad and ST elevation protocol.'}
                      </p>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <span className="text-2xl font-black font-mono text-emerald-800">
                        {primary?.decision_score?.toFixed(1) || 94.0}%
                      </span>
                      <span className="block text-[10px] text-emerald-700 font-semibold">Match Score</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-gray-200/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Advisory recommendation ready for attending physician authorization. Final clinical orders require licensed human sign-off.
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
