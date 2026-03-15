import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { RatingStars } from '@/components/ui/RatingStars'

export interface ProviderCardProps {
  id: string
  name: string
  avatar?: string | null
  rating: number
  reviewCount: number
}

export function ProviderCard({ id, name, avatar, rating, reviewCount }: ProviderCardProps) {
  return (
    <Link to={`/users/${id}/public`}>
      <Card hoverLift className="flex items-center gap-3">
        <Avatar src={avatar} fallback={name} size="md" />
        <div>
          <h3 className="font-display font-semibold text-[var(--color-text-primary)]">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars value={rating} size="sm" />
            <span className="text-sm text-[var(--color-text-muted)]">({reviewCount})</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
