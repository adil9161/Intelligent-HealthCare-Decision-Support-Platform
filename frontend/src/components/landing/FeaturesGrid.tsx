import React from 'react';
import { GlassCard } from '../common/GlassCard';
import {
  Brain,
  GitFork,
  AlertTriangle,
  Users,
  Sparkles,
  Box,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      title: 'Certainty Factors & Fuzzy Scoring',
      subtitle: 'Unit 4 AI Uncertainty Reasoning',
      description:
        'Computes Buchanan & Shortliffe Certainty Factors (CF) across independent symptom evidence and evaluates continuous fuzzy membership sets (Mild, Moderate, Severe, Critical) rather than binary switches.',
      icon: <Brain className="w-6 h-6 text-teal-300" />,
      tag: 'Buchanan-Shortliffe',
      link: '/triage',
      accent: 'teal',
    },
    {
      title: 'A* Healthcare Decision Graph Routing',
      subtitle: 'Optimal Clinical Pathway Exploration',
      description:
        'Traverses a 5-stage clinical decision network evaluating f(n) = g(n) + h(n), balancing procedural delays with clinical recovery suitability. Includes step-by-step comparisons with BFS, DFS, and Greedy Best-First.',
      icon: <GitFork className="w-6 h-6 text-teal-300" />,
      tag: 'Admissible Heuristic',
      link: '/search',
      accent: 'teal',
    },
    {
      title: 'Predictive Resource Shortage Rules',
      subtitle: 'Early Warning Safety Automation',
      description:
        'Uses rule-based forecasting to detect shortages before crisis: fires alerts when bed availability drops below 10% of capacity and forecasts oxygen run-out hours using real-time burn rate calculations.',
      icon: <AlertTriangle className="w-6 h-6 text-coral-400" />,
      tag: '<10% Reserve Alert',
      link: '/resources',
      accent: 'coral',
    },
    {
      title: 'Medical Workforce Load Balancing',
      subtitle: 'Shift Rostering & Burnout Protection',
      description:
        'Tracks clinical staff availability, active attendance, monthly salary allocations, and patient loads in real time, alerting coordinators when a physician exceeds 5 acute assigned patients.',
      icon: <Users className="w-6 h-6 text-teal-300" />,
      tag: 'Workforce Telemetry',
      link: '/staff',
      accent: 'teal',
    },
    {
      title: 'Explainable Decision Passports',
      subtitle: 'Human-in-the-Loop Transparency',
      description:
        'Every suggestion includes an itemized breakdown of contributing symptoms, activated clinical rules, and confidence margins—strictly leaving final diagnosis and treatment authority with attending doctors.',
      icon: <Sparkles className="w-6 h-6 text-coral-400" />,
      tag: 'Advisory CDSS',
      link: '/patients',
      accent: 'coral',
    },
    {
      title: '3D Campus Digital Twin (R3F)',
      subtitle: 'Spatial Acuity Visualization',
      description:
        'Interactive Three.js / React Three Fiber spatial digital twin with pulsating department pavilions (Trauma, Cardio, ICU, Neuro, Pulmonology) that pulse in real-time alert states.',
      icon: <Box className="w-6 h-6 text-teal-300" />,
      tag: 'Three.js / WebGL',
      link: '/digital-twin',
      accent: 'teal',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30">
          Core Capabilities
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-3">
          Clinical Decision Support Powered by AI
        </h2>
        <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
          Engineered for B.Tech CSE students and clinical operations under Dr. Mohd. Nazim's Artificial Intelligence curriculum.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => {
          const isCoral = feat.accent === 'coral';
          return (
            <GlassCard
              key={idx}
              className={`p-6 transition-all duration-300 hover:-translate-y-1.5 group border ${
                isCoral
                  ? 'border-gray-200 dark:border-coral-800/40 hover:border-coral-400 hover:shadow-md'
                  : 'border-gray-200 dark:border-teal-800/40 hover:border-teal-400 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl border transition-colors ${
                    isCoral
                      ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-coral-950/60 dark:border-coral-700/50 dark:text-coral-400'
                      : 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/60 dark:border-teal-700/50 dark:text-teal-300'
                  }`}
                >
                  {feat.icon}
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isCoral
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-coral-500/10 dark:text-coral-300 dark:border-coral-500/30'
                      : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30'
                  }`}
                >
                  {feat.tag}
                </span>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                {feat.subtitle}
              </span>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:text-teal-600 dark:group-hover:text-teal-200 transition-colors">
                {feat.title}
              </h3>

              <p className="text-xs text-gray-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                {feat.description}
              </p>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  to={feat.link}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 group-hover:gap-2 transition-all focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none rounded"
                >
                  <span>Explore Module</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">
                  #0{idx + 1}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
};

