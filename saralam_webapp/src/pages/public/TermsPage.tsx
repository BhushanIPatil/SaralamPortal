export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="section-title">Terms of Service</h1>
      <p className="mt-4 text-[var(--color-text-secondary)]">
        This page will contain Saralam&apos;s terms of service. Last updated: {new Date().toLocaleDateString()}.
      </p>
    </div>
  )
}
