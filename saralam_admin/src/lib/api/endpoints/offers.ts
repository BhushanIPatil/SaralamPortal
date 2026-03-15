import apiClient from '../client'

export const adminOffersApi = {
  list: () => apiClient.get('/admin/offers'),
  create: (data: Record<string, unknown>) => apiClient.post('/admin/offers', data),
  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/admin/offers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/admin/offers/${id}`),
  toggle: (id: string, active: boolean) => apiClient.patch(`/admin/offers/${id}`, { active }),
}
