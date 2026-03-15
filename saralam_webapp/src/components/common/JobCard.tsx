import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/format'
import { formatRelative } from '@/utils/format'
import type { JobListItem } from '@/types/job'

export interface JobCardProps {
  job: JobListItem
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link to={`/jobs/${job.id}`}>
      <Card hoverLift className="h-full">
        <h3 className="font-display font-semibold text-[var(--color-text-primary)] line-clamp-2">
          {job.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{job.status}</Badge>
          {job.budget_min != null && job.budget_max != null && (
            <span className="text-sm text-[var(--color-text-secondary)]">
              {formatCurrency(job.budget_min, job.currency)} - {formatCurrency(job.budget_max, job.currency)}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">{formatRelative(job.created_at)}</p>
      </Card>
    </Link>
  )
}
