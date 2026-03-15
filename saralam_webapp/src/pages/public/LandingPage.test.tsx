import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { LandingPage } from './LandingPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('LandingPage', () => {
  it('renders without crashing', () => {
    render(<LandingPage />, { wrapper: Wrapper })
    expect(document.body.textContent).toMatch(/Post a Job|Browse|Services|Saralam/i)
  })

  it('renders content section', () => {
    render(<LandingPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Post a Job \/ Browse Services/i)).toBeInTheDocument()
  })
})
