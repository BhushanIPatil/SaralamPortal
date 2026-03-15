import { useQuery } from '@tanstack/react-query'
import { adminAnalyticsApi } from '@/lib/api/endpoints/analytics'
import { Card } from '@/components/ui/Card'
import { BarChart } from '@/components/charts/BarChart'
import { PieChart } from '@/components/charts/PieChart'
import { Spinner } from '@/components/ui/Spinner'

export function AnalyticsPage() {
  const { data: acquisition, isLoading: acqLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'acquisition'],
    queryFn: async () => {
      const res = await adminAnalyticsApi.getUserAcquisition()
      return (res.data as { data?: { by_source?: Record<string, number>; by_city?: { city: string; count: number }[]; by_date?: { date: string; count: number }[] } })?.data ?? {}
    },
  })

  const { data: categoryHeatmap } = useQuery({
    queryKey: ['admin', 'analytics', 'category'],
    queryFn: async () => {
      const res = await adminAnalyticsApi.getJobCategoryHeatmap()
      return (res.data as { data?: { category: string; week: string; count: number }[] })?.data ?? []
    },
  })

  const { data: geo } = useQuery({
    queryKey: ['admin', 'analytics', 'geo'],
    queryFn: async () => {
      const res = await adminAnalyticsApi.getGeoDistribution()
      return (res.data as { data?: { city: string; users: number; jobs: number; services: number }[] })?.data ?? []
    },
  })

  const { data: providerLeaderboard } = useQuery({
    queryKey: ['admin', 'analytics', 'leaderboard'],
    queryFn: async () => {
      const res = await adminAnalyticsApi.getProviderLeaderboard()
      return (res.data as { data?: { name: string; rating: number; applications_count: number }[] })?.data ?? []
    },
  })

  const { data: seekerActivity } = useQuery({
    queryKey: ['admin', 'analytics', 'seeker'],
    queryFn: async () => {
      const res = await adminAnalyticsApi.getSeekerActivity()
      return (res.data as { data?: { seeker_name: string; jobs_posted: number; top_categories: string[] }[] })?.data ?? []
    },
  })

  const acq = acquisition as { by_source?: Record<string, number>; by_city?: { city: string; count: number }[]; by_date?: { date: string; count: number }[] }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-sm font-semibold text-[var(--color-admin-text)]">User acquisition</h2>
        <p className="mt-1 text-xs text-[var(--color-admin-text-muted)]">Registration source (Google OAuth vs email), by city, by date</p>
        {acqLoading ? (
          <Spinner className="mt-4" />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {acq?.by_source && (
              <div>
                <p className="text-xs font-medium text-[var(--color-admin-text-muted)]">By source</p>
                <pre className="mt-1 rounded bg-slate-100 p-3 text-xs">{JSON.stringify(acq.by_source, null, 2)}</pre>
              </div>
            )}
            {acq?.by_city && acq.by_city.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--color-admin-text-muted)]">By city</p>
                <PieChart data={acq.by_city.map((c) => ({ name: c.city, value: c.count }))} height={200} />
              </div>
            )}
            {acq?.by_date && acq.by_date.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-[var(--color-admin-text-muted)]">By date</p>
                <BarChart data={acq.by_date} xKey="date" series={[{ name: 'Registrations', dataKey: 'count' }]} height={200} />
              </div>
            )}
            {!acq?.by_source && !acq?.by_city?.length && !acq?.by_date?.length && (
              <p className="text-sm text-[var(--color-admin-text-muted)]">No acquisition data</p>
            )}
          </div>
        )}
      </Card>

      {categoryHeatmap && categoryHeatmap.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold">Job category popularity (heatmap data)</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left">Category</th>
                  <th className="text-left">Week</th>
                  <th className="text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {categoryHeatmap.slice(0, 20).map((r: { category: string; week: string; count: number }, i: number) => (
                  <tr key={i} className="border-b">
                    <td>{r.category}</td>
                    <td>{r.week}</td>
                    <td className="text-right">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {geo && geo.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold">Geographic distribution (city-wise)</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left">City</th>
                  <th className="text-right">Users</th>
                  <th className="text-right">Jobs</th>
                  <th className="text-right">Services</th>
                </tr>
              </thead>
              <tbody>
                {geo.map((r: { city: string; users: number; jobs: number; services: number }, i: number) => (
                  <tr key={i} className="border-b">
                    <td>{r.city}</td>
                    <td className="text-right">{r.users}</td>
                    <td className="text-right">{r.jobs}</td>
                    <td className="text-right">{r.services}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {providerLeaderboard && providerLeaderboard.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold">Provider performance leaderboard (top 10)</h2>
          <ul className="mt-3 space-y-2">
            {providerLeaderboard.slice(0, 10).map((p: { name: string; rating: number; applications_count: number }, i: number) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{i + 1}. {p.name}</span>
                <span>Rating: {p.rating?.toFixed(1) ?? '—'} · Applications: {p.applications_count ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {seekerActivity && seekerActivity.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold">Seeker activity (most jobs posted, categories)</h2>
          <ul className="mt-3 space-y-2">
            {seekerActivity.slice(0, 10).map((s: { seeker_name: string; jobs_posted: number; top_categories: string[] }, i: number) => (
              <li key={i} className="text-sm">
                {s.seeker_name} — {s.jobs_posted} jobs · {Array.isArray(s.top_categories) ? s.top_categories.join(', ') : '—'}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
