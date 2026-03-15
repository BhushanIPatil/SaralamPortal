export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="section-title">Privacy Policy</h1>
      <p className="mt-4 text-[var(--color-text-secondary)]">
        This page will contain Saralam&apos;s privacy policy. Last updated: {new Date().toLocaleDateString()}.
      </p>
    </div>
  )
}
