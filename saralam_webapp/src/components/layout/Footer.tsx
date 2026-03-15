import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { WeatherWidget } from '@/components/common/WeatherWidget'
import { cn } from '@/lib/utils'

const companyLinks = [
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
]
const serviceLinks = [
  { to: '/services', label: 'Browse Services' },
  { to: '/jobs', label: 'Browse Jobs' },
  { to: '/pricing', label: 'Pricing' },
]
const quickLinks = [
  { to: '/provider/dashboard', label: 'For Providers' },
  { to: '/seeker/dashboard', label: 'For Seekers' },
  { to: '/help', label: 'Help Center' },
]

const socialLinks = [
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Weather on mobile only */}
        <div className="mb-6 flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-2 md:hidden">
          <WeatherWidget />
        </div>
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/" className="font-display text-lg font-bold gradient-text">
              Saralam
            </Link>
            <p className="mt-2 max-w-xs text-sm text-[var(--color-text-secondary)]">
              The service marketplace for events, marketing, transport & lifestyle.
            </p>
            <div className="mt-4 flex gap-3">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'rounded-full p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-primary-600)]'
                  )}
                  aria-label={label}
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Company</h4>
              <ul className="mt-3 space-y-2">
                {companyLinks.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Services</h4>
              <ul className="mt-3 space-y-2">
                {serviceLinks.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Quick Links</h4>
              <ul className="mt-3 space-y-2">
                {quickLinks.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-[var(--color-border)] pt-8 text-center text-sm text-[var(--color-text-muted)]">
          © {year} Saralam. All rights reserved. | Empowering India&apos;s Service Economy
        </div>
      </div>
    </footer>
  )
}
