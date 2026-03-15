import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionsApi } from '@/lib/api/endpoints/subscriptions'
import { useAuthStore } from '@/store/authStore'
import { initRazorpayCheckout } from '@/utils/razorpay'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/format'
import type {
  SubscriptionPlan,
  SubscriptionMy,
  PaymentHistoryItem,
  RazorpayOrder,
} from '@/types/subscription'

type BillingCycle = 'monthly' | 'yearly'

export function SubscriptionPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [activeOfferCode, setActiveOfferCode] = useState<string | null>(null)

  const { data: myData, isLoading: myLoading } = useQuery({
    queryKey: ['subscriptions', 'my'],
    queryFn: async () => {
      const res = await subscriptionsApi.getMy()
      return (res.data as { data?: SubscriptionMy })?.data ?? null
    },
  })

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['subscriptions', 'plans'],
    queryFn: async () => {
      const res = await subscriptionsApi.getPlans()
      const list = (res.data as { data?: SubscriptionPlan[] })?.data ?? []
      const activeOffer = list
        .flatMap((p) => (p.offers ?? []))
        .find((o) => o.valid_until && new Date(o.valid_until) > new Date())
      if (activeOffer) setActiveOfferCode(activeOffer.offer_code)
      return list
    },
  })

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['subscriptions', 'payment-history'],
    queryFn: async () => {
      const res = await subscriptionsApi.getPaymentHistory()
      return (res.data as { data?: PaymentHistoryItem[] })?.data ?? []
    },
  })

  const subscribeMutation = useMutation({
    mutationFn: (payload: { plan_id: string; offer_code?: string }) =>
      subscriptionsApi.subscribe(payload),
    onSuccess: async (res, _variables) => {
      const order = (res.data as { data?: RazorpayOrder })?.data
      if (!order || !user) return
      initRazorpayCheckout(
        order,
        { name: user.name, email: user.email },
        () => {
          queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
        },
        () => {}
      )
    },
  })

  const my = myData as SubscriptionMy | null
  const plans = (plansData ?? []) as SubscriptionPlan[]
  const history = (historyData ?? []) as PaymentHistoryItem[]

  const filteredPlans = plans.filter(
    (p) => p.duration_type === (billingCycle === 'yearly' ? 'yearly' : 'monthly')
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="section-title">Subscription</h1>

      {/* Current plan */}
      <Card className="mt-6">
        <h2 className="font-display font-semibold text-[var(--color-text-primary)]">Current plan</h2>
        {myLoading ? (
          <Spinner />
        ) : my ? (
          <div className="mt-4 space-y-3">
            <p className="font-medium text-[var(--color-text-primary)]">{my.plan_name}</p>
            {my.current_period_end && (
              <p className="text-sm text-[var(--color-text-secondary)]">
                Expires {formatDate(my.current_period_end)}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              <span>
                Jobs posted this month: {my.jobs_posted_this_month ?? 0} / {my.jobs_limit_per_month ?? '—'}
              </span>
              <span>
                Applications submitted: {my.applications_submitted_this_month ?? 0} / {my.applications_limit_per_month ?? '—'}
              </span>
            </div>
            <Link
              to="/pricing"
              className="mt-2 inline-flex h-8 items-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
            >
              Upgrade / Change plan
            </Link>
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">No active subscription.</p>
        )}
      </Card>

      {/* Active offer */}
      {activeOfferCode && (
        <div className="mt-4 rounded-lg border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-4 py-3 text-sm text-[var(--color-text-primary)]">
          Limited offer: Use code <strong>{activeOfferCode}</strong> for 30% off eligible plans.
        </div>
      )}

      {/* Billing toggle */}
      <div className="mt-8 flex items-center gap-2">
        <span className="text-sm text-[var(--color-text-secondary)]">Billing:</span>
        <button
          type="button"
          onClick={() => setBillingCycle('monthly')}
          className={`rounded px-3 py-1 text-sm font-medium ${billingCycle === 'monthly' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBillingCycle('yearly')}
          className={`rounded px-3 py-1 text-sm font-medium ${billingCycle === 'yearly' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}
        >
          Yearly
        </button>
        {billingCycle === 'yearly' && (
          <span className="text-xs text-[var(--color-success)]">Save with yearly</span>
        )}
      </div>

      {/* Plans */}
      {plansLoading ? (
        <div className="mt-6 flex justify-center"><Spinner /></div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <h3 className="font-display font-semibold text-[var(--color-text-primary)]">{plan.name}</h3>
              <p className="mt-2 text-2xl font-bold text-[var(--color-primary)]">
                ₹{plan.price}
                <span className="text-sm font-normal text-[var(--color-text-muted)]">/{plan.duration_type === 'yearly' ? 'year' : 'month'}</span>
              </p>
              {plan.features && (
                <ul className="mt-3 list-inside list-disc text-sm text-[var(--color-text-secondary)]">
                  {plan.features.split(',').map((f, i) => (
                    <li key={i}>{f.trim()}</li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex-1" />
              <Button
                className="mt-4 w-full"
                disabled={my?.plan_id === plan.id || subscribeMutation.isPending}
                onClick={() =>
                  subscribeMutation.mutate({
                    plan_id: plan.id,
                    offer_code: activeOfferCode ?? undefined,
                  })
                }
              >
                {my?.plan_id === plan.id ? 'Current plan' : 'Subscribe'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Payment history */}
      <div className="mt-12">
        <h2 className="section-title">Payment history</h2>
        {historyLoading ? (
          <Spinner />
        ) : (
          <Card className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="pb-2 text-left font-medium">Date</th>
                  <th className="pb-2 text-left font-medium">Plan</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                  <th className="pb-2 text-left font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--color-border)]">
                    <td className="py-3">{formatDate(row.date)}</td>
                    <td>{row.plan_name}</td>
                    <td className="text-right">{row.currency} {row.amount}</td>
                    <td>{row.status}</td>
                    <td>
                      {row.receipt_url ? (
                        <a href={row.receipt_url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">
                          Download
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 && (
              <p className="py-6 text-center text-sm text-[var(--color-text-muted)]">No payments yet.</p>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
