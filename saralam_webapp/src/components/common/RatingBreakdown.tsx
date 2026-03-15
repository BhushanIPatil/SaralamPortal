import { useQuery } from '@tanstack/react-query'
import { ratingsApi } from '@/lib/api/endpoints/ratings'
import { RatingStars } from '@/components/ui/RatingStars'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/format'
import { cn } from '@/lib/utils'

export interface ReviewItem {
  id: string
  rating: number
  title?: string
  comment?: string
  seeker_name?: string
  created_at: string
  response_text?: string
  tags?: string[]
}

export interface RatingBreakdownProps {
  providerId: string
  className?: string
  /** Max reviews to show (default 10) */
  limit?: number
}

const STAR_LABELS = ['5', '4', '3', '2', '1']

export function RatingBreakdown({ providerId, className, limit = 10 }: RatingBreakdownProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['ratings', 'provider', providerId],
    queryFn: async () => {
      const res = await ratingsApi.getByProvider(providerId, { limit: 50 })
      const list = (res.data as { data?: { items?: ReviewItem[]; total?: number; avg_rating?: number; distribution?: Record<string, number>; tag_counts?: Record<string, number> } })?.data
      return list ?? { items: [], total: 0, avg_rating: 0, distribution: {}, tag_counts: {} }
    },
  })

  if (isLoading) return <Spinner />

  const items = (data?.items ?? []) as ReviewItem[]
  const avgRating = (data?.avg_rating as number) ?? 0
  const total = (data?.total as number) ?? items.length
  const distribution = (data?.distribution as Record<string, number>) ?? {}
  const tagCounts = (data?.tag_counts as Record<string, number>) ?? {}

  // Build distribution from items if not provided
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  items.forEach((r) => {
    const star = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5
    if (star >= 1 && star <= 5) dist[star] = (dist[star] ?? 0) + 1
  })
  const totalReviews = items.length || 1
  const displayDist: Record<string, number> = Object.keys(distribution).length ? distribution : Object.fromEntries(Object.entries(dist))

  const tagEntries = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <div className="flex flex-wrap items-center gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-[var(--color-text-primary)]">{avgRating.toFixed(1)}</p>
            <RatingStars value={avgRating} size="lg" />
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{total} reviews</p>
          </div>
          <div className="flex-1 min-w-[200px]">
            {STAR_LABELS.map((star) => {
              const count = displayDist[star] ?? 0
              const pct = totalReviews ? (count / totalReviews) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-4 text-sm text-[var(--color-text-muted)]">{star}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-3)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent-500)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm text-[var(--color-text-muted)]">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {tagEntries.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Tags</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {tagEntries.map(([tag, count]) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--color-surface-2)] px-3 py-1 text-sm text-[var(--color-text-primary)]"
              >
                {tag} <span className="text-[var(--color-text-muted)]">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Reviews</h3>
        <ul className="mt-4 space-y-4">
          {items.slice(0, limit).map((r) => (
            <li key={r.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-center gap-2">
                <RatingStars value={r.rating} size="sm" />
                <span className="text-sm text-[var(--color-text-muted)]">
                  {r.seeker_name ?? 'User'} · {formatDate(r.created_at)}
                </span>
              </div>
              {r.title && <p className="mt-1 font-medium text-[var(--color-text-primary)]">{r.title}</p>}
              {r.comment && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{r.comment}</p>}
              {r.response_text && (
                <div className="mt-2 rounded bg-[var(--color-surface-2)] p-2 text-sm italic text-[var(--color-text-secondary)]">
                  Response: {r.response_text}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
