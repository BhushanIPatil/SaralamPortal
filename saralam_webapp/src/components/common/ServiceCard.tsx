import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { RatingStars } from '@/components/ui/RatingStars'
import { formatCurrency } from '@/utils/format'
import type { ServiceListItem } from '@/types/service'

export interface ServiceCardProps {
  service: ServiceListItem
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link to={`/services/${service.id}`}>
      <Card hoverLift className="h-full">
        <div className="flex items-start gap-3">
          {service.provider_avatar !== undefined || service.provider_name ? (
            <Avatar
              src={service.provider_avatar}
              fallback={service.provider_name ?? service.title}
              size="sm"
              className="shrink-0"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-semibold text-[var(--color-text-primary)] line-clamp-2">
                {service.title}
              </h3>
              {service.is_verified && <Badge variant="primary">Verified</Badge>}
            </div>
            {service.category_name && (
              <Badge variant="outline" className="mt-1.5">
                {service.category_name}
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <RatingStars value={service.avg_rating} size="sm" />
          <span className="text-sm text-[var(--color-text-muted)]">
            ({service.total_reviews})
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">
          {service.price_type === 'fixed' && service.base_price != null
            ? formatCurrency(service.base_price, service.currency)
            : service.price_type}
        </p>
        {service.city && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{service.city}</p>
        )}
      </Card>
    </Link>
  )
}
