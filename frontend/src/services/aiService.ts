import { api } from './api';
import {
  TriageEvaluationResponse,
  SearchGraphResponse,
  VitalsData,
} from '../types';

export const aiService = {
  evaluateTriage: (input: {
    patient_id?: string;
    name?: string;
    age: number;
    gender?: string;
    symptoms: string[];
    severity: number;
    urgency: string;
    vitals?: VitalsData;
  }) => api.post<TriageEvaluationResponse>('/ai/triage-evaluate', input),

  executeSearchGraph: (input: {
    algorithm: string;
    start_node?: string;
    goal_department?: string;
    patient_severity?: number;
    patient_urgency?: string;
    symptoms?: string[];
  }) => api.post<SearchGraphResponse>('/ai/search-graph', input),

  getGraphStructure: () =>
    api.get<{
      nodes: Array<{
        id: string;
        label: string;
        level: number;
        type: string;
        base_cost: number;
        description: string;
        target_dept?: string;
      }>;
      edges: Array<{
        from: string;
        to: string;
        cost: number;
        label?: string;
      }>;
    }>('/ai/graph-structure'),

  getSymptomsCatalog: () =>
    api.get<{ symptoms: string[]; count: number }>('/ai/symptoms-catalog'),

  getDepartmentsCatalog: () =>
    api.get<Record<string, any>>('/ai/departments-catalog'),

  getMinimaxExclusionRationale: () =>
    api.get<{
      title: string;
      course_context: string;
      verdict: string;
      core_arguments: Array<{ principle: string; explanation: string }>;
      conclusion: string;
    }>('/ai/minimax-exclusion-rationale'),

  compareAlgorithms: (targetDept = 'Cardiology', severity = 9.0) =>
    api.get<any>('/ai/compare-search-algorithms', { target_department: targetDept, severity }),

  benchmarkAlgorithms: () =>
    api.get<any>('/ai/benchmark-algorithms'),
};

