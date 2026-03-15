import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Package,
  Briefcase,
  FileText,
  Star,
  Eye,
  Lock,
} from 'lucide-react'
import { providerApi } from '@/lib/api/endpoints/provider'
import { jobsApi } from '@/lib/api/endpoints/jobs'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RatingStars } from '@/components/ui/RatingStars'
import { SubscriptionBadge } from '@/components/common/SubscriptionBadge'
import { formatCurrency } from '@/utils/format'
import type { ProviderDashboardStats } from '@/types/provider'
import type { JobMatchItem } from '@/types/provider'
import type { JobListItem } from '@/types/job'

export function ProviderDashboardPage() {
  const { user } = useAuthStore()
  const [jobFeedCity, setJobFeedCity] = useState('')

  const { data: statsData } = useQuery({
    queryKey: ['provider', 'dashboard-stats'],
    queryFn: async () => {
      try {
        const res = await providerApi.getDashboardStats()
        return (res.data as { data?: ProviderDashboardStats })?.data
      } catch {
        return undefined
      }
    },
  })

  const { data: jobMatchesData } = useQuery({
    queryKey: ['provider', 'job-matches', jobFeedCity],
    queryFn: async () => {
      try {
        const res = await providerApi.getJobMatches({ city: jobFeedCity || undefined, limit: 10 })
        return (res.data as { data?: JobMatchItem[] })?.data ?? []
      } catch {
        return []
      }
    },
  })

  const { data: jobsListData } = useQuery({
    queryKey: ['jobs', 'list', 'provider-feed'],
    queryFn: async () => {
      const res = await jobsApi.list({ page_size: 10, status: 'open' })
      const d = res.data as { data?: JobListItem[] }
      return Array.isArray(d?.data) ? d.data : []
    },
  })

  const stats = statsData ?? {}
  const jobMatches = Array.isArray(jobMatchesData) ? jobMatchesData : []
  const jobsFeed = jobMatches.length > 0 ? jobMatches : (Array.isArray(jobsListData) ? jobsListData : [])
  const ratingTrend = stats.rating_trend ?? []
  const apps = stats.applications_submitted ?? {}
  const pending = apps.pending ?? 0
  const shortlisted = apps.shortlisted ?? 0
  const accepted = apps.accepted ?? 0
  const totalApps = pending + shortlisted + accepted
  const isPremium = user?.subscription_status === 'active'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="section-title">Dashboard</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Manage your services and applications.
      </p>

      {/* Stats cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Link to="/provider/services">
          <Card hoverLift className="h-full">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--color-primary-100)] p-2.5 text-[var(--color-primary-600)]">
                <Package className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.active_services ?? 0}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">Active Services</p>
              </div>
            </div>
          </Card>
        </Link>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--color-accent-50)] p-2.5 text-[var(--color-accent-600)]">
              <Briefcase className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {stats.job_matches_today ?? 0}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">New Job Matches Today</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--color-success)]/10 p-2.5 text-[var(--color-success)]">
              <FileText className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalApps}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">Applications (P/S/A)</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--color-accent-50)] p-2.5 text-[var(--color-accent-600)]">
              <Star className="size-6" />
            </div>
            <div>
              <RatingStars value={stats.avg_rating ?? 0} size="sm" />
              <p className="text-sm text-[var(--color-text-secondary)]">Overall Rating</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--color-surface-3)] p-2.5 text-[var(--color-text-secondary)]">
              <Eye className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {stats.profile_views_7d ?? 0}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">Profile Views (7d)</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <SubscriptionBadge status={user?.subscription_status} planName={user?.subscription_status === 'active' ? 'Active' : 'Free'} />
            <p className="text-sm text-[var(--color-text-secondary)]">Subscription</p>
          </div>
        </Card>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Job Alert Feed */}
        <Card>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
              Job Alert Feed
            </h2>
            <input
              type="text"
              placeholder="Filter by city"
              value={jobFeedCity}
              onChange={(e) => setJobFeedCity(e.target.value)}
              className="input-field w-40 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm"
            />
          </div>
          <ul className="mt-4 max-h-96 space-y-3 overflow-y-auto">
            {jobsFeed.length === 0 ? (
              <li className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                No matching jobs right now. Check back later.
              </li>
            ) : (
              jobsFeed.slice(0, 8).map((job) => {
                const isPremiumJob = (job as JobListItem).visibility === 'premium_only'
                const locked = isPremiumJob && !isPremium
                return (
                  <li
                    key={job.id}
                    className="rounded-lg border border-[var(--color-border)] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[var(--color-text-primary)]">{job.title}</p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {(job as JobMatchItem).seeker_name ?? 'Seeker'} · {(job as JobListItem).category_name ?? '—'}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {job.budget_min != null || job.budget_max != null
                            ? [job.budget_min, job.budget_max].filter(Boolean).map((n) => formatCurrency(n!, job.currency)).join(' – ')
                            : ('budget_type' in job ? job.budget_type : '—')}{' '}
                          · {(job as JobListItem).event_date ?? (job as JobMatchItem).event_date ?? '—'}
                        </p>
                      </div>
                      {locked ? (
                        <Link to="/subscription">
                          <Button variant="secondary" size="sm">
                            <Lock className="size-4" />
                            Upgrade
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/provider/jobs?apply=${job.id}`}>
                          <Button size="sm">Apply Now</Button>
                        </Link>
                      )}
                    </div>
                  </li>
                )
              })
            )}
          </ul>
          <Link to="/provider/jobs" className="mt-4 block">
            <Button variant="ghost" size="sm" className="w-full">Browse All Jobs</Button>
          </Link>
        </Card>

        {/* Performance */}
        <Card>
          <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
            Performance
          </h2>
          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-2xl font-bold text-[var(--color-primary-600)]">
                {stats.response_rate ?? 0}%
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">Response rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {stats.jobs_completed ?? 0}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">Jobs completed</p>
            </div>
          </div>
          {ratingTrend.length > 0 ? (
            <div className="mt-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rating" stroke="var(--color-primary-600)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-[var(--color-text-muted)]">Rating (last 6 months)</p>
            </div>
          ) : (
            <div className="mt-6 h-48 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center">
              <p className="text-sm text-[var(--color-text-muted)]">Rating trend will appear here</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
