import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { SearchBar } from '@/components/common/SearchBar'
import { FilterPanel } from '@/components/common/FilterPanel'
import { LocationPicker } from '@/components/common/LocationPicker'
import { ServiceCard } from '@/components/common/ServiceCard'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Pagination } from '@/components/ui/Pagination'
import { servicesApi } from '@/lib/api/endpoints/services'
import type { ServiceListItem } from '@/types/service'
import type { ServiceCategory } from '@/types/service'
import type { PaginatedResponse } from '@/types/api'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
]

const RATING_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '4', label: '4+ stars' },
  { value: '3', label: '3+ stars' },
]

export function BrowseServicesPage() {
  const { accessToken } = useAuthStore()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [city, setCity] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [ratingMin, setRatingMin] = useState('')
  const [sort, setSort] = useState('relevance')
  const [page, setPage] = useState(1)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await servicesApi.getCategories()
      return (res.data?.data as ServiceCategory[]) ?? []
    },
  })
  const categories = Array.isArray(categoriesData) ? categoriesData : []

  const params = useMemo(
    () => ({
      q: search || undefined,
      category_id: categoryId || undefined,
      city: city || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      min_rating: ratingMin ? Number(ratingMin) : undefined,
      sort: sort === 'relevance' ? undefined : sort,
      page,
      page_size: 12,
    }),
    [search, categoryId, city, minPrice, maxPrice, ratingMin, sort, page]
  )

  const {
    data: listData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['services', 'list', params],
    queryFn: async () => {
      const res = await servicesApi.list(params)
      return res.data as unknown as PaginatedResponse<ServiceListItem>
    },
  })

  const paginated = listData?.data != null && typeof listData.data === 'object' ? listData.data : null
  const items = Array.isArray(paginated?.data) ? paginated.data : []
  const totalPages = paginated?.total_pages ?? 1
  const total = paginated?.total ?? 0

  return (
    <div className="min-h-screen bg-[var(--color-surface-2)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="section-title">Browse Services</h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Find providers by category and location.
        </p>

        {!accessToken && (
          <div className="mt-4 rounded-lg border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-4 py-3 text-sm text-[var(--color-primary-800)]">
            Sign in to view contact info on service cards.
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 lg:flex-row">
          <SearchBar onSearch={setSearch} placeholder="Search services..." />
          <div className="w-full lg:w-64">
            <LocationPicker value={city} onChange={setCity} placeholder="City or area" />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-64">
            <FilterPanel className="sticky top-24">
              <h3 className="mb-4 font-display font-semibold text-[var(--color-text-primary)]">
                Filters
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value)
                      setPage(1)
                    }}
                    className="input-field w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Price range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value)
                        setPage(1)
                      }}
                      className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value)
                        setPage(1)
                      }}
                      className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Minimum rating
                  </label>
                  <select
                    value={ratingMin}
                    onChange={(e) => {
                      setRatingMin(e.target.value)
                      setPage(1)
                    }}
                    className="input-field w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                  >
                    {RATING_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Sort by
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value)
                      setPage(1)
                    }}
                    className="input-field w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setCategoryId('')
                    setCity('')
                    setMinPrice('')
                    setMaxPrice('')
                    setRatingMin('')
                    setSort('relevance')
                    setPage(1)
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </FilterPanel>
          </aside>

          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <p className="py-12 text-[var(--color-danger)]">Failed to load services.</p>
            ) : (
              <>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {total} service{total !== 1 ? 's' : ''} found
                </p>
                <div
                  className={cn(
                    'mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3',
                    isFetching && 'opacity-70'
                  )}
                >
                  {items.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
                {items.length === 0 && (
                  <p className="py-12 text-center text-[var(--color-text-muted)]">
                    No services match your filters. Try adjusting or clear filters.
                  </p>
                )}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
