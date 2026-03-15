export interface ServiceCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon_url?: string
  parent_category_id?: string
  sort_order: number
  is_featured: boolean
  children?: ServiceCategory[]
}

export interface ServiceListItem {
  id: string
  title: string
  price_type: string
  base_price?: number
  currency: string
  avg_rating: number
  total_reviews: number
  is_verified: boolean
  is_featured: boolean
  category_id: string
  provider_id: string
  provider_name?: string
  provider_avatar?: string
  category_name?: string
  city?: string
  status?: 'active' | 'inactive' | 'under_review'
  views_count?: number
  applications_count?: number
}

export interface ServiceDetail extends ServiceListItem {
  description?: string
  tags?: string[]
  portfolio_images?: string[]
  location?: { city?: string; state?: string; radius_km?: number }
  availability?: string
  contact_phone_visible?: boolean
  whatsapp_number?: string
}

export interface ServiceCreatePayload {
  title: string
  category_id: string
  description?: string
  tags?: string[]
  price_type: 'fixed' | 'hourly' | 'negotiable'
  base_price?: number
  currency?: string
  location?: { city?: string; radius_km?: number }
  availability?: string
  portfolio_images?: string[]
  contact_phone_visible?: boolean
  whatsapp_number?: string
}
