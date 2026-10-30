import { ObservationReview } from '../stage3/Tools'
import { rememberAssessment } from '../stage3/history'
import { translate } from '../../lib/translations'
import { useState } from 'react'
import type { AssessmentDraft } from '../intake/model'
import type { FinanceResult } from '../../lib/api'

const base = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1'

export function SaveAndReview({ draft, finance }: { draft: AssessmentDraft; finance: FinanceResult | null }) {
  const [id, setId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [reviewer, setReviewer] = useState('')
  const [observation, setObservation] = useState('')
  const [correction, setCorrection] = useState('')
  const [history, setHistory] = useState<{ id: string; reviewer: string; created_at: string; observation: string; correction: string }[]>([])
  async function save() {
    setBusy(true); setError('')
    try {
      const response = await fetch(base + '/assessments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment: draft, finance: finance?.inputs ?? null }), signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) throw new Error('Save failed')
      const result = await response.json() as { id: string }
      setId(result.id); setHistory([]); rememberAssessment(result.id)
    } catch { setError(translate(draft.language, "Could not save. Check your connection and retry.")) }
    finally { setBusy(false) }
  }
  async function review() {
    setBusy(true); setError('')
    try {
      const response = await fetch(base + '/officer/assessments/' + encodeURIComponent(id) + '/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ reviewer, observation, correction }), signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) throw new Error(response.status === 503 ? translate(draft.language, "Officer review is not configured on this server.") : translate(draft.language, "Review denied or invalid."))
      const item = await response.json() as typeof history[number]
      setHistory(current => [...current, item]); setObservation(''); setCorrection('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : translate(draft.language, "Review failed.")) }
    finally { setBusy(false) }
  }
  return <section className="mt-8 border-t border-stone-200 pt-7">
    <h3 className="text-xl font-semibold">{translate(draft.language, "Save and field review")}</h3>
    <p className="mt-2 text-sm text-stone-600">{(draft.language === 'ta' ? 'உறுதிப்படுத்திய விவரங்களும் கணக்கிட்ட நிதி உள்ளீடுகளும் சேமிக்கப்படும். மதிப்பீட்டு எண்ணைப் பாதுகாப்பாக வைத்திருங்கள்.' : 'Confirmed details and calculated financial inputs are saved. Keep the assessment ID private.')}</p>
    <button type="button" className="primary mt-4" onClick={save} disabled={busy}>{id ? (draft.language === 'ta' ? 'புதிய பதிப்பைச் சேமிக்கவும்' : 'Save another snapshot') : translate(draft.language, "Save assessment")}</button>
    {id && <p className="mt-3 break-all text-sm">{translate(draft.language, "Assessment ID:")}<strong>{id}</strong></p>}
    {id && <details className="mt-5 rounded-xl border border-stone-200 p-4">
      <summary className="cursor-pointer font-semibold">{translate(draft.language, "Officer verification")}</summary>
      <p className="mt-2 text-sm text-stone-600">{translate(draft.language, "Requires the server-configured officer token. It stays in this page\u2019s memory and is not stored.")}</p>
      <div className="mt-4 space-y-3">
        <label className="label" htmlFor="officer-token">{translate(draft.language, "Officer token")}</label>
        <input className="input" id="officer-token" type="password" autoComplete="off" value={token} onChange={event => setToken(event.target.value)} />
        <label className="label" htmlFor="reviewer">{translate(draft.language, "Reviewer name")}</label>
        <input className="input" id="reviewer" maxLength={120} value={reviewer} onChange={event => setReviewer(event.target.value)} />
        <label className="label" htmlFor="observation">{translate(draft.language, "Observation to check")}</label>
        <textarea className="input min-h-20" id="observation" maxLength={1000} value={observation} onChange={event => setObservation(event.target.value)} />
        <label className="label" htmlFor="correction">{translate(draft.language, "Correction or confirmation")}</label>
        <textarea className="input min-h-20" id="correction" maxLength={1000} value={correction} onChange={event => setCorrection(event.target.value)} />
        <button className="secondary" type="button" disabled={busy || !token || reviewer.length < 2 || observation.length < 2 || correction.length < 2} onClick={review}>{translate(draft.language, "Record review")}</button>
      </div>
      {history.length > 0 && <ol className="mt-5 space-y-2">{history.map(item => <li key={item.id} className="rounded-lg bg-stone-50 p-3 text-sm">
        <strong>{item.reviewer}</strong> · {new Date(item.created_at).toLocaleString()}<br />
        {item.observation} → {item.correction}
      </li>)}</ol>}
    </details>}
    <ObservationReview key={id} language={draft.language} assessmentId={id} />
    {error && <p role="alert" className="field-error mt-3">{error}</p>}
  </section>
}
