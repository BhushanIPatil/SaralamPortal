import apiClient from '../client'

export const profileApi = {
  getMine: () => apiClient.get('/profile'),
  update: (data: Record<string, unknown>) => apiClient.patch('/profile', data),
  getPublic: (userId: string) => apiClient.get(`/users/${userId}/public`),
  uploadAvatar: (formData: FormData) =>
    apiClient.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
