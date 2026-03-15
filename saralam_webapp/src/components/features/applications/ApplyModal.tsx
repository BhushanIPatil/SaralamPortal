import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api/endpoints/jobs'
import { servicesApi } from '@/lib/api/endpoints/services'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/format'
import type { JobDetail } from '@/types/job'
import type { ServiceListItem } from '@/types/service'
import type { ApplyToJobPayload } from '@/types/application'

export interface ApplyModalProps {
  open: boolean
  onClose: () => void
  job: JobDetail | null
  onSuccess?: () => void
}

export function ApplyModal({ open, onClose, job, onSuccess }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedPrice, setProposedPrice] = useState<number | ''>('')
  const [proposedTimeline, setProposedTimeline] = useState('')
  const [serviceId, setServiceId] = useState('')

  const { data: myServicesData } = useQuery({
    queryKey: ['services', 'my'],
    queryFn: async () => {
      const res = await servicesApi.getMy()
      return (res.data as { data?: ServiceListItem[] })?.data ?? []
    },
    enabled: open,
  })
  const myServices = Array.isArray(myServicesData) ? myServicesData : []

  const applyMutation = useMutation({
    mutationFn: (payload: ApplyToJobPayload) =>
      jobsApi.apply(job!.id, {
        cover_letter: payload.cover_letter,
        proposed_price: payload.proposed_price,
        proposed_timeline: payload.proposed_timeline,
        service_id: payload.service_id || undefined,
      }),
    onSuccess: () => {
      onSuccess?.()
      onClose()
      setCoverLetter('')
      setProposedPrice('')
      setProposedTimeline('')
      setServiceId('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!job || coverLetter.length < 50) return
    applyMutation.mutate({
      cover_letter: coverLetter,
      proposed_price: proposedPrice === '' ? undefined : Number(proposedPrice),
      proposed_timeline: proposedTimeline || undefined,
      service_id: serviceId || undefined,
    })
  }

  if (!job) return null

  return (
    <Modal open={open} onClose={onClose} title="Apply to Job">
      <div className="rounded-lg bg-[var(--color-surface-2)] p-3 text-sm">
        <p className="font-medium text-[var(--color-text-primary)]">{job.title}</p>
        <p className="text-[var(--color-text-muted)]">
          {job.category_name} · {job.budget_min != null || job.budget_max != null ? [job.budget_min, job.budget_max].filter(Boolean).map((n) => formatCurrency(n!, job.currency)).join(' – ') : job.budget_type}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Cover letter (min 50 characters)</label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={4}
            required
            minLength={50}
            className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
            placeholder="Introduce yourself and why you're a good fit..."
          />
          <p className="text-xs text-[var(--color-text-muted)]">{coverLetter.length} / 50</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Proposed price (₹)</label>
          <input
            type="number"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value === '' ? '' : Number(e.target.value))}
            className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Proposed timeline</label>
          <input
            type="text"
            value={proposedTimeline}
            onChange={(e) => setProposedTimeline(e.target.value)}
            className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
            placeholder="e.g. 2 weeks before event"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Apply with service</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="input-field w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          >
            <option value="">Select a service</option>
            {myServices.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
        {applyMutation.isError && (
          <p className="text-sm text-[var(--color-danger)]">
            {(applyMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Apply failed.'}
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={applyMutation.isPending} disabled={coverLetter.length < 50}>
            Submit Application
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
