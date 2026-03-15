import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ratingsApi } from '@/lib/api/endpoints/ratings'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { RatingStars } from '@/components/ui/RatingStars'

const RATING_TAGS = [
  'Professional',
  'On time',
  'Quality work',
  'Good communication',
  'Value for money',
] as const

export interface SubmitRatingModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  /** Job or application context for the rating */
  jobId?: string
  applicationId?: string
  providerId: string
  providerName?: string
}

const MIN_COMMENT_LENGTH = 20

export function SubmitRatingModal({
  open,
  onClose,
  onSuccess,
  jobId,
  applicationId,
  providerId,
  providerName,
}: SubmitRatingModalProps) {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const createRating = useMutation({
    mutationFn: (payload: {
      rating: number
      title?: string
      comment: string
      tags?: string[]
      provider_id: string
      job_id?: string
      application_id?: string
    }) => ratingsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] })
      onSuccess?.()
      onClose()
      setRating(5)
      setTitle('')
      setComment('')
      setSelectedTags([])
    },
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const canSubmit =
    rating >= 1 &&
    comment.trim().length >= MIN_COMMENT_LENGTH

  const handleSubmit = () => {
    if (!canSubmit) return
    createRating.mutate({
      rating,
      title: title.trim() || undefined,
      comment: comment.trim(),
      tags: selectedTags.length ? selectedTags : undefined,
      provider_id: providerId,
      job_id: jobId,
      application_id: applicationId,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Rate this service">
      {providerName && (
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          How was your experience with <strong>{providerName}</strong>?
        </p>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Rating</label>
          <div className="mt-2">
            <RatingStars
              value={rating}
              size="lg"
              interactive
              onChange={(v) => setRating(v)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">
            Review <span className="text-[var(--color-text-muted)]">(min {MIN_COMMENT_LENGTH} characters)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe your experience..."
            rows={4}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
          />
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {comment.trim().length} / {MIN_COMMENT_LENGTH}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Tags</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {RATING_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!canSubmit || createRating.isPending}
          loading={createRating.isPending}
          onClick={handleSubmit}
        >
          Submit rating
        </Button>
      </div>
    </Modal>
  )
}
