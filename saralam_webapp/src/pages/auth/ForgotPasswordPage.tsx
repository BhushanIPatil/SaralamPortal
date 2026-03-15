import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api/endpoints/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
})

type Form = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: Form) => {
    setApiError(null)
    try {
      await authApi.forgotPassword({ email: values.email })
      setSent(true)
    } catch {
      setApiError('Something went wrong. Please try again or contact support.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-2)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Forgot password?
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        {sent ? (
          <div className="mt-6 rounded-lg bg-[var(--color-primary-50)] p-4 text-sm text-[var(--color-primary-800)]">
            Check your email for a reset link. If you don&apos;t see it, check spam.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {apiError && (
              <p className="text-sm text-[var(--color-danger)]" role="alert">{apiError}</p>
            )}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              Send reset link
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          <Link to="/login" className="text-[var(--color-primary-600)] hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
