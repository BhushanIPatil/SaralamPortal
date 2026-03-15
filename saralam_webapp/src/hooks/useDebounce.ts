import { useState, useEffect, useCallback } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number
) {
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const debouncedFn = useCallback(
    (...args: A) => {
      if (timer) clearTimeout(timer)
      setTimer(setTimeout(() => fn(...args), delay))
    },
    [delay, fn, timer]
  )

  useEffect(() => () => { if (timer) clearTimeout(timer) }, [timer])

  return debouncedFn
}
