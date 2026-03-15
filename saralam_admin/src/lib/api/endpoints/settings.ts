import apiClient from '../client'

export const adminSettingsApi = {
  get: () => apiClient.get('/admin/settings'),
  update: (data: Record<string, unknown>) => apiClient.patch('/admin/settings', data),
}
