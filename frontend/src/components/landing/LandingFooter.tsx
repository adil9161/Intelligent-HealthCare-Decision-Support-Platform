import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  GraduationCap,
  Globe2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-teal-900/60 dark:bg-midnight-950 text-gray-600 dark:text-slate-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand & Mission (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center shadow-glow-teal">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                AegisHealth AI
              </span>
              <span className="block text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                Intelligent Healthcare Decision Support
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed max-w-sm">
            A production-grade, human-in-the-loop decision-support system built for B.Tech CSE students at NIET Greater Noida under Dr. Mohd. Nazim, aligned with UN SDG 3 (Good Health and Well-Being).
          </p>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 dark:bg-teal-950/60 dark:border-teal-800/40 text-[11px] text-teal-800 dark:text-teal-300">
            <span className="font-bold text-coral-600 dark:text-coral-400">Ethical Mandate:</span> Clinical suggestion advisory only. Final diagnostic and therapeutic authority rests strictly with the human attending physician.
          </div>
        </div>

        {/* Navigation Modules */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
            Platform Modules
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link
                to="/patients"
                className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none rounded"
              >
                Patient Management
              </Link>
            </li>
            <li>
              <Link
                to="/staff"
                className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none rounded"
              >
                Staff Roster & Shifts
              </Link>
            </li>
            <li>
              <Link
                to="/resources"
                className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none rounded"
              >
                Resource & Shortages
              </Link>
            </li>
            <li>
              <Link
                to="/triage"
                className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none rounded"
              >
                AI Decision Engine
              </Link>
            </li>
            <li>
              <Link
                to="/search"
                className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none rounded"
              >
                Decision Graph Search (A*)
              </Link>
            </li>
            <li>
              <Link
                to="/digital-twin"
                className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none rounded"
              >
                3D Campus Digital Twin
              </Link>
            </li>
          </ul>
        </div>

        {/* Academic Affiliation */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
            Academic Context
          </h4>
          <ul className="space-y-2.5 text-xs text-gray-600 dark:text-slate-300">
            <li className="font-semibold text-gray-900 dark:text-white">NIET Greater Noida</li>
            <li>B.Tech Computer Science &amp; Engg</li>
            <li>Course: Artificial Intelligence</li>
            <li>Faculty Guide: <strong className="text-teal-600 dark:text-teal-300">Dr. Mohd. Nazim</strong></li>
            <li>Unit 2: Heuristic Graph Search</li>
            <li>Unit 4: Uncertainty Reasoning</li>
          </ul>
        </div>

        {/* UN SDG 3 Mapping */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
            UN SDG 3 Mapping
          </h4>
          <ul className="space-y-2.5 text-xs text-gray-600 dark:text-slate-400">
            <li className="flex items-start gap-1.5">
              <span className="text-coral-500 font-bold">•</span>
              <span><strong className="text-gray-900 dark:text-white">Target 3.8:</strong> Universal Health Coverage</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-coral-500 font-bold">•</span>
              <span><strong className="text-gray-900 dark:text-white">Target 3.d:</strong> Early Warning &amp; Risk Reduction</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-coral-500 font-bold">•</span>
              <span><strong className="text-gray-900 dark:text-white">Target 3.c:</strong> Healthcare Workforce Support</span>
            </li>
            <li className="pt-2">
              <Link
                to="/sdg"
                className="inline-flex items-center gap-1 font-bold text-coral-600 hover:text-coral-500 dark:text-coral-400 dark:hover:text-coral-300 transition-colors focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none rounded"
              >
                <span>View Full SDG Impact Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-12 border-t border-gray-200 dark:border-teal-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-slate-500">
        <p>© 2026 AegisHealth AI. B.Tech CSE NIET Greater Noida. Licensed under MIT.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <span>60 FPS WebGL Engine</span>
          <span>•</span>
          <span>Zero Layout Shift (CLS &lt; 0.1)</span>
          <span>•</span>
          <span>WCAG 2.1 AA Accessible</span>
        </div>
      </div>
    </footer>
  );
};

