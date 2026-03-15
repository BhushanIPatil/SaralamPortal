import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminSettingsApi } from '@/lib/api/endpoints/settings'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

const DEFAULT_SETTINGS = {
  app_launched_date: '',
  max_free_job_postings_per_month: 3,
  max_free_applications_per_month: 5,
  featured_categories: [] as string[],
  maintenance_mode: false,
  contact_email: '',
  footer_links: [] as { label: string; url: string }[],
}

export function PlatformSettingsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(DEFAULT_SETTINGS)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const res = await adminSettingsApi.get()
      return (res.data as { data?: Record<string, unknown> })?.data ?? {}
    },
  })

  useEffect(() => {
    if (data && typeof data === 'object') {
      setForm((prev) => ({
        ...prev,
        ...(data as Record<string, unknown>),
        featured_categories: Array.isArray((data as Record<string, unknown>).featured_categories)
          ? (data as Record<string, unknown>).featured_categories as string[]
          : prev.featured_categories,
        footer_links: Array.isArray((data as Record<string, unknown>).footer_links)
          ? (data as Record<string, unknown>).footer_links as { label: string; url: string }[]
          : prev.footer_links,
      }))
    }
  }, [data])

  const updateSettings = useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminSettingsApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
      toast.success('Settings saved')
    },
    onError: () => toast.error('Failed to save'),
  })

  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-sm font-semibold text-[var(--color-admin-text)]">Key-value settings</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">App launched date (displayed on webapp)</label>
            <Input
              type="date"
              value={form.app_launched_date}
              onChange={(e) => setForm((f) => ({ ...f, app_launched_date: e.target.value }))}
              className="mt-1 max-w-xs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Max free job postings per month</label>
            <Input
              type="number"
              value={form.max_free_job_postings_per_month}
              onChange={(e) => setForm((f) => ({ ...f, max_free_job_postings_per_month: Number(e.target.value) || 0 }))}
              className="mt-1 max-w-xs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Max free applications per month</label>
            <Input
              type="number"
              value={form.max_free_applications_per_month}
              onChange={(e) => setForm((f) => ({ ...f, max_free_applications_per_month: Number(e.target.value) || 0 }))}
              className="mt-1 max-w-xs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Featured categories (comma-separated IDs or names)</label>
            <Input
              value={Array.isArray(form.featured_categories) ? form.featured_categories.join(', ') : ''}
              onChange={(e) => setForm((f) => ({ ...f, featured_categories: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) }))}
              placeholder="e.g. Photography, Catering"
              className="mt-1 max-w-md"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.maintenance_mode}
              onChange={(e) => setForm((f) => ({ ...f, maintenance_mode: e.target.checked }))}
            />
            <span className="text-sm">Maintenance mode</span>
          </div>
          <div>
            <label className="block text-sm font-medium">Contact email</label>
            <Input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
              className="mt-1 max-w-xs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Footer links (JSON array with label and url)</label>
            <Input
              value={JSON.stringify(form.footer_links, null, 0)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value || '[]')
                  setForm((f) => ({ ...f, footer_links: Array.isArray(parsed) ? parsed : f.footer_links }))
                } catch {
                  // ignore
                }
              }}
              className="mt-1 font-mono text-xs"
            />
          </div>
          <Button onClick={() => updateSettings.mutate(form)} loading={updateSettings.isPending}>
            Save settings
          </Button>
        </div>
      </Card>
    </div>
  )
}
