import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Staff, AvailabilityStatus, AttendanceStatus } from '../../types';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  UserCheck,
  Stethoscope,
  Briefcase,
  Clock,
  Activity,
  Phone,
  Mail,
  GraduationCap,
  DollarSign,
  Lock,
  ShieldCheck,
  Building,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface StaffDetailDrawerProps {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleAttendance: (staffId: string) => Promise<void>;
  onUpdateAvailability?: (staffId: string, availability: AvailabilityStatus) => Promise<void>;
}

export const StaffDetailDrawer: React.FC<StaffDetailDrawerProps> = ({
  staff,
  isOpen,
  onClose,
  onToggleAttendance,
  onUpdateAvailability,
}) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !staff) return null;

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const formatSalary = (val?: number) => {
    if (val === undefined || val === null) return 'Confidential';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onToggleAttendance(staff.staff_id);
    } finally {
      setIsUpdating(false);
    }
  };

  // Diverging color for attendance percentage
  const attPct = staff.attendance_percentage ?? 95.0;
  const getDivergingColor = (pct: number) => {
    if (pct < 70) return 'text-coral-400 bg-coral-500/10 border-coral-500/30';
    if (pct < 85) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (pct < 92) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  const divClass = getDivergingColor(attPct);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/20 dark:bg-midnight-950/70 backdrop-blur-sm"
        />

        {/* Slide-over Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white dark:bg-midnight-950 border-l border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 h-full overflow-y-auto shadow-2xl flex flex-col justify-between z-10"
        >
          {/* Header */}
          <div>
            <div className="p-5 border-b border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 sticky top-0 z-20 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 dark:bg-clinical-500/10 dark:border-clinical-500/30 flex items-center justify-center text-teal-700 dark:text-clinical-400 font-bold font-mono text-base">
                  {staff.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{staff.name}</h2>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 dark:bg-slate-800 dark:text-clinical-400 font-semibold border border-teal-200 dark:border-slate-700">
                      {staff.staff_id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    {staff.role} • {staff.department} • {staff.shift} Shift
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-5">
              {/* Operational Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800">
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Attendance State</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        staff.attendance === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40'
                          : staff.attendance === 'In Surgery'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40'
                          : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          staff.attendance === 'Present' ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}
                      />
                      <span>{staff.attendance}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Shift: {staff.shift}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-[#526176] dark:text-slate-400 uppercase font-semibold">Real-Time Availability</p>
                  <span
                    className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      staff.availability === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
                        : staff.availability === 'Busy'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-coral-500/10 dark:text-coral-300 dark:border-coral-500/30'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                    }`}
                  >
                    {staff.availability}
                  </span>
                </div>
              </div>

              {/* Attendance Percentage & Diverging Gauge */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#172033] dark:text-slate-300 flex items-center gap-1.5 font-heading">
                    <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>30-Day Attendance Reliability Rate</span>
                  </span>
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg border ${divClass}`}>
                    {attPct.toFixed(1)}% Rate
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      attPct < 70
                        ? 'bg-rose-500'
                        : attPct < 85
                        ? 'bg-amber-500'
                        : attPct < 92
                        ? 'bg-teal-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, attPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#8492A6] dark:text-slate-500 font-mono">
                  <span>&lt;70% Critical Shortage</span>
                  <span>85% Benchmark Target</span>
                  <span>100% Full Roster</span>
                </div>
              </div>

              {/* ROLE-BASED SALARY VISIBILITY SECTION */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#172033] dark:text-slate-300 flex items-center gap-1.5 font-heading">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Compensation & Payroll Grade</span>
                  </span>
                  {isAdmin ? (
                    <Badge variant="success" size="sm">Admin Access</Badge>
                  ) : (
                    <Badge variant="emergency" size="sm">Confidential</Badge>
                  )}
                </div>

                {isAdmin ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#526176] dark:text-slate-400">Monthly Remuneration:</span>
                      <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {formatSalary(staff.salary)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs text-[#526176] dark:text-slate-400">
                      <span>Annual Operational Cost:</span>
                      <span className="font-mono text-[#172033] dark:text-slate-300">
                        {formatSalary((staff.salary || 0) * 12)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 flex items-center gap-2.5 text-xs text-[#526176] dark:text-slate-400">
                    <Lock className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>
                      Financial compensation is restricted to Hospital Administrators.
                    </span>
                  </div>
                )}
              </div>

              {/* Workload & Patient Load */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 shadow-xs">
                  <p className="text-xs text-[#526176] dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Current Patient Load
                  </p>
                  <p className="text-lg font-black text-[#172033] dark:text-white mt-1 font-mono">
                    {staff.current_patient_load} pts
                  </p>
                  <p className="text-[10px] text-[#8492A6] dark:text-slate-500 mt-0.5">
                    {staff.current_patient_load >= 5 ? 'At capacity limit' : 'Available for admissions'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 shadow-xs">
                  <p className="text-xs text-[#526176] dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Building className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Department Wing
                  </p>
                  <p className="text-sm font-bold text-[#172033] dark:text-white mt-1">
                    {staff.department}
                  </p>
                  <p className="text-[10px] text-[#8492A6] dark:text-slate-500 mt-0.5">Assigned Shift: {staff.shift}</p>
                </div>
              </div>

              {/* Clinical Qualification & Contact */}
              <div className="space-y-2.5 p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 text-xs shadow-xs">
                <p className="text-[11px] font-semibold text-[#526176] dark:text-slate-400 uppercase tracking-wider">
                  Credentials & Professional Contact
                </p>

                <div className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#8492A6] dark:text-slate-400 block text-[10px]">Qualifications</span>
                    <span className="text-[#172033] dark:text-white font-medium">
                      {staff.qualification || 'Licensed Healthcare Practitioner'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-slate-800/80">
                  <Mail className="w-4 h-4 text-[#8492A6] flex-shrink-0" />
                  <span className="text-[#172033] dark:text-slate-300 font-mono">
                    {staff.email || `${staff.staff_id.toLowerCase()}@niet.ac.in`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#8492A6] flex-shrink-0" />
                  <span className="text-[#172033] dark:text-slate-300 font-mono">
                    {staff.phone || '+91 98765 XXXXX'}
                  </span>
                </div>
              </div>

              {/* Roster Workflow Actions */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-[#526176] dark:text-slate-400 uppercase tracking-wider mb-2">
                  Roster Workflow Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={isUpdating}
                    onClick={handleToggle}
                    className="px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                    <span>Toggle Attendance</span>
                  </button>

                  <button
                    disabled={isUpdating}
                    onClick={() => {
                      if (onUpdateAvailability) {
                        const nextAvail = staff.availability === 'Available' ? 'Busy' : 'Available';
                        onUpdateAvailability(staff.staff_id, nextAvail);
                      }
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#172033] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold border border-gray-200 dark:border-slate-700 transition-colors"
                  >
                    Toggle Availability
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex items-center justify-between sticky bottom-0 z-20 backdrop-blur-md">
            <span className="text-[11px] text-[#526176] dark:text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>WebSocket Live Sync Enabled</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#172033] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-semibold text-xs border border-gray-200 dark:border-slate-700 transition-colors"
            >
              Close Panel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

