import { useState, type FormEvent } from 'react'
import { calculateFinance, type FinanceInput, type FinanceResult } from '../../lib/api'

const money = (value: string) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(Number(value))

export function FinancePanel({ margin, onResult }: { margin: string; onResult: (result: FinanceResult | null) => void }) {
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
    catch { setError('Could not calculate. Check values and connection, then retry.') }
    finally { setBusy(false) }
  }
  const fields: { key: keyof FinanceInput; label: string; max: string }[] = [
    { key: 'project_cost', label: 'Project cost (₹)', max: '5000000' },
    { key: 'margin_capital', label: 'Available margin (₹)', max: '5000000' },
    { key: 'monthly_sales', label: 'Assumed monthly sales (₹)', max: '100000000' },
    { key: 'monthly_operating_cost', label: 'Assumed monthly operating cost (₹)', max: '100000000' },
  ]
  return <section className="mt-8 border-t border-stone-200 pt-7">
    <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">What-if simulator · indicative</p>
    <h3 className="mt-3 text-xl font-semibold">Adjust your assumptions</h3>
    <p className="mt-2 text-sm text-stone-600">These are your estimates, not predicted sales or a loan offer. Scheme defaults require official confirmation.</p>
    <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
      {fields.map(field => <div key={field.key}>
        <label className="label" htmlFor={field.key}>{field.label}</label>
        <input className="input" id={field.key} type="number" inputMode="decimal" min={field.key === 'project_cost' ? '0.01' : '0'}
          max={field.max} step="0.01" required value={values[field.key]}
          onChange={event => change(field.key, event.target.value)} />
      </div>)}
      <div>
        <label className="label" htmlFor="working_capital_months">Working capital months</label>
        <input className="input" id="working_capital_months" type="number" min="1" max="12" step="1"
          value={values.working_capital_months} onChange={event => change('working_capital_months', event.target.value)} />
      </div>
      <div className="self-end"><button className="primary w-full" disabled={busy}>{busy ? 'Calculating…' : 'Calculate plan'}</button></div>
    </form>
    {error && <p role="alert" className="field-error mt-4">{error}</p>}
    {result && <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
      <p className="text-xs font-bold uppercase text-emerald-800">Estimate · {result.status.replace('_', ' ')}</p>
      <h4 className="mt-2 text-lg font-semibold">{result.scheme ?? 'Outside supported scheme range'}</h4>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          ['Indicative loan', money(result.indicative_loan)], ['Required 10% margin', money(result.required_margin)],
          ['Unfunded gap', money(result.funding_gap)], ['Monthly repayment after moratorium', money(result.monthly_payment)],
          ['Monthly surplus before debt', money(result.monthly_surplus_before_debt)],
          ['Working capital estimate', money(result.working_capital_estimate)],
          ['Repayment coverage', result.repayment_coverage === null ? 'Unavailable' : result.repayment_coverage + '×'],
        ].map(([name, value]) => <div key={name}><dt className="text-xs text-stone-600">{name}</dt><dd className="font-semibold">{value}</dd></div>)}
      </dl>
      {result.repayment_coverage !== null && Number(result.repayment_coverage) < 1 &&
        <p className="mt-5 rounded-xl bg-amber-100 p-3 text-sm font-semibold">Assumed monthly surplus does not cover the estimated repayment.</p>}
      <details className="mt-5 text-sm"><summary className="cursor-pointer font-semibold">Formula, rules and assumptions</summary>
        <p className="mt-3">{result.formula}</p><p className="mt-2">Rules version: {result.rules_version}. {result.rules_source}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">{result.assumptions.map(item => <li key={item}>{item}</li>)}</ul>
      </details>
      {result.schedule.length > 0 && <details className="mt-5 text-sm"><summary className="cursor-pointer font-semibold">Repayment schedule ({result.schedule.length} months)</summary>
        <div className="mt-3 max-h-80 overflow-auto"><table className="w-full min-w-[500px] text-left text-xs">
          <thead><tr><th>Month</th><th>Phase</th><th>Interest</th><th>Principal</th><th>Payment</th><th>Balance</th></tr></thead>
          <tbody>{result.schedule.map(row => <tr key={row.month} className="border-t border-emerald-200">
            <td>{row.month}</td><td>{row.phase}</td><td>{money(row.interest)}</td><td>{money(row.principal)}</td><td>{money(row.payment)}</td><td>{money(row.closing_balance)}</td>
          </tr>)}</tbody>
        </table></div>
      </details>}
    </div>}
  </section>
}
