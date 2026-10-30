import React, { useEffect, useState } from 'react';
import { Sparkles, Activity } from 'lucide-react';

interface CountUpScoreProps {
  score: number;
  duration?: number;
  size?: 'sm' | 'md' | 'lg';
  showRadialGauge?: boolean;
}

export const CountUpScore: React.FC<CountUpScoreProps> = ({
  score,
  duration = 1200,
  size = 'md',
  showRadialGauge = true,
}) => {
  const [currentScore, setCurrentScore] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;
    const target = Math.max(0, Math.min(100, score));

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1.0);
      // Ease-out cubic curve: 1 - (1 - t)^3
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      setCurrentScore(Number((easeOutProgress * target).toFixed(1)));

      if (progress < 1.0) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrentScore(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [score, duration]);

  // Color scheme based on score severity
  const getColorClasses = (val: number) => {
    if (val >= 85) {
      return {
        text: 'text-rose-600 dark:text-coral-400',
        stroke: '#e11d48',
        glow: 'shadow-sm',
        bg: 'bg-rose-50 dark:bg-coral-500/10',
        border: 'border-rose-200 dark:border-coral-500/30',
        badge: 'Critical Stat Resuscitation',
      };
    }
    if (val >= 65) {
      return {
        text: 'text-amber-600 dark:text-amber-400',
        stroke: '#d97706',
        glow: 'shadow-sm',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-200 dark:border-amber-500/30',
        badge: 'Priority Acute Consultation',
      };
    }
    return {
      text: 'text-teal-600 dark:text-clinical-400',
      stroke: '#0d9488',
      glow: 'shadow-sm',
      bg: 'bg-teal-50 dark:bg-clinical-500/10',
      border: 'border-teal-200 dark:border-clinical-500/30',
      badge: 'Standard Clinical Evaluation',
    };
  };

  const colors = getColorClasses(score);

  // SVG Radial circle geometry
  const radius = size === 'lg' ? 44 : size === 'md' ? 36 : 24;
  const strokeWidth = size === 'lg' ? 6 : size === 'md' ? 5 : 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`font-mono font-bold text-sm ${colors.text} px-2 py-0.5 rounded-lg ${colors.bg} ${colors.border} border`}
        >
          {currentScore.toFixed(1)}%
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {showRadialGauge && (
        <div className="relative flex items-center justify-center">
          <svg
            width={svgSize}
            height={svgSize}
            className="transform -rotate-90 drop-shadow-md"
          >
            {/* Background Track */}
            <circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke="rgba(51, 65, 85, 0.4)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Score Progress Arc */}
            <circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke={colors.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 0.05s ease-out',
                filter: `drop-shadow(0 0 6px ${colors.stroke}88)`,
              }}
            />
          </svg>

          {/* Center Activity Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className={`w-4 h-4 ${colors.text} animate-pulse`} />
          </div>
        </div>
      )}

      <div>
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-mono font-black ${
              size === 'lg' ? 'text-3xl' : 'text-2xl'
            } ${colors.text} tracking-tight`}
          >
            {currentScore.toFixed(1)}
          </span>
          <span className="text-xs font-bold text-slate-400 font-mono">%</span>
        </div>
        <p className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 mt-0.5">
          <Sparkles className="w-3 h-3 text-clinical-400" />
          <span>Decision Score</span>
        </p>
      </div>
    </div>
  );
};

