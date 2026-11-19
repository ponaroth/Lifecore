export type ServiceStatus = 'UP' | 'DOWN' | 'UNKNOWN'

export const services = [
  { id: 'policy', name: 'Policy service' },
  { id: 'document', name: 'Document service' },
  { id: 'audit', name: 'Audit service' },
] as const

export type ServiceId = (typeof services)[number]['id']

/** Reads a service's Actuator health endpoint through the /api/<service> route. */
export async function fetchServiceStatus(
  service: ServiceId,
  signal?: AbortSignal,
): Promise<ServiceStatus> {
  try {
    const res = await fetch(`/api/${service}/actuator/health`, { signal })
    if (!res.ok) return 'DOWN'
    const body = (await res.json()) as { status?: string }
    return body.status === 'UP' ? 'UP' : 'DOWN'
  } catch {
    return 'UNKNOWN'
  }
}
