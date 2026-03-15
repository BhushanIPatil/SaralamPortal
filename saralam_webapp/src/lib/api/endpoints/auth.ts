import apiClient from '../client'

export const authApi = {
  register: (data: {
    email: string
    password: string
    full_name: string
    phone?: string
    role: 'seeker' | 'provider'
  }) => apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  google: (data: { id_token: string; role?: 'seeker' | 'provider' }) =>
    apiClient.post('/auth/google', data),
  refresh: (data: { refresh_token: string }) =>
    apiClient.post('/auth/refresh', data),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (data: { email: string }) =>
    apiClient.post('/auth/forgot-password', data),
}
