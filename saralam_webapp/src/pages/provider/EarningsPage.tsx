import { useQuery } from '@tanstack/react-query'
import { providerApi } from '@/lib/api/endpoints/provider'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

export function EarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['provider', 'earnings'],
    queryFn: async () => {
      try {
        const res = await providerApi.getEarnings()
        return (res.data as { data?: unknown })?.data
      } catch {
        return null
      }
    },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="section-title">Earnings Overview</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        View your earnings and payouts.
      </p>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card className="mt-8 py-12 text-center">
          <p className="text-[var(--color-text-muted)]">
            {data ? 'Earnings data will be displayed here.' : 'No earnings data yet. Complete jobs to see earnings.'}
          </p>
        </Card>
      )}
    </div>
  )
}
