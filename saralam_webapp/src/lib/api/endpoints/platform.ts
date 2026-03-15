import apiClient from '../client'

export const platformApi = {
  getInfo: () => apiClient.get('/platform/info'),
  getStats: () => apiClient.get('/platform/stats'),
}
