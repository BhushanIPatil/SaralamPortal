import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { jobsApi } from '@/lib/api/endpoints/jobs'
import { servicesApi } from '@/lib/api/endpoints/services'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ImageUpload } from '@/components/common/ImageUpload'
import { formatCurrency } from '@/utils/format'
import type { JobCreatePayload } from '@/types/job'
import type { ServiceCategory } from '@/types/service'
import { cn } from '@/lib/utils'

const STEPS = [
  'Job Basics',
  'Budget & Timeline',
  'Location & Visibility',
  'Media (optional)',
  'Review & Publish',
]

const BUDGET_TYPES = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'negotiable', label: 'Negotiable' },
]

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'premium_only', label: 'Premium only' },
]

const MAX_DESC = 2000
const FREE_JOBS_LIMIT = 3

export function PostJobPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [form, setForm] = useState<Partial<JobCreatePayload> & { requirements_str?: string }>({
    title: '',
    description: '',
    requirements_str: '',
    requirements: [],
    budget_type: 'fixed',
    budget_min: undefined,
    budget_max: undefined,
    currency: 'INR',
    event_date: '',
    duration_hours: undefined,
    duration_days: undefined,
    application_deadline: '',
    visibility: 'public',
    slots_available: 1,
    media_urls: [],
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await servicesApi.getCategories()
      return (res.data?.data as ServiceCategory[]) ?? []
    },
  })
  const categories = Array.isArray(categoriesData) ? categoriesData : []

  const { data: myJobsData } = useQuery({
    queryKey: ['jobs', 'my'],
    queryFn: async () => {
      const res = await jobsApi.getMy()
      return (res.data as { data?: { id: string }[] })?.data ?? []
    },
  })
  const myJobsCount = Array.isArray(myJobsData) ? myJobsData.length : 0
  const atLimit = !user?.subscription_status || user.subscription_status !== 'active' ? myJobsCount >= FREE_JOBS_LIMIT : false

  const createJob = useMutation({
    mutationFn: (payload: JobCreatePayload) => jobsApi.create(payload as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'my'] })
      navigate('/seeker/jobs', { replace: true })
    },
  })

  const updateForm = (patch: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...patch }))
    if ('requirements_str' in patch && patch.requirements_str !== undefined) {
      const reqs = patch.requirements_str.split(',').map((s) => s.trim()).filter(Boolean)
      setForm((p) => ({ ...p, requirements: reqs }))
    }
  }

  const handlePublish = () => {
    if (atLimit) {
      setUpgradeModalOpen(true)
      return
    }
    const payload: JobCreatePayload = {
      category_id: form.category_id!,
      title: form.title!,
      description: form.description || undefined,
      requirements: (form.requirements ?? []).length ? form.requirements : undefined,
      budget_type: form.budget_type!,
      budget_min: form.budget_min,
      budget_max: form.budget_max,
      currency: form.currency ?? 'INR',
      event_date: form.event_date || undefined,
      duration_hours: form.duration_hours,
      duration_days: form.duration_days,
      application_deadline: form.application_deadline || undefined,
      location: form.location,
      visibility: form.visibility,
      slots_available: form.slots_available ?? 1,
      media_urls: form.media_urls?.length ? form.media_urls : undefined,
      status: 'open',
    }
    createJob.mutate(payload)
  }

  const handleSaveDraft = () => {
    const payload: JobCreatePayload = {
      category_id: form.category_id!,
      title: form.title!,
      description: form.description || undefined,
      requirements: form.requirements?.length ? form.requirements : undefined,
      budget_type: form.budget_type!,
      budget_min: form.budget_min,
      budget_max: form.budget_max,
      currency: form.currency ?? 'INR',
      event_date: form.event_date || undefined,
      duration_hours: form.duration_hours,
      duration_days: form.duration_days,
      application_deadline: form.application_deadline || undefined,
      location: form.location,
      visibility: form.visibility,
      slots_available: form.slots_available ?? 1,
      media_urls: form.media_urls,
      status: 'draft',
    }
    createJob.mutate(payload)
  }

  const canNext = () => {
    if (step === 1) return form.category_id && form.title?.trim()
    if (step === 2) return true
    if (step === 3) return true
    if (step === 4) return true
    return false
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="section-title">Post a Job</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Fill in the details below. You can save as draft anytime.
      </p>

      {/* Progress bar */}
      <div className="mt-8 flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 flex-1 rounded-full transition-colors',
              i + 1 <= step ? 'bg-[var(--color-primary-600)]' : 'bg-[var(--color-border)]'
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Step {step} of {STEPS.length}: {STEPS[step - 1]}
      </p>

      <Card className="mt-8">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Job Basics</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">Category</label>
              <select
                value={form.category_id ?? ''}
                onChange={(e) => updateForm({ category_id: e.target.value })}
                className="input-field w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Job title"
              value={form.title ?? ''}
              onChange={(e) => updateForm({ title: e.target.value })}
              placeholder="e.g. Wedding Photographer needed"
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">Description</label>
              <textarea
                value={form.description ?? ''}
                onChange={(e) => updateForm({ description: e.target.value.slice(0, MAX_DESC) })}
                placeholder="Describe the job..."
                rows={5}
                className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
              />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {(form.description?.length ?? 0)} / {MAX_DESC}
              </p>
            </div>
            <Input
              label="Required skills / requirements (comma-separated)"
              value={form.requirements_str ?? ''}
              onChange={(e) => updateForm({ requirements_str: e.target.value })}
              placeholder="e.g. DSLR, 5+ years, portfolio"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Budget & Timeline</h2>
            <div>
              <label className="mb-1 block text-sm font-medium">Budget type</label>
              <div className="flex gap-4">
                {BUDGET_TYPES.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="budget_type"
                      value={value}
                      checked={form.budget_type === value}
                      onChange={() => updateForm({ budget_type: value as JobCreatePayload['budget_type'] })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            {form.budget_type !== 'negotiable' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Min budget (₹)"
                  type="number"
                  value={form.budget_min ?? ''}
                  onChange={(e) => updateForm({ budget_min: e.target.value ? Number(e.target.value) : undefined })}
                />
                <Input
                  label="Max budget (₹)"
                  type="number"
                  value={form.budget_max ?? ''}
                  onChange={(e) => updateForm({ budget_max: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            )}
            <Input
              label="Event / service date"
              type="date"
              value={form.event_date ?? ''}
              onChange={(e) => updateForm({ event_date: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Duration (hours)"
                type="number"
                value={form.duration_hours ?? ''}
                onChange={(e) => updateForm({ duration_hours: e.target.value ? Number(e.target.value) : undefined })}
              />
              <Input
                label="Duration (days)"
                type="number"
                value={form.duration_days ?? ''}
                onChange={(e) => updateForm({ duration_days: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <Input
              label="Application deadline"
              type="date"
              value={form.application_deadline ?? ''}
              onChange={(e) => updateForm({ application_deadline: e.target.value })}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Location & Visibility</h2>
            <Input
              label="Address (or city)"
              value={form.location?.address ?? form.location?.city ?? ''}
              onChange={(e) => updateForm({
                location: { ...form.location, address: e.target.value, city: e.target.value },
              })}
              placeholder="e.g. Mumbai"
            />
            <Input
              label="Service radius (km)"
              type="number"
              value={form.location?.radius_km ?? ''}
              onChange={(e) => updateForm({
                location: { ...form.location, radius_km: e.target.value ? Number(e.target.value) : undefined },
              })}
            />
            <div>
              <label className="mb-1 block text-sm font-medium">Visibility</label>
              <div className="flex gap-4">
                {VISIBILITY_OPTIONS.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="visibility"
                      value={value}
                      checked={form.visibility === value}
                      onChange={() => updateForm({ visibility: value as 'public' | 'premium_only' })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <Input
              label="Slots available"
              type="number"
              min={1}
              value={form.slots_available ?? 1}
              onChange={(e) => updateForm({ slots_available: e.target.value ? Number(e.target.value) : 1 })}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Media (optional)</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Upload up to 5 reference images or videos. Max 10MB each.
            </p>
            <ImageUpload
              maxFiles={5}
              maxSize={10 * 1024 * 1024}
              onAccept={(files) => {
                const urls = files.map((f) => URL.createObjectURL(f))
                updateForm({ media_urls: [...(form.media_urls ?? []), ...urls].slice(0, 5) })
              }}
            />
            {(form.media_urls?.length ?? 0) > 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">
                {form.media_urls!.length} file(s) added
              </p>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Review & Publish</h2>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-[var(--color-text-muted)]">Category</dt><dd>{categories.find((c) => c.id === form.category_id)?.name ?? form.category_id}</dd></div>
              <div><dt className="text-[var(--color-text-muted)]">Title</dt><dd>{form.title}</dd></div>
              <div><dt className="text-[var(--color-text-muted)]">Budget</dt><dd>{form.budget_type === 'negotiable' ? 'Negotiable' : [form.budget_min, form.budget_max].filter(Boolean).map((n) => formatCurrency(n!, form.currency)).join(' – ')}</dd></div>
              <div><dt className="text-[var(--color-text-muted)]">Event date</dt><dd>{form.event_date || '—'}</dd></div>
              <div><dt className="text-[var(--color-text-muted)]">Visibility</dt><dd>{form.visibility}</dd></div>
            </dl>
            <p className="text-sm text-[var(--color-text-muted)]">
              Estimated applications: Based on category and visibility.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                onClick={handlePublish}
                loading={createJob.isPending}
                disabled={!form.category_id || !form.title?.trim()}
              >
                Publish
              </Button>
              <Button variant="secondary" onClick={handleSaveDraft} disabled={createJob.isPending}>
                Save as Draft
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            Back
          </Button>
          {step < 5 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
              Next
            </Button>
          ) : null}
        </div>
      </Card>

      <Modal open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} title="Job limit reached">
        <p className="text-[var(--color-text-secondary)]">
          Free accounts can post up to {FREE_JOBS_LIMIT} jobs per month. Upgrade to post more.
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/subscription">
            <Button>View plans</Button>
          </Link>
          <Button variant="secondary" onClick={() => setUpgradeModalOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  )
}
