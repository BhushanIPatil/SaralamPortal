/** Map Open-Meteo WMO weather code to emoji (compact for header) */
export function weatherCodeToEmoji(code: number | null | undefined): string {
  if (code == null) return '☀️'
  if (code === 0) return '☀️'
  if (code >= 1 && code <= 3) return '⛅'
  if (code >= 45 && code <= 48) return '🌫️'
  if (code >= 51 && code <= 67) return '🌧️'
  if (code >= 71 && code <= 77) return '❄️'
  if (code >= 80 && code <= 82) return '🌦️'
  if (code >= 85 && code <= 86) return '❄️'
  if (code >= 95 && code <= 99) return '⛈️'
  return '☀️'
}
