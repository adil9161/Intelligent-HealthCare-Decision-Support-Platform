import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GlassCard } from '../common/GlassCard';
import { Clock, ShieldAlert, Award, Activity } from 'lucide-react';

interface CounterProps {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

const AnimatedNumber: React.FC<CounterProps> = ({
  end,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 2.0,
}) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = start + (end - start) * eased;
      setVal(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setVal(end);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className="font-mono font-extrabold">
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export const StatsCounterSection: React.FC = () => {
  const stats = [
    {
      label: 'Triage Latency Reduction',
      value: -42.5,
      decimals: 1,
      prefix: '',
      suffix: '%',
      subtext: 'Door-to-consultation delay reduction vs legacy manual queues.',
      icon: <Clock className="w-6 h-6 text-teal-400" />,
      accentColor: 'teal',
    },
    {
      label: 'Shortages Pre-Empted',
      value: 18,
      decimals: 0,
      prefix: '',
      suffix: '+',
      subtext: 'Bed, oxygen, and critical drug exhaustions averted before crisis.',
      icon: <ShieldAlert className="w-6 h-6 text-coral-400" />,
      accentColor: 'coral',
    },
    {
      label: 'Specialist Consensus Alignment',
      value: 96.4,
      decimals: 1,
      prefix: '',
      suffix: '%',
      subtext: 'Clinical department correlation across multi-criteria evaluations.',
      icon: <Award className="w-6 h-6 text-teal-300" />,
      accentColor: 'teal',
    },
    {
      label: 'Door-to-Intervention Turnaround',
      value: 14.8,
      decimals: 1,
      prefix: '< ',
      suffix: 'm',
      subtext: 'Target acute trauma resuscitation window (standard is < 30m).',
      icon: <Activity className="w-6 h-6 text-coral-300" />,
      accentColor: 'coral',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30">
          Quantifiable Clinical Impact
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-3">
          Evidence-Based Healthcare Decision Metrics
        </h2>
        <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
          Engineered to satisfy UN Sustainable Development Goal 3 (Target 3.8 and 3.d) through algorithmic triage rigor.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <GlassCard
            key={idx}
            className="p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md border-gray-200 dark:border-teal-800/40"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 dark:bg-teal-900/60 dark:border-teal-700/50 dark:text-teal-400">
                {stat.icon}
              </div>
              <span className="text-[11px] font-mono text-gray-400 dark:text-slate-400">KPI #0{idx + 1}</span>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              <AnimatedNumber
                end={stat.value}
                decimals={stat.decimals}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </div>

            <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mt-2">
              {stat.label}
            </h3>

            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
              {stat.subtext}
            </p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
};

