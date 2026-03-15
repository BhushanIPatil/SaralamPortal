import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string | null
  subscription_status?: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  setAuth: (accessToken: string, refreshToken: string, user: AuthUser) => void
  logout: () => void
  refreshAccessToken: () => Promise<boolean>
  updateUser: (user: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setAuth: (accessToken, refreshToken, user) => {
        set({ accessToken, refreshToken, user })
      },

      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null })
      },

      refreshAccessToken: async () => {
        const token = get().refreshToken
        if (!token) return false
        try {
          const { appConfig } = await import('@/config/env')
          const res = await fetch(`${appConfig.apiBaseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: token }),
          })
          const data = await res.json()
          if (data?.data?.access_token) {
            set({
              accessToken: data.data.access_token,
              refreshToken: data.data.refresh_token ?? token,
            })
            return true
          }
        } catch {
          // ignore
        }
        return false
      },

      updateUser: (user) => {
        const current = get().user
        if (current) set({ user: { ...current, ...user } })
      },
    }),
    { name: 'saralam-auth' }
  )
)
