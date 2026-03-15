import { useQuery } from '@tanstack/react-query'
import { subscriptionsApi } from '@/lib/api/endpoints/subscriptions'

export function useSubscription() {
  const { data, isLoading } = useQuery({
    queryKey: ['subscription', 'my'],
    queryFn: async () => {
      const res = await subscriptionsApi.getMy()
      return res.data?.data
    },
  })
  const subscription = data ?? null
  const hasActiveSubscription =
    subscription?.status === 'active'
  return {
    subscription,
    hasActiveSubscription,
    isLoading,
  }
}
