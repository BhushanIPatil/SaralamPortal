import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi } from '@/lib/api/endpoints/applications'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { RatingStars } from '@/components/ui/RatingStars'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency } from '@/utils/format'
import type { JobApplication } from '@/types/application'

export function ShortlistPage() {
  const queryClient = useQueryClient()

  const { data: shortlistedData, isLoading } = useQuery({
    queryKey: ['applications', 'shortlisted'],
    queryFn: async () => {
      const res = await applicationsApi.getMy({ status: 'shortlisted' })
      return (res.data as { data?: JobApplication[] })?.data ?? []
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => applicationsApi.updateStatus(id, 'pending'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'shortlisted'] })
    },
  })

  const shortlisted = Array.isArray(shortlistedData) ? shortlistedData : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="section-title">Shortlisted Providers</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Your shortlisted applications. Contact accepted providers or re-post a job for the same category.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : shortlisted.length === 0 ? (
        <Card className="mt-8 py-12 text-center">
          <p className="text-[var(--color-text-muted)]">
            You haven&apos;t shortlisted any providers yet. View applications on your jobs to shortlist.
          </p>
          <Link to="/seeker/jobs" className="mt-4 inline-block">
            <Button>My Jobs</Button>
          </Link>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shortlisted.map((app) => (
            <Card key={app.id} className="flex flex-col">
              <div className="flex gap-4">
                <Avatar
                  src={app.provider_avatar}
                  fallback={app.provider_name ?? 'Provider'}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold text-[var(--color-text-primary)]">
                    {app.provider_name ?? 'Provider'}
                  </h3>
                  <p className="truncate text-sm text-[var(--color-text-muted)]">
                    {app.service_title ?? 'Service'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <RatingStars value={app.provider_rating ?? 0} size="sm" />
                    <span className="text-xs text-[var(--color-text-muted)]">
                      ({app.provider_review_count ?? 0})
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {app.proposed_price != null && (
                  <span className="text-sm font-medium text-[var(--color-primary-600)]">
                    {formatCurrency(app.proposed_price, app.currency)}
                  </span>
                )}
              </div>
              {app.status === 'accepted' && (app.contact_phone || app.contact_email) && (
                <div className="mt-3 rounded-lg bg-[var(--color-surface-2)] p-3 text-sm">
                  <p className="font-medium text-[var(--color-text-primary)]">Contact</p>
                  {app.contact_phone && <p>{app.contact_phone}</p>}
                  {app.contact_email && <p>{app.contact_email}</p>}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/seeker/jobs/${app.job_id}/applications`}>
                  <Button variant="secondary" size="sm">View in Job</Button>
                </Link>
                <Link to={`/users/${app.provider_id}/public`}>
                  <Button variant="ghost" size="sm">View Profile</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--color-danger)]"
                  onClick={() => removeMutation.mutate(app.id)}
                  disabled={removeMutation.isPending}
                >
                  Remove
                </Button>
              </div>
              <Link
                to={`/seeker/post-job?category=${app.service_id ?? ''}`}
                className="mt-3 block text-center text-sm text-[var(--color-primary-600)] hover:underline"
              >
                Re-post job for same category
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
