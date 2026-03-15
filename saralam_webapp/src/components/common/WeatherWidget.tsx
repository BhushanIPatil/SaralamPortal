import { useWeather } from '@/hooks/useWeather'
import { weatherCodeToEmoji } from '@/utils/weatherCode'
import { cn } from '@/lib/utils'

/** Compact format for header: "☀️ Nagpur 32°C" */
export function WeatherWidget({ className }: { className?: string }) {
  const { city, temp, weathercode, loading } = useWeather()

  if (loading) {
    return <span className={cn('text-sm text-[var(--color-text-muted)]', className)}>...</span>
  }

  const emoji = weatherCodeToEmoji(weathercode)
  const tempStr = temp != null ? `${Math.round(temp)}°C` : '—'

  return (
    <span className={cn('text-sm text-[var(--color-text-primary)]', className)}>
      {emoji} {city} {tempStr}
    </span>
  )
}
