import apiClient from '../client'

export const notificationsApi = {
  list: () => apiClient.get('/notifications'),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.post('/notifications/read-all'),
  getPreferences: () => apiClient.get('/notifications/preferences'),
  updatePreferences: (data: Record<string, unknown>) =>
    apiClient.patch('/notifications/preferences', data),
}
