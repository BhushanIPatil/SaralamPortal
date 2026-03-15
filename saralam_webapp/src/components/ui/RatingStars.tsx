import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RatingStarsProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (value: number) => void
  className?: string
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
}

export function RatingStars({
  value,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  const rounded = Math.round(value * 2) / 2

  const handleClick = (i: number) => {
    if (interactive && onChange) onChange(i + 1)
  }

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role={interactive ? 'slider' : 'img'}
      aria-label={interactive ? undefined : `Rating: ${value} out of ${max}`}
      aria-valuenow={interactive ? rounded : undefined}
      aria-valuemin={interactive ? 1 : undefined}
      aria-valuemax={interactive ? max : undefined}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rounded)
        const half = i === Math.floor(rounded) && rounded % 1 === 0.5
        return (
          <span
            key={i}
            className={cn(
              'text-[var(--color-accent-500)]',
              interactive && 'cursor-pointer hover:opacity-80',
              sizeClasses[size]
            )}
            onClick={() => handleClick(i)}
            onKeyDown={(e) => {
              if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                handleClick(i)
              }
            }}
            tabIndex={interactive ? 0 : undefined}
          >
            <Star
              className={cn(
                sizeClasses[size],
                filled && 'fill-current',
                half && 'fill-current opacity-70'
              )}
            />
          </span>
        )
      })}
    </div>
  )
}
