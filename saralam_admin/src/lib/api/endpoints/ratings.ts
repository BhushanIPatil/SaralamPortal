import apiClient from '../client'

export const adminRatingsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/ratings', { params }),
  flag: (id: string, reason?: string) => apiClient.post(`/admin/ratings/${id}/flag`, { reason }),
  delete: (id: string) => apiClient.delete(`/admin/ratings/${id}`),
  getTrend: () => apiClient.get('/admin/ratings/trend'),
}
