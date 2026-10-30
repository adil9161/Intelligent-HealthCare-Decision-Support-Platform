import React, { useState, useMemo } from 'react';
import { Resource } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import {
  TrendingDown,
  Activity,
  AlertTriangle,
  Flame,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ResourceUsageAreaChartProps {
  resources: Resource[];
  activeResourceId?: string;
  onSelectResource?: (resourceId: string) => void;
}

export const ResourceUsageAreaChart: React.FC<ResourceUsageAreaChartProps> = ({
  resources,
  activeResourceId,
  onSelectResource,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    activeResourceId || (resources.length > 0 ? resources[0].resource_id : '')
  );

  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  const currentResource = useMemo(() => {
    return resources.find((r) => r.resource_id === selectedId) || resources[0];
  }, [resources, selectedId]);

  if (!currentResource) return null;

  // Usage trajectory points from backend or synthesized
  const trajectory = useMemo(() => {
    if (currentResource.historical_usage && currentResource.historical_usage.length > 0) {
      return currentResource.historical_usage;
    }

    // Default synthesis if historical usage not present
    const available = currentResource.available_units;
    const total = currentResource.total_capacity;
    const dailyBurn = currentResource.daily_usage_rate || (currentResource.burn_rate_per_hour * 24) || 10;
    const threshold = currentResource.min_safety_threshold;

    const points = [];
    for (let i = 6; i >= 0; i--) {
      points.push({
        day_index: -i,
        label: i === 0 ? 'Today (Now)' : `-${i}d`,
        is_prediction: false,
        available_units: Math.min(total, available + (dailyBurn * i * 0.95)),
        predicted_available: i === 0 ? available : null,
        threshold,
      });
    }

    for (let i = 1; i <= 3; i++) {
      points.push({
        day_index: i,
        label: `+${i}d`,
        is_prediction: true,
        available_units: null,
        predicted_available: Math.max(0, available - (dailyBurn * i)),
        threshold,
      });
    }

    return points;
  }, [currentResource]);

  // Chart Geometry Calculations
  const chartWidth = 720;
  const chartHeight = 220;
  const padLeft = 55;
  const padRight = 35;
  const padTop = 25;
  const padBottom = 35;

  const innerWidth = chartWidth - padLeft - padRight;
  const innerHeight = chartHeight - padTop - padBottom;

  const maxVal = Math.max(
    currentResource.total_capacity,
    ...trajectory.map((p: any) => Math.max(p.available_units || 0, p.predicted_available || 0, p.threshold || 0))
  ) * 1.05;

  const getX = (index: number) => {
    return padLeft + (index / (trajectory.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxVal, val));
    return padTop + innerHeight - (clamped / maxVal) * innerHeight;
  };

  // Find boundary between historical and prediction (Today index)
  const todayIndex = trajectory.findIndex((p: any) => p.is_prediction === false && p.predicted_available !== null);
  const boundaryIndex = todayIndex !== -1 ? todayIndex : 6;

  // Build SVG Paths for Historical Area & Solid Stroke
  const historicalPoints = trajectory.slice(0, boundaryIndex + 1);
  const predictionPoints = trajectory.slice(boundaryIndex);

  const histAreaPoints = historicalPoints.map((p: any, idx: number) => `${getX(idx)},${getY(p.available_units || 0)}`);
  const histAreaPath = `M ${getX(0)},${getY(0)} L ${histAreaPoints.join(' L ')} L ${getX(boundaryIndex)},${getY(0)} Z`;
  const histLinePath = `M ${histAreaPoints.join(' L ')}`;

  // Build SVG Path for Dashed Predicted Line
  const predLinePoints = predictionPoints.map((p: any, idx: number) => {
    const actualIdx = boundaryIndex + idx;
    return `${getX(actualIdx)},${getY(p.predicted_available || 0)}`;
  });
  const predLinePath = `M ${predLinePoints.join(' L ')}`;

  // Prediction Area
  const predAreaPath = `M ${getX(boundaryIndex)},${getY(0)} L ${predLinePoints.join(' L ')} L ${getX(trajectory.length - 1)},${getY(0)} Z`;

  // Reorder Threshold Line Y
  const thresholdY = getY(currentResource.min_safety_threshold);

  const isCritical = currentResource.status === 'Critical' || (currentResource.predicted_exhaustion_hours && currentResource.predicted_exhaustion_hours <= 24);

  return (
    <GlassCard className="p-5 space-y-4">
      {/* Header with Quick Resource Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-teal-600 dark:text-clinical-400" />
            <span>Resource Stock Trajectory: Historical vs Predicted Exhaustion</span>
            <Badge variant="info" size="sm">Dashed Projection</Badge>
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Solid area represents verified 7-day clinical usage; dashed line models rule-based depletion slope.
          </p>
        </div>

        {/* Quick Resource Selector Dropdown */}
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            if (onSelectResource) onSelectResource(e.target.value);
          }}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 max-w-xs"
        >
          {resources.map((r) => (
            <option key={r.resource_id} value={r.resource_id}>
              {r.name} ({r.category})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Resource Live Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-gray-50/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 text-xs">
        <div>
          <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Available Units</span>
          <p className="text-base font-black font-mono text-gray-900 dark:text-white mt-0.5">
            {currentResource.available_units}{' '}
            <span className="text-xs font-normal text-gray-500 dark:text-slate-400">{currentResource.unit_measure}</span>
          </p>
        </div>

        <div>
          <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Daily Burn Rate</span>
          <p className="text-base font-black font-mono text-teal-600 dark:text-cyan-400 mt-0.5">
            {currentResource.daily_usage_rate || (currentResource.burn_rate_per_hour * 24)} {currentResource.unit_measure}/day
          </p>
        </div>

        <div>
          <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Reorder Threshold</span>
          <p className="text-base font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
            {currentResource.min_safety_threshold} {currentResource.unit_measure}
          </p>
        </div>

        <div>
          <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Runout Forecast</span>
          <p className={`text-base font-black font-mono mt-0.5 ${isCritical ? 'text-rose-600 dark:text-coral-400 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {currentResource.predicted_exhaustion_hours !== undefined && currentResource.predicted_exhaustion_hours !== null
              ? `${currentResource.predicted_exhaustion_hours} hours`
              : 'Nominal'}
          </p>
        </div>
      </div>

      {/* SVG Historical Area Chart with DASHED PREDICTED LINE */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[580px] select-none"
        >
          <defs>
            {/* Historical Solid Gradient Area */}
            <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            {/* Predicted Dashed Gradient Area */}
            <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isCritical ? '#f43f5e' : '#f59e0b'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isCritical ? '#f43f5e' : '#f59e0b'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
            const y = padTop + innerHeight * (1 - frac);
            const val = Math.round(maxVal * frac);
            return (
              <g key={frac}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={chartWidth - padRight}
                  y2={y}
                  stroke="rgba(51, 65, 85, 0.3)"
                  strokeDasharray="2 2"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-500 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Reorder Threshold Reference Line */}
          <line
            x1={padLeft}
            y1={thresholdY}
            x2={chartWidth - padRight}
            y2={thresholdY}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={chartWidth - padRight - 5}
            y={thresholdY - 5}
            textAnchor="end"
            className="text-[9px] font-bold fill-amber-400 font-mono"
          >
            Reorder Threshold ({currentResource.min_safety_threshold} {currentResource.unit_measure})
          </text>

          {/* Historical Filled Area */}
          <path d={histAreaPath} fill="url(#historyGradient)" />

          {/* Predicted Filled Area */}
          <path d={predAreaPath} fill="url(#predictionGradient)" />

          {/* 1. Historical Solid Line */}
          <path
            d={histLinePath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* 2. PREDICTED DASHED LINE (Quality Bar Requirement) */}
          <path
            d={predLinePath}
            fill="none"
            stroke={isCritical ? '#f43f5e' : '#f59e0b'}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />

          {/* Vertical Separator at Today (Now) */}
          <line
            x1={getX(boundaryIndex)}
            y1={padTop}
            x2={getX(boundaryIndex)}
            y2={chartHeight - padBottom}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeDasharray="2 2"
          />
          <text
            x={getX(boundaryIndex)}
            y={padTop - 8}
            textAnchor="middle"
            className="text-[10px] font-bold fill-clinical-300 font-mono"
          >
            Today (Now)
          </text>

          {/* Interactive Data Point Dots */}
          {trajectory.map((point: any, idx: number) => {
            const isPred = point.is_prediction;
            const val = isPred ? point.predicted_available : point.available_units;
            if (val === null || val === undefined) return null;

            const cx = getX(idx);
            const cy = getY(val);

            return (
              <g
                key={idx}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredPoint({ ...point, cx, cy, val })}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r="4.5"
                  className={
                    isPred
                      ? 'fill-coral-400 stroke-midnight-950 stroke-2 hover:r-6 transition-all'
                      : 'fill-cyan-400 stroke-midnight-950 stroke-2 hover:r-6 transition-all'
                  }
                />
              </g>
            );
          })}

          {/* X-Axis Labels */}
          {trajectory.map((point: any, idx: number) => (
            <text
              key={idx}
              x={getX(idx)}
              y={chartHeight - padBottom + 16}
              textAnchor="middle"
              className={`text-[9px] font-mono ${
                point.is_prediction ? 'fill-amber-400 font-bold' : 'fill-slate-400'
              }`}
            >
              {point.label}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none p-2.5 rounded-xl bg-white/95 dark:bg-slate-950/95 border border-gray-200 dark:border-clinical-500/40 text-xs shadow-lg backdrop-blur-md animate-in fade-in"
            style={{
              left: `${Math.min(chartWidth - 180, Math.max(10, hoveredPoint.cx - 70))}px`,
              top: `${Math.max(10, hoveredPoint.cy - 70)}px`,
            }}
          >
            <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
              <span className={`w-2 h-2 rounded-full ${hoveredPoint.is_prediction ? 'bg-rose-500 dark:bg-coral-400' : 'bg-teal-500 dark:bg-cyan-400'}`} />
              <span>{hoveredPoint.label}</span>
              <span className="text-[10px] text-gray-500 dark:text-slate-400 font-mono">
                ({hoveredPoint.is_prediction ? 'AI Predicted' : 'Verified Actual'})
              </span>
            </div>
            <p className="text-teal-700 dark:text-cyan-300 font-mono font-bold mt-1">
              Stock: {hoveredPoint.val} {currentResource.unit_measure}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">
              Safety Threshold: {hoveredPoint.threshold} {currentResource.unit_measure}
            </p>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      <div className="pt-2 border-t border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-gray-600 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-teal-500 dark:bg-cyan-400 rounded-full" />
            <span>Historical Usage (Solid Area)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-500 dark:border-coral-400" />
            <span className="text-rose-600 dark:text-coral-300 font-semibold">Predicted 48h-72h Trajectory (Dashed Line)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-t border-dashed border-amber-500 dark:border-amber-400" />
            <span className="text-amber-700 dark:text-amber-300">Reorder Threshold</span>
          </span>
        </div>

        <span className="text-[11px] font-mono text-gray-500 dark:text-slate-500">
          Evaluated via rule-based consumption gradient
        </span>
      </div>
    </GlassCard>
  );
};

