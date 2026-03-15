import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { MapPin, Heart, Send, Briefcase } from 'lucide-react'
import { servicesApi } from '@/lib/api/endpoints/services'
import { ratingsApi } from '@/lib/api/endpoints/ratings'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { RatingStars } from '@/components/ui/RatingStars'
import { Spinner } from '@/components/ui/Spinner'
import { ServiceCard } from '@/components/common/ServiceCard'
import { formatCurrency } from '@/utils/format'
import { formatRelative } from '@/utils/format'
import type { ServiceDetail } from '@/types/service'
import type { Review } from '@/types/review'
import type { ServiceListItem } from '@/types/service'
import { cn } from '@/lib/utils'

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { accessToken } = useAuthStore()
  const [shortlisted, setShortlisted] = useState(false)

  const {
    data: serviceData,
    isLoading: serviceLoading,
    error: serviceError,
  } = useQuery({
    queryKey: ['services', id],
    queryFn: async () => {
      const res = await servicesApi.getById(id!)
      return res.data?.data as ServiceDetail | undefined
    },
    enabled: !!id,
  })

  const service = serviceData

  const { data: reviewsData } = useQuery({
    queryKey: ['ratings', 'provider', service?.provider_id],
    queryFn: async () => {
      const res = await ratingsApi.getByProvider(service!.provider_id)
      return (res.data?.data as Review[]) ?? []
    },
    enabled: !!service?.provider_id,
  })

  const { data: similarData } = useQuery({
    queryKey: ['services', 'similar', service?.category_id, id],
    queryFn: async () => {
      const res = await servicesApi.list({
        category_id: service!.category_id,
        page_size: 4,
      })
      const list = (res.data as { data?: ServiceListItem[] })?.data ?? []
      return list.filter((s) => s.id !== id)
    },
    enabled: !!service?.category_id && !!id,
  })

  const reviews = Array.isArray(reviewsData) ? reviewsData : []
  const similar = (similarData ?? []).slice(0, 4)
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : service?.avg_rating ?? 0
  const city = service?.city ?? service?.location?.city ?? ''

  const handleContact = () => {
    if (!accessToken) {
      navigate('/login?redirect=' + encodeURIComponent('/services/' + id))
      return
    }
    // Placeholder: could open modal or navigate to messages
    window.location.href = `mailto:?subject=Enquiry for ${encodeURIComponent(service?.title ?? '')}`
  }

  const handleShortlist = () => {
    if (!accessToken) {
      navigate('/login?redirect=' + encodeURIComponent('/services/' + id))
      return
    }
    setShortlisted((s) => !s)
    // TODO: call shortlist API
  }

  if (serviceLoading || !id) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (serviceError || !service) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-[var(--color-danger)]">Service not found.</p>
        <Link to="/services" className="mt-4 inline-block">
          <Button variant="secondary">Back to services</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-2)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={service.provider_avatar}
                    fallback={service.provider_name ?? 'Provider'}
                    size="lg"
                  />
                  <div>
                    <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
                      {service.title}
                    </h1>
                    <p className="text-[var(--color-text-secondary)]">
                      {service.provider_name ?? 'Provider'}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {service.is_verified && (
                        <Badge variant="primary">Verified</Badge>
                      )}
                      {service.category_name && (
                        <Badge variant="outline">{service.category_name}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RatingStars value={avgRating} size="md" />
                  <span className="text-sm text-[var(--color-text-muted)]">
                    ({reviews.length || service.total_reviews} reviews)
                  </span>
                </div>
              </div>
            </Card>

            {service.description && (
              <Card>
                <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
                  About this service
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-[var(--color-text-secondary)]">
                  {service.description}
                </p>
              </Card>
            )}

            {(service.portfolio_images?.length ?? 0) > 0 && (
              <Card>
                <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
                  Portfolio
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {service.portfolio_images!.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-video overflow-hidden rounded-lg bg-[var(--color-surface-3)]"
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
                Reviews
              </h2>
              <div className="mt-4 flex items-center gap-4">
                <p className="font-display text-3xl font-bold text-[var(--color-text-primary)]">
                  {avgRating.toFixed(1)}
                </p>
                <div>
                  <RatingStars value={avgRating} size="md" />
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {reviews.length || service.total_reviews} reviews
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-4">
                {reviews.slice(0, 5).map((r) => (
                  <li
                    key={r.id}
                    className="border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <RatingStars value={r.rating} size="sm" />
                      <span className="text-sm text-[var(--color-text-muted)]">
                        {r.seeker_name ?? 'User'} · {formatRelative(r.created_at)}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {r.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              {reviews.length === 0 && (
                <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                  No reviews yet.
                </p>
              )}
            </Card>

            {similar.length > 0 && (
              <div>
                <h2 className="section-title">Similar services</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {similar.map((s) => (
                    <ServiceCard key={s.id} service={s} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 space-y-6">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Price</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-primary-600)]">
                  {service.price_type === 'fixed' && service.base_price != null
                    ? formatCurrency(service.base_price, service.currency)
                    : service.price_type}
                </p>
              </div>
              {service.availability && (
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Availability</p>
                  <p className="mt-1 text-[var(--color-text-secondary)]">
                    {service.availability}
                  </p>
                </div>
              )}
              {city && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">{city}</span>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleContact}
                  leftIcon={<Send className="size-5" />}
                >
                  {accessToken ? 'Contact Provider' : 'Sign in to contact'}
                </Button>
                <Link to={accessToken ? '/seeker/post-job' : '/login'} className="block">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    leftIcon={<Briefcase className="size-5" />}
                  >
                    Post a Job
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn('w-full', shortlisted && 'text-[var(--color-danger)]')}
                  leftIcon={<Heart className={cn('size-5', shortlisted && 'fill-current')} />}
                  onClick={handleShortlist}
                >
                  {shortlisted ? 'Shortlisted' : 'Shortlist'}
                </Button>
              </div>
              {!accessToken && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  Sign in to view contact details and shortlist services.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
