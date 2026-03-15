import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { NotificationPreferences } from '@/components/shared/NotificationPreferences'
import { cn } from '@/lib/utils'

type TabId = 'account' | 'security' | 'notifications' | 'privacy' | 'danger'

const TABS: { id: TabId; label: string }[] = [
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'danger', label: 'Danger Zone' },
]

export function SettingsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabId>('account')
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Placeholder state for settings (would come from API)
  const [profileVisibility, setProfileVisibility] = useState(true)
  const [contactVisibility, setContactVisibility] = useState(true)
  const [appearInSearches, setAppearInSearches] = useState(true)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="section-title">Settings</h1>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <nav className="flex shrink-0 flex-wrap gap-1 sm:flex-col sm:gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {activeTab === 'account' && (
            <Card>
              <h2 className="font-display font-semibold text-[var(--color-text-primary)]">Account</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Email</label>
                  <p className="mt-1 text-[var(--color-text-primary)]">{user?.email ?? '—'}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">Change email with OTP (coming soon).</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Phone</label>
                  <p className="mt-1 text-[var(--color-text-primary)]">Not set</p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">Add or change phone with OTP (coming soon).</p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h2 className="font-display font-semibold text-[var(--color-text-primary)]">Security</h2>
              <div className="mt-4 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Password</label>
                  <Button variant="secondary" size="sm" className="mt-2">
                    Change password
                  </Button>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">You will receive a link to reset.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Active sessions</label>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">Current device is active. Manage sessions (coming soon).</p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h2 className="font-display font-semibold text-[var(--color-text-primary)]">Notifications</h2>
              <div className="mt-4">
                <NotificationPreferences />
              </div>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <h2 className="font-display font-semibold text-[var(--color-text-primary)]">Privacy</h2>
              <div className="mt-4 space-y-4">
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-text-primary)]">Profile visibility</span>
                  <input
                    type="checkbox"
                    checked={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-text-primary)]">Contact info visibility</span>
                  <input
                    type="checkbox"
                    checked={contactVisibility}
                    onChange={(e) => setContactVisibility(e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-text-primary)]">Appear in searches</span>
                  <input
                    type="checkbox"
                    checked={appearInSearches}
                    onChange={(e) => setAppearInSearches(e.target.checked)}
                  />
                </label>
              </div>
            </Card>
          )}

          {activeTab === 'danger' && (
            <Card className="border-[var(--color-danger)]/30">
              <h2 className="font-display font-semibold text-[var(--color-text-primary)]">Danger Zone</h2>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] p-4">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">Deactivate account</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Your profile will be hidden. You can reactivate later.</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setShowDeactivateConfirm(true)}>
                    Deactivate
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--color-danger)]/50 p-4">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">Delete account</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Permanently delete your account and data. This cannot be undone.</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                    Delete account
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal open={showDeactivateConfirm} onClose={() => setShowDeactivateConfirm(false)} title="Deactivate account?">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Your profile will be hidden and you won&apos;t appear in search. You can reactivate by logging in again.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDeactivateConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => { setShowDeactivateConfirm(false); /* API call */ }}>Deactivate</Button>
        </div>
      </Modal>

      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete account permanently?">
        <p className="text-sm text-[var(--color-text-secondary)]">
          All your data will be permanently deleted. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => { setShowDeleteConfirm(false); /* API call */ }}>Delete forever</Button>
        </div>
      </Modal>
    </div>
  )
}
