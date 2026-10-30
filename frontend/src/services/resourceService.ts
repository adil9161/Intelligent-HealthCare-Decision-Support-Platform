import { api } from './api';
import { Resource, ResourceSummary } from '../types';

export const resourceService = {
  getResources: (params?: {
    category?: string;
    department?: string;
    status_filter?: string;
  }) => api.get<Resource[]>('/resources', params),

  getSummary: () => api.get<ResourceSummary>('/resources/summary'),

  createResource: (data: Partial<Resource>) => api.post<Resource>('/resources', data),

  updateResource: (id: string | number, data: Partial<Resource>) =>
    api.put<Resource>(`/resources/${id}`, data),

  restock: (id: string | number, unitsToAdd: number, notes?: string) =>
    api.post<Resource>(`/resources/${id}/restock`, {
      units_to_add: unitsToAdd,
      notes: notes || 'Manual clinical replenishment',
    }),

  updateThreshold: (id: string | number, minThreshold: number, notes?: string) =>
    api.put<Resource>(`/resources/${id}/threshold`, {
      min_safety_threshold: minThreshold,
      notes: notes || 'Threshold adjusted by Administrator',
    }),

  simulateSurge: (params: {
    scenario_type: string;
    additional_trauma_patients: number;
    additional_icu_need: number;
  }) => api.post<any>('/resources/simulate-surge', params),
};

