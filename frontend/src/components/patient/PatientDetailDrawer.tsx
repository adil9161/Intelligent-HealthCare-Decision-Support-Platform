import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Patient, PatientStatus, AuditLogItem } from '../../types';
import { Badge } from '../common/Badge';
import { CountUpScore } from './CountUpScore';
import { patientService } from '../../services/patientService';
import {
  X,
  HeartPulse,
  Activity,
  AlertTriangle,
  Stethoscope,
  Bed,
  Sparkles,
  GitCommit,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building2,
  FileText,
  UserCheck,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

interface PatientDetailDrawerProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (patientId: string, status: PatientStatus) => Promise<void>;
  onRerunTriage: (patientId: string) => Promise<void>;
}

export const PatientDetailDrawer: React.FC<PatientDetailDrawerProps> = ({
  patient,
  isOpen,
  onClose,
  onUpdateStatus,
  onRerunTriage,
}) => {
  const [activeTab, setActiveTab] = useState<'clinical' | 'audit'>('clinical');
  const [isUpdating, setIsUpdating] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Fetch patient audit logs whenever patient changes or drawer opens
  useEffect(() => {
    if (isOpen && patient?.patient_id) {
      setIsLoadingLogs(true);
      patientService
        .getPatientAuditLogs(patient.patient_id)
        .then((logs) => {
          setAuditLogs(logs || []);
        })
        .catch(() => {
          setAuditLogs([]);
        })
        .finally(() => {
          setIsLoadingLogs(false);
        });
    }
  }, [isOpen, patient?.patient_id]);

  if (!isOpen || !patient) return null;

  const aiRec = patient.ai_recommendation;
  const primaryDept = aiRec?.primary_recommendation;
  const alternatives = aiRec?.ranked_alternatives || [];
  const softWarnings = aiRec?.warnings || [];

  const handleStatusChange = async (newStatus: PatientStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(patient.patient_id, newStatus);
      // Refresh audit logs
      const updatedLogs = await patientService.getPatientAuditLogs(patient.patient_id);
      setAuditLogs(updatedLogs || []);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRerun = async () => {
    setIsUpdating(true);
    try {
      await onRerunTriage(patient.patient_id);
      // Refresh audit logs
      const updatedLogs = await patientService.getPatientAuditLogs(patient.patient_id);
      setAuditLogs(updatedLogs || []);
    } finally {
      setIsUpdating(false);
    }
  };

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

        {/* Slide-over Panel with Spring Physics */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-midnight-950 border-l border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 h-full overflow-y-auto shadow-2xl flex flex-col justify-between z-10"
        >
          {/* Drawer Top Header */}
          <div>
            <div className="p-5 border-b border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 sticky top-0 z-20 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 dark:bg-clinical-500/10 dark:border-clinical-500/30 flex items-center justify-center text-teal-600 dark:text-clinical-400">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                      {patient.name}
                    </h2>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 dark:bg-slate-800 dark:text-clinical-400 font-semibold border border-teal-200 dark:border-slate-700">
                      {patient.patient_id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    {patient.age} yrs • {patient.gender} • Emergency Contact: {patient.contact || 'N/A'}
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

            {/* Navigation Tabs: Clinical Overview vs Audit Trail */}
            <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/40 px-5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('clinical')}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'clinical'
                    ? 'border-teal-600 text-teal-700 dark:border-clinical-500 dark:text-clinical-300 font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Decision Passport</span>
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'audit'
                    ? 'border-clinical-500 text-clinical-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Audit Trail Table</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {auditLogs.length}
                </span>
              </button>
            </div>

            {/* TAB 1: Clinical Decision Support & Passport */}
            {activeTab === 'clinical' && (
              <div className="p-5 space-y-5">
                {/* Status & Priority Badge Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <p className="text-[11px] text-[#526176] dark:text-slate-400 uppercase font-semibold">
                      Current Status & Urgency
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          patient.urgency === 'Emergency'
                            ? 'emergency'
                            : patient.urgency === 'Urgent'
                            ? 'urgent'
                            : 'neutral'
                        }
                        pulse={patient.urgency === 'Emergency'}
                      >
                        {patient.status}
                      </Badge>
                      <span className="text-xs text-[#526176] dark:text-slate-300 font-mono">
                        Urgency: {patient.urgency}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <p className="text-[11px] text-[#526176] dark:text-slate-400 uppercase font-semibold">
                      Assigned Department
                    </p>
                    <p className="text-sm font-bold text-[#172033] dark:text-white flex items-center gap-1.5 justify-end">
                      <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      {patient.assigned_department}
                    </p>
                  </div>
                </div>

                {/* Soft Warnings Banner (Quality Bar Requirement) */}
                {softWarnings.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 space-y-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Algorithmic Soft Warning Note:</span>
                    </div>
                    <ul className="space-y-1.5 pl-6 text-xs text-amber-800 dark:text-amber-200 list-disc font-body">
                      {softWarnings.map((warn, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {warn}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 italic pt-1">
                      System evaluated using correlated heuristic baseline without interrupting intake or throwing runtime errors.
                    </p>
                  </div>
                )}

                {/* AI Recommendation Panel with ANIMATED COUNT-UP SCORE */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/60 via-white to-white dark:from-teal-950/40 dark:via-slate-900/70 dark:to-slate-900/90 border border-teal-200 dark:border-teal-500/30 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span className="text-sm font-bold text-[#172033] dark:text-white font-heading">
                          AI Multi-Paradigm Recommendation
                        </span>
                        <Badge variant="info" size="sm">
                          Unit 4 Reasoning
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#526176] dark:text-slate-400 mt-0.5 font-body">
                        Forward-chaining rules + Certainty Factors + Continuous Fuzzy Logic
                      </p>
                    </div>

                    {/* Animated Score Counting Up */}
                    {primaryDept && (
                      <div className="flex-shrink-0">
                        <CountUpScore
                          score={primaryDept.decision_score}
                          duration={1200}
                          size="md"
                        />
                      </div>
                    )}
                  </div>

                  {primaryDept ? (
                    <>
                      <div>
                        <p className="text-xs text-[#526176] dark:text-slate-400 font-semibold uppercase">
                          Top Department Match
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl font-black text-[#172033] dark:text-white font-heading">
                            {primaryDept.department}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-mono font-bold border border-teal-200 dark:bg-slate-800 dark:text-teal-300 dark:border-slate-700">
                            {primaryDept.department_code}
                          </span>
                          {primaryDept.floor && (
                            <span className="text-xs text-[#526176] dark:text-slate-400 flex items-center gap-1 font-body">
                              <Building2 className="w-3 h-3 text-[#8492A6]" />
                              {primaryDept.floor}
                            </span>
                          )}
                        </div>

                        {/* Suggested Resource Tier */}
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 dark:bg-teal-950/60 dark:border-teal-700 dark:text-teal-300">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{primaryDept.suggested_resource_tier}</span>
                        </div>

                        <p className="text-xs text-[#526176] dark:text-slate-300 mt-2 italic bg-gray-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 font-body">
                          "{primaryDept.clinical_rationale}"
                        </p>
                      </div>

                      {/* Reasoning Trace: Certainty Factors & Fuzzy Degrees */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 shadow-xs">
                          <span className="text-[#526176] dark:text-slate-400 font-semibold">
                            Certainty Factor (CF)
                          </span>
                          <p className="text-base font-bold font-mono text-teal-700 dark:text-teal-300 mt-0.5">
                            +{primaryDept.certainty_factor.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-[#8492A6] dark:text-slate-500 mt-0.5 font-mono">
                            CF_comb = CF1 + CF2*(1 - CF1)
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 shadow-xs">
                          <span className="text-[#526176] dark:text-slate-400 font-semibold">
                            Fuzzy Severity Degree
                          </span>
                          <p className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                            {(primaryDept.fuzzy_severity_degree * 100).toFixed(0)}% Centroid
                          </p>
                          <p className="text-[10px] text-[#8492A6] dark:text-slate-500 mt-0.5">
                            Continuous membership defuzzification
                          </p>
                        </div>
                      </div>

                      {/* Activated Clinical Rules */}
                      {primaryDept.activated_rules.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-500/30">
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Activated Clinical Rules
                          </p>
                          <ul className="mt-1.5 space-y-1">
                            {primaryDept.activated_rules.map((rule, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-gray-700 dark:text-slate-300 list-disc list-inside font-body"
                              >
                                {rule}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Optimal A* Decision Graph Pathway */}
                      {aiRec?.search_pathway && (
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 shadow-xs">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-[#172033] dark:text-slate-300 flex items-center gap-1.5 font-heading">
                              <GitCommit className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                              <span>Optimal A* Decision Graph Route</span>
                            </p>
                            <span className="font-mono text-xs text-teal-700 dark:text-teal-400 font-bold">
                              Cost: {aiRec.search_pathway.total_path_cost} mins
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
                            {aiRec.search_pathway.optimal_path_labels.map((step, idx) => (
                              <React.Fragment key={idx}>
                                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-[#172033] dark:text-slate-200 border border-gray-200 dark:border-slate-700">
                                  {step}
                                </span>
                                {idx < aiRec.search_pathway!.optimal_path_labels.length - 1 && (
                                  <span className="text-teal-600 dark:text-teal-400 font-bold">→</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ranked Alternative Departments */}
                      {alternatives.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <p className="text-xs font-semibold text-[#526176] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-[#8492A6]" />
                            <span>Ranked Alternative Pathways</span>
                          </p>
                          <div className="space-y-1.5">
                            {alternatives.map((alt) => (
                              <div
                                key={alt.rank}
                                className="p-2.5 rounded-xl bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-slate-800 text-[#526176] dark:text-slate-400 flex items-center justify-center font-mono font-bold text-[10px]">
                                    #{alt.rank}
                                  </span>
                                  <span className="font-bold text-[#172033] dark:text-slate-200 font-sans">
                                    {alt.department}
                                  </span>
                                  <span className="text-[10px] text-[#8492A6] font-mono">
                                    ({alt.department_code})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[#526176] dark:text-slate-400 font-mono text-[11px]">
                                    CF: +{alt.certainty_factor.toFixed(2)}
                                  </span>
                                  <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                                    {alt.decision_score.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6 text-xs text-[#526176] dark:text-slate-400 space-y-2">
                      <p>No AI decision evaluation attached to this patient yet.</p>
                      <button
                        onClick={handleRerun}
                        disabled={isUpdating}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Run AI Evaluation Now</span>
                      </button>
                    </div>
                  )}

                  {/* Mandatory Clinical Notice */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 dark:bg-slate-950/80 dark:border-slate-800 text-[11px] text-[#526176] dark:text-slate-400 leading-relaxed font-body">
                    <span className="font-bold text-amber-700 dark:text-amber-400">CLINICAL NOTICE:</span> AegisHealth AI is an advisory clinical decision support system, not an autonomous diagnostic agent. All recommendations must be confirmed by the attending licensed medical doctor.
                  </div>
                </div>

                {/* Vitals Signs Grid */}
                <div>
                  <h4 className="text-xs font-semibold text-[#526176] dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Recorded Vital Signs
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 text-center shadow-xs">
                      <p className="text-[10px] text-[#8492A6] uppercase">Blood Pressure</p>
                      <p className="text-sm font-bold font-mono text-[#172033] dark:text-white mt-0.5">
                        {patient.vitals?.bp || '120/80'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 text-center shadow-xs">
                      <p className="text-[10px] text-[#8492A6] uppercase">Heart Rate</p>
                      <p className="text-sm font-bold font-mono text-[#172033] dark:text-white mt-0.5">
                        {patient.vitals?.heart_rate || 78} bpm
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 text-center shadow-xs">
                      <p className="text-[10px] text-[#8492A6] uppercase">SpO2 Oxygen</p>
                      <p
                        className={`text-sm font-bold font-mono mt-0.5 ${
                          (patient.vitals?.spo2 || 98) < 92 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {patient.vitals?.spo2 || 98}%
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 text-center shadow-xs">
                      <p className="text-[10px] text-[#8492A6] uppercase">Temperature</p>
                      <p className="text-sm font-bold font-mono text-[#172033] dark:text-white mt-0.5">
                        {patient.vitals?.temperature || 98.6} °F
                      </p>
                    </div>
                  </div>
                </div>

                {/* Presenting Symptoms */}
                <div>
                  <h4 className="text-xs font-semibold text-[#526176] dark:text-slate-400 uppercase tracking-wider mb-2">
                    Presenting Symptoms ({patient.symptoms.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.symptoms.map((sym, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-[#172033] dark:text-slate-200 font-body"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Operational Placement: Bed & Attending Physician */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 shadow-xs">
                    <p className="text-xs text-[#526176] dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                      <Bed className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Bed Allocation
                    </p>
                    <p className="text-sm font-bold text-[#172033] dark:text-white mt-1 font-body">
                      {patient.bed_number || 'Unallocated (OPD)'}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 shadow-xs">
                    <p className="text-xs text-[#526176] dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Attending Physician
                    </p>
                    <p className="text-sm font-bold text-[#172033] dark:text-white mt-1 font-body">
                      {patient.assigned_doctor || 'Dr. Mohd. Nazim'}
                    </p>
                  </div>
                </div>

                {/* Physician Workflow Actions */}
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-[#526176] dark:text-slate-400 uppercase tracking-wider mb-2">
                    Physician Workflow Actions
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      disabled={isUpdating}
                      onClick={() => handleStatusChange('In Consultation')}
                      className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#172033] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold border border-gray-200 dark:border-slate-700 transition-colors"
                    >
                      Consultation
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => handleStatusChange('Admitted')}
                      className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-700 transition-colors"
                    >
                      Admit Ward
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => handleStatusChange('Discharged')}
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-700 transition-colors"
                    >
                      Discharge
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AUDIT TRAIL TABLE (Quality Bar Requirement) */}
            {activeTab === 'audit' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#172033] dark:text-white flex items-center gap-2 font-heading">
                      <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Audit Trail History</span>
                    </h3>
                    <p className="text-xs text-[#526176] dark:text-slate-400 mt-0.5 font-body">
                      Chronological tamper-evident audit logs for patient #{patient.patient_id}.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsLoadingLogs(true);
                      patientService
                        .getPatientAuditLogs(patient.patient_id)
                        .then((logs) => setAuditLogs(logs || []))
                        .finally(() => setIsLoadingLogs(false));
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                    title="Refresh Audit Logs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {isLoadingLogs ? (
                  <div className="py-8 text-center text-xs text-[#526176] dark:text-slate-400">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin text-teal-600 mb-2" />
                    <span>Loading audit records...</span>
                  </div>
                ) : auditLogs.length > 0 ? (
                  <div className="space-y-2.5 font-body">
                    {auditLogs.map((log) => {
                      const dateObj = new Date(log.timestamp);
                      const formattedTime = dateObj.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      });
                      const formattedDate = dateObj.toLocaleDateString();

                      return (
                        <div
                          key={log.id}
                          className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700">
                              {log.action}
                            </span>
                            <span className="text-[11px] font-mono text-[#8492A6]">
                              {formattedDate} • {formattedTime}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[#172033] dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-[#526176]" />
                              <span>{log.actor_name}</span>
                              <span className="text-[10px] text-[#8492A6] uppercase font-mono">
                                ({log.actor_role})
                              </span>
                            </span>
                            <span className="text-[11px] text-[#8492A6] font-mono">
                              ID: #{log.id}
                            </span>
                          </div>

                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-950 font-mono text-[11px] text-[#526176] dark:text-slate-400 overflow-x-auto border border-gray-200 dark:border-slate-800">
                              {Object.entries(log.details).map(([key, val]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="text-[#8492A6]">{key}:</span>
                                  <span className="text-[#172033] dark:text-slate-300">
                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-[#8492A6] border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                    <Info className="w-6 h-6 mx-auto mb-2 text-gray-400 dark:text-slate-600" />
                    <p className="font-semibold text-[#526176] dark:text-slate-400">No audit log entries recorded yet</p>
                    <p className="text-[11px] mt-1">
                      Actions like status updates or triage re-evaluation will log events here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Drawer Bottom Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex items-center justify-between sticky bottom-0 z-20 backdrop-blur-md">
            <button
              onClick={handleRerun}
              disabled={isUpdating}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#526176] hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>Re-evaluate AI Triage</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#172033] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-semibold text-xs border border-gray-200 dark:border-slate-700 transition-colors"
            >
              Close Slide-Over
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
