import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/lib/api/endpoints/search'
import { servicesApi } from '@/lib/api/endpoints/services'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { ServiceCard } from '@/components/common/ServiceCard'
import { JobCard } from '@/components/common/JobCard'
import { ProviderCard } from '@/components/common/ProviderCard'
import { cn } from '@/lib/utils'

function flattenCategories(cats: { id: string; name: string; children?: unknown[] }[]): { id: string; name: string }[] {
  const out: { id: string; name: string }[] = []
  for (const c of cats) {
    out.push({ id: c.id, name: c.name })
    if (Array.isArray(c.children) && c.children.length) {
      out.push(...flattenCategories(c.children as { id: string; name: string; children?: unknown[] }[]))
    }
  }
  return out
}

type TabType = 'services' | 'jobs' | 'providers'

const DEBOUNCE_MS = 300

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const type = (searchParams.get('type') as TabType) || 'jobs'
  const categoryId = searchParams.get('category') ?? ''
  const city = searchParams.get('city') ?? ''

  const [inputValue, setInputValue] = useState(q)
  const [debouncedQ, setDebouncedQ] = useState(q)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(inputValue), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [inputValue])

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (debouncedQ) params.set('q', debouncedQ)
    else params.delete('q')
    params.set('type', type)
    if (categoryId) params.set('category', categoryId)
    else params.delete('category')
    if (city) params.set('city', city)
    else params.delete('city')
    setSearchParams(params, { replace: true })
  }, [debouncedQ, type, categoryId, city])

  const { data: searchData, isLoading } = useQuery({
    queryKey: ['search', debouncedQ, type, categoryId, city],
    queryFn: async () => {
      const res = await searchApi.search({
        q: debouncedQ || undefined,
        type,
        category_id: categoryId || undefined,
        city: city || undefined,
        page: 1,
        page_size: 20,
      })
      const raw = (res.data as { data?: { data?: unknown[]; total?: number } })?.data
      return { items: raw?.data ?? [], total: raw?.total ?? 0 }
    },
  })

  const { data: categoriesRaw } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await servicesApi.getCategories()
      return (res.data as { data?: { id: string; name: string; children?: unknown[] }[] })?.data ?? []
    },
  })
  const categoriesFlat = useMemo(
    () => flattenCategories(Array.isArray(categoriesRaw) ? categoriesRaw : []),
    [categoriesRaw]
  )

  type ServiceItem = { id: string; title?: string; [k: string]: unknown }
  type JobItem = { id: string; [k: string]: unknown }
  type ProviderItem = { id: string; full_name?: string; profile_picture_url?: string; [k: string]: unknown }
  const items = (searchData?.items ?? []) as (ServiceItem | JobItem | ProviderItem)[]
  const total = searchData?.total ?? 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="section-title">Search</h1>
      <div className="mt-4 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search services, jobs, or providers..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="max-w-xl"
          />
        </div>
        <div className="flex gap-2">
          {(['services', 'jobs', 'providers'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams)
                next.set('type', t)
                setSearchParams(next)
              }}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium capitalize',
                type === t ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-8">
        <aside className="w-56 shrink-0 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Filters</h2>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)]">Category</label>
            <select
              value={categoryId}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams)
                if (e.target.value) next.set('category', e.target.value)
                else next.delete('category')
                setSearchParams(next)
              }}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {categoriesFlat.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)]">City</label>
            <Input
              value={city}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams)
                if (e.target.value) next.set('city', e.target.value)
                else next.delete('city')
                setSearchParams(next)
              }}
              placeholder="City"
              className="mt-1"
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : (
            <>
              <p className="text-sm text-[var(--color-text-muted)]">{total} results</p>
              <ul className="mt-4 space-y-4">
                {type === 'services' && (items as ServiceItem[]).map((s) => (
                  <li key={s.id}>
                    <ServiceCard service={s as unknown as Parameters<typeof ServiceCard>[0]['service']} />
                  </li>
                ))}
                {type === 'jobs' && (items as JobItem[]).map((j) => (
                  <li key={j.id}>
                    <JobCard job={j as unknown as Parameters<typeof JobCard>[0]['job']} />
                  </li>
                ))}
                {type === 'providers' && (items as ProviderItem[]).map((p) => (
                  <li key={p.id}>
                    <ProviderCard
                      id={String(p.id)}
                      name={String(p.full_name ?? 'Provider')}
                      avatar={p.profile_picture_url ? String(p.profile_picture_url) : null}
                      rating={0}
                      reviewCount={0}
                    />
                  </li>
                ))}
              </ul>
              {items.length === 0 && (
                <Card className="py-12 text-center text-[var(--color-text-muted)]">No results.</Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
