import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { CardSkeleton, TableSkeleton } from '../common/SkeletonLoader';
import { containerStaggerVariants, cardEntranceVariants } from '../../utils/motion';
import { Patient, Staff, ResourceSummary } from '../../types';
import {
  Users,
  UserCog,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  HeartPulse,
  Bed,
  Wind,
  Stethoscope,
  Activity,
  Flame,
  Plus,
} from 'lucide-react';

interface DashboardHomeProps {
  patients: Patient[];
  staffList: Staff[];
  summary: ResourceSummary | null;
  isLoading?: boolean;
  onOpenIntake: () => void;
  onSelectPatient: (p: Patient) => void;
}

// Mini SVG Sparkline Component
const MiniSparkline: React.FC<{
  data: number[];
  color: string;
  fillColor?: string;
  height?: number;
  width?: number;
}> = ({ data, color, fillColor, height = 28, width = 72 }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      {fillColor && (
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={fillColor}
          opacity="0.2"
        />
      )}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  patients,
  staffList,
  summary,
  isLoading = false,
  onOpenIntake,
  onSelectPatient,
}) => {
  const totalPatientsToday = patients.length;
  const staffOnDuty = staffList.filter((s) => s.attendance === 'Present').length;
  const resourceAlertsCount = summary?.critical_alerts_count || 0;
  const pendingRecommendations = patients.filter(
    (p) => p.status === 'Waiting' || p.status === 'Triage Evaluated'
  ).length;

  // Sparkline sample telemetry series
  const patientTrend = [4, 6, 5, 8, 7, 9, 10];
  const staffTrend = [8, 9, 10, 11, 11, 11, staffOnDuty];
  const alertTrend = [2, 3, 5, 6, 8, 9, resourceAlertsCount];
  const recommendationTrend = [1, 2, 4, 3, 5, 4, pendingRecommendations];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30">
            Real-Time Clinical Operations Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-2">
            Clinical Triage Dashboard
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Real-time patient intake, AI decision support, and shortage forecasting.
          </p>
        </div>

        <button
          onClick={onOpenIntake}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-400 hover:to-coral-500 text-white font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Patient Triage</span>
        </button>
      </div>

      {/* FOUR SUMMARY CARDS WITH MINI SPARKLINES */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <motion.div
          variants={containerStaggerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
        {/* Card 1: Total Patients Today */}
        <motion.div variants={cardEntranceVariants}>
          <GlassCard className="p-5 border-gray-200 dark:border-teal-800/40 hover:-translate-y-1 transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Total Patients Today
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {totalPatientsToday}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  +18% influx
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">Active registered intake</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 dark:bg-teal-900/60 dark:border-teal-700/50 dark:text-teal-300">
                <Users className="w-5 h-5" />
              </div>
              <MiniSparkline
                data={patientTrend}
                color="#0d9488"
                fillColor="#2dd4bf"
              />
            </div>
          </div>
        </GlassCard>
        </motion.div>

        {/* Card 2: Staff on Duty */}
        <motion.div variants={cardEntranceVariants}>
        <GlassCard className="p-5 border-gray-200 dark:border-teal-800/40 hover:-translate-y-1 transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Staff on Duty
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {staffOnDuty}
                </span>
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                  / {staffList.length} roster
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                {staffList.length > 0 ? Math.round((staffOnDuty / staffList.length) * 100) : 0}% attendance rate
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 dark:bg-teal-900/60 dark:border-teal-700/50 dark:text-teal-300">
                <UserCog className="w-5 h-5" />
              </div>
              <MiniSparkline
                data={staffTrend}
                color="#0f766e"
                fillColor="#5eead4"
              />
            </div>
          </div>
        </GlassCard>
        </motion.div>

        {/* Card 3: Resource Alerts */}
        <motion.div variants={cardEntranceVariants}>
        <GlassCard
          glow={resourceAlertsCount > 0 ? 'coral' : 'none'}
          className="p-5 border-rose-200 dark:border-coral-800/40 hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-600 dark:text-coral-300 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-coral-400" /> Resource Alerts
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-600 dark:text-coral-400">
                  {resourceAlertsCount}
                </span>
                <span className="text-xs font-semibold text-rose-600 dark:text-coral-300">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">Beds &lt; 10% • O2 Run-out</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-coral-950/60 dark:border-coral-700/50 dark:text-coral-400 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <MiniSparkline
                data={alertTrend}
                color="#e11d48"
                fillColor="#fecdd3"
              />
            </div>
          </div>
        </GlassCard>
        </motion.div>

        {/* Card 4: Pending Recommendations */}
        <motion.div variants={cardEntranceVariants}>
        <GlassCard className="p-5 border-gray-200 dark:border-teal-800/40 hover:-translate-y-1 transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Pending Recommendations
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {pendingRecommendations}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Awaiting review
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">Human-in-the-loop sign-off</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 dark:bg-teal-900/60 dark:border-teal-700/50 dark:text-teal-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <MiniSparkline
                data={recommendationTrend}
                color="#0284c7"
                fillColor="#bae6fd"
              />
            </div>
          </div>
        </GlassCard>
        </motion.div>
      </motion.div>
      )}

      {/* Main Workspace Split: Live Triage Queue vs Resource Shortage Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Triage Queue (2 cols) */}
        <GlassCard className="lg:col-span-2 p-6 border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Active Priority Patient Queue
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Prioritized by clinical severity and certainty factor.
              </p>
            </div>
            <Link
              to="/patients"
              className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 flex items-center gap-1"
            >
              <span>View All ({patients.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-gray-100 dark:divide-slate-800/60">
            {patients.slice(0, 5).map((patient) => {
              const aiScore = patient.ai_recommendation?.primary_recommendation?.decision_score;
              return (
                <div
                  key={patient.id}
                  onClick={() => onSelectPatient(patient)}
                  className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-900/50 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 dark:bg-slate-900 dark:border-slate-700 dark:text-teal-300 font-bold">
                      {patient.patient_id}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-xs">{patient.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">{patient.disease}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        patient.urgency === 'Emergency'
                          ? 'emergency'
                          : patient.urgency === 'Urgent'
                          ? 'urgent'
                          : 'semi'
                      }
                      size="sm"
                      pulse={patient.urgency === 'Emergency'}
                    >
                      {patient.urgency}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                      {aiScore ? `${aiScore.toFixed(1)}%` : '75.0%'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Real-Time Shortage Forecast Widget (1 col) */}
        <GlassCard className="p-6 flex flex-col justify-between border-gray-200 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-coral-400" /> Early Warning Status
              </h3>
              <Badge variant="warning" size="sm">&lt;10% Rule Active</Badge>
            </div>

            <div className="mt-4 space-y-4">
              {/* Bed Safety Rule */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 dark:bg-slate-900/80 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Bed Safety Reserve
                  </span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {summary?.beds.available_units} / {summary?.beds.total_capacity}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (summary?.beds.availability_percentage || 0) < 10
                        ? 'bg-red-500'
                        : 'bg-teal-500'
                    }`}
                    style={{ width: `${summary?.beds.availability_percentage || 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 flex justify-between">
                  <span>Capacity: {summary?.beds.availability_percentage}%</span>
                  {(summary?.beds.availability_percentage || 0) < 10 && (
                    <span className="text-red-600 dark:text-red-400 font-bold">&lt;10% CRITICAL SHORTAGE</span>
                  )}
                </p>
              </div>

              {/* Oxygen Forecast */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 dark:bg-slate-900/80 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-rose-600 dark:text-coral-400" /> Oxygen Run-Out Forecast
                  </span>
                  <span className="font-mono font-bold text-rose-600 dark:text-coral-400">
                    ~{summary?.oxygen.hours_remaining} Hours
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1.5">
                  Consumption burn rate: <span className="text-gray-900 dark:text-white font-mono font-bold">{summary?.oxygen.total_burn_rate_lph} L/hr</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-800">
            <Link
              to="/resources"
              className="w-full py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:hover:bg-teal-900/90 dark:text-teal-300 font-bold text-xs border border-teal-200 dark:border-teal-700/60 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Manage Hospital Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

