import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'bg-[var(--color-admin-primary)] text-white hover:bg-[var(--color-admin-primary-hover)]',
  secondary: 'border border-[var(--color-admin-border)] bg-white text-[var(--color-admin-text)] hover:bg-slate-50',
  ghost: 'text-[var(--color-admin-text-muted)] hover:bg-slate-100',
  danger: 'bg-[var(--color-admin-danger)] text-white hover:opacity-90',
}

const sizes = {
  sm: 'h-8 rounded px-2.5 text-sm',
  md: 'h-9 rounded-md px-4 text-sm',
  lg: 'h-10 rounded-md px-5 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
