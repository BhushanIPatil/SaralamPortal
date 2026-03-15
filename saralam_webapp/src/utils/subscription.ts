export function isFeatureAllowed(
  subscriptionStatus: string | undefined,
  feature: string
): boolean {
  if (!subscriptionStatus || subscriptionStatus === 'none') {
    return feature === 'browse'
  }
  return true
}

export function getUpgradeUrl(): string {
  return '/pricing'
}
