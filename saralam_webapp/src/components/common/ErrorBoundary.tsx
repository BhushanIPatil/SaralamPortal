import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { appConfig } from '@/config/env'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (appConfig.isDevelopment) {
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 py-12">
          <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">
            Something went wrong
          </h2>
          <p className="max-w-md text-center text-sm text-[var(--color-text-secondary)]">
            We encountered an error. Please try again.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="secondary"
          >
            Try again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
