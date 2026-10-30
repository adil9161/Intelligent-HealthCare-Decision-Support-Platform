import { api } from './api';
import { Patient } from '../types';

export const patientService = {
  getPatients: (params?: {
    search?: string;
    department?: string;
    urgency?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }) => api.get<Patient[]>('/patients', params),

  getPatient: (id: string | number) => api.get<Patient>(`/patients/${id}`),

  createPatient: (data: Partial<Patient>) => api.post<Patient>('/patients', data),

  updatePatient: (id: string | number, data: Partial<Patient>) =>
    api.put<Patient>(`/patients/${id}`, data),

  deletePatient: (id: string | number) => api.delete<{ message: string; deleted: boolean }>(`/patients/${id}`),

  rerunTriage: (id: string | number) => api.post<Patient>(`/patients/${id}/triage`),

  getPatientAuditLogs: (id: string | number) => api.get<any[]>(`/patients/${id}/audit-logs`),
};

