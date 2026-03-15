import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { adminAuthApi } from '@/lib/api/endpoints/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import toast from 'react-hot-toast'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = useMutation({
    mutationFn: () => adminAuthApi.login({ email, password }),
    onSuccess: (res) => {
      const data = (res.data as { data?: { access_token: string; user: { id: string; email: string; name: string; role: string } } })?.data
      if (data?.access_token && data?.user) {
        setAuth(data.access_token, data.user)
        toast.success('Logged in')
        navigate(searchParams.get('redirect') || '/', { replace: true })
      }
    },
    onError: () => toast.error('Invalid email or password'),
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-admin-bg)] px-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-[var(--color-admin-text)]">Saralam Admin</h1>
        <p className="mt-1 text-sm text-[var(--color-admin-text-muted)]">Sign in with email</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            login.mutate()
          }}
        >
          <div>
            <label className="block text-sm font-medium text-[var(--color-admin-text)]">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-admin-text)]">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
              required
            />
          </div>
          <Button type="submit" className="w-full" loading={login.isPending}>
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  )
}
