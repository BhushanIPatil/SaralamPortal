import { create } from 'zustand'

export interface AppNotification {
  id: string
  type: string
  title: string
  message?: string
  isRead: boolean
  createdAt: string
}

interface NotificationState {
  items: AppNotification[]
  unreadCount: number
  setNotifications: (items: AppNotification[]) => void
  setUnreadCount: (n: number) => void
  addNotification: (n: AppNotification) => void
  markRead: (id: string) => void
  markAllRead: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  setNotifications: (items) =>
    set({ items, unreadCount: items.filter((i) => !i.isRead).length }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  addNotification: (n) =>
    set((s) => ({
      items: [n, ...s.items.filter((i) => i.id !== n.id)],
      unreadCount: n.isRead ? s.unreadCount : s.unreadCount + 1,
    })),
  markRead: (id) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, isRead: true } : i)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),
  markAllRead: () =>
    set((s) => ({
      items: s.items.map((i) => ({ ...i, isRead: true })),
      unreadCount: 0,
    })),
}))
