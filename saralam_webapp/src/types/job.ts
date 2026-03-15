export interface JobListItem {
  id: string
  title: string
  budget_type: string
  budget_min?: number
  budget_max?: number
  currency: string
  event_date?: string
  status: string
  category_id: string
  seeker_id: string
  created_at: string
  category_name?: string
  applications_count?: number
  new_applications_count?: number
  city?: string
  /** For provider: distance from provider's location (km) */
  distance_km?: number
  /** Premium jobs visible only to paid subscribers */
  visibility?: 'public' | 'premium_only'
  application_deadline?: string
}

export type JobStatus =
  | 'draft'
  | 'open'
  | 'in_review'
  | 'assigned'
  | 'completed'
  | 'cancelled'

export interface JobDetail extends JobListItem {
  description?: string
  requirements?: string[]
  event_date?: string
  duration_hours?: number
  duration_days?: number
  application_deadline?: string
  location?: { address?: string; city?: string; radius_km?: number }
  visibility?: 'public' | 'premium_only'
  slots_available?: number
  media_urls?: string[]
  created_at: string
  updated_at?: string
}

export interface JobCreatePayload {
  category_id: string
  title: string
  description?: string
  requirements?: string[]
  budget_type: 'fixed' | 'per_hour' | 'negotiable'
  budget_min?: number
  budget_max?: number
  currency?: string
  event_date?: string
  duration_hours?: number
  duration_days?: number
  application_deadline?: string
  location?: { address?: string; city?: string; radius_km?: number }
  visibility?: 'public' | 'premium_only'
  slots_available?: number
  media_urls?: string[]
  status?: 'draft' | 'open'
}
