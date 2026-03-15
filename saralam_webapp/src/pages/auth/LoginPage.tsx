import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GoogleLogin } from '@react-oauth/google'
import { Sparkles } from 'lucide-react'
import { authApi } from '@/lib/api/endpoints/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { AuthResponseUser } from '@/types/auth'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

function normalizeUser(u: unknown): AuthResponseUser | null {
  if (!u || typeof u !== 'object') return null
  const o = u as Record<string, unknown>
  const id = typeof o.id === 'string' ? o.id : ''
  const name = typeof o.name === 'string' ? o.name : ''
  const email = typeof o.email === 'string' ? o.email : ''
  const role = typeof o.role === 'string' ? o.role : 'seeker'
  const avatar = o.avatar == null ? null : typeof o.avatar === 'string' ? o.avatar : null
  const subscription_status = typeof o.subscription_status === 'string' ? o.subscription_status : undefined
  if (!id || !email) return null
  return { id, name, email, role, avatar, subscription_status }
}

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? ''
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [apiError, setApiError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleAuthSuccess = (data: { access_token: string; refresh_token?: string; user?: unknown }) => {
    const user = normalizeUser(data.user)
    if (!user) {
      setApiError('Invalid response from server.')
      return
    }
    setAuth(data.access_token, data.refresh_token ?? data.access_token, user)
    setApiError(null)
    const target = redirect && redirect.startsWith('/') ? redirect : user.role === 'provider' ? '/provider/dashboard' : '/seeker/dashboard'
    navigate(target, { replace: true })
  }

  const onEmailSubmit = async (values: LoginForm) => {
    setApiError(null)
    try {
      const res = await authApi.login({ email: values.email, password: values.password })
      const d = (res.data as { data?: Record<string, unknown> })?.data
      if (!d || typeof (d as { access_token?: string }).access_token !== 'string') {
        setApiError('Invalid response from server.')
        return
      }
      handleAuthSuccess(d as { access_token: string; refresh_token?: string; user?: unknown })
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; errors?: string[] }; status?: number } }
      const msg = ax.response?.data?.message ?? ax.response?.data?.errors?.[0]
      const status = ax.response?.status
      if (status === 401) setApiError(msg ?? 'Wrong email or password.')
      else if (status === 404) setApiError(msg ?? 'Account not found.')
      else if (status === 403) setApiError(msg ?? 'Account suspended. Contact support.')
      else setApiError(msg ?? 'Something went wrong. Please try again.')
    }
  }

  const onGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential
    if (!idToken) {
      setApiError('Google sign-in was cancelled or failed.')
      return
    }
    setGoogleLoading(true)
    setApiError(null)
    try {
      const role = (() => {
        const r = localStorage.getItem('saralam_register_role')
        if (r === 'seeker' || r === 'provider') return r
        return undefined
      })()
      const res = await authApi.google({ id_token: idToken, role })
      const d = (res.data as { data?: Record<string, unknown> })?.data
      if (!d || typeof (d as { access_token?: string }).access_token !== 'string') {
        setApiError('Invalid response from server.')
        return
      }
      handleAuthSuccess(d as { access_token: string; refresh_token?: string; user?: unknown })
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; errors?: string[] } } }
      const msg = ax.response?.data?.message ?? ax.response?.data?.errors?.[0]
      setApiError(msg ?? 'Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-2)]">
      {/* Left: brand / features */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-700)] p-10 text-white lg:flex">
        <Link to="/" className="font-display text-2xl font-bold">
          Saralam
        </Link>
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">
            Find the right service for every moment
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Connect with photographers, anchors, designers and more — no middlemen, direct connection.
          </p>
          <ul className="mt-8 space-y-4">
            {['Post jobs or browse services', 'Get applications from verified providers', 'Pay securely and collaborate'].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <Sparkles className="size-5 shrink-0 opacity-90" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm opacity-75">© Saralam. Empowering India&apos;s service economy.</p>
      </div>

      {/* Right: form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
            Welcome back to Saralam
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Sign in to continue to your account.
          </p>

          <div className="mt-8">
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => setApiError('Google sign-in failed.')}
                  useOneTap={false}
                  theme="filled_black"
                  size="large"
                  width="100%"
                  text="continue_with"
                  type="standard"
                />
              </div>
              {googleLoading && (
                <p className="text-center text-sm text-[var(--color-text-muted)]">
                  Signing you in...
                </p>
              )}

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-border)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[var(--color-surface)] px-2 text-[var(--color-text-muted)]">
                    or continue with email
                  </span>
                </div>
              </div>

              {apiError && (
                <div
                  className="rounded-lg border border-[var(--color-danger)] bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]"
                  role="alert"
                >
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <div>
                  <Input
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <div className="mt-2 text-right">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-[var(--color-primary-600)] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={isSubmitting}
                  disabled={googleLoading}
                >
                  Sign in
                </Button>
              </form>
            </div>

            <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-[var(--color-primary-600)] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
