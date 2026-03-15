import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface FilterPanelProps {
  children: ReactNode
  className?: string
}

export function FilterPanel({ children, className }: FilterPanelProps) {
  return (
    <aside className={cn('rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4', className)}>
      {children}
    </aside>
  )
}
