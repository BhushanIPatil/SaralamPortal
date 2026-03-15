import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Camera,
  Mic2,
  Palette,
  Truck,
  Plane,
  Sparkles,
  FileText,
  Megaphone,
  Video,
} from 'lucide-react'
import { servicesApi } from '@/lib/api/endpoints/services'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { ServiceCategory } from '@/types/service'

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  events: Sparkles,
  photography: Camera,
  marketing: Megaphone,
  'content-creation': Video,
  transport: Truck,
  'travel-tours': Plane,
  anchoring: Mic2,
  'graphic-design': Palette,
  'reel-stars': Video,
  default: FileText,
}

export function CategoriesListPage() {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const res = await servicesApi.getCategories()
      return (res.data?.data as ServiceCategory[]) ?? []
    },
  })

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-[var(--color-danger)]">Failed to load categories.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="section-title">Browse by category</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Find the right service for your occasion.
      </p>
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {(categories ?? []).map((cat) => {
            const Icon = categoryIcons[cat.slug] ?? categoryIcons.default
            return (
              <Link key={cat.id} to={`/categories/${cat.slug}`}>
                <motion.div whileHover={{ y: -4 }}>
                  <Card hoverLift className="h-full">
                    <span className="inline-flex rounded-lg bg-[var(--color-primary-100)] p-2.5 text-[var(--color-primary-600)]">
                      <Icon className="size-6" />
                    </span>
                    <p className="mt-3 font-display font-semibold text-[var(--color-text-primary)]">
                      {cat.name}
                    </p>
                    {cat.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-muted)]">
                        {cat.description}
                      </p>
                    )}
                  </Card>
                </motion.div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
