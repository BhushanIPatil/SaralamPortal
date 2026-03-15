import apiClient from '../client'

export const applicationsApi = {
  /** As seeker: applications on my jobs; as provider: my applications */
  getMy: (params?: { status?: string; limit?: number }) =>
    apiClient.get('/applications/my', { params }),
  /** Applications received on seeker's jobs (for dashboard feed) */
  getReceived: (params?: { limit?: number }) =>
    apiClient.get('/applications/received', { params }),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/applications/${id}/status`, { status }),
  withdraw: (id: string) => apiClient.delete(`/applications/${id}`),
}
