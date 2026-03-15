import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/lib/api/endpoints/notifications'
import { useNotificationStore } from '@/store/notificationStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { NotificationPreferences } from '@/components/shared/NotificationPreferences'
import { formatRelative } from '@/utils/format'
import type { AppNotification } from '@/types/notification'
import { cn } from '@/lib/utils'

function groupNotifications(items: AppNotification[]) {
  const now = new Date()
  const today: AppNotification[] = []
  const yesterday: AppNotification[] = []
  const thisWeek: AppNotification[] = []
  const earlier: AppNotification[] = []
  items.forEach((n) => {
    const d = new Date(n.createdAt)
    const diffDays = (now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000)
    if (diffDays < 1) today.push(n)
    else if (diffDays < 2) yesterday.push(n)
    else if (diffDays < 7) thisWeek.push(n)
    else earlier.push(n)
  })
  return { today, yesterday, thisWeek, earlier }
}

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const { setNotifications, markRead, markAllRead, items } = useNotificationStore()

  const { data: listData, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: async () => {
      try {
        const res = await notificationsApi.list()
        const data = (res.data as { data?: AppNotification[] })?.data ?? []
        setNotifications(data)
        return data
      } catch {
        return []
      }
    },
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      markAllRead()
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] })
    },
  })

  const notifications = (listData ?? items) as AppNotification[]
  const groups = groupNotifications(notifications)

  const handleClick = (n: AppNotification) => {
    if (!n.isRead) {
      markRead(n.id)
      markReadMutation.mutate(n.id)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="ghost" size="sm" onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isPending}>
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="mt-6 space-y-6">
          {[
            { label: 'Today', items: groups.today },
            { label: 'Yesterday', items: groups.yesterday },
            { label: 'This Week', items: groups.thisWeek },
            { label: 'Earlier', items: groups.earlier },
          ].map(({ label, items: groupItems }) =>
            groupItems.length > 0 ? (
              <div key={label}>
                <h2 className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">{label}</h2>
                <ul className="space-y-2">
                  {groupItems.map((n) => {
                    const isShortlisted = n.type === 'shortlisted'
                    const isAccepted = n.type === 'accepted'
                    return (
                      <li key={n.id}>
                        <Link
                          to={n.link ?? '#'}
                          onClick={() => handleClick(n)}
                          className={cn(
                            'block rounded-lg border p-4 transition-colors',
                            !n.isRead && 'border-[var(--color-primary-200)] bg-[var(--color-primary-50)]',
                            n.isRead && 'border-[var(--color-border)] bg-[var(--color-surface)]',
                            isShortlisted && 'border-[var(--color-accent-500)]/50 bg-[var(--color-accent-50)]',
                            isAccepted && 'border-[var(--color-success)]/50 bg-[var(--color-success)]/10'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-[var(--color-text-primary)]">{n.title}</p>
                              {n.message && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{n.message}</p>}
                              <p className="mt-2 text-xs text-[var(--color-text-muted)]">{formatRelative(n.createdAt)}</p>
                            </div>
                            {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary-600)]" />}
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}

      {notifications.length === 0 && !isLoading && (
        <Card className="mt-8 py-12 text-center text-[var(--color-text-muted)]">No notifications yet.</Card>
      )}

      <div className="mt-12">
        <h2 className="section-title">Preferences</h2>
        <NotificationPreferences />
      </div>
    </div>
  )
}
