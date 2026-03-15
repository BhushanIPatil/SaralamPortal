export type NotificationType =
  | 'job_posted'
  | 'application_received'
  | 'shortlisted'
  | 'accepted'
  | 'rating_received'
  | 'subscription_expiring'
  | 'offer_available'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message?: string
  link?: string
  isRead: boolean
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface NotificationPreferences {
  job_posted?: { email: boolean; in_app: boolean }
  application_received?: { email: boolean; in_app: boolean }
  shortlisted?: { email: boolean; in_app: boolean }
  accepted?: { email: boolean; in_app: boolean }
  rating_received?: { email: boolean; in_app: boolean }
  subscription_expiring?: { email: boolean; in_app: boolean }
  offer_available?: { email: boolean; in_app: boolean }
}
