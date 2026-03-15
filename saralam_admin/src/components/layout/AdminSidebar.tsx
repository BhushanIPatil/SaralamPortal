import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  CreditCard,
  Tag,
  Star,
  BarChart3,
  Settings,
  Wrench,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/services', icon: Wrench, label: 'Services' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/applications', icon: FileText, label: 'Applications' },
  { to: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/offers', icon: Tag, label: 'Offers' },
  { to: '/ratings', icon: Star, label: 'Ratings' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Platform Settings' },
]

export function AdminSidebar() {
  const logout = useAuthStore((s) => s.logout)

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-[var(--color-admin-sidebar)]">
      <div className="flex h-14 items-center border-b border-white/10 px-4">
        <span className="font-semibold text-[var(--color-admin-sidebar-text)]">Saralam Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-[var(--color-admin-sidebar-active)] text-white'
                  : 'text-[var(--color-admin-sidebar-muted)] hover:bg-[var(--color-admin-sidebar-hover)] hover:text-[var(--color-admin-sidebar-text)]'
              )
            }
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-2">
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--color-admin-sidebar-muted)] hover:bg-[var(--color-admin-sidebar-hover)] hover:text-[var(--color-admin-sidebar-text)]"
        >
          <LogOut className="size-5" />
          Log out
        </button>
      </div>
    </aside>
  )
}
