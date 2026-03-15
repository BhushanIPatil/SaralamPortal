import apiClient from '../client'

export const servicesApi = {
  getCategories: () => apiClient.get('/categories'),
  list: (params?: Record<string, unknown>) => apiClient.get('/services', { params }),
  getById: (id: string) => apiClient.get(`/services/${id}`),
  getMy: () => apiClient.get('/services/my'),
  create: (data: Record<string, unknown>) => apiClient.post('/services', data),
  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/services/${id}`, data),
  delete: (id: string) => apiClient.delete(`/services/${id}`),
}
