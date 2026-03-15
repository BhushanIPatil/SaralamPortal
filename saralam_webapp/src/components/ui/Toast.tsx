import { Toaster as HotToaster } from 'react-hot-toast'

export function Toast() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
        },
        success: {
          iconTheme: { primary: 'var(--color-success)', secondary: 'white' },
        },
        error: {
          iconTheme: { primary: 'var(--color-danger)', secondary: 'white' },
        },
      }}
    />
  )
}
