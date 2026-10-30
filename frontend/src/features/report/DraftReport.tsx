import { translate } from '../../lib/translations'
import { useState } from 'react'
import type { AssessmentDraft } from '../intake/model'
import type { EvidenceResponse, FinanceResult } from '../../lib/api'

export function DraftReport({ draft, evidence, finance }: { draft: AssessmentDraft; evidence: EvidenceResponse; finance: FinanceResult | null }) {
  const [notes, setNotes] = useState('')
  return <section className="mt-8 border-t border-stone-200 pt-7">
    <h3 className="text-xl font-semibold">{translate(draft.language, "Draft project report")}</h3>
    <p className="mt-2 text-sm text-stone-600">{translate(draft.language, "Editable field notes and print-ready summary. Draft for officer review; not a sanction or verified feasibility finding.")}</p>
    <div className="report-print mt-5 rounded-xl border border-stone-200 p-5">
      <p className="text-xs font-bold uppercase tracking-widest">{translate(draft.language, "DRAFT \u00b7 GramUdyog.AI \u00b7 SIH26091")}</p>
      <h4 className="mt-3 text-lg font-semibold">{translate(draft.language, "Proposed business assessment")}</h4>
      <dl className="mt-4 text-sm">
        <div><dt className="inline font-semibold">{translate(draft.language, "Location:")}</dt><dd className="inline">{translate(draft.language, draft.village)}, {translate(draft.language, draft.block)}, {translate(draft.language, draft.district)}</dd></div>
        <div><dt className="inline font-semibold">{translate(draft.language, "Radius:")}</dt><dd className="inline">{draft.radius_km} km</dd></div>
        <div><dt className="inline font-semibold">{translate(draft.language, "Category:")}</dt><dd className="inline">{translate(draft.language, draft.category)}</dd></div>
        <div><dt className="inline font-semibold">{translate(draft.language, "Available margin:")}</dt><dd className="inline">₹{draft.margin_capital}</dd></div>
        <div><dt className="inline font-semibold">{translate(draft.language, "Market evidence:")}</dt><dd className="inline">{translate(draft.language, evidence.coverage)}; {translate(draft.language, "customer counts, competitors, and local prices unavailable.")}</dd></div>
      </dl>
      <div className="mt-4 text-sm">
        <p><strong>{translate(draft.language, "Indicative plan:")}</strong> {finance ? (translate(draft.language, finance.scheme ?? "Outside supported scheme range")) : translate(draft.language, "Not calculated")}</p>
        {finance && <>
          <p>{translate(draft.language, "Project cost")}: ₹{finance.inputs.project_cost} · {translate(draft.language, "Indicative loan")}: ₹{finance.indicative_loan} · {translate(draft.language, "Unfunded gap")}: ₹{finance.funding_gap}</p>
          <p>{translate(draft.language, "Assumed monthly sales")}: ₹{finance.inputs.monthly_sales} · {translate(draft.language, "Operating cost")}: ₹{finance.inputs.monthly_operating_cost}<br />{translate(draft.language, "Monthly repayment after moratorium")}: ₹{finance.monthly_payment} · {translate(draft.language, "Coverage")}: {finance.repayment_coverage ?? translate(draft.language, "unavailable")}</p>
          <p>{translate(draft.language, "Rules")}: {finance.rules_version} · {translate(draft.language, finance.rules_source)}</p>
        </>}
      </div>
      <p className="mt-4 text-sm">{translate(draft.language, "Source")}: {evidence.coverage === 'sample' ? translate(draft.language, "GramUdyog.AI synthetic demonstration dataset") : translate(draft.language, "No local source")}. {translate(draft.language, "Observation date: unavailable.")}</p>
      <p className="mt-3 text-sm whitespace-pre-wrap"><strong>{translate(draft.language, "Field notes:")}</strong> {notes || translate(draft.language, "Pending field verification.")}</p>
    </div>
    <label className="label mt-5" htmlFor="field-notes">{translate(draft.language, "Edit field notes")}</label>
    <textarea className="input min-h-28" id="field-notes" maxLength={3000} value={notes} onChange={event => setNotes(event.target.value)} />
    <button type="button" className="secondary mt-4" onClick={() => window.print()}>{translate(draft.language, "Print or save as PDF")}</button>
  </section>
}
