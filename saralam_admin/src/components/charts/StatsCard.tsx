import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: number; label?: string }
  className?: string
}

export function StatsCard({ title, value, subtitle, trend, className }: StatsCardProps) {
  return (
    <Card className={cn('', className)}>
      <p className="text-sm font-medium text-[var(--color-admin-text-muted)]">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--color-admin-text)]">{value}</p>
      {(subtitle || trend) && (
        <p className="mt-1 text-xs text-[var(--color-admin-text-muted)]">
          {subtitle}
          {trend != null && (
            <span className={trend.value >= 0 ? 'text-[var(--color-admin-success)]' : 'text-[var(--color-admin-danger)]'}>
              {' '}{trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label ?? 'vs last period'}
            </span>
          )}
        </p>
      )}
    </Card>
  )
}
