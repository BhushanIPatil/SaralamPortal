import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/** Stale times for specific keys (use in query options): categories/plans 5min, jobs/notifications 30s */
export const STALE_TIME = {
  categories: 5 * 60 * 1000,
  plans: 5 * 60 * 1000,
  jobs: 30 * 1000,
  notifications: 30 * 1000,
}
