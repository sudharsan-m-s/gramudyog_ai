import { translate } from '../../lib/translations'
import { useState, type FormEvent } from 'react'
import type { Language } from '../intake/model'
import { calculateFinance, type FinanceInput, type FinanceResult } from '../../lib/api'

const money = (value: string) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(Number(value))

export function FinancePanel({ margin, onResult, language }: { margin: string; onResult: (result: FinanceResult | null) => void; language: Language }) {
  const [values, setValues] = useState<FinanceInput>({
    project_cost: '140000', margin_capital: margin,
    monthly_sales: '30000', monthly_operating_cost: '20000', working_capital_months: 1,
  })
  const [result, setResult] = useState<FinanceResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  function change(key: keyof FinanceInput, value: string) {
    setValues(previous => ({ ...previous, [key]: key === 'working_capital_months' ? Number(value) : value }))
    setResult(null)
    onResult(null)
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true); setError('')
    try { const calculated = await calculateFinance(values); setResult(calculated); onResult(calculated) }
    catch { setError(translate(language, "Could not calculate. Check values and connection, then retry.")) }
    finally { setBusy(false) }
  }
  const amounts = [0,5000,10000,15000,20000,25000,30000,40000,50000,75000,100000,125000,140000,150000,200000,300000,500000,1000000,2000000,5000000]
  const fields: { key: keyof FinanceInput; label: string; max: string }[] = [
    { key: 'project_cost', label: translate(language, "Project cost (\u20b9)"), max: '5000000' },
    { key: 'margin_capital', label: translate(language, "Available margin (\u20b9)"), max: '5000000' },
    { key: 'monthly_sales', label: translate(language, "Assumed monthly sales (\u20b9)"), max: '100000000' },
    { key: 'monthly_operating_cost', label: translate(language, "Assumed monthly operating cost (\u20b9)"), max: '100000000' },
  ]
  return <section className="mt-8 border-t border-stone-200 pt-7">
    <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">{translate(language, "What-if simulator \u00b7 indicative")}</p>
    <h3 className="mt-3 text-xl font-semibold">{translate(language, "Adjust your assumptions")}</h3>
    <p className="mt-2 text-sm text-stone-600">{translate(language, "These are your estimates, not predicted sales or a loan offer. Scheme defaults require official confirmation.")}</p>
    <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
      {fields.map(field => <div key={field.key}>
        <label className="label" htmlFor={field.key}>{field.label}</label>
        <select className="input" id={field.key} required value={values[field.key]}
          onChange={event => change(field.key, event.target.value)}>
          {amounts.filter(value => field.key !== 'project_cost' || value > 0).map(value =>
            <option key={value} value={value}>{money(String(value))}</option>)}
        </select>
      </div>)}
      <div>
        <label className="label" htmlFor="working_capital_months">{translate(language, "Working capital months")}</label>
        <select className="input" id="working_capital_months" value={values.working_capital_months}
          onChange={event => change('working_capital_months', event.target.value)}>
          {Array.from({length: 12}, (_, index) => index + 1).map(value =>
            <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
      <div className="self-end"><button className="primary w-full" disabled={busy}>{busy ? translate(language, "Calculating\u2026") : translate(language, "Calculate plan")}</button></div>
    </form>
    {error && <p role="alert" className="field-error mt-4">{error}</p>}
    {result && <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
      <p className="text-xs font-bold uppercase text-emerald-800">{translate(language, "Estimate")} · {translate(language, result.status)}</p>
      <h4 className="mt-2 text-lg font-semibold">{translate(language, result.scheme ?? "Outside supported scheme range")}</h4>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          [translate(language, "Indicative loan"), money(result.indicative_loan)], [translate(language, "Required 10% margin"), money(result.required_margin)],
          [translate(language, "Unfunded gap"), money(result.funding_gap)], [translate(language, "Monthly repayment after moratorium"), money(result.monthly_payment)],
          [translate(language, "Monthly surplus before debt"), money(result.monthly_surplus_before_debt)],
          [translate(language, "Working capital estimate"), money(result.working_capital_estimate)],
          [translate(language, "Repayment coverage"), result.repayment_coverage === null ? translate(language, "Unavailable") : result.repayment_coverage + '×'],
        ].map(([name, value]) => <div key={name}><dt className="text-xs text-stone-600">{name}</dt><dd className="font-semibold">{value}</dd></div>)}
      </dl>
      {result.repayment_coverage !== null && Number(result.repayment_coverage) < 1 &&
        <p className="mt-5 rounded-xl bg-amber-100 p-3 text-sm font-semibold">{translate(language, "Assumed monthly surplus does not cover the estimated repayment.")}</p>}
      <details className="mt-5 text-sm"><summary className="cursor-pointer font-semibold">{translate(language, "Formula, rules and assumptions")}</summary>
        <p className="mt-3">{translate(language, result.formula)}</p><p className="mt-2">{translate(language, "Rules version")}: {result.rules_version}. {translate(language, result.rules_source)}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">{result.assumptions.map(item => <li key={item}>{translate(language, item)}</li>)}</ul>
      </details>
      {result.schedule.length > 0 && <details className="mt-5 text-sm"><summary className="cursor-pointer font-semibold">{translate(language, "Repayment schedule")} ({result.schedule.length} {translate(language, "months")})</summary>
        <div className="mt-3 max-h-80 overflow-auto"><table className="w-full min-w-[500px] text-left text-xs">
          <thead><tr><th>{translate(language, "Month")}</th><th>{translate(language, "Phase")}</th><th>{translate(language, "Interest")}</th><th>{translate(language, "Principal")}</th><th>{translate(language, "Payment")}</th><th>{translate(language, "Balance")}</th></tr></thead>
          <tbody>{result.schedule.map(row => <tr key={row.month} className="border-t border-emerald-200">
            <td>{row.month}</td><td>{translate(language, row.phase)}</td><td>{money(row.interest)}</td><td>{money(row.principal)}</td><td>{money(row.payment)}</td><td>{money(row.closing_balance)}</td>
          </tr>)}</tbody>
        </table></div>
      </details>}
    </div>}
  </section>
}
