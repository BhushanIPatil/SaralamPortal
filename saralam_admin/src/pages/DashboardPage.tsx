import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi } from '@/lib/api/endpoints/dashboard'
import { appConfig } from '@/config/env'
import { StatsCard } from '@/components/charts/StatsCard'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'
import { AreaChart } from '@/components/charts/AreaChart'
import { PieChart } from '@/components/charts/PieChart'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { format, differenceInDays } from 'date-fns'

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async () => {
      try {
        const res = await adminDashboardApi.getStats()
        return (res.data as { data?: Record<string, unknown> })?.data ?? {}
      } catch {
        return {}
      }
    },
  })

  const { data: userGrowth } = useQuery({
    queryKey: ['admin', 'dashboard', 'user-growth'],
    queryFn: async () => {
      try {
        const res = await adminDashboardApi.getUserGrowth()
        return (res.data as { data?: { date: string; seekers: number; providers: number }[] })?.data ?? []
      } catch { return [] }
    },
  })

  const { data: jobsActivity } = useQuery({
    queryKey: ['admin', 'dashboard', 'jobs-activity'],
    queryFn: async () => {
      try {
        const res = await adminDashboardApi.getJobsActivity()
        return (res.data as { data?: { week: string; jobs_posted: number; applications: number }[] })?.data ?? []
      } catch { return [] }
    },
  })

  const { data: revenue } = useQuery({
    queryKey: ['admin', 'dashboard', 'revenue'],
    queryFn: async () => {
      try {
        const res = await adminDashboardApi.getRevenue()
        return (res.data as { data?: { month: string; revenue: number }[] })?.data ?? []
      } catch { return [] }
    },
  })

  const { data: categoryDist } = useQuery({
    queryKey: ['admin', 'dashboard', 'category-dist'],
    queryFn: async () => {
      try {
        const res = await adminDashboardApi.getCategoryDistribution()
        return (res.data as { data?: { name: string; value: number }[] })?.data ?? []
      } catch { return [] }
    },
  })

  const { data: recent } = useQuery({
    queryKey: ['admin', 'dashboard', 'recent'],
    queryFn: async () => {
      try {
        const res = await adminDashboardApi.getRecentActivity()
        return (res.data as {
          data?: {
            registrations?: Array<{ id: string; name: string; email: string; created_at: string }>
            jobs?: Array<{ id: string; title: string; seeker_name: string; created_at: string }>
            payments?: Array<{ id: string; user_name: string; plan_name: string; amount: number; created_at: string }>
          }
        })?.data ?? {}
      } catch { return {} }
    },
  })

  const s = stats as Record<string, unknown>
  const daysSinceLaunch = differenceInDays(new Date(), new Date(appConfig.appLaunchedDate))

  if (statsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={Number(s.total_users ?? 0).toLocaleString()}
          trend={s.user_growth_pct != null ? { value: Number(s.user_growth_pct) } : undefined}
        />
        <StatsCard
          title="Active Jobs Posted"
          value={Number(s.active_jobs ?? 0).toLocaleString()}
          subtitle={s.new_jobs_this_week != null ? `+${s.new_jobs_this_week} this week` : undefined}
        />
        <StatsCard
          title="Total Services Listed"
          value={Number(s.total_services ?? 0).toLocaleString()}
          subtitle={s.new_services_this_week != null ? `+${s.new_services_this_week} this week` : undefined}
        />
        <StatsCard
          title="Revenue This Month"
          value={`₹${Number(s.revenue_this_month ?? 0).toLocaleString()}`}
          trend={s.revenue_growth_pct != null ? { value: Number(s.revenue_growth_pct) } : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LineChart
          title="User Growth (last 30 days)"
          data={userGrowth ?? []}
          xKey="date"
          series={[
            { name: 'Seekers', dataKey: 'seekers' },
            { name: 'Providers', dataKey: 'providers' },
          ]}
        />
        <BarChart
          title="Jobs Activity (last 12 weeks)"
          data={jobsActivity ?? []}
          xKey="week"
          series={[
            { name: 'Jobs Posted', dataKey: 'jobs_posted' },
            { name: 'Applications', dataKey: 'applications' },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AreaChart
          title="Subscription Revenue (last 12 months)"
          data={revenue ?? []}
          xKey="month"
          dataKey="revenue"
        />
        <PieChart title="Services by Category" data={categoryDist ?? []} />
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-[var(--color-admin-text)]">Business Health KPIs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-[var(--color-admin-text-muted)]">Avg rating (platform)</p>
            <p className="text-xl font-semibold">{Number(s.avg_rating ?? 0).toFixed(1)} ⭐</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-admin-text-muted)]">Application → Acceptance %</p>
            <p className="text-xl font-semibold">{Number(s.acceptance_rate ?? 0).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-admin-text-muted)]">Subscription conversion %</p>
            <p className="text-xl font-semibold">{Number(s.subscription_conversion ?? 0).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-admin-text-muted)]">Days since launch</p>
            <p className="text-xl font-semibold">{daysSinceLaunch}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="text-sm font-semibold">Latest Registrations</h3>
          <ul className="mt-3 space-y-2">
            {(recent?.registrations ?? []).slice(0, 10).map((r: { id: string; name: string; email: string; created_at: string }) => (
              <li key={r.id} className="flex justify-between text-xs">
                <span>{r.name} ({r.email})</span>
                <span className="text-[var(--color-admin-text-muted)]">{format(new Date(r.created_at), 'dd MMM')}</span>
              </li>
            ))}
            {(recent?.registrations ?? []).length === 0 && <li className="text-xs text-[var(--color-admin-text-muted)]">No data</li>}
          </ul>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold">Latest Job Postings</h3>
          <ul className="mt-3 space-y-2">
            {(recent?.jobs ?? []).slice(0, 10).map((j: { id: string; title: string; seeker_name: string; created_at: string }) => (
              <li key={j.id} className="flex justify-between text-xs">
                <span>{j.title} — {j.seeker_name}</span>
                <span className="text-[var(--color-admin-text-muted)]">{format(new Date(j.created_at), 'dd MMM')}</span>
              </li>
            ))}
            {(recent?.jobs ?? []).length === 0 && <li className="text-xs text-[var(--color-admin-text-muted)]">No data</li>}
          </ul>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold">Latest Payments</h3>
          <ul className="mt-3 space-y-2">
            {(recent?.payments ?? []).slice(0, 10).map((p: { id: string; user_name: string; plan_name: string; amount: number; created_at: string }) => (
              <li key={p.id} className="flex justify-between text-xs">
                <span>{p.user_name} — {p.plan_name}</span>
                <span>₹{p.amount} · {format(new Date(p.created_at), 'dd MMM')}</span>
              </li>
            ))}
            {(recent?.payments ?? []).length === 0 && <li className="text-xs text-[var(--color-admin-text-muted)]">No data</li>}
          </ul>
        </Card>
      </div>
    </div>
  )
}
