import apiClient from '../client'

export const jobsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/jobs', { params }),
  getById: (id: string) => apiClient.get(`/jobs/${id}`),
  getMy: (params?: { status?: string }) => apiClient.get('/jobs/my', { params }),
  create: (data: Record<string, unknown>) => apiClient.post('/jobs', data),
  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/jobs/${id}`, data),
  delete: (id: string) => apiClient.delete(`/jobs/${id}`),
  cancel: (id: string) => apiClient.patch(`/jobs/${id}/cancel`),
  complete: (id: string) => apiClient.patch(`/jobs/${id}/complete`),
  apply: (jobId: string, data: Record<string, unknown>) =>
    apiClient.post(`/jobs/${jobId}/apply`, data),
  getApplications: (jobId: string, params?: Record<string, unknown>) =>
    apiClient.get(`/jobs/${jobId}/applications`, { params }),
}
