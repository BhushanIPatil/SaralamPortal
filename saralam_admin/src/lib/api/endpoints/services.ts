import apiClient from '../client'

export const adminServicesApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/services', { params }),
  getById: (id: string) => apiClient.get(`/admin/services/${id}`),
  verify: (id: string) => apiClient.post(`/admin/services/${id}/verify`),
  flag: (id: string, reason?: string) => apiClient.post(`/admin/services/${id}/flag`, { reason }),
  deactivate: (id: string) => apiClient.post(`/admin/services/${id}/deactivate`),
}
