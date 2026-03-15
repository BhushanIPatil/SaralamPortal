import apiClient from '../client'

export const adminJobsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/jobs', { params }),
  getById: (id: string) => apiClient.get(`/admin/jobs/${id}`),
  flag: (id: string, reason?: string) => apiClient.post(`/admin/jobs/${id}/flag`, { reason }),
  close: (id: string) => apiClient.post(`/admin/jobs/${id}/close`),
  delete: (id: string) => apiClient.delete(`/admin/jobs/${id}`),
}
