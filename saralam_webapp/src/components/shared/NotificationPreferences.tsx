import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/lib/api/endpoints/notifications'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { NotificationType } from '@/types/notification'

const NOTIFICATION_TYPES: { type: NotificationType; label: string }[] = [
  { type: 'job_posted', label: 'New jobs matching my services' },
  { type: 'application_received', label: 'Applications on my jobs' },
  { type: 'shortlisted', label: 'Shortlisted for a job' },
  { type: 'accepted', label: 'Application accepted' },
  { type: 'rating_received', label: 'New rating received' },
  { type: 'subscription_expiring', label: 'Subscription expiring' },
  { type: 'offer_available', label: 'Offers and promotions' },
]

export function NotificationPreferences() {
  const queryClient = useQueryClient()
  const { data: prefs, isLoading } = useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      try {
        const res = await notificationsApi.getPreferences()
        return (res.data as { data?: Record<string, { email: boolean; in_app: boolean }> })?.data ?? {}
      } catch {
        return {}
      }
    },
  })

  const updatePrefs = useMutation({
    mutationFn: (data: Record<string, unknown>) => notificationsApi.updatePreferences(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] }),
  })

  const setPref = (type: NotificationType, channel: 'email' | 'in_app', value: boolean) => {
    const current = (prefs ?? {})[type] ?? { email: true, in_app: true }
    const next = { ...current, [channel]: value }
    updatePrefs.mutate({ [type]: next })
  }

  if (isLoading) return <Spinner />

  return (
    <Card className="space-y-4">
      <h3 className="font-display font-semibold text-[var(--color-text-primary)]">Notification preferences</h3>
      <p className="text-sm text-[var(--color-text-secondary)]">Choose how you want to be notified for each type.</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="pb-2 text-left font-medium text-[var(--color-text-primary)]">Type</th>
            <th className="pb-2 text-center font-medium text-[var(--color-text-primary)]">Email</th>
            <th className="pb-2 text-center font-medium text-[var(--color-text-primary)]">In-app</th>
          </tr>
        </thead>
        <tbody>
          {NOTIFICATION_TYPES.map(({ type, label }) => {
            const p = (prefs ?? {})[type] ?? { email: true, in_app: true }
            return (
              <tr key={type} className="border-b border-[var(--color-border)]">
                <td className="py-3">{label}</td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={p.email}
                    onChange={(e) => setPref(type, 'email', e.target.checked)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={p.in_app}
                    onChange={(e) => setPref(type, 'in_app', e.target.checked)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
