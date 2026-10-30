import { useState } from 'react'
import type { AssessmentDraft, Category } from '../intake/model'
import { categories } from '../intake/model'

interface Row { category: Category; data_status: string; cost_status: string; channels: string[]; risks: string[]; note: string }
const base = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1'

export function ComparisonPanel({ draft }: { draft: AssessmentDraft }) {
  const [selected, setSelected] = useState<Category[]>(draft.category ? [draft.category] : [])
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  function toggle(value: Category) {
    setSelected(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value].slice(0, 3))
    setRows([])
  }
  async function compare() {
    setBusy(true); setError('')
    try {
      const response = await fetch(base + '/compare', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment: draft, categories: selected }), signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) throw new Error('Comparison failed')
      const body = await response.json() as { rows: Row[] }
      setRows(body.rows)
    } catch { setError('Could not compare. Check the connection and retry.') }
    finally { setBusy(false) }
  }
  return <section className="mt-8 border-t border-stone-200 pt-7">
    <h3 className="text-xl font-semibold">Compare business categories</h3>
    <p className="mt-2 text-sm text-stone-600">Choose up to three for the same location and margin. Costs require your assumptions.</p>
    <div className="mt-4 grid gap-2 sm:grid-cols-2">{categories.map(category =>
      <label key={category.value} className="flex min-h-12 items-center gap-3 rounded-xl border border-stone-200 p-3">
        <input type="checkbox" checked={selected.includes(category.value)}
          disabled={!selected.includes(category.value) && selected.length >= 3}
          onChange={() => toggle(category.value)} />{category[draft.language]}
      </label>)}</div>
    <button type="button" className="primary mt-4" disabled={!selected.length || busy} onClick={compare}>{busy ? 'Comparing…' : 'Compare selected'}</button>
    {error && <p role="alert" className="field-error mt-3">{error}</p>}
    {rows.length > 0 && <>
      <p className="mt-5 text-sm">Qualitative sample prompts only. No ranking or predicted success.</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">{rows.map(row =>
        <article key={row.category} className="rounded-xl border border-stone-200 p-4 text-sm">
          <h4 className="font-semibold">{categories.find(item => item.value === row.category)?.[draft.language]}</h4>
          <p className="mt-2">Data: {row.data_status} · Costs: {row.cost_status}</p>
          <p className="mt-3 font-semibold">Channels to check</p><p>{row.channels.join(', ') || 'Unavailable'}</p>
          <p className="mt-3 font-semibold">Risks to check</p><p>{row.risks.join(', ') || 'Unavailable'}</p>
          <p className="mt-3 text-xs text-stone-600">{row.note}</p>
        </article>)}</div>
    </>}
  </section>
}
