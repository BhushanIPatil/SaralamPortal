import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut, User, Settings, CreditCard, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { WeatherWidget } from '@/components/common/WeatherWidget'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/search', label: 'Search' },
  { to: '/services', label: 'Services' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/categories', label: 'Categories' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
]

export function Header() {
  const { user, accessToken, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const { toggleMobileNav } = useUIStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/')
  }

  const dashboardPath = user?.role === 'provider' ? '/provider/dashboard' : '/seeker/dashboard'

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={toggleMobileNav}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <Link to="/" className="font-display text-xl font-bold gradient-text">
            Saralam
          </Link>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)]"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {/* Weather widget - hide on small mobile */}
          <div className="hidden items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1.5 sm:flex">
            <WeatherWidget />
          </div>
          {accessToken && user ? (
            <>
              <Link
                to="/notifications"
                className="relative rounded-full p-2 hover:bg-[var(--color-surface-3)]"
                aria-label="Notifications"
              >
                <Bell className="size-5 text-[var(--color-text-secondary)]" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-medium text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full ring-offset-2 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <Avatar src={user.avatar} fallback={user.name} size="sm" />
                </button>
                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-lg)]"
                    role="menu"
                  >
                    <div className="border-b border-[var(--color-border)] px-4 py-2">
                      <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-[var(--color-text-muted)]">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
                      role="menuitem"
                    >
                      <User className="size-4" />
                      My Profile
                    </Link>
                    <Link
                      to={dashboardPath}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
                      role="menuitem"
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
                      role="menuitem"
                    >
                      <Settings className="size-4" />
                      Settings
                    </Link>
                    <Link
                      to="/subscription"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
                      role="menuitem"
                    >
                      <CreditCard className="size-4" />
                      Subscription
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={cn(
                        'flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-2)]'
                      )}
                      role="menuitem"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
