import React, { useState } from 'react';
import { Staff } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Activity, Users, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

interface AttendanceHeatmapProps {
  staffList: Staff[];
}

interface CellData {
  department: string;
  shift: 'Morning' | 'Evening' | 'Night' | 'Overall';
  total: number;
  present: number;
  attendancePct: number;
  staffNames: string[];
}

export const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({ staffList }) => {
  const [hoveredCell, setHoveredCell] = useState<CellData | null>(null);

  const departments = [
    'Emergency',
    'Cardiology',
    'Neurology',
    'Pulmonology',
    'Orthopedics',
    'Pediatrics',
    'Hospital Operations',
  ];

  const shifts: Array<'Morning' | 'Evening' | 'Night'> = ['Morning', 'Evening', 'Night'];

  // Calculate cell data
  const getCellData = (dept: string, shift?: 'Morning' | 'Evening' | 'Night'): CellData => {
    const deptStaff = staffList.filter((s) => s.department === dept);
    const filtered = shift
      ? deptStaff.filter((s) => s.shift === shift)
      : deptStaff;

    const total = filtered.length;
    const present = filtered.filter((s) => s.attendance === 'Present').length;
    
    // Weighted attendance percentage average or fallback to present/total
    let attendancePct = 85.0;
    if (total > 0) {
      const sumPct = filtered.reduce((acc, s) => acc + (s.attendance_percentage ?? 90.0), 0);
      attendancePct = Number((sumPct / total).toFixed(1));
    }

    return {
      department: dept,
      shift: shift || 'Overall',
      total,
      present,
      attendancePct,
      staffNames: filtered.map((s) => `${s.name} (${s.attendance})`),
    };
  };

  /**
   * Diverging Color Scale around baseline target (85%):
   * < 70%: Intense Coral Red (Critical Shortage)
   * 70% - 84%: Warm Amber (Cautionary Sub-optimal)
   * 85% - 91%: Balanced Cyan/Teal (Nominal Operational Baseline)
   * >= 92%: Deep Emerald Green (Full Roster Coverage)
   */
  const getDivergingStyles = (pct: number, total: number) => {
    if (total === 0) {
      return {
        bg: 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-500',
        label: 'No Staff Scheduled',
        dot: 'bg-gray-400 dark:bg-slate-600',
      };
    }
    if (pct < 70) {
      return {
        bg: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-coral-500/20 dark:border-coral-500/40 dark:text-coral-300 dark:hover:bg-coral-500/30',
        label: 'Critical Shortage (<70%)',
        dot: 'bg-rose-500 dark:bg-coral-400',
      };
    }
    if (pct < 85) {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/30',
        label: 'Cautionary Sub-optimal (70-84%)',
        dot: 'bg-amber-500 dark:bg-amber-400',
      };
    }
    if (pct < 92) {
      return {
        bg: 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 dark:bg-cyan-500/20 dark:border-cyan-500/40 dark:text-cyan-300 dark:hover:bg-cyan-500/30',
        label: 'Nominal Baseline (85-91%)',
        dot: 'bg-teal-500 dark:bg-cyan-400',
      };
    }
    return {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-500/30',
      label: 'Optimal Coverage (≥92%)',
      dot: 'bg-emerald-500 dark:bg-emerald-400',
    };
  };

  return (
    <GlassCard className="p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600 dark:text-clinical-400" />
            <span>Department-Wise Attendance Heatmap</span>
            <Badge variant="info" size="sm">Diverging Scale</Badge>
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Real-time shift coverage matrix diverging around target operational threshold (85%).
          </p>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
          <Users className="w-3.5 h-3.5 text-teal-600 dark:text-clinical-400" />
          <span>Workforce: {staffList.length} staff</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[580px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Department</th>
              {shifts.map((shift) => (
                <th key={shift} className="py-2.5 px-3 text-center">
                  {shift} Shift
                </th>
              ))}
              <th className="py-2.5 px-3 text-center">Overall Dept Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-xs">
            {departments.map((dept) => {
              const overall = getCellData(dept);
              const overallStyle = getDivergingStyles(overall.attendancePct, overall.total);

              return (
                <tr key={dept} className="hover:bg-gray-50/70 dark:hover:bg-slate-900/40 transition-colors">
                  {/* Department Column */}
                  <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">
                    <span>{dept}</span>
                    <span className="block text-[10px] text-gray-500 dark:text-slate-500 font-mono">
                      {overall.total} assigned
                    </span>
                  </td>

                  {/* Shift Heatmap Cells */}
                  {shifts.map((shift) => {
                    const cell = getCellData(dept, shift);
                    const style = getDivergingStyles(cell.attendancePct, cell.total);

                    return (
                      <td
                        key={shift}
                        className="py-2 px-2 text-center"
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div
                          className={`p-2 rounded-xl border transition-all cursor-pointer font-mono ${style.bg}`}
                        >
                          {cell.total > 0 ? (
                            <>
                              <span className="font-bold text-xs block">
                                {cell.attendancePct.toFixed(1)}%
                              </span>
                              <span className="text-[10px] opacity-80 block">
                                {cell.present}/{cell.total} on duty
                              </span>
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-400 dark:text-slate-600 block py-1">—</span>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Overall Department Cell */}
                  <td
                    className="py-2 px-2 text-center"
                    onMouseEnter={() => setHoveredCell(overall)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div
                      className={`p-2 rounded-xl border transition-all cursor-pointer font-mono font-bold ${overallStyle.bg}`}
                    >
                      <span className="text-xs block">
                        {overall.attendancePct.toFixed(1)}%
                      </span>
                      <span className="text-[10px] opacity-80 block">
                        {overall.present}/{overall.total} Total
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tooltip / Inspection Card when cell hovered */}
      {hoveredCell && (
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-gray-200 dark:border-clinical-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white">{hoveredCell.department}</span>
              <span className="text-gray-500 dark:text-slate-400 font-mono">({hoveredCell.shift})</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  getDivergingStyles(hoveredCell.attendancePct, hoveredCell.total).dot
                }`}
              />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
              Scheduled Staff: {hoveredCell.staffNames.join(', ') || 'None scheduled'}
            </p>
          </div>
          <div className="text-right flex-shrink-0 font-mono">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {hoveredCell.attendancePct.toFixed(1)}% Rate
            </span>
            <span className="block text-[11px] text-gray-500 dark:text-slate-400">
              {hoveredCell.present} of {hoveredCell.total} active
            </span>
          </div>
        </div>
      )}

      {/* Diverging Color Scale Legend */}
      <div className="pt-2 border-t border-gray-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 mb-1.5">
          <span className="font-semibold text-rose-600 dark:text-coral-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-coral-400" />
            &lt;70% Critical Shortage
          </span>
          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
            70% - 84% Cautionary
          </span>
          <span className="text-teal-600 dark:text-cyan-400 flex items-center gap-1 font-semibold">
            85% - 91% Nominal Target
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            ≥92% Full Coverage
          </span>
        </div>

        {/* Continuous Gradient Bar */}
        <div className="h-2 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 via-teal-400 to-emerald-500 shadow-inner" />
      </div>
    </GlassCard>
  );
};

