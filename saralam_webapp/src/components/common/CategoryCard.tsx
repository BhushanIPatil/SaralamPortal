import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import type { ServiceCategory } from '@/types/service'

export interface CategoryCardProps {
  category: ServiceCategory
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/categories/${category.slug}`}>
      <Card hoverLift className="h-full text-center">
        {category.icon_url && (
          <img src={category.icon_url} alt="" className="mx-auto mb-2 size-12 object-contain" />
        )}
        <h3 className="font-display font-semibold text-[var(--color-text-primary)]">
          {category.name}
        </h3>
        {category.description && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)] line-clamp-2">
            {category.description}
          </p>
        )}
      </Card>
    </Link>
  )
}
