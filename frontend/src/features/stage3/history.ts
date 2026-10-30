export const HISTORY_KEY = 'gramudyog.assessment-ids.v1'
export function rememberAssessment(id: string) {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
    const ids = Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : []
    localStorage.setItem(HISTORY_KEY, JSON.stringify([id, ...ids.filter(value => value !== id)].slice(0, 20)))
  } catch { /* Saving on the server succeeds even when browser storage is disabled. */ }
}

