import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Briefcase, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/seeker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seeker/post-job', label: 'Post Job', icon: PlusCircle },
  { to: '/seeker/jobs', label: 'My Jobs', icon: Briefcase },
  { to: '/seeker/shortlist', label: 'Shortlist', icon: Heart },
]

export function SeekerBottomNav() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)] py-2 lg:hidden"
      aria-label="Seeker navigation"
    >
      {links.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to || (to !== '/seeker/jobs' && location.pathname.startsWith(to))
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors',
              active ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-text-muted)]'
            )}
          >
            <Icon className="size-6" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
