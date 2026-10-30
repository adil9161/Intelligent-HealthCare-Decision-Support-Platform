import React, { useState, useMemo } from 'react';
import { Staff, StaffRole, AttendanceStatus, AvailabilityStatus } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { TableSkeleton } from '../common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { useStaffWebSocket, StaffWebSocketEvent } from '../../hooks/useStaffWebSocket';
import { AttendanceHeatmap } from './AttendanceHeatmap';
import { SalaryOverviewChart } from './SalaryOverviewChart';
import { StaffDetailDrawer } from './StaffDetailDrawer';
import {
  UserPlus,
  Search,
  Filter,
  UserCheck,
  Stethoscope,
  Briefcase,
  Clock,
  Activity,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Lock,
  DollarSign,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Radio,
  X,
  RefreshCw,
} from 'lucide-react';

interface StaffListProps {
  staffList: Staff[];
  isLoading: boolean;
  onOpenCreateModal: () => void;
  onToggleAttendance: (staffId: string) => Promise<void>;
  onDeleteStaff: (staffId: string) => Promise<void>;
  onUpdateStaffList?: React.Dispatch<React.SetStateAction<Staff[]>>;
}

type SortColumn =
  | 'staff_id'
  | 'name'
  | 'department'
  | 'role'
  | 'salary'
  | 'attendance_percentage'
  | 'availability';

type SortDirection = 'asc' | 'desc';

export const StaffList: React.FC<StaffListProps> = ({
  staffList,
  isLoading,
  onOpenCreateModal,
  onToggleAttendance,
  onDeleteStaff,
  onUpdateStaffList,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // Search & Filter state (AND logic)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedAttendance, setSelectedAttendance] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');

  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn>('staff_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Slide-over drawer state
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Real-time WebSocket integration across open tabs
  const handleWebSocketEvent = (event: StaffWebSocketEvent) => {
    if (!onUpdateStaffList) return;

    if (event.event === 'STAFF_ATTENDANCE_UPDATED' && event.staff) {
      onUpdateStaffList((prev) =>
        prev.map((s) => (s.staff_id === event.staff_id ? { ...s, ...event.staff } : s))
      );
      // If currently open in slide-over, update in place
      setSelectedStaff((curr) =>
        curr?.staff_id === event.staff_id ? { ...curr, ...event.staff } : curr
      );
    } else if (event.event === 'STAFF_UPDATED' && event.staff) {
      onUpdateStaffList((prev) =>
        prev.map((s) => (s.staff_id === event.staff_id ? { ...s, ...event.staff } : s))
      );
      setSelectedStaff((curr) =>
        curr?.staff_id === event.staff_id ? { ...curr, ...event.staff } : curr
      );
    } else if (event.event === 'STAFF_CREATED' && event.staff) {
      onUpdateStaffList((prev) => [...prev, event.staff!]);
    } else if (event.event === 'STAFF_DELETED' && event.staff_id) {
      onUpdateStaffList((prev) => prev.filter((s) => s.staff_id !== event.staff_id));
      setSelectedStaff((curr) => (curr?.staff_id === event.staff_id ? null : curr));
    }
  };

  const { isConnected } = useStaffWebSocket(handleWebSocketEvent);

  const departments = [
    'All',
    'Emergency',
    'Cardiology',
    'Neurology',
    'Pulmonology',
    'Pediatrics',
    'Orthopedics',
    'Hospital Operations',
  ];

  const roles = ['All', 'Doctor', 'Surgeon', 'Nurse', 'Radiologist', 'Technician', 'Administrator'];
  const attendances = ['All', 'Present', 'On Leave', 'In Surgery', 'On Call', 'Off Duty'];
  const availabilities = ['All', 'Available', 'Busy', 'On Break'];

  // Handle header sorting click
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Locale-based salary formatting (en-IN by default for NIET)
  const formatSalary = (val?: number) => {
    if (val === undefined || val === null) return null;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Diverging scale badge for attendance percentage
  const getDivergingBadge = (pct: number) => {
    if (pct < 70) {
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-coral-500/20 dark:text-coral-300 dark:border-coral-500/40';
    }
    if (pct < 85) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40';
    }
    if (pct < 92) {
      return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40';
    }
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40';
  };

  // Filter with strict AND logic
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      let matchesSearch = true;
      if (searchTerm.trim() !== '') {
        const query = searchTerm.trim().toLowerCase();
        matchesSearch =
          s.name.toLowerCase().includes(query) ||
          s.staff_id.toLowerCase().includes(query) ||
          s.department.toLowerCase().includes(query) ||
          s.role.toLowerCase().includes(query) ||
          (s.qualification && s.qualification.toLowerCase().includes(query)) ||
          false;
      }

      const matchesDept = selectedDept === 'All' || s.department === selectedDept;
      const matchesRole = selectedRole === 'All' || s.role === selectedRole;
      const matchesAttendance = selectedAttendance === 'All' || s.attendance === selectedAttendance;
      const matchesAvailability =
        selectedAvailability === 'All' || s.availability === selectedAvailability;

      return matchesSearch && matchesDept && matchesRole && matchesAttendance && matchesAvailability;
    });
  }, [staffList, searchTerm, selectedDept, selectedRole, selectedAttendance, selectedAvailability]);

  // Sort filtered staff across columns
  const sortedStaff = useMemo(() => {
    return [...filteredStaff].sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'staff_id': {
          const numA = parseInt(a.staff_id.replace(/\D/g, '') || '0', 10);
          const numB = parseInt(b.staff_id.replace(/\D/g, '') || '0', 10);
          comparison = numA !== numB ? numA - numB : a.staff_id.localeCompare(b.staff_id);
          break;
        }
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'salary':
          comparison = (a.salary || 0) - (b.salary || 0);
          break;
        case 'attendance_percentage':
          comparison = (a.attendance_percentage ?? 90) - (b.attendance_percentage ?? 90);
          break;
        case 'availability':
          comparison = a.availability.localeCompare(b.availability);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredStaff, sortColumn, sortDirection]);

  // KPI Aggregates
  const totalStaff = staffList.length;
  const presentCount = staffList.filter((s) => s.attendance === 'Present').length;
  const availableCount = staffList.filter(
    (s) => s.attendance === 'Present' && s.availability === 'Available'
  ).length;
  const avgAttendance =
    staffList.length > 0
      ? (
          staffList.reduce((acc, s) => acc + (s.attendance_percentage ?? 95.0), 0) /
          staffList.length
        ).toFixed(1)
      : '95.0';

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-30 group-hover:opacity-80 transition-opacity" />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-clinical-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-clinical-400" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Staff Roster & Resource Allocation</span>
              <Badge variant="info">{totalStaff} Registered Staff</Badge>
            </h2>

            {/* Real-Time WebSocket Live Indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
              }`}
              title="Real-time WebSocket sync active across all open tabs"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{isConnected ? 'Live WebSocket Sync' : 'Reconnecting...'}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Live shift attendance, clinical workload quotas, and roster management.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Clinical Staff</span>
          </button>
        )}
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase">Total Workforce</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{totalStaff}</p>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Across clinical departments</p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Present on Duty</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{presentCount}</p>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
            {totalStaff > 0 ? Math.round((presentCount / totalStaff) * 100) : 0}% active presence
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs text-teal-600 dark:text-clinical-400 font-semibold uppercase">Available for Triage</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{availableCount}</p>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Unassigned & ready for intake</p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase">Workforce Reliability</p>
          <p className="text-2xl font-black font-mono text-gray-900 dark:text-white mt-1">{avgAttendance}%</p>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">30-day average attendance rate</p>
        </GlassCard>
      </div>

      {/* 1. DEPARTMENT-WISE ATTENDANCE HEATMAP (Diverging Color Scale) */}
      <AttendanceHeatmap staffList={staffList} />

      {/* 2. SALARY OVERVIEW CHART (Role-Based Visibility & Locale Formatting) */}
      <SalaryOverviewChart staffList={staffList} />

      {/* 3. FILTER AND SEARCH BAR (Strict AND Logic) */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Name, Department, Role, or Qualifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700/80 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'Dept: All' : d}
                </option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r === 'All' ? 'Role: All' : r}
                </option>
              ))}
            </select>

            <select
              value={selectedAttendance}
              onChange={(e) => setSelectedAttendance(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {attendances.map((a) => (
                <option key={a} value={a}>
                  {a === 'All' ? 'Attendance: All' : a}
                </option>
              ))}
            </select>

            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {availabilities.map((av) => (
                <option key={av} value={av}>
                  {av === 'All' ? 'Availability: All' : av}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* 4. STAFF ROSTER TABLE (Table-and-Panel Pattern) */}
      {isLoading ? (
        <TableSkeleton rows={7} columns={8} />
      ) : (
        <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50/90 dark:bg-slate-900/90 text-[11px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider select-none">
                {/* 1. Staff ID */}
                <th
                  onClick={() => handleSort('staff_id')}
                  className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Staff ID</span>
                    {renderSortIcon('staff_id')}
                  </div>
                </th>

                {/* 2. Name */}
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Name</span>
                    {renderSortIcon('name')}
                  </div>
                </th>

                {/* 3. Department */}
                <th
                  onClick={() => handleSort('department')}
                  className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Department</span>
                    {renderSortIcon('department')}
                  </div>
                </th>

                {/* 4. Role */}
                <th
                  onClick={() => handleSort('role')}
                  className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role</span>
                    {renderSortIcon('role')}
                  </div>
                </th>

                {/* 5. Salary (Role-based) */}
                <th
                  onClick={() => handleSort('salary')}
                  className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Salary</span>
                    {!isAdmin && <Lock className="w-3 h-3 text-rose-500" />}
                    {renderSortIcon('salary')}
                  </div>
                </th>

                {/* 6. Attendance Percentage */}
                <th
                  onClick={() => handleSort('attendance_percentage')}
                  className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Attendance %</span>
                    {renderSortIcon('attendance_percentage')}
                  </div>
                </th>

                {/* 7. Availability Status */}
                <th
                  onClick={() => handleSort('availability')}
                  className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Availability</span>
                    {renderSortIcon('availability')}
                  </div>
                </th>

                {/* Actions */}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-xs">
              {sortedStaff.length > 0 ? (
                sortedStaff.map((staff) => {
                  const attPercentage = staff.attendance_percentage ?? 95.0;
                  const divBadgeClass = getDivergingBadge(attPercentage);
                  const formattedSalary = formatSalary(staff.salary);

                  return (
                    <tr
                      key={staff.id}
                      onClick={() => setSelectedStaff(staff)}
                      className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      {/* 1. Staff ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-teal-700 dark:text-clinical-400 text-[11px] px-2 py-0.5 rounded-md bg-teal-50 dark:bg-slate-900 border border-teal-200 dark:border-slate-700/80 group-hover:border-teal-400 transition-colors">
                          {staff.staff_id}
                        </span>
                      </td>

                      {/* 2. Name */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-clinical-300 transition-colors">
                            {staff.name}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate max-w-xs">
                            {staff.qualification || 'Clinical Practitioner'}
                          </p>
                        </div>
                      </td>

                      {/* 3. Department */}
                      <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-slate-200">
                        {staff.department}
                      </td>

                      {/* 4. Role */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 dark:bg-slate-900 dark:text-clinical-300 dark:border-slate-700">
                          {staff.role}
                        </span>
                      </td>

                      {/* 5. Salary (Role-Based Visibility) */}
                      <td className="py-3.5 px-4">
                        {isAdmin && formattedSalary ? (
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formattedSalary}
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 font-mono text-[11px] text-gray-500 dark:text-slate-500 bg-gray-100 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-800"
                            title="Restricted: Salary metrics visible exclusively to Administrators"
                          >
                            <Lock className="w-3 h-3 text-rose-500" />
                            <span>Confidential</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Attendance Percentage (Diverging Color Scale) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-md border ${divBadgeClass}`}
                          >
                            {attPercentage.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-slate-400 font-mono">
                            ({staff.attendance})
                          </span>
                        </div>
                      </td>

                      {/* 7. Availability Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            staff.availability === 'Available'
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30'
                              : staff.availability === 'Busy'
                              ? 'text-rose-700 bg-rose-50 border border-rose-200 dark:text-coral-300 dark:bg-coral-500/10 dark:border-coral-500/30'
                              : 'text-amber-700 bg-amber-50 border border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              staff.availability === 'Available'
                                ? 'bg-emerald-500'
                                : staff.availability === 'Busy'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span>{staff.availability}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Slide-over Profile Drawer Button */}
                          <button
                            onClick={() => setSelectedStaff(staff)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                            title="Open Slide-Over Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Toggle Attendance Button (Broadcasts over WebSocket) */}
                          <button
                            onClick={() => onToggleAttendance(staff.staff_id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              staff.attendance === 'Present'
                                ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-500/10'
                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                            title={`Toggle attendance for ${staff.name} (Live WebSocket Broadcast)`}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* Admin Only Delete */}
                          {isAdmin && (
                            <button
                              onClick={() => {
                                if (confirm(`Remove staff member ${staff.name}?`)) {
                                  onDeleteStaff(staff.staff_id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-coral-400 dark:hover:bg-slate-800 transition-colors"
                              title="Delete staff record (Admin only)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500 dark:text-slate-400">
                    <Briefcase className="w-8 h-8 mx-auto text-gray-400 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-sm text-gray-800 dark:text-slate-200">No staff members match the selected filters</p>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                      Try resetting your search query or department/role dropdowns.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
      )}

      {/* Slide-Over Detail Drawer */}
      <StaffDetailDrawer
        staff={selectedStaff}
        isOpen={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        onToggleAttendance={onToggleAttendance}
      />
    </div>
  );
};
