export type BackendStatus = 'UP' | 'DOWN' | 'UNKNOWN'

/** Reads the backend's Actuator health endpoint (proxied by Vite in development). */
export async function fetchBackendStatus(signal?: AbortSignal): Promise<BackendStatus> {
  try {
    const res = await fetch('/actuator/health', { signal })
    if (!res.ok) return 'DOWN'
    const body = (await res.json()) as { status?: string }
    return body.status === 'UP' ? 'UP' : 'DOWN'
  } catch {
    return 'UNKNOWN'
  }
}
