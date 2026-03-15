import { Link, useLocation } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  LayoutDashboard,
  Briefcase,
  Package,
  PlusCircle,
  Grid3X3,
  DollarSign,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const publicLinks = [
  { to: '/services', label: 'Services', icon: Package },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/categories', label: 'Categories', icon: Grid3X3 },
  { to: '/pricing', label: 'Pricing', icon: DollarSign },
  { to: '/about', label: 'About', icon: Info },
]

const seekerLinks = [
  { to: '/seeker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seeker/post-job', label: 'Post Job', icon: PlusCircle },
  { to: '/seeker/jobs', label: 'My Jobs', icon: Briefcase },
]
const providerLinks = [
  { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/provider/services', label: 'My Services', icon: Package },
  { to: '/provider/jobs', label: 'Browse Jobs', icon: Briefcase },
]

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useUIStore()
  const location = useLocation()
  const { user, accessToken } = useAuthStore()

  const roleLinks = user?.role === 'provider' ? providerLinks : seekerLinks

  return (
    <AnimatePresence>
      {mobileNavOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] lg:hidden"
          >
            <div className="flex h-14 items-center justify-between border-b border-[var(--color-border)] px-4">
              <span className="font-display font-semibold">Menu</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-5" />
              </Button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-auto p-3">
              {publicLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                    location.pathname === to || (to !== '/services' && location.pathname.startsWith(to))
                      ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
                      : 'text-[var(--color-text-secondary)]'
                  )}
                >
                  <Icon className="size-5" />
                  {label}
                </Link>
              ))}
              {accessToken && user && (
                <>
                  <div className="my-2 border-t border-[var(--color-border)] pt-2" />
                  {roleLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileNavOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                        location.pathname.startsWith(to)
                          ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
                          : 'text-[var(--color-text-secondary)]'
                      )}
                    >
                      <Icon className="size-5" />
                      {label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
            {!accessToken && (
              <div className="flex gap-2 border-t border-[var(--color-border)] p-3">
                <Link to="/login" onClick={() => setMobileNavOpen(false)} className="flex-1">
                  <Button variant="ghost" size="md" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileNavOpen(false)} className="flex-1">
                  <Button size="md" className="w-full">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
