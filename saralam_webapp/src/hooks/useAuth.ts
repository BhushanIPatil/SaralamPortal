import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const store = useAuthStore()
  const { user, accessToken, setAuth, logout, refreshAccessToken, updateUser } = store
  const isAuthenticated = !!accessToken
  const isSeeker = user?.role === 'seeker'
  const isProvider = user?.role === 'provider'
  const isAdmin = user?.role === 'admin'
  const hasActiveSubscription = user?.subscription_status === 'active'
  const dashboardPath =
    isSeeker ? '/seeker/dashboard'
    : isProvider ? '/provider/dashboard'
    : isAdmin ? '/admin'
    : '/'

  return {
    ...store,
    user,
    accessToken,
    isAuthenticated,
    isSeeker,
    isProvider,
    isAdmin,
    hasActiveSubscription,
    dashboardPath,
    setAuth,
    logout,
    refreshAccessToken,
    updateUser,
  }
}
