import { format, formatDistanceToNow } from 'date-fns'

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(d: string | Date, pattern = 'PPP'): string {
  return format(new Date(d), pattern)
}

export function formatRelative(d: string | Date): string {
  return formatDistanceToNow(new Date(d), { addSuffix: true })
}
