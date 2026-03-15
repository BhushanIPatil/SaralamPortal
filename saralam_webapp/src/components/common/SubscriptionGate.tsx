import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export type SubscriptionFeature = 'post_job' | 'apply_job' | 'view_contact' | 'premium_jobs'

const FEATURE_CONFIG: Record<SubscriptionFeature, { label: string; requiresPaid: boolean }> = {
  post_job: { label: 'Post more jobs', requiresPaid: true },
  apply_job: { label: 'Apply to more jobs', requiresPaid: true },
  view_contact: { label: 'View contact details', requiresPaid: true },
  premium_jobs: { label: 'See premium job listings', requiresPaid: true },
}

interface SubscriptionGateProps {
  feature: SubscriptionFeature
  fallback?: ReactNode
  children: ReactNode
  className?: string
}

/** Renders children if user has access to the feature; otherwise shows upgrade prompt or fallback. */
export function SubscriptionGate({ feature, fallback, children, className }: SubscriptionGateProps) {
  const { user, hasActiveSubscription } = useAuth()
  const config = FEATURE_CONFIG[feature]

  if (!user) {
    return (
      <div className={cn('rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-center text-sm text-[var(--color-text-secondary)]', className)}>
        <Link to="/login" className="font-medium text-[var(--color-primary-600)] underline">Log in</Link> to access this feature.
      </div>
    )
  }

  const allowed = config.requiresPaid ? hasActiveSubscription : true
  if (allowed) return <>{children}</>

  if (fallback !== undefined) return <>{fallback}</>

  return (
    <div className={cn('rounded-lg border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] p-4 text-center', className)}>
      <p className="text-sm font-medium text-[var(--color-text-primary)]">Upgrade to {config.label}</p>
      <Link
        to="/pricing"
        className="mt-2 inline-block rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)]"
      >
        View plans
      </Link>
    </div>
  )
}
