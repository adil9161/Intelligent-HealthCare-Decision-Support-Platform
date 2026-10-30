import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { DnaHelixHeroScene } from './DnaHelixHeroScene';
import { FeaturesGrid } from './FeaturesGrid';
import { HowItWorksTimeline } from './HowItWorksTimeline';
import { StatsCounterSection } from './StatsCounterSection';
import { LandingFooter } from './LandingFooter';
import {
  HeartPulse,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Activity,
  Layers,
  ChevronDown,
  Network,
  Cpu,
  Boxes,
  Stethoscope,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const featurePills = [
    { title: 'Explainable AI Triage', icon: <Cpu className="w-3.5 h-3.5 text-teal-600" /> },
    { title: 'Intelligent Decision Graph', icon: <Network className="w-3.5 h-3.5 text-blue-600" /> },
    { title: 'Resource Management', icon: <Boxes className="w-3.5 h-3.5 text-amber-600" /> },
    { title: 'Clinical Decision Support', icon: <Stethoscope className="w-3.5 h-3.5 text-emerald-600" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#172033] dark:bg-gray-950 dark:text-slate-100 overflow-x-hidden selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-500/30 dark:selection:text-teal-200 font-sans">
      {/* HERO SECTION: Bright, Welcoming Healthcare Light Theme */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-teal-50/40 via-[#F7FAFC] to-[#F7FAFC] dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
        {/* Subtle decorative background gradients & mesh */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />

        {/* 3D Helix Background Canvas */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-60">
          <DnaHelixHeroScene isReducedMotion={isReducedMotion} />
        </div>

        {/* Foreground Content Overlays */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl space-y-6"
          >
            {/* Information Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-700/60 text-[#172033] dark:text-slate-200 text-xs font-semibold shadow-sm hover:shadow-md transition-shadow">
                <div className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <span>NIET Greater Noida • Dr. Mohd. Nazim • B.Tech CSE AI</span>
                <span className="text-gray-300 dark:text-slate-700">|</span>
                <span className="text-teal-700 dark:text-teal-400 font-bold">UN SDG 3 Target</span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#172033] dark:text-white tracking-tight leading-[1.12] font-heading">
                Intelligent Healthcare{' '}
                <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-blue-600 dark:from-teal-300 dark:via-teal-200 dark:to-blue-400 bg-clip-text text-transparent">
                  Decision Support
                </span>{' '}
                Platform
              </h1>
            </motion.div>

            {/* Hero Description */}
            <motion.div variants={itemVariants}>
              <p className="text-base sm:text-lg text-[#526176] dark:text-slate-300 font-normal leading-relaxed max-w-xl font-body">
                Explainable AI for clinical triage, intelligent routing, and hospital resource planning.
              </p>
            </motion.div>

            {/* Compact Clinical Safety Notice */}
            <motion.div variants={itemVariants}>
              <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-coral-200/90 dark:border-coral-800/60 shadow-2xs text-xs flex items-start gap-2.5 max-w-xl">
                <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[#526176] dark:text-slate-300 font-body">
                  <strong className="text-rose-700 dark:text-rose-400">Advisory Decision Support:</strong> Assists attending physicians with triage prioritization. Autonomous diagnosis is prohibited; final clinical authority strictly rests with licensed medical professionals.
                </p>
              </div>
            </motion.div>

            {/* Call to Action Buttons */}
            <motion.div variants={itemVariants} className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/patients"
                className="px-6 py-3.5 rounded-[12px] bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 group focus-visible:ring-4 focus-visible:ring-teal-300 focus-visible:outline-none"
              >
                <span>Launch Clinical Platform</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={scrollToFeatures}
                className="px-6 py-3.5 rounded-[12px] bg-white hover:bg-teal-50/50 text-teal-700 font-bold text-sm border border-teal-300 shadow-sm hover:border-teal-400 transition-all flex items-center gap-2 focus-visible:ring-4 focus-visible:ring-teal-200 focus-visible:outline-none"
              >
                <span>Explore Decision Engine</span>
                <ChevronDown className="w-4 h-4 text-teal-600" />
              </button>

              <Link
                to="/digital-twin"
                className="text-xs font-semibold text-[#526176] hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300 transition-colors underline decoration-gray-300 hover:decoration-teal-500 underline-offset-4 focus-visible:ring-2 focus-visible:ring-teal-400 rounded"
              >
                View 3D Campus Twin →
              </Link>
            </motion.div>

            {/* Feature Highlights Row */}
            <motion.div variants={itemVariants} className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl">
                {featurePills.map((pill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-gray-200/90 dark:border-slate-800 text-xs font-medium text-[#172033] dark:text-slate-200 shadow-xs"
                  >
                    {pill.icon}
                    <span className="truncate">{pill.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-[11px] font-mono text-[#8492A6] dark:text-slate-500 pointer-events-none">
          <span>SCROLL TO EXPLORE</span>
          <div className="w-5 h-7 rounded-full border-2 border-gray-300 dark:border-slate-700 flex justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-teal-600 animate-bounce" />
          </div>
        </div>
      </section>

      {/* STATS COUNTER SECTION (Triggers on Scroll) */}
      <StatsCounterSection />

      {/* HOW IT WORKS: Animated Horizontal Workflow Timeline */}
      <HowItWorksTimeline />

      {/* CORE FEATURES GRID with Glassmorphism Hover Glows */}
      <div id="features-section">
        <FeaturesGrid />
      </div>

      {/* FOOTER with Navigation & Academic Links */}
      <LandingFooter />
    </div>
  );
};

