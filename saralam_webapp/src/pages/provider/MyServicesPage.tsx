import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { servicesApi } from '@/lib/api/endpoints/services'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RatingStars } from '@/components/ui/RatingStars'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency } from '@/utils/format'
import type { ServiceListItem } from '@/types/service'

const MAX_SERVICES_FREE = 3

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  under_review: 'Under Review',
}

export function MyServicesPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['services', 'my'],
    queryFn: async () => {
      const res = await servicesApi.getMy()
      return (res.data as { data?: ServiceListItem[] })?.data ?? []
    },
  })

  const deleteService = useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services', 'my'] }),
  })

  const services = Array.isArray(servicesData) ? servicesData : []
  const atLimit = !user?.subscription_status || user.subscription_status !== 'active'
    ? services.length >= MAX_SERVICES_FREE
    : false

  const handleToggleActive = (id: string, current: string) => {
    const next = current === 'active' ? 'inactive' : 'active'
    servicesApi.update(id, { status: next }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['services', 'my'] })
    })
  }

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) deleteService.mutate(id)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title">My Services</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Manage your service listings.
          </p>
        </div>
        <Link to={atLimit ? '/subscription' : '/provider/services/new'}>
          <Button leftIcon={<span className="text-lg">+</span>}>
            Add New Service
          </Button>
        </Link>
      </div>
      {atLimit && (
        <p className="mt-4 rounded-lg border border-[var(--color-accent-500)] bg-[var(--color-accent-50)] px-4 py-2 text-sm text-[var(--color-accent-600)]">
          Free accounts can list up to {MAX_SERVICES_FREE} services. Upgrade to add more.
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : services.length === 0 ? (
        <Card className="mt-8 py-12 text-center">
          <p className="text-[var(--color-text-muted)]">You haven&apos;t added any services yet.</p>
          <Link to="/provider/services/new" className="mt-4 inline-block">
            <Button>Add your first service</Button>
          </Link>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <Card key={svc.id} className="flex flex-col">
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-[var(--color-surface-3)]" />
              <div className="mt-4 flex-1">
                <h3 className="font-display font-semibold text-[var(--color-text-primary)]">
                  {svc.title}
                </h3>
                {svc.category_name && (
                  <Badge variant="outline" className="mt-1">{svc.category_name}</Badge>
                )}
                <Badge
                  variant={svc.status === 'active' ? 'success' : svc.status === 'under_review' ? 'warning' : 'default'}
                  className="ml-2"
                >
                  {STATUS_LABEL[svc.status ?? 'active'] ?? svc.status}
                </Badge>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--color-text-muted)]">
                  <span>{svc.views_count ?? 0} views</span>
                  <span>{svc.applications_count ?? 0} applications</span>
                  <RatingStars value={svc.avg_rating} size="sm" />
                </div>
                <p className="mt-2 text-sm font-medium text-[var(--color-primary-600)]">
                  {svc.price_type === 'fixed' && svc.base_price != null
                    ? formatCurrency(svc.base_price, svc.currency)
                    : svc.price_type}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/provider/services/${svc.id}/edit`}>
                  <Button variant="secondary" size="sm">Edit</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(svc.id, svc.status ?? 'active')}
                >
                  {svc.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Link to={`/services/${svc.id}`} target="_blank">
                  <Button variant="ghost" size="sm">View Public</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--color-danger)]"
                  onClick={() => handleDelete(svc.id, svc.title)}
                  disabled={deleteService.isPending}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
