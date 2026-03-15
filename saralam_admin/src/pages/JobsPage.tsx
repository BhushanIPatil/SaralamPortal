import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminJobsApi } from '@/lib/api/endpoints/jobs'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface JobRow {
  id: string
  title: string
  seeker_name: string
  category_name: string
  budget_display?: string
  applications_count?: number
  status: string
  created_at: string
}

export function JobsPage() {
  const queryClient = useQueryClient()
  const [detailId, setDetailId] = useState<string | null>(null)

  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin', 'jobs'],
    queryFn: async () => {
      const res = await adminJobsApi.list()
      return (res.data as { data?: JobRow[] })?.data ?? []
    },
  })

  const { data: detail } = useQuery({
    queryKey: ['admin', 'jobs', detailId],
    queryFn: async () => {
      if (!detailId) return null
      const res = await adminJobsApi.getById(detailId)
      return (res.data as { data?: unknown })?.data ?? null
    },
    enabled: !!detailId,
  })

  const closeJob = useMutation({
    mutationFn: (id: string) => adminJobsApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] })
      toast.success('Job closed')
    },
  })

  const deleteJob = useMutation({
    mutationFn: (id: string) => adminJobsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] })
      setDetailId(null)
      toast.success('Job deleted')
    },
  })

  const columns: ColumnDef<JobRow>[] = [
    { accessorKey: 'title', header: 'Job Title' },
    { accessorKey: 'seeker_name', header: 'Seeker' },
    { accessorKey: 'category_name', header: 'Category' },
    { accessorKey: 'budget_display', header: 'Budget' },
    { accessorKey: 'applications_count', header: 'Applications' },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <Badge>{String(getValue())}</Badge> },
    { accessorKey: 'created_at', header: 'Posted', cell: ({ getValue }) => format(new Date(String(getValue())), 'dd MMM yyyy') },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setDetailId(row.original.id)}>View</Button>
          <Button variant="ghost" size="sm" onClick={() => toast('Flag: not implemented')}>Flag</Button>
          {row.original.status !== 'closed' && (
            <Button variant="ghost" size="sm" onClick={() => closeJob.mutate(row.original.id)}>Close</Button>
          )}
          <Button variant="danger" size="sm" onClick={() => window.confirm('Delete?') && deleteJob.mutate(row.original.id)}>Delete</Button>
        </div>
      ),
    },
  ]

  const jobs = (listData ?? []) as JobRow[]

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <DataTable data={jobs} columns={columns} searchPlaceholder="Search jobs..." />
      )}

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Job Detail">
        {detail ? (
          <pre className="max-h-96 overflow-auto rounded bg-slate-100 p-3 text-xs">
            {JSON.stringify(detail, null, 2)}
          </pre>
        ) : (
          <Spinner />
        )}
      </Modal>
    </div>
  )
}
