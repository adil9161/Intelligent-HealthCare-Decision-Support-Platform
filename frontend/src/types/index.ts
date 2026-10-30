/**
 * Shared Type Definitions for Intelligent Healthcare Decision Support Platform
 * Monorepo package: @aegishealth/shared-types
 * Kept in sync with backend Pydantic models & frontend React state
 */

export type UrgencyLevel = 'Emergency' | 'Urgent' | 'Semi-Urgent' | 'Non-Urgent';
export type PatientStatus = 'Waiting' | 'Triage Evaluated' | 'In Consultation' | 'Admitted' | 'Transferred' | 'Discharged';
export type StaffRole = 'Doctor' | 'Nurse' | 'Surgeon' | 'Radiologist' | 'Technician' | 'Administrator';
export type AttendanceStatus = 'Present' | 'On Leave' | 'In Surgery' | 'On Call' | 'Off Duty';
export type AvailabilityStatus = 'Available' | 'Busy' | 'On Break';
export type ResourceCategory = 'Beds' | 'Oxygen' | 'Medicines' | 'Equipment';
export type ResourceStatus = 'Normal' | 'Warning' | 'Critical';
export type UserRole = 'admin' | 'doctor' | 'staff';

export interface VitalsData {
  bp?: string;
  heart_rate?: number;
  spo2?: number;
  temperature?: number;
}

export interface DepartmentCandidate {
  rank: number;
  department: string;
  department_code: string;
  decision_score: number;
  score?: number; // alias for decision_score
  certainty_factor: number;
  fuzzy_severity_degree: number;
  fuzzy_urgency_degree: number;
  severity_compatibility?: number; // 0.0 to 100.0%
  urgency_compatibility?: number; // 0.0 to 100.0%
  is_red_flag_alert: boolean;
  matched_symptoms: string[];
  matching_symptoms?: string[]; // alias for matched_symptoms
  activated_rules: string[];
  suggested_resource_tier: string;
  clinical_rationale: string;
  plain_language_explanation?: string; // jargon-free plain language explanation
  explanation?: string; // alias for plain_language_explanation
  floor?: string;
  critical_resources?: string[];
}

export interface SearchStep {
  step_number: number;
  current_node: string;
  current_node_label: string;
  frontier_queue: string[];
  explored_set: string[];
  g_cost: number;
  h_cost: number;
  f_cost: number;
  decision_log: string;
}

export interface SearchGraphResponse {
  algorithm: string;
  start_node: string;
  goal_node: string;
  path_found: boolean;
  optimal_path: string[];
  optimal_path_labels: string[];
  total_path_cost: number;
  nodes_expanded_count: number;
  execution_trace: SearchStep[];
  academic_notes: string;
}

export interface TriageEvaluationResponse {
  patient_profile: {
    name: string;
    age: number;
    gender: string;
    symptoms: string[];
    severity: number;
    urgency: string;
    vitals?: VitalsData;
  };
  primary_recommendation: DepartmentCandidate;
  top_result?: {
    department: string;
    department_code: string;
    score: number;
    matching_symptoms: string[];
    severity_compatibility: number;
    urgency_compatibility: number;
    plain_language_explanation: string;
    certainty_factor: number;
  };
  ranked_alternatives: DepartmentCandidate[];
  rule_engine_trace: Array<{
    id: string;
    name: string;
    condition_description: string;
    departments: string[];
    urgency_escalation: string;
    is_red_flag: boolean;
    rationale: string;
    evidence_matched?: string[];
  }>;
  fuzzy_membership_breakdown: {
    severity: Record<string, number>;
    urgency: Record<string, number>;
  };
  certainty_factor_trace: {
    primary_department: string;
    final_combined_cf: number;
    formula_applied: string;
  };
  search_pathway?: SearchGraphResponse;
  search_comparison?: Record<string, any>;
  graceful_degradation_applied?: boolean;
  graceful_degradation_notice?: string;
  minimax_exclusion_reasoning?: Record<string, any>;
  warnings?: string[];
  all_evaluated_departments?: DepartmentCandidate[];
  ethical_disclaimer: string;
  academic_attribution: {
    institution: string;
    department: string;
    course: string;
    sdg_target: string;
  };
  timestamp: string;
}

export interface Patient {
  id: number;
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  contact?: string;
  symptoms: string[];
  severity: number;
  urgency: UrgencyLevel;
  disease?: string;
  assigned_department: string;
  status: PatientStatus;
  bed_number?: string;
  assigned_doctor?: string;
  vitals?: VitalsData;
  triage_notes?: string;
  ai_recommendation?: TriageEvaluationResponse;
  created_at?: string;
  updated_at?: string;
}

export interface Staff {
  id: number;
  staff_id: string;
  name: string;
  department: string;
  role: StaffRole;
  salary?: number;
  attendance: AttendanceStatus;
  attendance_percentage: number;
  availability: AvailabilityStatus;
  shift: 'Morning' | 'Evening' | 'Night';
  current_patient_load: number;
  email?: string;
  phone?: string;
  qualification?: string;
  is_active: boolean;
}

export interface ResourceAlert {
  resource_name?: string;
  resource_id?: string;
  category?: string;
  severity: 'WARNING' | 'CRITICAL';
  code: string;
  message: string;
  suggested_action?: string;
  predicted_exhaustion_hours?: number;
  available_units?: number;
  min_safety_threshold?: number;
  daily_usage_rate?: number;
}

export interface Resource {
  id: number;
  resource_id: string;
  name: string;
  category: ResourceCategory;
  department: string;
  total_capacity: number;
  available_units: number;
  occupied_units: number;
  unit_measure: string;
  burn_rate_per_hour: number;
  daily_usage_rate?: number;
  min_safety_threshold: number;
  reorder_threshold?: number;
  status: ResourceStatus;
  predicted_exhaustion_hours?: number;
  occupancy_percentage: number;
  availability_percentage: number;
  is_critical_shortage: boolean;
  predictive_alerts?: ResourceAlert[];
  historical_usage?: Array<{ timestamp: string; label: string; used_units: number; available_units: number }>;
  last_restocked?: string;
  notes?: string;
}

export interface ResourceSummary {
  beds: {
    total_capacity: number;
    available_units: number;
    occupied_units: number;
    availability_percentage: number;
    is_critical_shortage: boolean;
    status: ResourceStatus;
  };
  oxygen: {
    available_liters: number;
    total_burn_rate_lph: number;
    hours_remaining?: number;
    status: ResourceStatus;
  };
  critical_alerts_count: number;
  critical_medicines_count: number;
  saturated_equipment_count: number;
  alerts: ResourceAlert[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  is_active: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  actor_email: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: Record<string, any>;
}

export interface SDG3ImpactData {
  sdg_alignment: {
    goal: string;
    targets: Array<{ code: string; description: string }>;
    course_mapping: string;
  };
  kpis: {
    triage_decision_latency_reduction_pct: number;
    preempted_shortage_events: number;
    door_to_intervention_time_minutes: number;
    clinical_decision_support_accuracy_score: number;
    total_active_patients: number;
    critical_trauma_cases: number;
    active_on_duty_staff: number;
    total_staff_strength: number;
    critical_resource_alerts: number;
  };
  urgency_breakdown: Record<string, number>;
  department_distribution: Record<string, number>;
}
