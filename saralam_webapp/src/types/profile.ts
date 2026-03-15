export interface ProfilePayload {
  name?: string
  bio?: string
  experience_years?: number
  website?: string
  linkedin_url?: string
  instagram_url?: string
  youtube_url?: string
  languages?: string[]
  portfolio_url?: string
  avatar_url?: string
}

export interface PublicProfile {
  id: string
  name: string
  avatar?: string | null
  bio?: string
  experience_years?: number
  website?: string
  is_verified: boolean
  avg_rating: number
  total_reviews: number
  total_jobs?: number
  response_rate?: number
  member_since: string
  services?: { id: string; title: string; category_name?: string; avg_rating: number }[]
  portfolio_images?: string[]
  reviews?: { id: string; rating: number; comment?: string; seeker_name?: string; created_at: string; response_text?: string }[]
}
