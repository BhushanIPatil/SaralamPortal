import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, CheckCircle, Sparkles, Briefcase, Package } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

const ONBOARDING_KEY = 'saralam_onboarding_done'

export function Onboarding() {
  const { user, accessToken } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [bio, setBio] = useState('')
  const [experience, setExperience] = useState('')

  const isSeeker = user?.role === 'seeker'
  const isProvider = user?.role === 'provider'

  if (!accessToken || !user) return null
  if (!isSeeker && !isProvider) return null

  const stored = localStorage.getItem(ONBOARDING_KEY)
  const done = stored === 'true' || stored === user.id
  if (done && !open) return null

  const showOnboarding = open || !stored
  if (!showOnboarding) return null

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, user.id)
    setOpen(false)
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
    else handleComplete()
  }

  const totalSteps = 3
  const isLastStep = step === totalSteps

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="onboarding-title" className="font-display text-xl font-semibold text-[var(--color-text-primary)]">
            Welcome to Saralam
          </h2>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  s <= step ? 'bg-[var(--color-primary-600)]' : 'bg-[var(--color-border)]'
                )}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isSeeker && (
            <>
              {step === 1 && (
                <motion.div
                  key="seeker-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 text-[var(--color-primary-600)]">
                    <MapPin className="size-8" />
                    <span className="font-display font-semibold">Add your primary address</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    We&apos;ll use this for nearby service recommendations.
                  </p>
                  <Input
                    label="Address (optional)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="City, area or full address"
                  />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="seeker-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 text-[var(--color-primary-600)]">
                    <Sparkles className="size-8" />
                    <span className="font-display font-semibold">Preferred categories</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    You can change this later in settings. For now we&apos;ll show you a bit of everything.
                  </p>
                  <p className="rounded-lg bg-[var(--color-surface-3)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
                    Select preferred categories in Settings → Notifications when you&apos;re ready.
                  </p>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div
                  key="seeker-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 text-[var(--color-success)]">
                    <CheckCircle className="size-8" />
                    <span className="font-display font-semibold">You&apos;re ready!</span>
                  </div>
                  <p className="text-[var(--color-text-secondary)]">
                    Post your first job or browse services to find the right provider.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <Link to="/seeker/post-job" className="flex-1" onClick={handleComplete}>
                      <Button size="lg" className="w-full">
                        Post a job
                      </Button>
                    </Link>
                    <Link to="/services" className="flex-1" onClick={handleComplete}>
                      <Button variant="secondary" size="lg" className="w-full">
                        Browse services
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {isProvider && (
            <>
              {step === 1 && (
                <motion.div
                  key="provider-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 text-[var(--color-primary-600)]">
                    <MapPin className="size-8" />
                    <span className="font-display font-semibold">Service address / city</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Where do you primarily offer your services?
                  </p>
                  <Input
                    label="City or area"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Delhi"
                  />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="provider-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 text-[var(--color-primary-600)]">
                    <Briefcase className="size-8" />
                    <span className="font-display font-semibold">Complete your profile</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    A short bio and experience help seekers trust you.
                  </p>
                  <Input
                    label="Bio (optional)"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="What do you do?"
                  />
                  <Input
                    label="Experience (optional)"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 5 years in event photography"
                  />
                </motion.div>
              )}
              {step === 3 && (
                <motion.div
                  key="provider-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 text-[var(--color-success)]">
                    <CheckCircle className="size-8" />
                    <span className="font-display font-semibold">Add your first service</span>
                  </div>
                  <p className="text-[var(--color-text-secondary)]">
                    List your service with portfolio, pricing, and availability to start getting job leads.
                  </p>
                  <Link to="/provider/services/new" onClick={handleComplete}>
                    <Button size="lg" className="w-full" leftIcon={<Package className="size-5" />}>
                      Add service listing
                    </Button>
                  </Link>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {!(isSeeker && step === 3) && !(isProvider && step === 3) && (
          <div className="mt-8 flex justify-end">
            <Button onClick={handleNext}>
              {isLastStep ? 'Finish' : 'Next'}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
