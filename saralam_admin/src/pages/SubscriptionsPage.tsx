import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminSubscriptionsApi } from '@/lib/api/endpoints/subscriptions'
import { DataTable } from '@/components/ui/DataTable'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface SubRow {
  id: string
  user_name: string
  plan_name: string
  amount: number
  start_date: string
  expiry_date: string
  status: string
  payment_id?: string
}

export function SubscriptionsPage() {
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: summary } = useQuery({
    queryKey: ['admin', 'subscriptions', 'summary'],
    queryFn: async () => {
      const res = await adminSubscriptionsApi.getRevenueSummary()
      return (res.data as { data?: { mrr?: number; arr?: number; subscribers_by_plan?: Record<string, number> } })?.data ?? {}
    },
  })

  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', planFilter, statusFilter],
    queryFn: async () => {
      const res = await adminSubscriptionsApi.list({
        plan: planFilter || undefined,
        status: statusFilter || undefined,
      })
      return (res.data as { data?: SubRow[] })?.data ?? []
    },
  })

  const handleReconcile = () => {
    adminSubscriptionsApi.reconcile().then(() => toast.success('Reconciliation started')).catch(() => toast.error('Failed'))
  }

  const columns: ColumnDef<SubRow>[] = [
    { accessorKey: 'user_name', header: 'User' },
    { accessorKey: 'plan_name', header: 'Plan' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ getValue }) => `₹${Number(getValue()).toLocaleString()}` },
    { accessorKey: 'start_date', header: 'Start', cell: ({ getValue }) => format(new Date(String(getValue())), 'dd MMM yyyy') },
    { accessorKey: 'expiry_date', header: 'Expiry', cell: ({ getValue }) => format(new Date(String(getValue())), 'dd MMM yyyy') },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'payment_id', header: 'Payment ID' },
  ]

  const subs = (listData ?? []) as SubRow[]
  const filtered = subs.filter((s) => {
    if (planFilter && s.plan_name !== planFilter) return false
    if (statusFilter && s.status !== statusFilter) return false
    return true
  })

  const s = summary as { mrr?: number; arr?: number; subscribers_by_plan?: Record<string, number> }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-sm font-semibold text-[var(--color-admin-text)]">Revenue summary</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-[var(--color-admin-text-muted)]">MRR</p>
            <p className="text-xl font-semibold">₹{(s?.mrr ?? 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-admin-text-muted)]">ARR</p>
            <p className="text-xl font-semibold">₹{(s?.arr ?? 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-admin-text-muted)]">Subscribers by plan</p>
            <pre className="mt-1 text-xs">{JSON.stringify(s?.subscribers_by_plan ?? {}, null, 0)}</pre>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-4">
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="h-9 rounded-md border border-[var(--color-admin-border)] px-3 text-sm"
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-[var(--color-admin-border)] px-3 text-sm"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button variant="secondary" size="sm" onClick={handleReconcile}>Razorpay reconcile</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <DataTable data={filtered} columns={columns} searchPlaceholder="Search user..." />
      )}
    </div>
  )
}
