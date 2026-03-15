import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-md border border-[var(--color-admin-border)] bg-white px-3 text-sm text-[var(--color-admin-text)] placeholder:text-[var(--color-admin-text-muted)] focus:border-[var(--color-admin-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-admin-primary)]',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
