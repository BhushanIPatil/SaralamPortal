import apiClient from '../client'

export const adminDashboardApi = {
  getStats: () => apiClient.get('/admin/dashboard/stats'),
  getUserGrowth: (params?: { days?: number }) =>
    apiClient.get('/admin/dashboard/user-growth', { params: params ?? { days: 30 } }),
  getJobsActivity: (params?: { weeks?: number }) =>
    apiClient.get('/admin/dashboard/jobs-activity', { params: params ?? { weeks: 12 } }),
  getRevenue: (params?: { months?: number }) =>
    apiClient.get('/admin/dashboard/revenue', { params: params ?? { months: 12 } }),
  getCategoryDistribution: () => apiClient.get('/admin/dashboard/category-distribution'),
  getRecentActivity: () => apiClient.get('/admin/dashboard/recent-activity'),
}
