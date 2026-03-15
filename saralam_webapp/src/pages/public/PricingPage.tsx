import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { Check } from 'lucide-react'
import { subscriptionsApi } from '@/lib/api/endpoints/subscriptions'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/format'
import type { SubscriptionPlan } from '@/types/subscription'

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const { accessToken } = useAuthStore()

  const { data: plansData, isLoading, error } = useQuery({
    queryKey: ['subscriptions', 'plans'],
    queryFn: async () => {
      const res = await subscriptionsApi.getPlans()
      return (res.data?.data as SubscriptionPlan[]) ?? []
    },
  })

  const plans = Array.isArray(plansData) ? plansData : []
  const monthlyPlans = plans.filter((p) => p.duration_type === 'monthly')
  const yearlyPlans = plans.filter((p) => p.duration_type === 'yearly')
  const displayPlans = billingCycle === 'yearly' ? yearlyPlans : monthlyPlans

  const freePlan = plans.find((p) => p.slug === 'free' || p.plan_type === 'free')
  const proPlan = plans.find((p) => p.slug === 'professional' || p.plan_type === 'professional')
  const premiumPlan = plans.find((p) => p.slug === 'premium' || p.plan_type === 'premium')
  const defaultPlans = [freePlan, proPlan, premiumPlan].filter(Boolean) as SubscriptionPlan[]

  const plansToShow = displayPlans.length > 0 ? displayPlans : defaultPlans
  const hasYearlyDiscount =
    yearlyPlans.length > 0 && monthlyPlans.length > 0 && yearlyPlans[0]?.price < monthlyPlans[0]!.price * 12

  const upgradeUrl = accessToken ? '/subscription' : '/login'

  return (
    <div className="min-h-screen bg-[var(--color-surface-2)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="section-title text-center">Pricing</h1>
        <p className="mt-2 text-center text-[var(--color-text-secondary)]">
          Choose a plan that fits your needs. Upgrade anytime.
        </p>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full bg-[var(--color-surface)] p-1 shadow-[var(--shadow-sm)]">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                billingCycle === 'monthly'
                  ? 'bg-[var(--color-primary-600)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                billingCycle === 'yearly'
                  ? 'bg-[var(--color-primary-600)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
              )}
            >
              Yearly
            </button>
          </div>
        </div>
        {billingCycle === 'yearly' && hasYearlyDiscount && (
          <p className="mt-2 text-center text-sm font-medium text-[var(--color-success)]">
            Save with yearly billing
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <p className="py-12 text-center text-[var(--color-danger)]">Failed to load plans.</p>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {plansToShow.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  'flex flex-col',
                  (plan.slug === 'professional' || plan.plan_type === 'professional') &&
                    'ring-2 ring-[var(--color-primary-500)]'
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
                    {plan.name}
                  </h3>
                  {plan.offers && plan.offers.length > 0 && (
                    <Badge variant="accent">Offer</Badge>
                  )}
                </div>
                <p className="mt-4 text-2xl font-bold text-[var(--color-primary-600)]">
                  {formatCurrency(plan.price, plan.currency)}
                  <span className="text-sm font-normal text-[var(--color-text-muted)]">
                    /{plan.duration_type === 'yearly' ? 'year' : 'month'}
                  </span>
                </p>
                {plan.features && (
                  <ul className="mt-6 flex-1 space-y-3 text-sm text-[var(--color-text-secondary)]">
                    {typeof plan.features === 'string'
                      ? plan.features.split(',').map((f, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-success)]" />
                            {f.trim()}
                          </li>
                        ))
                      : null}
                  </ul>
                )}
                <div className="mt-8">
                  <Link to={upgradeUrl}>
                    <Button
                      variant={plan.slug === 'professional' || plan.plan_type === 'professional' ? 'primary' : 'secondary'}
                      size="md"
                      className="w-full"
                    >
                      {plan.slug === 'free' || plan.plan_type === 'free' ? 'Get started' : 'Upgrade'}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {plans.some((p) => p.offers && p.offers.length > 0) && (
          <div className="mt-12 rounded-xl border-2 border-[var(--color-accent-500)] bg-[var(--color-accent-50)] p-4 text-center">
            <p className="font-semibold text-[var(--color-accent-600)]">Active offers</p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Use an offer code at checkout for extra savings.
            </p>
          </div>
        )}

        <div className="mt-16 overflow-x-auto">
          <h2 className="section-title mb-4">Feature comparison</h2>
          <table className="w-full min-w-[500px] border-collapse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                  Feature
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Free</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Professional</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Premium</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-[var(--color-border)]">
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">Job postings / month</td>
                <td className="px-4 py-3 text-center">3</td>
                <td className="px-4 py-3 text-center">15</td>
                <td className="px-4 py-3 text-center">Unlimited</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">View contact info</td>
                <td className="px-4 py-3 text-center">—</td>
                <td className="px-4 py-3 text-center">
                  <Check className="mx-auto size-4 text-[var(--color-success)]" />
                </td>
                <td className="px-4 py-3 text-center">
                  <Check className="mx-auto size-4 text-[var(--color-success)]" />
                </td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">Priority listing</td>
                <td className="px-4 py-3 text-center">—</td>
                <td className="px-4 py-3 text-center">—</td>
                <td className="px-4 py-3 text-center">
                  <Check className="mx-auto size-4 text-[var(--color-success)]" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {!accessToken && (
          <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            <Link to="/login" className="text-[var(--color-primary-600)] hover:underline">
              Sign in
            </Link>{' '}
            to manage your subscription.
          </p>
        )}
      </div>
    </div>
  )
}
