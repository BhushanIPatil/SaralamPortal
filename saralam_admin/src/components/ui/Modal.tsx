import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        className={cn(
          'relative z-10 w-full max-w-lg rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] shadow-xl',
          className
        )}
      >
        {(title || true) && (
          <div className="flex items-center justify-between border-b border-[var(--color-admin-border)] px-4 py-3">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              <X className="size-5" />
            </Button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
