import apiClient from '../client'

export const searchApi = {
  search: (params: { q?: string; type?: 'jobs' | 'services' | 'providers'; category_id?: string; city?: string; page?: number; page_size?: number }) =>
    apiClient.get('/search', { params }),
}
