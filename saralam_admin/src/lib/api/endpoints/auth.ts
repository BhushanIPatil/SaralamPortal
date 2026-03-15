import apiClient from '../client'

export const adminAuthApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post('/admin/auth/login', data),
  me: () => apiClient.get('/admin/auth/me'),
}
