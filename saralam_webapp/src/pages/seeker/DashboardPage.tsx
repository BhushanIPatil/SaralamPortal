import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Briefcase, FileText, Heart, CreditCard, PlusCircle, Sparkles } from 'lucide-react'
import { jobsApi } from '@/lib/api/endpoints/jobs'
import { applicationsApi } from '@/lib/api/endpoints/applications'
import { servicesApi } from '@/lib/api/endpoints/services'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { SubscriptionBadge } from '@/components/common/SubscriptionBadge'
import { formatCurrency } from '@/utils/format'
import type { JobListItem } from '@/types/job'
import type { JobApplication } from '@/types/application'
import type { ServiceListItem } from '@/types/service'

export function SeekerDashboardPage() {
  const { user } = useAuthStore()

  const { data: jobsData } = useQuery({
    queryKey: ['jobs', 'my'],
    queryFn: async () => {
      const res = await jobsApi.getMy()
      return (res.data as { data?: JobListItem[] })?.data ?? []
    },
  })

  const { data: receivedData } = useQuery({
    queryKey: ['applications', 'received'],
    queryFn: async () => {
      try {
        const res = await applicationsApi.getReceived({ limit: 10 })
        return (res.data as { data?: JobApplication[] })?.data ?? []
      } catch {
        return []
      }
    },
  })

  const { data: shortlistedData } = useQuery({
    queryKey: ['applications', 'shortlisted'],
    queryFn: async () => {
      try {
        const res = await applicationsApi.getMy({ status: 'shortlisted' })
        return (res.data as { data?: JobApplication[] })?.data ?? []
      } catch {
        return []
      }
    },
  })

  const { data: recommendedData } = useQuery({
    queryKey: ['services', 'recommended'],
    queryFn: async () => {
      const res = await servicesApi.list({ page_size: 6, featured: true })
      const list = (res.data as { data?: ServiceListItem[] })?.data ?? []
      return Array.isArray(list) ? list : []
    },
  })

  const jobs = Array.isArray(jobsData) ? jobsData : []
  const activeJobs = jobs.filter((j) => ['open', 'in_review', 'assigned'].includes(j.status))
  const receivedApps = Array.isArray(receivedData) ? receivedData : []
  const shortlisted = Array.isArray(shortlistedData) ? shortlistedData : []
  const recommended = Array.isArray(recommendedData) ? recommendedData : []
  const applicationsToday = 0
  const totalApplications = jobs.reduce((sum, j) => sum + (j.applications_count ?? 0), 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="section-title">Dashboard</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Manage your jobs and applications.
      </p>

      {/* Overview cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/seeker/jobs?status=active">
          <Card hoverLift className="h-full">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--color-primary-100)] p-2.5 text-[var(--color-primary-600)]">
                <Briefcase className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {activeJobs.length}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">Active Jobs Posted</p>
              </div>
            </div>
          </Card>
        </Link>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--color-accent-50)] p-2.5 text-[var(--color-accent-600)]">
              <FileText className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {applicationsToday > 0 ? `${applicationsToday} today / ` : ''}{totalApplications}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">Applications Received</p>
            </div>
          </div>
        </Card>
        <Link to="/seeker/shortlist">
          <Card hoverLift className="h-full">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--color-success)]/10 p-2.5 text-[var(--color-success)]">
                <Heart className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {shortlisted.length}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">Shortlisted Providers</p>
              </div>
            </div>
          </Card>
        </Link>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--color-surface-3)] p-2.5 text-[var(--color-text-secondary)]">
              <CreditCard className="size-6" />
            </div>
            <div>
              <SubscriptionBadge status={user?.subscription_status} planName={user?.subscription_status === 'active' ? 'Active' : 'Free'} />
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {user?.subscription_status === 'active' ? 'Days remaining' : 'Upgrade for more'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link to="/seeker/post-job">
          <Button size="lg" leftIcon={<PlusCircle className="size-5" />}>
            Post New Job
          </Button>
        </Link>
        <Link to="/services">
          <Button variant="secondary" size="lg" leftIcon={<Sparkles className="size-5" />}>
            Browse Services
          </Button>
        </Link>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {/* Recent activity */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
              Recent Activity
            </h2>
            {jobs.some((j) => (j.applications_count ?? 0) > 0) && (
              <Link to="/seeker/jobs">
                <Button variant="ghost" size="sm">View All Applications</Button>
              </Link>
            )}
          </div>
          <ul className="mt-4 space-y-3">
            {receivedApps.length === 0 ? (
              <li className="py-6 text-center text-sm text-[var(--color-text-muted)]">
                No new applications yet. Post a job to get started.
              </li>
            ) : (
              receivedApps.slice(0, 5).map((app) => (
                <li
                  key={app.id}
                  className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3"
                >
                  <Avatar
                    src={app.provider_avatar}
                    fallback={app.provider_name ?? 'Provider'}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {app.provider_name ?? 'Provider'}
                    </p>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">
                      {app.service_title ?? 'Application'} · {app.proposed_price != null ? formatCurrency(app.proposed_price, app.currency) : '—'}
                    </p>
                  </div>
                  <Link to={`/seeker/jobs/${app.job_id}/applications`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Card>

        {/* Recommended providers */}
        <Card>
          <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
            Recommended Providers
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Based on your job categories and location
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recommended.length === 0 ? (
              <p className="col-span-2 py-6 text-center text-sm text-[var(--color-text-muted)]">
                Browse services to see recommendations.
              </p>
            ) : (
              recommended.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3">
                  <Avatar
                    src={s.provider_avatar}
                    fallback={s.provider_name ?? s.title}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {s.provider_name ?? s.title}
                    </p>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">{s.title}</p>
                  </div>
                  <Link to={`/services/${s.id}`}>
                    <Button variant="ghost" size="sm">Contact</Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
