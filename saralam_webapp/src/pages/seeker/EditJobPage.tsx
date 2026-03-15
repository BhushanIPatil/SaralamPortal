import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api/endpoints/jobs'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { JobDetail } from '@/types/job'

export function EditJobPage() {
  const { id } = useParams<{ id: string }>()
  const { data: job, isLoading } = useQuery({
    queryKey: ['jobs', id],
    queryFn: async () => {
      const res = await jobsApi.getById(id!)
      return res.data?.data as JobDetail | undefined
    },
    enabled: !!id,
  })

  if (!id) return null
  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>
  if (!job) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-[var(--color-danger)]">Job not found.</p>
        <Link to="/seeker/jobs"><Button className="mt-4">My Jobs</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="section-title">Edit Job</h1>
      <Card className="mt-6 p-6">
        <p className="text-[var(--color-text-secondary)]">
          Editing &quot;{job.title}&quot;. Full edit form can be implemented here (same fields as Post Job, pre-filled).
        </p>
        <Link to="/seeker/jobs" className="mt-4 inline-block">
          <Button variant="secondary">Back to My Jobs</Button>
        </Link>
      </Card>
    </div>
  )
}
