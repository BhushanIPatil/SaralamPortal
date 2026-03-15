import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect } from 'react'
import {
  Bell,
  Camera,
  Mic2,
  Palette,
  Truck,
  Plane,
  Sparkles,
  FileText,
  Megaphone,
  Video,
  Package,
} from 'lucide-react'
import { platformApi } from '@/lib/api/endpoints/platform'
import { servicesApi } from '@/lib/api/endpoints/services'
import { subscriptionsApi } from '@/lib/api/endpoints/subscriptions'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ServiceCard } from '@/components/common/ServiceCard'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'
import type { PlatformStats } from '@/types/platform'
import type { ServiceCategory } from '@/types/service'
import type { ServiceListItem } from '@/types/service'
import type { SubscriptionPlan } from '@/types/subscription'
import type { Review } from '@/types/review'
import { formatCurrency } from '@/utils/format'
import { appConfig } from '@/config/env'

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

const floatingCategories = [
  'photography',
  'anchoring',
  'graphic-design',
  'transport',
  'events',
  'marketing',
]

function useCountUp(end: number, duration = 2000, inView: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, inView])
  return count
}

function AnimatedCounter({ value, inView }: { value: number; inView: boolean }) {
  const count = useCountUp(value, 1800, inView)
  return <span>{count.toLocaleString()}</span>
}

export function LandingPage() {
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' })
  const [howItWorksMode, setHowItWorksMode] = useState<'seeker' | 'provider'>('seeker')
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['platform', 'stats'],
    queryFn: async () => {
      const res = await platformApi.getStats()
      return res.data?.data as PlatformStats | undefined
    },
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await servicesApi.getCategories()
      const list = (res.data?.data as ServiceCategory[]) ?? []
      return list.filter((c) => c.is_featured).slice(0, 8)
    },
  })

  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['services', 'featured'],
    queryFn: async () => {
      const res = await servicesApi.list({ featured: true, page_size: 8 })
      const raw = (res.data as { data?: { items?: ServiceListItem[] } })?.data
      return Array.isArray(raw?.items) ? raw.items : []
    },
  })

  const { data: plansData } = useQuery({
    queryKey: ['subscriptions', 'plans'],
    queryFn: async () => {
      const res = await subscriptionsApi.getPlans()
      return (res.data?.data as SubscriptionPlan[]) ?? []
    },
  })

  const stats = statsRes ?? {}
  const servicesCount = stats.services_count ?? 0
  const citiesCount = stats.cities_count ?? 0
  const connectionsCount = stats.connections_count ?? 0
  const appLaunched = stats.app_launched_date ?? appConfig.appLaunchedDate
  const daysServing = Math.max(
    0,
    Math.floor((Date.now() - new Date(appLaunched).getTime()) / (24 * 60 * 60 * 1000))
  )

  const plans = Array.isArray(plansData) ? plansData : []
  const freePlan = plans.find((p) => p.slug === 'free' || p.plan_type === 'free')
  const proPlan = plans.find((p) => p.slug === 'professional' || p.plan_type === 'professional')
  const premiumPlan = plans.find((p) => p.slug === 'premium' || p.plan_type === 'premium')

  const testimonials: (Review & { excerpt?: string })[] = [
    {
      id: '1',
      provider_id: 'p1',
      provider_name: 'Rahul S.',
      service_title: 'Wedding Photography',
      rating: 5,
      comment: 'Saralam made it so easy to find the right photographer. No middlemen, direct contact.',
      created_at: new Date().toISOString(),
      excerpt: 'No middlemen, direct contact. Highly recommend!',
    },
    {
      id: '2',
      provider_id: 'p2',
      provider_name: 'Priya M.',
      service_title: 'Event Anchoring',
      rating: 5,
      comment: 'As a provider I get genuine job leads. The platform is professional and easy to use.',
      created_at: new Date().toISOString(),
      excerpt: 'Genuine job leads. Professional and easy to use.',
    },
    {
      id: '3',
      provider_id: 'p3',
      provider_name: 'Vikram K.',
      service_title: 'Transport Services',
      rating: 5,
      comment: 'Found multiple transport options for our corporate event in one place. Great experience.',
      created_at: new Date().toISOString(),
      excerpt: 'Multiple options in one place. Great experience.',
    },
  ]

  useEffect(() => {
    const t = setInterval(
      () => setTestimonialIndex((i) => (i + 1) % testimonials.length),
      5000
    )
    return () => clearInterval(t)
  }, [testimonials.length])

  return (
    <div className="min-h-screen bg-[var(--color-surface-2)]">
      {/* 1. Hero */}
      <section className="relative overflow-hidden px-4 pt-12 pb-20 sm:px-6 sm:pt-16 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-50)] via-[var(--color-surface)] to-[var(--color-accent-50)] opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%231a56db\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60" />
        <div className="relative mx-auto max-w-5xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl font-extrabold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl"
          >
            Find the Perfect{' '}
            <span className="gradient-text">Service</span> for Any{' '}
            <span className="gradient-text">Occasion</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-text-secondary)]"
          >
            Connect with photographers, anchors, designers, transport services and more — no
            middlemen, direct connection.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link to="/services">
              <Button size="lg" leftIcon={<Sparkles className="size-5" />}>
                Explore Services
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="lg">
                I&apos;m a Service Provider
              </Button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-14 flex flex-wrap justify-center gap-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-6 py-5 shadow-[var(--shadow-card)] backdrop-blur sm:gap-12"
          >
            {statsLoading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-[var(--color-primary-600)] sm:text-3xl">
                    {servicesCount.toLocaleString()}+
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Services Listed</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-[var(--color-primary-600)] sm:text-3xl">
                    {citiesCount.toLocaleString()}+
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Cities</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-[var(--color-primary-600)] sm:text-3xl">
                    {connectionsCount.toLocaleString()}+
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Successful Connections</p>
                </div>
              </>
            )}
          </motion.div>
        </div>
        {/* Floating icons */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {floatingCategories.map((slug, i) => {
            const Icon = categoryIcons[slug] ?? categoryIcons.default
            return (
              <motion.div
                key={slug}
                className="absolute rounded-full bg-[var(--color-surface)]/80 p-2 shadow-[var(--shadow-sm)]"
                style={{
                  left: `${15 + (i * 14) % 70}%`,
                  top: `${20 + (i * 11) % 60}%`,
                }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon className="size-5 text-[var(--color-primary-600)]" />
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* 2. Category Grid */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="section-title text-center">What service are you looking for?</h2>
          {categoriesLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {(categoriesData ?? []).map((cat) => {
                const Icon = categoryIcons[cat.slug] ?? categoryIcons.default
                return (
                  <Link key={cat.id} to={`/categories/${cat.slug}`}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5 transition-shadow hover:shadow-[var(--shadow-md)] hover:ring-2 hover:ring-[var(--color-primary-200)]"
                    >
                      <motion.span
                        whileHover={{ scale: 1.15 }}
                        className="inline-flex rounded-lg bg-[var(--color-primary-100)] p-2.5 text-[var(--color-primary-600)]"
                      >
                        <Icon className="size-6" />
                      </motion.span>
                      <p className="mt-3 font-display font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-600)]">
                        {cat.name}
                      </p>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link to="/categories">
              <Button variant="secondary">View All Categories</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="section-title text-center">How it works</h2>
          <div className="mt-8 flex justify-center gap-2 rounded-full bg-[var(--color-surface)] p-1 shadow-[var(--shadow-sm)]">
            <button
              type="button"
              onClick={() => setHowItWorksMode('seeker')}
              className={cn(
                'rounded-full px-6 py-2 text-sm font-medium transition-colors',
                howItWorksMode === 'seeker'
                  ? 'bg-[var(--color-primary-600)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
              )}
            >
              I need a service
            </button>
            <button
              type="button"
              onClick={() => setHowItWorksMode('provider')}
              className={cn(
                'rounded-full px-6 py-2 text-sm font-medium transition-colors',
                howItWorksMode === 'provider'
                  ? 'bg-[var(--color-primary-600)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
              )}
            >
              I provide services
            </button>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {howItWorksMode === 'seeker' ? (
              <>
                <Card className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)]">
                    <FileText className="size-6" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold">Post a Job / Browse Services</h3>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Describe what you need or explore our service catalog.
                  </p>
                </Card>
                <Card className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)]">
                    <Megaphone className="size-6" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold">Get Applications</h3>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Providers apply or you reach out directly. Compare and shortlist.
                  </p>
                </Card>
                <Card className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)]">
                    <Sparkles className="size-6" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold">Connect & Collaborate</h3>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Finalize details, pay securely, and get the job done.
                  </p>
                </Card>
              </>
            ) : (
              <>
                <Card className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-50)] text-[var(--color-accent-600)]">
                    <Package className="size-6" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold">Onboard Your Service</h3>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    List your services with portfolio, pricing, and availability.
                  </p>
                </Card>
                <Card className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-50)] text-[var(--color-accent-600)]">
                    <Bell className="size-6" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold">Get Job Alerts</h3>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Receive relevant job posts and browse opportunities.
                  </p>
                </Card>
                <Card className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-50)] text-[var(--color-accent-600)]">
                    <Truck className="size-6" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold">Apply & Grow</h3>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Apply to jobs, win clients, and build your reputation.
                  </p>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 4. Featured Services */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-title">Featured Services</h2>
            <Link to="/services" className="hidden shrink-0 sm:block">
              <Button variant="secondary" size="sm">
                Browse All Services
              </Button>
            </Link>
          </div>
          {featuredLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="mt-10 overflow-x-auto pb-4 md:overflow-visible">
              <div className="flex gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
                {(Array.isArray(featuredData) ? featuredData : []).slice(0, 4).map((service) => (
                  <div key={service.id} className="min-w-[280px] md:min-w-0">
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 text-center sm:hidden">
            <Link to="/services">
              <Button variant="secondary">Browse All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Platform Stats Counter */}
      <section
        ref={statsRef}
        className="border-t border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)] px-4 py-16 text-white sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="text-center">
            <p className="font-display text-3xl font-bold sm:text-4xl">
              <AnimatedCounter value={daysServing} inView={statsInView} />
            </p>
            <p className="mt-1 text-sm opacity-90">Days serving India</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl font-bold sm:text-4xl">
              <AnimatedCounter value={stats.providers_count ?? 0} inView={statsInView} />
            </p>
            <p className="mt-1 text-sm opacity-90">Providers</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl font-bold sm:text-4xl">
              <AnimatedCounter value={stats.seekers_count ?? 0} inView={statsInView} />
            </p>
            <p className="mt-1 text-sm opacity-90">Seekers</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl font-bold sm:text-4xl">
              <AnimatedCounter value={stats.jobs_count ?? 0} inView={statsInView} />
            </p>
            <p className="mt-1 text-sm opacity-90">Jobs posted</p>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="section-title text-center">What people say</h2>
          <div className="relative mt-10 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: testimonialIndex === i ? 1 : 0,
                  display: testimonialIndex === i ? 'block' : 'none',
                }}
                className="text-center"
              >
                <p className="text-lg text-[var(--color-text-primary)]">
                  &ldquo;{(t.excerpt ?? t.comment) ?? ''}&rdquo;
                </p>
                <p className="mt-4 font-display font-semibold text-[var(--color-primary-600)]">
                  {t.provider_name}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">{t.service_title}</p>
                <div className="mt-2 flex justify-center gap-0.5 text-[var(--color-accent-500)]">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className={j < (t.rating ?? 0) ? 'fill-current' : ''}>
                      ★
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
            <div className="mt-6 flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTestimonialIndex(i)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    testimonialIndex === i
                      ? 'bg-[var(--color-primary-600)]'
                      : 'bg-[var(--color-border)] hover:bg-[var(--color-border-strong)]'
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Pricing Preview */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="section-title text-center">Simple pricing</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[freePlan, proPlan, premiumPlan].map((plan, i) => (
              <Card
                key={plan?.id ?? i}
                className={cn(
                  'text-center',
                  i === 1 && 'ring-2 ring-[var(--color-primary-500)]'
                )}
              >
                <h3 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
                  {plan?.name ?? (i === 0 ? 'Free' : i === 1 ? 'Professional' : 'Premium')}
                </h3>
                <p className="mt-2 text-2xl font-bold text-[var(--color-primary-600)]">
                  {plan ? formatCurrency(plan.price, plan.currency) : (i === 0 ? '₹0' : '—')}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {plan?.duration_type === 'yearly' ? '/year' : '/month'}
                </p>
                <Link to="/pricing" className="mt-4 block">
                  <Button variant={i === 1 ? 'primary' : 'secondary'} size="sm" className="w-full">
                    {i === 0 ? 'Get started' : 'View details'}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/pricing">
              <Button variant="secondary">View Full Pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. CTA Banner */}
      <section className="border-t border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Join as a seeker to find services or as a provider to grow your business.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="border-2 border-white bg-white text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)]"
              >
                Register as Seeker
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="secondary"
                size="lg"
                className="border-2 border-white bg-transparent text-white hover:bg-white/20"
              >
                Register as Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
