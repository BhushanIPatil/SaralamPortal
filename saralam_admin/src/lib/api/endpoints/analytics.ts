import apiClient from '../client'

export const adminAnalyticsApi = {
  getUserAcquisition: (params?: Record<string, unknown>) =>
    apiClient.get('/admin/analytics/user-acquisition', { params }),
  getJobCategoryHeatmap: () => apiClient.get('/admin/analytics/job-category-heatmap'),
  getGeoDistribution: () => apiClient.get('/admin/analytics/geo-distribution'),
  getProviderLeaderboard: () => apiClient.get('/admin/analytics/provider-leaderboard'),
  getSeekerActivity: () => apiClient.get('/admin/analytics/seeker-activity'),
}
