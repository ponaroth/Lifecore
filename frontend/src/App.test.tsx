import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows each service status from its health endpoint', async () => {
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(
        url.startsWith('/api/audit')
          ? new Response('', { status: 503 })
          : new Response(JSON.stringify({ status: 'UP' }), { status: 200 }),
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)

    expect(await screen.findByText('Policy service: UP')).toBeInTheDocument()
    expect(await screen.findByText('Document service: UP')).toBeInTheDocument()
    expect(await screen.findByText('Audit service: DOWN')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/policy/actuator/health', expect.anything())
  })

  it('reports UNKNOWN when services are unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')))
    render(<App />)
    expect(await screen.findByText('Policy service: UNKNOWN')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Policy administration' })).toBeInTheDocument()
  })
})
