import apiClient from '../client'

export const adminUsersApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/users', { params }),
  getById: (id: string) => apiClient.get(`/admin/users/${id}`),
  suspend: (id: string) => apiClient.post(`/admin/users/${id}/suspend`),
  unsuspend: (id: string) => apiClient.post(`/admin/users/${id}/unsuspend`),
  sendNotification: (id: string, data: { title: string; message: string }) =>
    apiClient.post(`/admin/users/${id}/notify`, data),
  exportCsv: (params?: Record<string, unknown>) =>
    apiClient.get('/admin/users/export', { params, responseType: 'blob' }),
}
