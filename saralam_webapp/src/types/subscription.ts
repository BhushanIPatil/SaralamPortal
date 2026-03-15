export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  plan_type: string
  duration_type: string
  duration_days: number
  price: number
  currency: string
  features?: string
  max_job_postings_per_month: number
  max_applications_per_month: number
  can_view_contact_info: boolean
  can_see_premium_jobs: boolean
  priority_listing: boolean
  sort_order: number
  offers?: SubscriptionOffer[]
}

export interface SubscriptionOffer {
  id: string
  offer_name: string
  offer_code: string
  discount_type: string
  discount_value: number
  valid_until?: string
}

export interface SubscriptionMy {
  plan_id: string
  plan_name: string
  status: string
  current_period_end?: string
  jobs_posted_this_month?: number
  jobs_limit_per_month?: number
  applications_submitted_this_month?: number
  applications_limit_per_month?: number
}

export interface PaymentHistoryItem {
  id: string
  date: string
  plan_name: string
  amount: number
  currency: string
  status: string
  receipt_url?: string
}

export interface RazorpayOrder {
  razorpay_order_id: string
  amount: number
  currency: string
  plan_name: string
  plan_id: string
}
