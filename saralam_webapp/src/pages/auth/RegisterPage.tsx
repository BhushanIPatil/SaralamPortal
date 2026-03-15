import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GoogleLogin } from '@react-oauth/google'
import { Sparkles, UserPlus, Briefcase } from 'lucide-react'
import { authApi } from '@/lib/api/endpoints/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import type { AuthResponseUser } from '@/types/auth'

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    accept_terms: z.boolean().refine((v) => v === true, { message: 'You must accept the terms' }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type RegisterForm = z.infer<typeof registerSchema>

type Role = 'seeker' | 'provider'

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

export function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [role, setRole] = useState<Role>('seeker')
  const [apiError, setApiError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
      accept_terms: false,
    },
  })

  const handleAuthSuccess = (data: { access_token: string; refresh_token?: string; user?: unknown }) => {
    const user = normalizeUser(data.user)
    if (!user) {
      setApiError('Invalid response from server.')
      return
    }
    setAuth(data.access_token, data.refresh_token ?? data.access_token, user)
    setApiError(null)
    localStorage.removeItem('saralam_register_role')
    const target = user.role === 'provider' ? '/provider/dashboard' : '/seeker/dashboard'
    navigate(target, { replace: true })
  }

  const onEmailSubmit = async (values: RegisterForm) => {
    setApiError(null)
    try {
      const res = await authApi.register({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
        role,
      })
      const d = (res.data as { data?: Record<string, unknown> })?.data
      if (!d || typeof (d as { access_token?: string }).access_token !== 'string') {
        setApiError('Invalid response from server.')
        return
      }
      handleAuthSuccess(d as { access_token: string; refresh_token?: string; user?: unknown })
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; errors?: string[] } } }
      const msg = ax.response?.data?.message ?? ax.response?.data?.errors?.[0]
      setApiError(msg ?? 'Registration failed. Please try again.')
    }
  }

  const onGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential
    if (!idToken) {
      setApiError('Google sign-up was cancelled or failed.')
      return
    }
    setGoogleLoading(true)
    setApiError(null)
    localStorage.setItem('saralam_register_role', role)
    try {
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
      setApiError(msg ?? 'Google sign-up failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-2)]">
      {/* Left: brand */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-700)] p-10 text-white lg:flex">
        <Link to="/" className="font-display text-2xl font-bold">
          Saralam
        </Link>
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">
            Join India&apos;s service marketplace
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Whether you need a service or offer one, Saralam connects you directly — no middlemen.
          </p>
          <ul className="mt-8 space-y-4">
            {['Choose your role: Seeker or Provider', 'One account for jobs and services', 'Secure and transparent'].map((item, i) => (
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
            Create your account
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Select your role and sign up with Google or email.
          </p>

          {/* Role selection */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('seeker')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors',
                role === 'seeker'
                  ? 'border-[var(--color-primary-600)] bg-[var(--color-primary-50)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]'
              )}
            >
              <UserPlus className={cn('size-8', role === 'seeker' ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-text-muted)]')} />
              <span className="font-display font-semibold text-[var(--color-text-primary)]">
                I need services
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('provider')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors',
                role === 'provider'
                  ? 'border-[var(--color-primary-600)] bg-[var(--color-primary-50)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]'
              )}
            >
              <Briefcase className={cn('size-8', role === 'provider' ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-text-muted)]')} />
              <span className="font-display font-semibold text-[var(--color-text-primary)]">
                I offer services
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">Provider</span>
            </button>
          </div>

          <p className="mt-4 rounded-lg bg-[var(--color-surface-3)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
            {role === 'seeker'
              ? 'Post jobs and find services for events, marketing, and more.'
              : 'Onboard your services, get job alerts, and grow your business.'}
          </p>

          <div className="mt-8">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => setApiError('Google sign-up failed.')}
                useOneTap={false}
                theme="filled_black"
                size="large"
                width="100%"
                text="signup_with"
                type="standard"
              />
            </div>
            {googleLoading && (
              <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">
                Creating your account...
              </p>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[var(--color-surface)] px-2 text-[var(--color-text-muted)]">
                  or register with email
                </span>
              </div>
            </div>

            {apiError && (
              <div
                className="mb-4 rounded-lg border border-[var(--color-danger)] bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]"
                role="alert"
              >
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
              <Input
                label="Full name"
                type="text"
                autoComplete="name"
                error={errors.full_name?.message}
                {...register('full_name')}
              />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Phone (optional)"
                type="tel"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                error={errors.confirm_password?.message}
                {...register('confirm_password')}
              />
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="accept_terms"
                  className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
                  {...register('accept_terms')}
                />
                <label htmlFor="accept_terms" className="text-sm text-[var(--color-text-secondary)]">
                  I agree to the{' '}
                  <Link to="/terms" className="text-[var(--color-primary-600)] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-[var(--color-primary-600)] hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.accept_terms && (
                <p className="text-sm text-[var(--color-danger)]">{errors.accept_terms.message}</p>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={isSubmitting}
                disabled={googleLoading}
              >
                Create account
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[var(--color-primary-600)] hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
