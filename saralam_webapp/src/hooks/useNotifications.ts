import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { appConfig } from '@/config/env'
import toast from 'react-hot-toast'

/** Map backend NotificationResponse to store AppNotification shape */
function toAppNotification(p: {
  id: string
  type: string
  title: string
  message?: string | null
  is_read?: boolean
  created_at: string
  action_url?: string | null
}): { id: string; type: string; title: string; message?: string; isRead: boolean; createdAt: string; link?: string } {
  return {
    id: String(p.id),
    type: p.type,
    title: p.title,
    message: p.message ?? undefined,
    isRead: p.is_read ?? false,
    createdAt: p.created_at,
    link: p.action_url ?? undefined,
  }
}

const HIGH_PRIORITY_TYPES = ['shortlisted', 'accepted']

export function useNotifications() {
  const { accessToken } = useAuthStore()
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!accessToken) return

    const url = `${appConfig.apiBaseUrl}/notifications/stream?token=${encodeURIComponent(accessToken)}`
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data)
        const notif = toAppNotification({
          id: payload.id,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          is_read: payload.is_read,
          created_at: payload.created_at,
          action_url: payload.action_url,
        })
        addNotification(notif)
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        if (HIGH_PRIORITY_TYPES.includes(notif.type)) {
          toast(notif.title, { icon: notif.type === 'accepted' ? '✅' : '📌' })
        }
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      es.close()
      eventSourceRef.current = null
    }

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [accessToken, addNotification, queryClient])
}
