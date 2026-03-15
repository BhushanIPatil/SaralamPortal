import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { SubscriptionBadge } from '@/components/common/SubscriptionBadge'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  Heart,
  Settings,
  Package,
  PlusCircle,
  ClipboardList,
  Bell,
  CreditCard,
  User,
  DollarSign,
} from 'lucide-react'

const seekerLinks = [
  { to: '/seeker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seeker/post-job', label: 'Post a Job', icon: PlusCircle },
  { to: '/seeker/jobs', label: 'My Jobs', icon: Briefcase },
  { to: '/seeker/shortlist', label: 'Shortlisted Providers', icon: Heart },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/subscription', label: 'Subscription', icon: CreditCard },
  { to: '/profile', label: 'Profile', icon: User },
]

const providerLinks = [
  { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/provider/services', label: 'My Services', icon: Package },
  { to: '/provider/jobs', label: 'Browse Jobs', icon: Briefcase },
  { to: '/provider/applications', label: 'My Applications', icon: ClipboardList },
  { to: '/provider/earnings', label: 'Earnings Overview', icon: DollarSign },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/subscription', label: 'Subscription', icon: CreditCard },
  { to: '/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const isSeeker = user?.role === 'seeker'
  const links = isSeeker ? seekerLinks : providerLinks

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:flex">
      {user && (
        <div className="border-b border-[var(--color-border)] p-4">
          <Link to="/profile" className="flex items-center gap-3 rounded-lg p-2 hover:bg-[var(--color-surface-2)]">
            <Avatar src={user.avatar} fallback={user.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {user.name}
              </p>
              <SubscriptionBadge status={user.subscription_status} />
            </div>
          </Link>
        </div>
      )}
      <nav className="flex flex-col gap-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              location.pathname === to || (to !== '/seeker/jobs' && to !== '/provider/jobs' && location.pathname.startsWith(to))
                ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
            )}
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </Link>
        ))}
        <div className="my-2 border-t border-[var(--color-border)]" />
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            location.pathname === '/settings'
              ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
          )}
        >
          <Settings className="size-5 shrink-0" />
          Settings
        </Link>
      </nav>
    </aside>
  )
}
