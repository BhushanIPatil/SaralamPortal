export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T | null
  errors?: string[]
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}
