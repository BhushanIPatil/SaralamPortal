import apiClient from '../client'

export const adminApplicationsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/applications', { params }),
  getById: (id: string) => apiClient.get(`/admin/applications/${id}`),
}
