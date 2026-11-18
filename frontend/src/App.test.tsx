import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows the backend status from the health endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'UP' }), { status: 200 })),
    )
    render(<App />)
    expect(await screen.findByText('Backend: UP')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Policy administration' })).toBeInTheDocument()
  })

  it('reports UNKNOWN when the backend is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')))
    render(<App />)
    expect(await screen.findByText('Backend: UNKNOWN')).toBeInTheDocument()
  })
})
