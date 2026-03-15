import apiClient from '../client'

export const adminSubscriptionsApi = {
  getRevenueSummary: () => apiClient.get('/admin/subscriptions/revenue-summary'),
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/subscriptions', { params }),
  reconcile: (params?: Record<string, unknown>) =>
    apiClient.post('/admin/subscriptions/reconcile', params),
}
