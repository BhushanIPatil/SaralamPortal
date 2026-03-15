export interface ProviderDashboardStats {
  active_services?: number
  job_matches_today?: number
  applications_submitted?: { pending?: number; shortlisted?: number; accepted?: number }
  avg_rating?: number
  profile_views_7d?: number
  response_rate?: number
  jobs_completed?: number
  rating_trend?: { month: string; rating: number }[]
}

export interface JobMatchItem {
  id: string
  title: string
  category_id: string
  category_name?: string
  budget_type?: string
  budget_min?: number
  budget_max?: number
  currency: string
  event_date?: string
  city?: string
  seeker_name?: string
  applications_count?: number
  visibility?: 'public' | 'premium_only'
  created_at: string
}
