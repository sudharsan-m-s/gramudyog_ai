const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1'
export async function checkApi(): Promise<void> {
  const response = await fetch(baseUrl + '/health', { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error('Service unavailable')
  const body: unknown = await response.json()
  if (typeof body !== 'object' || body === null || !('status' in body) || body.status !== 'ok') {
    throw new Error('Unexpected service response')
  }
}
