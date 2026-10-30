export type EvidenceStatus = 'verified' | 'estimated' | 'sample' | 'user-entered' | 'unavailable'
export interface Evidence<T = unknown> {
  id: string
  value: T | null
  status: EvidenceStatus
  source: string
  observedAt: string | null
  assumptions: string[]
}
