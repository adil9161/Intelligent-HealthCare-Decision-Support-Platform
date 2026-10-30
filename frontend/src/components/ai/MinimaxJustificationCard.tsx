import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import {
  Brain,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';

export const MinimaxJustificationCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <GlassCard glow="cyan" className="p-5 border-gray-200 dark:border-clinical-500/30">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Theoretical Evaluation: Why Minimax & Alpha-Beta Pruning Were Excluded
              </h3>
              <Badge variant="warning" size="sm">Unit 2 vs Unit 4 AI Curriculum</Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              NIET Greater Noida B.Tech CSE AI Course (Dr. Mohd. Nazim) • Rigorous Algorithmic Justification
            </p>
          </div>
        </div>

        <button className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700/60 space-y-4 text-xs animate-in fade-in duration-200">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700/60 text-gray-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-teal-700 dark:text-clinical-400 uppercase">Core Academic Verdict: </span>
            Minimax and Alpha-Beta Pruning are classical algorithms designed for <strong>two-player zero-sum adversarial games</strong> (e.g., Chess, Checkers, Go) where an intelligent adversary actively selects optimal moves to minimize our payoff. In clinical triage and hospital resource allocation, <strong>there are no competing adversarial agents</strong>.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 dark:bg-red-950/30 dark:border-red-500/30">
              <p className="font-bold text-rose-700 dark:text-red-400 flex items-center gap-1.5 mb-2">
                <XCircle className="w-4 h-4" /> Why Minimax / Alpha-Beta Fail in Healthcare
              </p>
              <ul className="space-y-1.5 text-gray-700 dark:text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-600 dark:text-red-400 font-bold">•</span>
                  <span><strong>Nature is Stochastic, Not Adversarial:</strong> Disease progression is a probabilistic biological phenomenon, not an agent plotting deliberate counter-moves against medical staff.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-600 dark:text-red-400 font-bold">•</span>
                  <span><strong>Hazard of Unethical Pruning:</strong> Alpha-Beta Pruning eliminates search branches assumed to be suboptimal against a minimax opponent. In triage, pruning medical diagnostic branches based on zero-sum assumptions risks fatal diagnostic omission.</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-500/30">
              <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4" /> Methodologies Selected for AegisHealth AI
              </p>
              <ul className="space-y-1.5 text-gray-700 dark:text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span><strong>A* Heuristic Search:</strong> Evaluates optimal clinical pathways balancing turnaround delay $g(n)$ and clinical suitability $h(n)$.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span><strong>Buchanan-Shortliffe Certainty Factors (CF):</strong> Combines multi-symptom belief degrees dynamically without requiring strict statistical independence.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span><strong>Fuzzy Sets:</strong> Replaces abrupt binary switches with continuous membership functions for patient severity and urgency.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

