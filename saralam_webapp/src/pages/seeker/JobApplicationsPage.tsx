import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api/endpoints/jobs'
import { applicationsApi } from '@/lib/api/endpoints/applications'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { RatingStars } from '@/components/ui/RatingStars'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency } from '@/utils/format'
import type { JobDetail } from '@/types/job'
import type { JobApplication } from '@/types/application'
import { cn } from '@/lib/utils'

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
]

const SORT_OPTIONS = [
  { value: 'date', label: 'By Date' },
  { value: 'price', label: 'By Price' },
  { value: 'rating', label: 'By Rating' },
]

export function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('date')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: jobData, isLoading: jobLoading } = useQuery({
    queryKey: ['jobs', id],
    queryFn: async () => {
      const res = await jobsApi.getById(id!)
      return res.data?.data as JobDetail | undefined
    },
    enabled: !!id,
  })

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['jobs', id, 'applications'],
    queryFn: async () => {
      const res = await jobsApi.getApplications(id!, { sort })
      return (res.data as { data?: JobApplication[] })?.data ?? []
    },
    enabled: !!id,
  })

  const updateStatus = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: string }) =>
      applicationsApi.updateStatus(appId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', id, 'applications'] })
    },
  })

  const job = jobData
  const applications = Array.isArray(appsData) ? appsData : []
  const filtered = applications.filter((a) => {
    if (filter === 'all') return true
    return a.status === filter
  })
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sort === 'price') return (b.proposed_price ?? 0) - (a.proposed_price ?? 0)
    if (sort === 'rating') return (b.provider_rating ?? 0) - (a.provider_rating ?? 0)
    return 0
  })

  if (!id || jobLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-[var(--color-danger)]">Job not found.</p>
        <Link to="/seeker/jobs"><Button variant="secondary" className="mt-4">Back to My Jobs</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/seeker/jobs" className="text-sm text-[var(--color-primary-600)] hover:underline">
        ← Back to My Jobs
      </Link>

      {/* Job summary card */}
      <Card className="mt-6">
        <h1 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">
          {job.title}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-[var(--color-text-secondary)]">
          {job.category_name && <Badge variant="outline">{job.category_name}</Badge>}
          <span>{job.applications_count ?? 0} applications</span>
          <span>
            {job.budget_min != null || job.budget_max != null
              ? [job.budget_min, job.budget_max].filter(Boolean).map((n) => formatCurrency(n!, job.currency)).join(' – ')
              : job.budget_type}
          </span>
        </div>
      </Card>

      {/* Filter & sort */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {FILTER_TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium',
                filter === value ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-field rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {appsLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : sorted.length === 0 ? (
        <Card className="mt-6 py-12 text-center text-[var(--color-text-muted)]">
          No applications in this filter.
        </Card>
      ) : (
        <ul className="mt-6 space-y-4">
          {sorted.map((app) => (
            <li key={app.id}>
              <Card>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <Avatar
                      src={app.provider_avatar}
                      fallback={app.provider_name ?? 'Provider'}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display font-semibold text-[var(--color-text-primary)]">
                          {app.provider_name ?? 'Provider'}
                        </h3>
                        <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'shortlisted' ? 'primary' : 'default'}>
                          {app.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <RatingStars value={app.provider_rating ?? 0} size="sm" />
                        <span className="text-sm text-[var(--color-text-muted)]">
                          ({app.provider_review_count ?? 0} reviews)
                        </span>
                      </div>
                      {app.cover_letter && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                            className="text-left text-sm text-[var(--color-primary-600)] hover:underline"
                          >
                            {expandedId === app.id ? 'Hide' : 'Show'} cover letter
                          </button>
                          {expandedId === app.id && (
                            <p className="mt-2 rounded-lg bg-[var(--color-surface-2)] p-3 text-sm text-[var(--color-text-secondary)]">
                              {app.cover_letter}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {app.proposed_price != null ? formatCurrency(app.proposed_price, app.currency) : '—'}
                        </span>
                        {app.proposed_timeline && (
                          <span className="text-[var(--color-text-muted)]">{app.proposed_timeline}</span>
                        )}
                      </div>
                      {(app.portfolio_images?.length ?? 0) > 0 && (
                        <div className="mt-3 flex gap-2">
                          {app.portfolio_images!.slice(0, 3).map((url, i) => (
                            <div
                              key={i}
                              className="h-16 w-16 overflow-hidden rounded-lg bg-[var(--color-surface-3)]"
                            >
                              <img src={url} alt="" className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      {app.status === 'accepted' && (app.contact_phone || app.contact_email) && (
                        <div className="mt-3 rounded-lg bg-[var(--color-primary-50)] p-3 text-sm">
                          <p className="font-medium text-[var(--color-text-primary)]">Contact</p>
                          {app.contact_phone && <p>{app.contact_phone}</p>}
                          {app.contact_email && <p>{app.contact_email}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus.mutate({ appId: app.id, status: 'shortlisted' })}
                          disabled={updateStatus.isPending}
                        >
                          Shortlist
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[var(--color-danger)]"
                          onClick={() => updateStatus.mutate({ appId: app.id, status: 'rejected' })}
                          disabled={updateStatus.isPending}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {app.status === 'shortlisted' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus.mutate({ appId: app.id, status: 'accepted' })}
                          disabled={updateStatus.isPending}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus.mutate({ appId: app.id, status: 'pending' })}
                          disabled={updateStatus.isPending}
                        >
                          Remove from shortlist
                        </Button>
                      </>
                    )}
                    <Link to={`/users/${app.provider_id}/public`}>
                      <Button variant="secondary" size="sm">View Full Profile</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
