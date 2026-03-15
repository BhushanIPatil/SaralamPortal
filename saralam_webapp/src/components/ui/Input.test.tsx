import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter email" />)
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
  })

  it('accepts and displays value', async () => {
    render(<Input placeholder="Name" />)
    const input = screen.getByPlaceholderText('Name')
    await userEvent.type(input, 'John')
    expect(input).toHaveValue('John')
  })
})
