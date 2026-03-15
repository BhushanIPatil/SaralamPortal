import apiClient from '../client'

export const providerApi = {
  getDashboardStats: () => apiClient.get('/provider/dashboard-stats'),
  getJobMatches: (params?: { city?: string; limit?: number }) =>
    apiClient.get('/provider/job-matches', { params }),
  getEarnings: (params?: { from?: string; to?: string }) =>
    apiClient.get('/provider/earnings', { params }),
}
