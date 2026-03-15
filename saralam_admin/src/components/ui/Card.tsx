import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-4 shadow-sm',
        className
      )}
      {...props}
    />
  )
}
