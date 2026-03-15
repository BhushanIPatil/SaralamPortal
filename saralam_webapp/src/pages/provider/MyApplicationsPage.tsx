import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi } from '@/lib/api/endpoints/applications'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency } from '@/utils/format'
import { formatDate } from '@/utils/format'
import type { JobApplication } from '@/types/application'

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

export function MyApplicationsPage() {
  const [tab, setTab] = useState('pending')
  const queryClient = useQueryClient()

  const { data: appsData, isLoading } = useQuery({
    queryKey: ['applications', 'my'],
    queryFn: async () => {
      const res = await applicationsApi.getMy()
      return (res.data as { data?: JobApplication[] })?.data ?? []
    },
  })

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => applicationsApi.withdraw(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications', 'my'] }),
  })

  const applications = Array.isArray(appsData) ? appsData : []
  const filtered = applications.filter((a) => a.status === tab)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="section-title">My Applications</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Track your job applications and seeker responses.
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-[var(--color-border)] pb-2">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === value
                ? 'bg-[var(--color-primary-600)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
            }`}
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
        <Card className="mt-8 py-12 text-center text-[var(--color-text-muted)]">
          No applications in this tab.
        </Card>
      ) : (
        <ul className="mt-6 space-y-4">
          {filtered.map((app) => (
            <li key={app.id}>
              <Card>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold text-[var(--color-text-primary)]">
                      {app.job_title ?? 'Job'}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {app.status === 'accepted' || app.status === 'shortlisted'
                        ? `Seeker: ${app.seeker_name ?? '—'}`
                        : 'Seeker: Anonymous'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          app.status === 'accepted'
                            ? 'success'
                            : app.status === 'shortlisted'
                              ? 'primary'
                              : app.status === 'rejected'
                                ? 'danger'
                                : 'default'
                        }
                      >
                        {app.status}
                      </Badge>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        Applied {formatDate(app.created_at)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">
                      Your proposal: {app.proposed_price != null ? formatCurrency(app.proposed_price, app.currency) : '—'}
                      {app.proposed_timeline && ` · ${app.proposed_timeline}`}
                    </p>
                    {app.cover_letter && (
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-muted)]">
                        {app.cover_letter}
                      </p>
                    )}
                    {(app.status === 'shortlisted' || app.status === 'accepted') && (app.seeker_phone || app.seeker_email) && (
                      <div className="mt-4 rounded-lg border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] p-4">
                        <p className="font-medium text-[var(--color-primary-800)]">Seeker contact</p>
                        {app.seeker_phone && <p>{app.seeker_phone}</p>}
                        {app.seeker_email && <p>{app.seeker_email}</p>}
                        {app.status === 'shortlisted' && (
                          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                            Seeker will contact you. You can also reach out with the details above.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link to={`/jobs/${app.job_id}`}>
                      <Button variant="secondary" size="sm">View Job</Button>
                    </Link>
                    {app.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--color-danger)]"
                        onClick={() => withdrawMutation.mutate(app.id)}
                        disabled={withdrawMutation.isPending}
                      >
                        Withdraw
                      </Button>
                    )}
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
