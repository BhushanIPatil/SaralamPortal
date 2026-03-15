import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '@/lib/api/endpoints/profile'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { RatingStars } from '@/components/ui/RatingStars'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/format'
import type { PublicProfile } from '@/types/profile'
import type { ProfilePayload } from '@/types/profile'

export function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const isViewMode = !!id && id !== user?.id

  const { data: myProfile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const res = await profileApi.getMine()
      return (res.data as { data?: ProfilePayload & { email?: string; phone?: string } })?.data
    },
    enabled: !isViewMode,
  })

  const { data: publicProfile, isLoading: publicLoading } = useQuery({
    queryKey: ['profile', 'public', id],
    queryFn: async () => {
      const res = await profileApi.getPublic(id!)
      return (res.data as { data?: PublicProfile })?.data
    },
    enabled: isViewMode && !!id,
  })

  const updateProfile = useMutation({
    mutationFn: (data: ProfilePayload) => profileApi.update(data as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      useAuthStore.getState().updateUser({ name: (myProfile as { name?: string })?.name })
    },
  })

  const [form, setForm] = useState<ProfilePayload>({
    name: user?.name ?? '',
    bio: '',
    experience_years: undefined,
    website: '',
    linkedin_url: '',
    instagram_url: '',
    youtube_url: '',
    languages: [],
    portfolio_url: '',
  })

  if (isViewMode) {
    if (publicLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
    if (!publicProfile) return <div className="mx-auto max-w-2xl px-4 py-8"><p>Profile not found.</p></div>
    return <PublicProfileView profile={publicProfile} />
  }

  useEffect(() => {
    const current = (myProfile as ProfilePayload & { name?: string }) ?? {}
    if (current.name || current.bio != null) {
      setForm((f) => ({
        ...f,
        name: current.name ?? user?.name ?? f.name,
        bio: current.bio ?? f.bio,
        website: current.website ?? f.website,
        linkedin_url: current.linkedin_url ?? f.linkedin_url,
        instagram_url: current.instagram_url ?? f.instagram_url,
        youtube_url: current.youtube_url ?? f.youtube_url,
        portfolio_url: current.portfolio_url ?? f.portfolio_url,
        experience_years: current.experience_years ?? f.experience_years,
      }))
    }
  }, [myProfile, user?.name])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="section-title">Edit My Profile</h1>
      <Card className="mt-8 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar src={user?.avatar} fallback={form.name || user?.name} size="lg" />
          <label className="cursor-pointer text-sm text-[var(--color-primary-600)] hover:underline">
            Upload photo
            <input type="file" accept="image/*" className="hidden" />
          </label>
        </div>
        <Input label="Name" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea value={form.bio ?? ''} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={4} className="input-field w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        </div>
        <Input label="Experience (years)" type="number" value={form.experience_years ?? ''} onChange={(e) => setForm((f) => ({ ...f, experience_years: e.target.value ? Number(e.target.value) : undefined }))} />
        <Input label="Website" value={form.website ?? ''} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://" />
        <Input label="LinkedIn" value={form.linkedin_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))} />
        <Input label="Instagram" value={form.instagram_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, instagram_url: e.target.value }))} />
        <Input label="YouTube" value={form.youtube_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))} />
        <Input label="Portfolio URL" value={form.portfolio_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, portfolio_url: e.target.value }))} />
        <Input label="Languages (comma-separated)" value={(form.languages ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
        <Button loading={updateProfile.isPending} onClick={() => updateProfile.mutate(form)}>Save changes</Button>
      </Card>
    </div>
  )
}

function PublicProfileView({ profile }: { profile: PublicProfile }) {
  const { user } = useAuthStore()
  const canContact = user && user.role === 'seeker'

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="relative h-40 rounded-t-2xl bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)]" />
      <div className="relative -mt-16 px-4">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <Avatar src={profile.avatar} fallback={profile.name} size="lg" className="ring-4 ring-[var(--color-surface)]" />
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">{profile.name}</h1>
            {profile.is_verified && <Badge variant="primary" className="mt-1">Verified</Badge>}
            <div className="mt-2 flex items-center gap-2">
              <RatingStars value={profile.avg_rating} size="md" />
              <span className="text-sm text-[var(--color-text-muted)]">({profile.total_reviews} reviews)</span>
            </div>
          </div>
          {canContact && (
            <Button>Contact</Button>
          )}
        </div>
      </div>
      <Card className="mt-6">
        <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">Stats</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div><p className="text-2xl font-bold text-[var(--color-primary-600)]">{profile.total_jobs ?? 0}</p><p className="text-sm text-[var(--color-text-muted)]">Total jobs</p></div>
          <div><p className="text-2xl font-bold">{profile.avg_rating.toFixed(1)}</p><p className="text-sm text-[var(--color-text-muted)]">Rating</p></div>
          <div><p className="text-2xl font-bold">{profile.member_since ? formatDate(profile.member_since) : '—'}</p><p className="text-sm text-[var(--color-text-muted)]">Member since</p></div>
          <div><p className="text-2xl font-bold">{profile.response_rate ?? 0}%</p><p className="text-sm text-[var(--color-text-muted)]">Response rate</p></div>
        </div>
      </Card>
      {profile.bio && (
        <Card className="mt-6">
          <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">About</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">{profile.bio}</p>
        </Card>
      )}
      {(profile.services?.length ?? 0) > 0 && (
        <Card className="mt-6">
          <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">Services</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {profile.services!.map((s) => (
              <Link key={s.id} to={`/services/${s.id}`}>
                <div className="rounded-lg border border-[var(--color-border)] p-3 hover:bg-[var(--color-surface-2)]">
                  <p className="font-medium text-[var(--color-text-primary)]">{s.title}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{s.category_name} · {s.avg_rating.toFixed(1)}★</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
      {(profile.portfolio_images?.length ?? 0) > 0 && (
        <Card className="mt-6">
          <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">Portfolio</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {profile.portfolio_images!.map((url, i) => (
              <div key={i} className="aspect-video overflow-hidden rounded-lg bg-[var(--color-surface-3)]">
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </Card>
      )}
      {(profile.reviews?.length ?? 0) > 0 && (
        <Card className="mt-6">
          <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">Reviews</h2>
          <ul className="mt-4 space-y-4">
            {profile.reviews!.slice(0, 10).map((r) => (
              <li key={r.id} className="border-b border-[var(--color-border)] pb-4 last:border-0">
                <div className="flex items-center gap-2">
                  <RatingStars value={r.rating} size="sm" />
                  <span className="text-sm text-[var(--color-text-muted)]">{r.seeker_name ?? 'User'} · {formatDate(r.created_at)}</span>
                </div>
                {r.comment && <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{r.comment}</p>}
                {r.response_text && <p className="mt-2 text-sm text-[var(--color-text-muted)] italic">— {r.response_text}</p>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
