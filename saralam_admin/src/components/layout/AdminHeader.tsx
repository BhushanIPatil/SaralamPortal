import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  title: string
  className?: string
  children?: React.ReactNode
}

export function AdminHeader({ title, className, children }: AdminHeaderProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-admin-border)] bg-[var(--color-admin-card)] px-6',
        className
      )}
    >
      <h1 className="text-lg font-semibold text-[var(--color-admin-text)]">{title}</h1>
      <div className="flex items-center gap-4">
        {children}
        {user && (
          <span className="text-sm text-[var(--color-admin-text-muted)]">
            {user.email}
          </span>
        )}
      </div>
    </header>
  )
}
