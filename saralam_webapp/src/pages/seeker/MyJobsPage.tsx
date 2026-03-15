import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api/endpoints/jobs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { SubmitRatingModal } from '@/components/features/ratings'
import { formatCurrency } from '@/utils/format'
import { formatDate } from '@/utils/format'
import type { JobListItem } from '@/types/job'
import { cn } from '@/lib/utils'

const TABS = [
  { value: 'active', label: 'Active' },
  { value: 'in_review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'draft', label: 'Draft' },
]

const STATUS_CHIP: Record<string, string> = {
  open: 'Open',
  in_review: 'Reviewing',
  assigned: 'Assigned',
  completed: 'Completed',
  cancelled: 'Cancelled',
  draft: 'Draft',
}

export function MyJobsPage() {
  const [tab, setTab] = useState('active')
  const [ratingTarget, setRatingTarget] = useState<{ jobId: string; providerId: string; providerName?: string } | null>(null)
  const queryClient = useQueryClient()

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', 'my'],
    queryFn: async () => {
      const res = await jobsApi.getMy()
      return (res.data as { data?: JobListItem[] })?.data ?? []
    },
  })

  const cancelJob = useMutation({
    mutationFn: (id: string) => jobsApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs', 'my'] }),
  })

  const completeJob = useMutation({
    mutationFn: (id: string) => jobsApi.complete(id),
    onSuccess: async (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'my'] })
      try {
        const res = await jobsApi.getById(jobId)
        const d = (res.data as { data?: { assigned_provider_id?: string; assigned_provider_name?: string } })?.data
        if (d?.assigned_provider_id) {
          setRatingTarget({
            jobId,
            providerId: d.assigned_provider_id,
            providerName: d.assigned_provider_name,
          })
        }
      } catch {
        // ignore
      }
    },
  })

  const jobs = Array.isArray(jobsData) ? jobsData : []
  const filtered = jobs.filter((j) => {
    if (tab === 'active') return ['open', 'in_review', 'assigned'].includes(j.status)
    if (tab === 'in_review') return j.status === 'in_review'
    if (tab === 'completed') return j.status === 'completed'
    if (tab === 'cancelled') return j.status === 'cancelled'
    if (tab === 'draft') return j.status === 'draft'
    return true
  })

  const handleCancel = (id: string) => {
    if (window.confirm('Cancel this job? Applications will be notified.')) cancelJob.mutate(id)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="section-title">My Jobs</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        View and manage your posted jobs.
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-[var(--color-border)] pb-2">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              tab === value
                ? 'bg-[var(--color-primary-600)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="mt-8 py-12 text-center">
          <p className="text-[var(--color-text-muted)]">
            No jobs in this tab. Post a job to get started.
          </p>
          <Link to="/seeker/post-job" className="mt-4 inline-block">
            <Button>Post a Job</Button>
          </Link>
        </Card>
      ) : (
        <ul className="mt-6 space-y-4">
          {filtered.map((job) => (
            <li key={job.id}>
              <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-semibold text-[var(--color-text-primary)]">
                      {job.title}
                    </h2>
                    {job.category_name && (
                      <Badge variant="outline">{job.category_name}</Badge>
                    )}
                    {(job.new_applications_count ?? 0) > 0 && (
                      <Badge variant="primary">New</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Posted {formatDate(job.created_at)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      {job.applications_count ?? 0} applications
                    </span>
                    <Badge variant="default">{STATUS_CHIP[job.status] ?? job.status}</Badge>
                    <span className="text-[var(--color-text-muted)]">
                      {job.budget_min != null || job.budget_max != null
                        ? [job.budget_min, job.budget_max].filter(Boolean).map((n) => formatCurrency(n!, job.currency)).join(' – ')
                        : job.budget_type}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/seeker/jobs/${job.id}/applications`}>
                    <Button variant="secondary" size="sm">View Applications</Button>
                  </Link>
                  {job.status === 'draft' && (
                    <Link to={`/seeker/jobs/${job.id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                  )}
                  {['open', 'in_review'].includes(job.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[var(--color-danger)]"
                      onClick={() => handleCancel(job.id)}
                      disabled={cancelJob.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                  {job.status === 'assigned' && (
                    <Button
                      size="sm"
                      onClick={() => completeJob.mutate(job.id)}
                      disabled={completeJob.isPending}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <SubmitRatingModal
        open={!!ratingTarget}
        onClose={() => setRatingTarget(null)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['ratings'] })}
        jobId={ratingTarget?.jobId}
        providerId={ratingTarget?.providerId ?? ''}
        providerName={ratingTarget?.providerName}
      />
    </div>
  )
}
