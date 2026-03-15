import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { servicesApi } from '@/lib/api/endpoints/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/common/ImageUpload'
import { Spinner } from '@/components/ui/Spinner'
import type { ServiceDetail } from '@/types/service'
import type { ServiceCreatePayload } from '@/types/service'
import { servicesApi as getCategoriesApi } from '@/lib/api/endpoints/services'
import type { ServiceCategory } from '@/types/service'

const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'negotiable', label: 'Negotiable' },
]

export function CreateServicePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const [form, setForm] = useState<Partial<ServiceCreatePayload> & { tags_str?: string }>({
    title: '',
    category_id: '',
    description: '',
    tags_str: '',
    tags: [],
    price_type: 'fixed',
    base_price: undefined,
    currency: 'INR',
    location: {},
    availability: '',
    portfolio_images: [],
    contact_phone_visible: false,
    whatsapp_number: '',
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategoriesApi.getCategories()
      return (res.data?.data as ServiceCategory[]) ?? []
    },
  })

  const { data: serviceData, isLoading: serviceLoading } = useQuery({
    queryKey: ['services', id],
    queryFn: async () => {
      const res = await servicesApi.getById(id!)
      return res.data?.data as ServiceDetail | undefined
    },
    enabled: isEdit,
  })

  const categories = Array.isArray(categoriesData) ? categoriesData : []

  useEffect(() => {
    if (!isEdit || !serviceData) return
    setForm({
      title: serviceData.title,
      category_id: serviceData.category_id,
      description: serviceData.description,
      tags: serviceData.tags ?? [],
      tags_str: (serviceData.tags ?? []).join(', '),
      price_type: (serviceData.price_type as ServiceCreatePayload['price_type']) ?? 'fixed',
      base_price: serviceData.base_price,
      currency: serviceData.currency ?? 'INR',
      location: serviceData.location,
      availability: serviceData.availability,
      portfolio_images: serviceData.portfolio_images,
      contact_phone_visible: serviceData.contact_phone_visible,
      whatsapp_number: serviceData.whatsapp_number,
    })
  }, [isEdit, serviceData])

  const createMutation = useMutation({
    mutationFn: (payload: ServiceCreatePayload) => servicesApi.create(payload as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', 'my'] })
      navigate('/provider/services')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<ServiceCreatePayload>) =>
      servicesApi.update(id!, payload as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', 'my'] })
      navigate('/provider/services')
    },
  })

  const updateForm = (patch: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...patch }))
    if ('tags_str' in patch && patch.tags_str !== undefined) {
      const tags = patch.tags_str.split(',').map((s) => s.trim()).filter(Boolean)
      setForm((p) => ({ ...p, tags }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: ServiceCreatePayload = {
      title: form.title!,
      category_id: form.category_id!,
      description: form.description,
      tags: form.tags?.length ? form.tags : undefined,
      price_type: form.price_type!,
      base_price: form.base_price,
      currency: form.currency ?? 'INR',
      location: form.location,
      availability: form.availability,
      portfolio_images: form.portfolio_images,
      contact_phone_visible: form.contact_phone_visible,
      whatsapp_number: form.whatsapp_number,
    }
    if (isEdit) updateMutation.mutate(payload)
    else createMutation.mutate(payload)
  }

  if (isEdit && serviceLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="section-title">{isEdit ? 'Edit Service' : 'Add Service'}</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        {isEdit ? 'Update your service details.' : 'Fill in the details below.'}
      </p>

      <form onSubmit={handleSubmit}>
        <Card className="mt-8 space-y-8">
          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
              1. Service Info
            </h2>
            <div className="mt-4 space-y-4">
              <Input
                label="Title"
                value={form.title ?? ''}
                onChange={(e) => updateForm({ title: e.target.value })}
                required
              />
              <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <select
                  value={form.category_id ?? ''}
                  onChange={(e) => updateForm({ category_id: e.target.value })}
                  className="input-field w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
                  required
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  rows={5}
                  className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
                />
              </div>
              <Input
                label="Tags (comma-separated)"
                value={form.tags_str ?? ''}
                onChange={(e) => updateForm({ tags_str: e.target.value })}
                placeholder="e.g. wedding, events, candid"
              />
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
              2. Pricing
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Price type</label>
                <select
                  value={form.price_type ?? 'fixed'}
                  onChange={(e) => updateForm({ price_type: e.target.value as ServiceCreatePayload['price_type'] })}
                  className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
                >
                  {PRICE_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Base price (₹)"
                type="number"
                value={form.base_price ?? ''}
                onChange={(e) => updateForm({ base_price: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
              3. Location & Availability
            </h2>
            <div className="mt-4 space-y-4">
              <Input
                label="Primary service location (city)"
                value={form.location?.city ?? ''}
                onChange={(e) => updateForm({
                  location: { ...form.location, city: e.target.value },
                })}
              />
              <div>
                <label className="mb-1 block text-sm font-medium">Service radius (km)</label>
                <input
                  type="range"
                  min={5}
                  max={200}
                  value={form.location?.radius_km ?? 50}
                  onChange={(e) => updateForm({
                    location: { ...form.location, radius_km: Number(e.target.value) },
                  })}
                  className="w-full"
                />
                <p className="text-sm text-[var(--color-text-muted)]">
                  {form.location?.radius_km ?? 50} km
                </p>
              </div>
              <Input
                label="Availability schedule"
                value={form.availability ?? ''}
                onChange={(e) => updateForm({ availability: e.target.value })}
                placeholder="e.g. Weekends, Mon-Fri"
              />
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
              4. Portfolio
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Up to 10 images/videos. Drag to reorder.
            </p>
            <ImageUpload
              maxFiles={10}
              maxSize={10 * 1024 * 1024}
              onAccept={(files) => {
                const urls = files.map((f) => URL.createObjectURL(f))
                updateForm({ portfolio_images: [...(form.portfolio_images ?? []), ...urls].slice(0, 10) })
              }}
            />
            {(form.portfolio_images?.length ?? 0) > 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">
                {form.portfolio_images!.length} file(s)
              </p>
            )}
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
              5. Contact Preferences
            </h2>
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.contact_phone_visible ?? false}
                  onChange={(e) => updateForm({ contact_phone_visible: e.target.checked })}
                />
                <span className="text-sm">Phone visible to accepted applicants only</span>
              </label>
              <Input
                label="WhatsApp number"
                value={form.whatsapp_number ?? ''}
                onChange={(e) => updateForm({ whatsapp_number: e.target.value })}
                placeholder="+91..."
              />
            </div>
          </section>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={!form.title?.trim() || !form.category_id}
            >
              {isEdit ? 'Update Service' : 'Create Service'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/provider/services')}>
              Cancel
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
