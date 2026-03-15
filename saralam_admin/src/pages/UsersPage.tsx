import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUsersApi } from '@/lib/api/endpoints/users'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  city?: string
  subscription_status?: string
  rating?: number
  jobs_count?: number
  services_count?: number
  status: string
  created_at: string
}

export function UsersPage() {
  const queryClient = useQueryClient()
  const [detailId, setDetailId] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin', 'users', roleFilter, statusFilter, dateFrom, dateTo],
    queryFn: async () => {
      const res = await adminUsersApi.list({
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      })
      return (res.data as { data?: UserRow[] })?.data ?? []
    },
  })

  const { data: detail } = useQuery({
    queryKey: ['admin', 'users', detailId],
    queryFn: async () => {
      if (!detailId) return null
      const res = await adminUsersApi.getById(detailId)
      return (res.data as { data?: unknown })?.data ?? null
    },
    enabled: !!detailId,
  })

  const suspend = useMutation({
    mutationFn: (id: string) => adminUsersApi.suspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User suspended')
    },
    onError: () => toast.error('Failed to suspend'),
  })

  const unsuspend = useMutation({
    mutationFn: (id: string) => adminUsersApi.unsuspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User unsuspended')
    },
    onError: () => toast.error('Failed to unsuspend'),
  })

  const handleExport = () => {
    adminUsersApi.exportCsv({ role: roleFilter || undefined }).then((res) => {
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'users.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export started')
    }).catch(() => toast.error('Export failed'))
  }

  const columns: ColumnDef<UserRow>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role', cell: ({ getValue }) => <Badge>{String(getValue())}</Badge> },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'subscription_status', header: 'Subscription' },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ getValue }) => (getValue() != null ? Number(getValue()).toFixed(1) : '—'),
    },
    {
      id: 'activity',
      header: 'Jobs/Services',
      cell: ({ row }) => `${row.original.jobs_count ?? 0} / ${row.original.services_count ?? 0}`,
    },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <Badge variant={getValue() === 'active' ? 'success' : 'warning'}>{String(getValue())}</Badge> },
    { accessorKey: 'created_at', header: 'Joined', cell: ({ getValue }) => format(new Date(String(getValue())), 'dd MMM yyyy') },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setDetailId(row.original.id)}>View</Button>
          {row.original.status === 'active' ? (
            <Button variant="ghost" size="sm" onClick={() => suspend.mutate(row.original.id)}>Suspend</Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => unsuspend.mutate(row.original.id)}>Unsuspend</Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => toast('Send notification: not implemented')}>Notify</Button>
        </div>
      ),
    },
  ]

  const users = (listData ?? []) as UserRow[]
  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false
    if (statusFilter && u.status !== statusFilter) return false
    if (dateFrom && u.created_at < dateFrom) return false
    if (dateTo && u.created_at > dateTo) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 rounded-md border border-[var(--color-admin-border)] px-3 text-sm"
        >
          <option value="">All roles</option>
          <option value="seeker">Seeker</option>
          <option value="provider">Provider</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-[var(--color-admin-border)] px-3 text-sm"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        <Button variant="secondary" size="sm" onClick={handleExport}>Export CSV</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          searchPlaceholder="Search name or email..."
          searchKey="search"
        />
      )}

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="User Detail">
        {detail ? (
          <div className="space-y-3 text-sm">
            <pre className="max-h-96 overflow-auto rounded bg-slate-100 p-3 text-xs">
              {JSON.stringify(detail, null, 2)}
            </pre>
            <p className="text-[var(--color-admin-text-muted)]">Profile, subscription history, job/service history, ratings (from API).</p>
          </div>
        ) : (
          <Spinner />
        )}
      </Modal>
    </div>
  )
}
