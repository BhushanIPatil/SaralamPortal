import apiClient from '../client'

export const ratingsApi = {
  create: (data: Record<string, unknown>) => apiClient.post('/ratings', data),
  getByProvider: (providerId: string, params?: Record<string, unknown>) =>
    apiClient.get(`/ratings/provider/${providerId}`, { params }),
  getRecent: (params?: { limit?: number }) =>
    apiClient.get('/ratings/recent', { params }),
  respond: (ratingId: string, data: { response_text: string }) =>
    apiClient.post(`/ratings/${ratingId}/respond`, data),
}
