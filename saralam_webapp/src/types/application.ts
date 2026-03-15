export type ApplicationStatus = 'pending' | 'shortlisted' | 'rejected' | 'accepted'

export interface JobApplication {
  id: string
  job_id: string
  job_title?: string
  provider_id: string
  provider_name?: string
  provider_avatar?: string
  provider_rating?: number
  provider_review_count?: number
  service_id?: string
  service_title?: string
  cover_letter?: string
  proposed_price?: number
  proposed_timeline?: string
  currency?: string
  portfolio_images?: string[]
  status: ApplicationStatus
  created_at: string
  updated_at?: string
  /** Shown when status is accepted and seeker has permission */
  contact_phone?: string
  contact_email?: string
  /** For provider view: seeker name (anonymous for free tier until accepted) */
  seeker_name?: string
  /** Seeker contact when application is shortlisted/accepted */
  seeker_phone?: string
  seeker_email?: string
}

export interface ApplyToJobPayload {
  cover_letter: string
  proposed_price?: number
  proposed_timeline?: string
  service_id?: string
}
