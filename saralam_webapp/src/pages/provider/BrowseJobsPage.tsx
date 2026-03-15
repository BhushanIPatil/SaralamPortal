import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { jobsApi } from '@/lib/api/endpoints/jobs'
import { servicesApi } from '@/lib/api/endpoints/services'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ApplyModal } from '@/components/features/applications/ApplyModal'
import { formatCurrency } from '@/utils/format'
import { formatDate } from '@/utils/format'
import type { JobListItem } from '@/types/job'
import type { JobDetail } from '@/types/job'
import type { ServiceCategory } from '@/types/service'

export function ProviderBrowseJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const applyId = searchParams.get('apply')
  const { user } = useAuthStore()
  const [categoryId, setCategoryId] = useState('')
  const [city, setCity] = useState('')
  const [matchMyServices, setMatchMyServices] = useState(true)
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [postedWithin, setPostedWithin] = useState('')

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await servicesApi.getCategories()
      return (res.data?.data as ServiceCategory[]) ?? []
    },
  })

  const { data: myServicesData } = useQuery({
    queryKey: ['services', 'my'],
    queryFn: async () => {
      const res = await servicesApi.getMy()
      return (res.data as { data?: { category_id: string }[] })?.data ?? []
    },
  })

  const myCategoryIds = Array.isArray(myServicesData) ? [...new Set(myServicesData.map((s) => s.category_id))] : []

  const params: Record<string, unknown> = {
    status: 'open',
    page_size: 20,
    category_id: categoryId || undefined,
    city: city || undefined,
    min_budget: minBudget ? Number(minBudget) : undefined,
    max_budget: maxBudget ? Number(maxBudget) : undefined,
    posted_within: postedWithin || undefined,
  }
  if (matchMyServices && myCategoryIds.length > 0) {
    params.category_ids = myCategoryIds.join(',')
  }

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', 'list', params],
    queryFn: async () => {
      const res = await jobsApi.list(params)
      const d = res.data as { data?: JobListItem[] }
      return Array.isArray(d?.data) ? d.data : []
    },
  })

  const { data: jobDetailData } = useQuery({
    queryKey: ['jobs', applyId],
    queryFn: async () => {
      const res = await jobsApi.getById(applyId!)
      return res.data?.data as JobDetail | undefined
    },
    enabled: !!applyId,
  })

  const jobs = Array.isArray(jobsData) ? jobsData : []
  const isPremium = user?.subscription_status === 'active'

  const openApply = (id: string) => setSearchParams({ apply: id })
  const closeApply = () => setSearchParams({})

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="section-title">Browse Jobs</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Find jobs that match your services and apply.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={matchMyServices}
            onChange={(e) => setMatchMyServices(e.target.checked)}
          />
          <span className="text-sm">Jobs matching my services</span>
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:w-56">
          <h3 className="font-display font-semibold text-[var(--color-text-primary)]">Filters</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {(categoriesData ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Any"
                className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">Budget range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">Posted within</label>
              <select
                value={postedWithin}
                onChange={(e) => setPostedWithin(e.target.value)}
                className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : jobs.length === 0 ? (
            <Card className="py-12 text-center text-[var(--color-text-muted)]">
              No jobs match your filters.
            </Card>
          ) : (
            <ul className="space-y-4">
              {jobs.map((job) => {
                const isPremiumJob = job.visibility === 'premium_only'
                const locked = isPremiumJob && !isPremium
                return (
                  <li key={job.id}>
                    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-semibold text-[var(--color-text-primary)]">
                          {job.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-sm">
                          {job.category_name && <Badge variant="outline">{job.category_name}</Badge>}
                          <span className="text-[var(--color-text-muted)]">
                            {job.budget_min != null || job.budget_max != null
                              ? [job.budget_min, job.budget_max].filter(Boolean).map((n) => formatCurrency(n!, job.currency)).join(' – ')
                              : job.budget_type}
                          </span>
                          {job.event_date && <span>{formatDate(job.event_date)}</span>}
                          {job.city && <span>{job.city}</span>}
                          {job.distance_km != null && <span>{job.distance_km.toFixed(0)} km away</span>}
                        </div>
                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          {job.applications_count ?? 0} applications · Deadline {job.application_deadline ? formatDate(job.application_deadline) : '—'}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {locked ? (
                          <Link to="/subscription">
                            <Button variant="secondary" size="sm">Upgrade to view</Button>
                          </Link>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => openApply(job.id)}>
                              Quick Apply
                            </Button>
                            <Link to={`/jobs/${job.id}`}>
                              <Button variant="secondary" size="sm">View Details</Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <ApplyModal
        open={!!applyId}
        onClose={closeApply}
        job={applyId ? (jobDetailData ?? null) : null}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['applications', 'my'] })}
      />
    </div>
  )
}
