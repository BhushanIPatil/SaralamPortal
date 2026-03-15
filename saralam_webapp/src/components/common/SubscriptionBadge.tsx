import { Badge } from '@/components/ui/Badge'
import { Crown } from 'lucide-react'

export interface SubscriptionBadgeProps {
  status?: string
  planName?: string
}

export function SubscriptionBadge({ status, planName }: SubscriptionBadgeProps) {
  if (!status || status === 'none') return null
  return (
    <Badge variant="accent" className="gap-1">
      <Crown className="size-3" />
      {planName ?? status}
    </Badge>
  )
}
