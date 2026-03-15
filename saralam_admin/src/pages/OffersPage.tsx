import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminOffersApi } from '@/lib/api/endpoints/offers'
import { adminSubscriptionsApi } from '@/lib/api/endpoints/subscriptions'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface OfferRow {
  id: string
  offer_name: string
  offer_code: string
  plan_name: string
  discount_type: string
  discount_value: number
  redemptions: number
  valid_until?: string
  active: boolean
}

export function OffersPage() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    offer_name: '',
    offer_code: '',
    plan_id: '',
    discount_type: 'percent',
    discount_value: 0,
    valid_from: '',
    valid_until: '',
    max_redemptions: -1,
    active: true,
  })

  const { data: plansData } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const res = await adminSubscriptionsApi.list()
      const list = (res.data as { data?: { plan_name: string; plan_id: string }[] })?.data ?? []
      return list
    },
  })

  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin', 'offers'],
    queryFn: async () => {
      const res = await adminOffersApi.list()
      return (res.data as { data?: OfferRow[] })?.data ?? []
    },
  })

  const createOffer = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminOffersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'offers'] })
      setShowCreate(false)
      setForm({ offer_name: '', offer_code: '', plan_id: '', discount_type: 'percent', discount_value: 0, valid_from: '', valid_until: '', max_redemptions: -1, active: true })
      toast.success('Offer created')
    },
    onError: () => toast.error('Failed to create offer'),
  })

  const toggleOffer = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => adminOffersApi.toggle(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'offers'] }),
  })

  const deleteOffer = useMutation({
    mutationFn: (id: string) => adminOffersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'offers'] }),
  })

  const generateCode = () => {
    setForm((f) => ({ ...f, offer_code: (f.offer_name.toUpperCase().replace(/\s/g, '') || 'OFFER').slice(0, 8) + Math.floor(1000 + Math.random() * 9000) }))
  }

  const columns: ColumnDef<OfferRow>[] = [
    { accessorKey: 'offer_name', header: 'Name' },
    { accessorKey: 'offer_code', header: 'Code' },
    { accessorKey: 'plan_name', header: 'Plan' },
    {
      id: 'discount',
      header: 'Discount',
      cell: ({ row }) =>
        row.original.discount_type === 'percent'
          ? `${row.original.discount_value}%`
          : row.original.discount_type === 'flat'
            ? `₹${row.original.discount_value}`
            : '100%',
    },
    { accessorKey: 'redemptions', header: 'Redemptions' },
    { accessorKey: 'valid_until', header: 'Valid Until', cell: ({ getValue }) => (getValue() ? format(new Date(String(getValue())), 'dd MMM yyyy') : '—') },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => (row.original.active ? 'Active' : 'Inactive'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => toast('Edit: open edit modal')}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => toggleOffer.mutate({ id: row.original.id, active: !row.original.active })}>
            {row.original.active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => window.confirm('Delete?') && deleteOffer.mutate(row.original.id)}>Delete</Button>
        </div>
      ),
    },
  ]

  const offers = (listData ?? []) as OfferRow[]
  const plans = (plansData ?? []) as { plan_name: string; plan_id: string }[]

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Offers</h2>
        <Button onClick={() => setShowCreate(true)}>Create offer</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <DataTable data={offers} columns={columns} />
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create offer">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Offer name</label>
            <Input value={form.offer_name} onChange={(e) => setForm((f) => ({ ...f, offer_name: e.target.value }))} className="mt-1" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium">Code</label>
              <Input value={form.offer_code} onChange={(e) => setForm((f) => ({ ...f, offer_code: e.target.value }))} className="mt-1" />
            </div>
            <Button variant="secondary" size="sm" className="mt-6" onClick={generateCode}>Generate</Button>
          </div>
          <div>
            <label className="block text-sm font-medium">Apply to plan</label>
            <select
              value={form.plan_id}
              onChange={(e) => setForm((f) => ({ ...f, plan_id: e.target.value }))}
              className="mt-1 h-9 w-full rounded-md border border-[var(--color-admin-border)] px-3 text-sm"
            >
              <option value="">Select plan</option>
              {plans.map((p) => (
                <option key={p.plan_id} value={p.plan_id}>{p.plan_name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Discount type</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))}
                className="mt-1 h-9 w-full rounded-md border border-[var(--color-admin-border)] px-3 text-sm"
              >
                <option value="percent">Percent</option>
                <option value="flat">Flat amount</option>
                <option value="free">Free (100%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Discount value</label>
              <Input
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) || 0 }))}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Valid from</label>
              <Input type="date" value={form.valid_from} onChange={(e) => setForm((f) => ({ ...f, valid_from: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Valid until</label>
              <Input type="date" value={form.valid_until} onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Max redemptions (-1 = unlimited)</label>
            <Input
              type="number"
              value={form.max_redemptions}
              onChange={(e) => setForm((f) => ({ ...f, max_redemptions: Number(e.target.value) ?? -1 }))}
              className="mt-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            <span className="text-sm">Active</span>
          </div>
          <p className="text-xs text-[var(--color-admin-text-muted)]">Preview: Users will pay ₹X instead of ₹Y (calculated by backend).</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createOffer.mutate(form)} loading={createOffer.isPending}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
