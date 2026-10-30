import { useState } from 'react'
import type { AssessmentDraft } from '../intake/model'
import type { EvidenceResponse, FinanceResult } from '../../lib/api'

export function DraftReport({ draft, evidence, finance }: { draft: AssessmentDraft; evidence: EvidenceResponse; finance: FinanceResult | null }) {
  const [notes, setNotes] = useState('')
  return <section className="mt-8 border-t border-stone-200 pt-7">
    <h3 className="text-xl font-semibold">Draft project report</h3>
    <p className="mt-2 text-sm text-stone-600">Editable field notes and print-ready summary. Draft for officer review; not a sanction or verified feasibility finding.</p>
    <div className="report-print mt-5 rounded-xl border border-stone-200 p-5">
      <p className="text-xs font-bold uppercase tracking-widest">DRAFT · GramUdyog.AI · SIH26091</p>
      <h4 className="mt-3 text-lg font-semibold">Proposed business assessment</h4>
      <dl className="mt-4 text-sm">
        <div><dt className="inline font-semibold">Location: </dt><dd className="inline">{draft.village}, {draft.block}, {draft.district}</dd></div>
        <div><dt className="inline font-semibold">Radius: </dt><dd className="inline">{draft.radius_km} km</dd></div>
        <div><dt className="inline font-semibold">Category: </dt><dd className="inline">{draft.category}</dd></div>
        <div><dt className="inline font-semibold">Available margin: </dt><dd className="inline">₹{draft.margin_capital}</dd></div>
        <div><dt className="inline font-semibold">Market evidence: </dt><dd className="inline">{evidence.coverage}; customer counts, competitors, and local prices unavailable.</dd></div>
      </dl>
      <div className="mt-4 text-sm">
        <p><strong>Indicative plan:</strong> {finance ? (finance.scheme ?? 'Outside supported scheme range') : 'Not calculated'}</p>
        {finance && <>
          <p>Project cost: ₹{finance.inputs.project_cost} · Indicative loan: ₹{finance.indicative_loan} · Funding gap: ₹{finance.funding_gap}</p>
          <p>Assumed monthly sales: ₹{finance.inputs.monthly_sales} · Operating cost: ₹{finance.inputs.monthly_operating_cost}<br />Monthly payment after moratorium: ₹{finance.monthly_payment} · Coverage: {finance.repayment_coverage ?? 'unavailable'}</p>
          <p>Rules: {finance.rules_version} · {finance.rules_source}</p>
        </>}
      </div>
      <p className="mt-4 text-sm">Source: {evidence.coverage === 'sample' ? 'GramUdyog.AI synthetic demonstration dataset' : 'No local source'}. Observation date: unavailable.</p>
      <p className="mt-3 text-sm whitespace-pre-wrap"><strong>Field notes:</strong> {notes || 'Pending field verification.'}</p>
    </div>
    <label className="label mt-5" htmlFor="field-notes">Edit field notes</label>
    <textarea className="input min-h-28" id="field-notes" maxLength={3000} value={notes} onChange={event => setNotes(event.target.value)} />
    <button type="button" className="secondary mt-4" onClick={() => window.print()}>Print or save as PDF</button>
  </section>
}
