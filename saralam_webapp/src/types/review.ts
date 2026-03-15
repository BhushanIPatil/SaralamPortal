export interface Review {
  id: string
  service_id?: string
  service_title?: string
  provider_id: string
  provider_name?: string
  seeker_id?: string
  seeker_name?: string
  rating: number
  comment?: string
  created_at: string
}
