import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from './useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('returns isAuthenticated false when no token', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('returns isSeeker true when user role is seeker', () => {
    act(() => {
      useAuthStore.getState().setAuth('token', 'refresh', {
        id: '1',
        name: 'Test',
        email: 't@t.com',
        role: 'seeker',
      })
    })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isSeeker).toBe(true)
    expect(result.current.isProvider).toBe(false)
    expect(result.current.dashboardPath).toBe('/seeker/dashboard')
  })

  it('returns hasActiveSubscription when user has subscription_status active', () => {
    act(() => {
      useAuthStore.getState().setAuth('token', 'refresh', {
        id: '1',
        name: 'Test',
        email: 't@t.com',
        role: 'provider',
        subscription_status: 'active',
      })
    })
    const { result } = renderHook(() => useAuth())
    expect(result.current.hasActiveSubscription).toBe(true)
  })
})
