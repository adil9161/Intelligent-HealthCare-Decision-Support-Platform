import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import {
  FileText,
  AlertTriangle,
  Brain,
  GitFork,
  UserCheck,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export const HowItWorksTimeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Triage Intake & Vitals Ingestion',
      category: 'Stage 0',
      icon: <FileText className="w-5 h-5 text-teal-300" />,
      description:
        'Patient presents with complex clinical symptoms, age demographics, and baseline vitals (BP, Heart Rate, SpO2, Temperature).',
      formula: 'Vitals = {BP, HR, SpO2, Temp} • Symptoms ∈ S',
      accent: 'teal',
    },
    {
      num: '02',
      title: 'Forward-Chaining Rule Evaluation',
      category: 'Stage 1',
      icon: <AlertTriangle className="w-5 h-5 text-coral-400" />,
      description:
        'Clinical heuristics immediately scan for acute triads (STEMI chest pain, FAST stroke weakness, hypoxemia) and trigger urgency escalations.',
      formula: 'Rule: ACS_Triad(Chest_Pain ∧ Diaphoresis) ⇒ STAT_Cardiology',
      accent: 'coral',
    },
    {
      num: '03',
      title: 'Uncertainty Reasoning (CF & Fuzzy)',
      category: 'Stage 2',
      icon: <Brain className="w-5 h-5 text-teal-300" />,
      description:
        'Buchanan & Shortliffe Certainty Factors combine multi-symptom belief degrees, while trapezoidal/triangular fuzzy sets grade continuous severity.',
      formula: 'CF_combined = CF1 + CF2(1 - CF1) • μ_severity ∈ [0.0, 1.0]',
      accent: 'teal',
    },
    {
      num: '04',
      title: 'A* Decision Graph Traversal',
      category: 'Stage 3',
      icon: <GitFork className="w-5 h-5 text-teal-300" />,
      description:
        'Explores the healthcare network evaluating f(n) = g(n) + h(n), balancing operational transit delays with diagnostic recovery heuristics.',
      formula: 'f(n) = g(delay_minutes) + h(clinical_suitability)',
      accent: 'teal',
    },
    {
      num: '05',
      title: 'Human-in-the-Loop Physician Review',
      category: 'Stage 4',
      icon: <UserCheck className="w-5 h-5 text-coral-400" />,
      description:
        'Generates an explainable Decision Passport with candidate ranks and scores. The licensed attending physician retains 100% final clinical authority.',
      formula: 'Clinical Suggestion ⟶ Attending Doctor Final Sign-off',
      accent: 'coral',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-coral-600 dark:text-coral-400 px-3 py-1 rounded-full bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/30">
          Algorithmic Workflow
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-3">
          How the Decision Support Engine Operates
        </h2>
        <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
          From patient intake to physician confirmation: a transparent 5-stage clinical intelligence pathway.
        </p>
      </div>

      {/* Horizontal Desktop Timeline */}
      <div className="relative">
        {/* Progress Connecting Line */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500/20 via-coral-500/30 to-teal-500/20 -translate-y-8 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
          {steps.map((step, idx) => {
            const isSelected = activeStep === idx;
            const isCoral = step.accent === 'coral';

            return (
              <GlassCard
                key={step.num}
                onClick={() => setActiveStep(idx)}
                className={`p-5 cursor-pointer transition-all duration-300 text-left border ${
                  isSelected
                    ? isCoral
                      ? 'border-coral-500 shadow-md -translate-y-1.5 bg-white dark:bg-slate-900/90'
                      : 'border-teal-500 shadow-md -translate-y-1.5 bg-white dark:bg-slate-900/90'
                    : 'border-gray-200 hover:-translate-y-1 hover:border-teal-300 dark:border-teal-900/40'
                }`}
              >
                {/* Step Pill */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                      isCoral
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-coral-500/10 dark:text-coral-300 dark:border-coral-500/30'
                        : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30'
                    }`}
                  >
                    STEP {step.num}
                  </span>
                  <div
                    className={`p-2 rounded-xl border ${
                      isSelected
                        ? isCoral
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-coral-500/20 dark:text-coral-300 dark:border-coral-500/40'
                          : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/40'
                        : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    {step.icon}
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 tracking-wider">
                  {step.category}
                </span>

                <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1 leading-snug">
                  {step.title}
                </h3>

                <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {step.description}
                </p>

                {/* Mathematical Formula Footnote */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-[10px] font-mono text-teal-700 dark:text-teal-300/80 truncate">
                  {step.formula}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Selected Step Deep Dive Banner */}
      <div className="mt-8">
        <GlassCard className="p-6 border-teal-200 bg-teal-50/70 dark:border-teal-700/40 dark:bg-teal-950/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm">
                {steps[activeStep].num}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-400 tracking-wider">
                  Active Clinical Pathway Focus
                </p>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                  {steps[activeStep].title}
                </h4>
              </div>
            </div>

            <div className="font-mono text-xs px-3 py-1.5 rounded-xl bg-white border border-teal-300 text-teal-800 dark:bg-slate-900 dark:border-teal-700/60 dark:text-teal-200 shadow-sm">
              {steps[activeStep].formula}
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

