import React, { useState, useMemo } from 'react';
import { Patient, UrgencyLevel, PatientStatus } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { TriageScoreBadge } from './TriageScoreBadge';
import { TableSkeleton } from '../common/SkeletonLoader';
import {
  Search,
  Plus,
  Filter,
  Users,
  Activity,
  AlertTriangle,
  Stethoscope,
  Eye,
  Trash2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Sparkles,
} from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  isLoading: boolean;
  onSelectPatient: (patient: Patient) => void;
  onOpenCreateModal: () => void;
  onDeletePatient: (patientId: string) => Promise<void>;
  onRerunTriage: (patientId: string) => Promise<void>;
}

type SortColumn =
  | 'patient_id'
  | 'name'
  | 'age'
  | 'symptoms'
  | 'severity'
  | 'urgency'
  | 'assigned_department'
  | 'status';

type SortDirection = 'asc' | 'desc';

const URGENCY_PRIORITY_MAP: Record<string, number> = {
  Emergency: 4,
  Urgent: 3,
  'Semi-Urgent': 2,
  'Non-Urgent': 1,
};

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  isLoading,
  onSelectPatient,
  onOpenCreateModal,
  onDeletePatient,
  onRerunTriage,
}) => {
  // Search & Filter state (AND logic)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn>('patient_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const departments = [
    'All',
    'Emergency',
    'Cardiology',
    'Neurology',
    'Pulmonology',
    'Orthopedics',
    'Gastroenterology',
    'Nephrology',
    'Pediatrics',
    'General Medicine',
  ];

  const urgencies = ['All', 'Emergency', 'Urgent', 'Semi-Urgent', 'Non-Urgent'];
  const statuses = [
    'All',
    'Waiting',
    'Triage Evaluated',
    'In Consultation',
    'Admitted',
    'Discharged',
  ];

  // Handle header sorting click
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to page 1 on sort change
  };

  // Filter with strict AND logic
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // 1. Search Query Match
      let matchesSearch = true;
      if (searchTerm.trim() !== '') {
        const query = searchTerm.trim().toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesId = p.patient_id.toLowerCase().includes(query);
        const matchesDisease = p.disease?.toLowerCase().includes(query) ?? false;
        const matchesDept = p.assigned_department.toLowerCase().includes(query);
        const matchesSymptoms = p.symptoms.some((s) => s.toLowerCase().includes(query));

        matchesSearch = matchesName || matchesId || matchesDisease || matchesDept || matchesSymptoms;
      }

      // 2. Department Match
      const matchesDept = selectedDept === 'All' || p.assigned_department === selectedDept;

      // 3. Urgency Match
      const matchesUrgency = selectedUrgency === 'All' || p.urgency === selectedUrgency;

      // 4. Status Match
      const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

      // Strict AND combination of all 4 criteria
      return matchesSearch && matchesDept && matchesUrgency && matchesStatus;
    });
  }, [patients, searchTerm, selectedDept, selectedUrgency, selectedStatus]);

  // Sort filtered patients across ANY column
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'patient_id': {
          const numA = parseInt(a.patient_id.replace(/\D/g, '') || '0', 10);
          const numB = parseInt(b.patient_id.replace(/\D/g, '') || '0', 10);
          comparison = numA !== numB ? numA - numB : a.patient_id.localeCompare(b.patient_id);
          break;
        }
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'age':
          comparison = a.age - b.age;
          break;
        case 'symptoms':
          // Sort primarily by symptom count, secondarily by first symptom name
          comparison = a.symptoms.length - b.symptoms.length;
          if (comparison === 0 && a.symptoms.length > 0 && b.symptoms.length > 0) {
            comparison = a.symptoms[0].localeCompare(b.symptoms[0]);
          }
          break;
        case 'severity':
          comparison = a.severity - b.severity;
          break;
        case 'urgency':
          comparison =
            (URGENCY_PRIORITY_MAP[a.urgency] || 0) - (URGENCY_PRIORITY_MAP[b.urgency] || 0);
          break;
        case 'assigned_department':
          comparison = a.assigned_department.localeCompare(b.assigned_department);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredPatients, sortColumn, sortDirection]);

  // Pagination calculation
  const totalFiltered = sortedPatients.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedPatients = sortedPatients.slice(startIndex, endIndex);

  // Quick stats
  const totalPatients = patients.length;
  const emergencyCount = patients.filter((p) => p.urgency === 'Emergency').length;
  const waitingCount = patients.filter((p) => p.status === 'Waiting').length;
  const avgSeverity =
    patients.length > 0
      ? (patients.reduce((sum, p) => sum + p.severity, 0) / patients.length).toFixed(1)
      : '0.0';

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedDept !== 'All' ||
    selectedUrgency !== 'All' ||
    selectedStatus !== 'All';

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedDept('All');
    setSelectedUrgency('All');
    setSelectedStatus('All');
    setCurrentPage(1);
  };

  const renderSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-30 group-hover:opacity-80 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-clinical-400 animate-in fade-in" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-clinical-400 animate-in fade-in" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#172033] dark:text-white tracking-tight flex items-center gap-2.5 font-heading">
            <span>Patient Intake & Triage Management</span>
            <Badge variant="info">{totalPatients} Registered</Badge>
          </h2>
          <p className="text-xs text-[#526176] dark:text-slate-400 mt-1 font-body">
            Intake registry, fuzzy acuity grading, and AI decision passport reviews.
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-[12px] bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all duration-200 shrink-0 focus-visible:ring-4 focus-visible:ring-teal-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Patient Intake</span>
        </button>
      </div>

      {/* KPI Stats Bar: 4 Metric Cards with Dedicated Accents */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total In-Hospital (Blue) */}
        <div className="group relative overflow-hidden rounded-[18px] bg-white dark:bg-slate-900/80 p-5 shadow-sm hover:shadow-card-hover transition-all duration-200 border-l-4 border-l-blue-500 border border-gray-200 dark:border-slate-800">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#526176] dark:text-slate-400">Total In-Hospital</p>
              <p className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#172033] dark:text-white font-heading">{totalPatients}</p>
              <p className="text-xs text-[#8492A6] dark:text-slate-400 font-body">Active registered cases</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Emergency Resuscitation (Coral/Red) */}
        <div className="group relative overflow-hidden rounded-[18px] bg-white dark:bg-slate-900/80 p-5 shadow-sm hover:shadow-card-hover transition-all duration-200 border-l-4 border-l-rose-500 border border-gray-200 dark:border-slate-800">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Emergency Resuscitation
              </p>
              <p className="text-2xl lg:text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 font-heading">{emergencyCount}</p>
              <p className="text-xs text-[#8492A6] dark:text-slate-400 font-body">ESI Level 1 & 2 priority</p>
            </div>
            <div className={`p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50 ${emergencyCount > 0 ? 'animate-pulse' : ''}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Triage Queue (Amber) */}
        <div className="group relative overflow-hidden rounded-[18px] bg-white dark:bg-slate-900/80 p-5 shadow-sm hover:shadow-card-hover transition-all duration-200 border-l-4 border-l-amber-500 border border-gray-200 dark:border-slate-800">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Triage Queue</p>
              <p className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#172033] dark:text-white font-heading">{waitingCount}</p>
              <p className="text-xs text-[#8492A6] dark:text-slate-400 font-body">Awaiting physician consult</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Average Severity (Teal) */}
        <div className="group relative overflow-hidden rounded-[18px] bg-white dark:bg-slate-900/80 p-5 shadow-sm hover:shadow-card-hover transition-all duration-200 border-l-4 border-l-teal-600 border border-gray-200 dark:border-slate-800">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">Average Severity</p>
              <p className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#172033] dark:text-white font-heading">{avgSeverity} / 10</p>
              <p className="text-xs text-[#8492A6] dark:text-slate-400 font-body">Defuzzified case severity</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/50">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Clean White Toolbar with Accessible Focus) */}
      <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#8492A6]" />
            <input
              type="text"
              placeholder="Search by ID, Name, Condition, Symptoms (e.g. PT-1001, Chest Pain)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 text-xs text-[#172033] dark:text-white placeholder-[#8492A6] focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/50 transition-all font-body"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-3 text-[#8492A6] hover:text-[#172033] dark:hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department, Urgency, Status Dropdowns (AND combined) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#526176] dark:text-slate-400 font-medium">
              <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Filters:</span>
            </div>

            {/* Department */}
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all font-body cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'Dept: All' : d}
                </option>
              ))}
            </select>

            {/* Urgency */}
            <select
              value={selectedUrgency}
              onChange={(e) => {
                setSelectedUrgency(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all font-body cursor-pointer"
            >
              {urgencies.map((u) => (
                <option key={u} value={u}>
                  {u === 'All' ? 'Urgency: All' : u}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all font-body cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'Status: All' : s}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Reset all filters to default"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-slate-800 text-xs text-[#526176] dark:text-slate-400">
            <span className="font-semibold text-[11px] text-[#8492A6] uppercase tracking-wider">
              Active Constraints:
            </span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 text-[11px]">
                Search: "{searchTerm}"
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-600"
                  onClick={() => setSearchTerm('')}
                />
              </span>
            )}
            {selectedDept !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-[#172033] border border-gray-200 dark:bg-slate-800 dark:text-slate-300 text-[11px]">
                Dept: {selectedDept}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-600"
                  onClick={() => setSelectedDept('All')}
                />
              </span>
            )}
            {selectedUrgency !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-[#172033] border border-gray-200 dark:bg-slate-800 dark:text-slate-300 text-[11px]">
                Urgency: {selectedUrgency}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-600"
                  onClick={() => setSelectedUrgency('All')}
                />
              </span>
            )}
            {selectedStatus !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-[#172033] border border-gray-200 dark:bg-slate-800 dark:text-slate-300 text-[11px]">
                Status: {selectedStatus}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-600"
                  onClick={() => setSelectedStatus('All')}
                />
              </span>
            )}
            <span className="text-[11px] text-[#8492A6] font-mono ml-auto">
              Matched: {totalFiltered} of {totalPatients}
            </span>
          </div>
        )}
      </div>

      {/* Patient Table with sorting on EVERY column */}
      {isLoading ? (
        <TableSkeleton rows={8} columns={9} />
      ) : (
        <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/80 text-[11px] font-bold text-[#526176] dark:text-slate-300 uppercase tracking-wider select-none font-heading">
                {/* 1. Patient ID */}
                <th
                  onClick={() => handleSort('patient_id')}
                  className="py-3.5 px-4 cursor-pointer hover:text-teal-700 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Patient ID</span>
                    {renderSortIndicator('patient_id')}
                  </div>
                </th>

                {/* 2. Name */}
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-teal-700 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Name</span>
                    {renderSortIndicator('name')}
                  </div>
                </th>

                {/* 3. Age */}
                <th
                  onClick={() => handleSort('age')}
                  className="py-3.5 px-4 cursor-pointer hover:text-teal-700 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Age</span>
                    {renderSortIndicator('age')}
                  </div>
                </th>

                {/* 4. Symptoms */}
                <th
                  onClick={() => handleSort('symptoms')}
                  className="py-3.5 px-4 cursor-pointer hover:text-teal-700 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Symptoms</span>
                    {renderSortIndicator('symptoms')}
                  </div>
                </th>

                {/* 5. Severity */}
                <th
                  onClick={() => handleSort('severity')}
                  className="py-3.5 px-4 cursor-pointer hover:text-teal-700 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Severity</span>
                    {renderSortIndicator('severity')}
                  </div>
                </th>

                {/* 6. Urgency */}
                <th
                  onClick={() => handleSort('urgency')}
                  className="py-3.5 px-4 cursor-pointer hover:text-teal-700 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Urgency</span>
                    {renderSortIndicator('urgency')}
                  </div>
                </th>

                {/* 7. Assigned Department */}
                <th
                  onClick={() => handleSort('assigned_department')}
                  className="py-3.5 px-4 cursor-pointer hover:text-teal-700 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Assigned Department</span>
                    {renderSortIndicator('assigned_department')}
                  </div>
                </th>

                {/* 8. Status */}
                <th
                  onClick={() => handleSort('status')}
                  className="py-3.5 px-4 cursor-pointer hover:text-teal-700 dark:hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {renderSortIndicator('status')}
                  </div>
                </th>

                {/* Actions */}
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7] dark:divide-slate-800 text-xs font-body">
              {paginatedPatients.length > 0 ? (
                paginatedPatients.map((patient) => {
                  const aiScore =
                    patient.ai_recommendation?.primary_recommendation?.decision_score;
                  const hasUnknownWarning =
                    patient.ai_recommendation?.warnings &&
                    patient.ai_recommendation.warnings.length > 0;

                  return (
                    <tr
                      key={patient.id}
                      onClick={() => onSelectPatient(patient)}
                      className="hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Column 1: Patient ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-teal-700 dark:text-teal-300 text-[11px] px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 group-hover:border-teal-400 transition-colors">
                          {patient.patient_id}
                        </span>
                      </td>

                      {/* Column 2: Name */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-[#172033] dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors font-sans">
                            {patient.name}
                          </p>
                          <p className="text-[11px] text-[#526176] dark:text-slate-400">
                            {patient.gender} • {patient.disease || 'Under Evaluation'}
                          </p>
                        </div>
                      </td>

                      {/* Column 3: Age */}
                      <td className="py-3.5 px-4 font-mono font-medium text-[#172033] dark:text-slate-300">
                        {patient.age}y
                      </td>

                      {/* Column 4: Symptoms */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap items-center gap-1">
                          {patient.symptoms.slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-[#526176] dark:text-slate-300 border border-gray-200 dark:border-slate-700 truncate max-w-[140px]"
                              title={s}
                            >
                              {s}
                            </span>
                          ))}
                          {patient.symptoms.length > 2 && (
                            <span className="text-[10px] font-mono text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60">
                              +{patient.symptoms.length - 2}
                            </span>
                          )}
                          {hasUnknownWarning && (
                            <span
                              className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded font-mono"
                              title="Soft warning: contains uncataloged symptom"
                            >
                              ⚠️ Uncataloged
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Severity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[11px] text-[#172033] dark:text-slate-200">
                            {patient.severity.toFixed(1)}/10
                          </span>
                        </div>
                        {/* Mini Severity Meter */}
                        <div className="w-20 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              patient.severity >= 8.5
                                ? 'bg-rose-500 shadow-sm'
                                : patient.severity >= 6.5
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${(patient.severity / 10) * 100}%` }}
                          />
                        </div>
                      </td>

                      {/* Column 6: Urgency */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            patient.urgency === 'Emergency'
                              ? 'emergency'
                              : patient.urgency === 'Urgent'
                              ? 'urgent'
                              : 'semi'
                          }
                          pulse={patient.urgency === 'Emergency'}
                          size="sm"
                        >
                          {patient.urgency}
                        </Badge>
                      </td>

                      {/* Column 7: Assigned Department */}
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 font-semibold text-[#172033] dark:text-white font-body">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                          <span>{patient.assigned_department}</span>
                        </span>
                        {patient.bed_number && (
                          <span className="text-[10px] text-[#8492A6] dark:text-slate-400 block mt-0.5 font-mono">
                            Bed: {patient.bed_number}
                          </span>
                        )}
                      </td>

                      {/* Column 8: Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 border border-slate-200 text-[#172033] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                          {patient.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onSelectPatient(patient)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                            title="Open Decision Support Slide-Over Panel"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRerunTriage(patient.patient_id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-clinical-400 dark:hover:bg-slate-800 transition-colors"
                            title="Re-run AI Multi-Paradigm Triage"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove patient record for ${patient.name}?`)) {
                                onDeletePatient(patient.patient_id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-coral-400 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Patient Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500 dark:text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-gray-400 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-sm text-gray-800 dark:text-slate-200">No patients match filter criteria</p>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                      Try adjusting your search keywords or resetting filters.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-3 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold hover:bg-teal-100 dark:bg-clinical-600/20 dark:text-clinical-300 dark:border-clinical-500/30 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800/80 bg-gray-50/60 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Showing{' '}
              <strong className="text-gray-900 dark:text-white">
                {totalFiltered === 0 ? 0 : startIndex + 1}
              </strong>{' '}
              to <strong className="text-gray-900 dark:text-white">{endIndex}</strong> of{' '}
              <strong className="text-gray-900 dark:text-white">{totalFiltered}</strong> patients
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-white text-gray-700 dark:text-white transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-white text-gray-700 dark:text-white transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-mono text-xs text-gray-600 dark:text-slate-300">
              Page <strong className="text-gray-900 dark:text-white">{safePage}</strong> of{' '}
              <strong className="text-gray-900 dark:text-white">{totalPages}</strong>
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-white text-gray-700 dark:text-white transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-white text-gray-700 dark:text-white transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
