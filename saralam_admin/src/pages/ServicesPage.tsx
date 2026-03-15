import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminServicesApi } from '@/lib/api/endpoints/services'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface ServiceRow {
  id: string
  title: string
  provider_name: string
  category_name: string
  city?: string
  rating?: number
  status: string
  verify_status: string
  created_at: string
}

export function ServicesPage() {
  const queryClient = useQueryClient()
  const [detailId, setDetailId] = useState<string | null>(null)

  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin', 'services'],
    queryFn: async () => {
      const res = await adminServicesApi.list()
      return (res.data as { data?: ServiceRow[] })?.data ?? []
    },
  })

  const { data: detail } = useQuery({
    queryKey: ['admin', 'services', detailId],
    queryFn: async () => {
      if (!detailId) return null
      const res = await adminServicesApi.getById(detailId)
      return (res.data as { data?: unknown })?.data ?? null
    },
    enabled: !!detailId,
  })

  const verify = useMutation({
    mutationFn: (id: string) => adminServicesApi.verify(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      toast.success('Service verified')
    },
  })

  const deactivate = useMutation({
    mutationFn: (id: string) => adminServicesApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      toast.success('Service deactivated')
    },
  })

  const columns: ColumnDef<ServiceRow>[] = [
    { accessorKey: 'title', header: 'Service Title' },
    { accessorKey: 'provider_name', header: 'Provider' },
    { accessorKey: 'category_name', header: 'Category' },
    { accessorKey: 'city', header: 'City' },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ getValue }) => (getValue() != null ? Number(getValue()).toFixed(1) : '—'),
    },
    { accessorKey: 'status', header: 'Status' },
    {
      accessorKey: 'verify_status',
      header: 'Verify',
      cell: ({ getValue }) => (
        <Badge variant={getValue() === 'verified' ? 'success' : 'default'}>{String(getValue())}</Badge>
      ),
    },
    { accessorKey: 'created_at', header: 'Created', cell: ({ getValue }) => format(new Date(String(getValue())), 'dd MMM yyyy') },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setDetailId(row.original.id)}>View</Button>
          {row.original.verify_status !== 'verified' && (
            <Button variant="ghost" size="sm" onClick={() => verify.mutate(row.original.id)}>Verify</Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => toast('Flag: not implemented')}>Flag</Button>
          <Button variant="ghost" size="sm" onClick={() => deactivate.mutate(row.original.id)}>Deactivate</Button>
        </div>
      ),
    },
  ]

  const services = (listData ?? []) as ServiceRow[]

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <DataTable data={services} columns={columns} searchPlaceholder="Search services..." />
      )}

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Service Detail">
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
