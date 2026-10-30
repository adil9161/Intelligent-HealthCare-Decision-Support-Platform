import { api } from './api';
import { Staff } from '../types';

export const staffService = {
  getStaffMembers: (params?: {
    department?: string;
    role?: string;
    attendance?: string;
    availability?: string;
    search?: string;
  }) => api.get<Staff[]>('/staff', params),

  getStaff: (id: string | number) => api.get<Staff>(`/staff/${id}`),

  createStaff: (data: Partial<Staff>) => api.post<Staff>('/staff', data),

  updateStaff: (id: string | number, data: Partial<Staff>) =>
    api.put<Staff>(`/staff/${id}`, data),

  toggleAttendance: (id: string | number) =>
    api.post<Staff>(`/staff/${id}/toggle-attendance`),

  deleteStaff: (id: string | number) =>
    api.delete<{ message: string; deleted: boolean }>(`/staff/${id}`),
};

