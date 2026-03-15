import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { platformApi } from '@/lib/api/endpoints/platform'
import { servicesApi } from '@/lib/api/endpoints/services'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { appConfig } from '@/config/env'
import type { PlatformStats } from '@/types/platform'
import type { ServiceCategory } from '@/types/service'

export function AboutPage() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['platform', 'stats'],
    queryFn: async () => {
      const res = await platformApi.getStats()
      return res.data?.data as PlatformStats | undefined
    },
  })

  const { data: categoriesList } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await servicesApi.getCategories()
      return (res.data?.data as ServiceCategory[]) ?? []
    },
  })

  const stats = statsData ?? {}
  const appLaunched = stats.app_launched_date ?? appConfig.appLaunchedDate
  const daysServing = Math.max(
    0,
    Math.floor((Date.now() - new Date(appLaunched).getTime()) / (24 * 60 * 60 * 1000))
  )
  const citiesCount = stats.cities_count ?? 0
  const categoriesCount = Array.isArray(categoriesList) ? categoriesList.length : 0
  const transactionsCount = stats.connections_count ?? 0

  return (
    <div className="min-h-screen bg-[var(--color-surface-2)]">
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="section-title">About Saralam</h1>
          <p className="mt-6 text-lg text-[var(--color-text-secondary)]">
            We connect people who need services with skilled providers — photographers, anchors,
            designers, transport and more. No middlemen, direct connection, so you get the right
            fit for every occasion.
          </p>
          {statsLoading ? (
            <div className="mt-8 flex justify-center">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="mt-8 font-display text-xl font-semibold text-[var(--color-primary-600)]">
              Serving India for {daysServing.toLocaleString()} days
            </p>
          )}
        </div>
      </section>

      <section ref={ref} className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="section-title text-center">Our reach</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Card className="text-center">
              <p className="font-display text-3xl font-bold text-[var(--color-primary-600)]">
                {inView ? citiesCount.toLocaleString() : '0'}
              </p>
              <p className="mt-1 text-[var(--color-text-secondary)]">Cities covered</p>
            </Card>
            <Card className="text-center">
              <p className="font-display text-3xl font-bold text-[var(--color-primary-600)]">
                {inView ? categoriesCount : '0'}
              </p>
              <p className="mt-1 text-[var(--color-text-secondary)]">Service categories</p>
            </Card>
            <Card className="text-center">
              <p className="font-display text-3xl font-bold text-[var(--color-primary-600)]">
                {inView ? transactionsCount.toLocaleString() : '0'}
              </p>
              <p className="mt-1 text-[var(--color-text-secondary)]">Successful connections</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="section-title text-center">Vision & values</h2>
          <div className="mt-10 space-y-6">
            <Card>
              <h3 className="font-display font-semibold text-[var(--color-text-primary)]">
                Trust & transparency
              </h3>
              <p className="mt-2 text-[var(--color-text-secondary)]">
                Verified providers, clear pricing, and direct communication so you know exactly who
                you&apos;re working with.
              </p>
            </Card>
            <Card>
              <h3 className="font-display font-semibold text-[var(--color-text-primary)]">
                Empowering India&apos;s service economy
              </h3>
              <p className="mt-2 text-[var(--color-text-secondary)]">
                From events to marketing to transport, we help seekers find the right talent and
                help providers grow their business.
              </p>
            </Card>
            <Card>
              <h3 className="font-display font-semibold text-[var(--color-text-primary)]">
                No middlemen
              </h3>
              <p className="mt-2 text-[var(--color-text-secondary)]">
                Connect directly with providers. Post a job or browse services, compare options,
                and collaborate without unnecessary layers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="section-title text-center">Team</h2>
          <p className="mt-4 text-center text-[var(--color-text-secondary)]">
            We&apos;re a small team building the future of service discovery in India.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-[var(--color-surface-3)]" />
                <h3 className="mt-4 font-display font-semibold text-[var(--color-text-primary)]">
                  Team member {i}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">Role placeholder</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
