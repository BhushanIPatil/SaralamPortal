import { useState, useEffect, useCallback } from 'react'

export interface WeatherState {
  city: string
  temp: number | null
  weathercode: number | null
  loading: boolean
  error: string | null
}

const FALLBACK_CITY = 'Mumbai'

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    city: FALLBACK_CITY,
    temp: null,
    weathercode: null,
    loading: true,
    error: null,
  })

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode`
      )
      const data = await res.json()
      const temp = data?.current?.temperature_2m as number | undefined
      const weathercode = data?.current?.weathercode as number | undefined
      const cityRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      )
      const cityData = await cityRes.json()
      const city =
        cityData?.address?.city ||
        cityData?.address?.town ||
        cityData?.address?.state_district ||
        FALLBACK_CITY
      setState({
        city,
        temp: temp ?? null,
        weathercode: weathercode ?? null,
        loading: false,
        error: null,
      })
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: (e as Error).message,
        temp: null,
        weathercode: null,
      }))
    }
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, loading: false }))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => setState((s) => ({ ...s, loading: false }))
    )
  }, [fetchWeather])

  return state
}
