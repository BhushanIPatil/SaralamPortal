import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  size?: AvatarSize
  fallback?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-8 text-sm',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Avatar({
  className,
  src,
  alt = '',
  size = 'md',
  fallback,
  ...props
}: AvatarProps) {
  const initials = fallback ? getInitials(fallback) : null
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-3)] font-medium text-[var(--color-text-secondary)]',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <span>{initials ?? '?'}</span>
      )}
    </div>
  )
}
