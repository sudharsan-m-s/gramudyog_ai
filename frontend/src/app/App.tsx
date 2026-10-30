import { useState, type FormEvent } from 'react'
import { previewAssessment, loadEvidence, type EvidenceResponse, type FinanceResult } from '../lib/api'
import { EvidencePanel } from '../features/evidence/EvidencePanel'
import { FinancePanel } from '../features/finance/FinancePanel'
import { ComparisonPanel } from '../features/comparison/ComparisonPanel'
import { DraftReport } from '../features/report/DraftReport'
import { SaveAndReview } from '../features/officer/SaveAndReview'
import { VoiceInput } from '../features/voice/VoiceInput'
import { categories, copy, type AssessmentDraft, type AssessmentPreview, type Language } from '../features/intake/model'

const initial: AssessmentDraft = {
  language: 'en', village: '', block: '', district: '', margin_capital: '', category: '', radius_km: 5,
}

type Step = 'welcome' | 'details' | 'confirm' | 'evidence'

function formatMoney(value: string, language: Language) {
  return new Intl.NumberFormat(language === 'ta' ? 'ta-IN' : 'en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2,
  }).format(Number(value))
}

export default function App() {
  const [draft, setDraft] = useState<AssessmentDraft>(initial)
  const [step, setStep] = useState<Step>('welcome')
  const [preview, setPreview] = useState<AssessmentPreview | null>(null)
  const [evidence, setEvidence] = useState<EvidenceResponse | null>(null)
  const [finance, setFinance] = useState<FinanceResult | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [requestState, setRequestState] = useState<'idle' | 'loading' | 'error'>('idle')
  const t = copy[draft.language]

  function update<K extends keyof AssessmentDraft>(key: K, value: AssessmentDraft[K]) {
    setDraft(previous => ({ ...previous, [key]: value }))
    setErrors(previous => ({ ...previous, [key]: '' }))
    setPreview(null)
    setEvidence(null)
    setFinance(null)
  }

  function validate() {
    const next: Record<string, string> = {}
    for (const key of ['village', 'block', 'district'] as const) {
      const value = draft[key].trim()
      if (value.length < 2 || value.length > 120 || Array.from(value).some(character => character.charCodeAt(0) < 32)) next[key] = t.required
    }
    const capital = Number(draft.margin_capital)
    if (!/^\d+(\.\d{1,2})?$/.test(draft.margin_capital) || capital <= 0 || capital > 5000000) next.margin_capital = t.positive
    if (!draft.category) next.category = t.select
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (validate()) setStep('confirm')
  }

  async function confirm() {
    if (!validate()) { setStep('details'); return }
    setRequestState('loading')
    try {
      const result = await previewAssessment({
        ...draft, village: draft.village.trim(), block: draft.block.trim(), district: draft.district.trim(),
      })
      setPreview(result)
      setEvidence(await loadEvidence(result.input))
      setStep('evidence')
      setRequestState('idle')
    } catch {
      setRequestState('error')
    }
  }

  const chosen = categories.find(category => category.value === draft.category)
  const label = chosen?.[draft.language] ?? ''
  const field = (key: 'village' | 'block' | 'district', labelText: string) => (
    <div>
      <label htmlFor={key} className="label">{labelText}</label>
      <input id={key} name={key} value={draft[key]} maxLength={120} required
        aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? key + '-error' : undefined}
        onChange={event => update(key, event.target.value)} className="input" autoComplete="off" />
      {errors[key] && <p id={key + '-error'} className="field-error">{errors[key]}</p>}
    </div>
  )

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-5 sm:px-8">
        <a href="/" className="text-xl font-bold tracking-tight" aria-label="GramUdyog AI home">GramUdyog<span className="text-emerald-700">.AI</span></a>
        <span className="rounded-full border border-emerald-900/15 px-3 py-1 text-xs font-semibold">SIH26091 · MVP</span>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-5 pb-20 pt-8 sm:px-8 sm:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_330px] lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">GramUdyog.AI</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{t.home}</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600">{t.subtitle}</p>
            {step !== 'welcome' && (
              <ol className="mt-9 flex gap-2" aria-label="Assessment progress">
                {['details', 'confirm', 'evidence'].map((item, index) => (
                  <li key={item} className={'h-1.5 flex-1 rounded-full ' + (
                    ['details', 'confirm', 'evidence'].indexOf(step) >= index ? 'bg-emerald-800' : 'bg-stone-200'
                  )}><span className="sr-only">Step {index + 1}: {item}</span></li>
                ))}
              </ol>
            )}
            <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-8" aria-live="polite">
              {step === 'welcome' && <>
                <h2 className="text-2xl font-semibold">{t.language}</h2>
                <div className="mt-5 flex flex-wrap gap-3" role="group" aria-label={t.language}>
                  {([['en', 'English'], ['ta', 'தமிழ்']] as const).map(([value, label]) => (
                    <button key={value} type="button" onClick={() => update('language', value)}
                      aria-pressed={draft.language === value}
                      className={'min-h-12 rounded-xl border px-6 font-semibold ' + (draft.language === value ? 'border-emerald-800 bg-emerald-50 text-emerald-900' : 'border-stone-300')}>
                      {label}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setStep('details')} className="primary mt-8">{t.start} <span aria-hidden="true">→</span></button>
              </>}
              {step === 'details' && <>
                <h2 className="text-2xl font-semibold">{t.details}</h2>
                <p className="mt-2 text-sm text-stone-600">{t.location}</p>
                <form onSubmit={submitDetails} noValidate className="mt-6 space-y-5">
                  {field('village', t.village)}
                  <VoiceInput language={draft.language} onValue={value => update('village', value)} />
                  <div className="grid gap-5 sm:grid-cols-2">{field('block', t.block)}{field('district', t.district)}</div>
                  <div>
                    <label htmlFor="margin_capital" className="label">{t.margin}</label>
                    <input id="margin_capital" type="number" inputMode="decimal" min="0.01" max="5000000" step="0.01"
                      value={draft.margin_capital} onChange={event => update('margin_capital', event.target.value)}
                      aria-invalid={Boolean(errors.margin_capital)} aria-describedby={errors.margin_capital ? 'capital-error' : undefined}
                      className="input" required />
                    {errors.margin_capital && <p id="capital-error" className="field-error">{errors.margin_capital}</p>}
                  </div>
                  <div>
                    <label htmlFor="category" className="label">{t.category}</label>
                    <select id="category" value={draft.category} onChange={event => update('category', event.target.value as AssessmentDraft['category'])}
                      aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? 'category-error' : undefined}
                      className="input" required>
                      <option value="">—</option>
                      {categories.map(category => <option key={category.value} value={category.value}>{category[draft.language]}</option>)}
                    </select>
                    {errors.category && <p id="category-error" className="field-error">{errors.category}</p>}
                  </div>
                  <div>
                    <label htmlFor="radius" className="label">{t.radius}</label>
                    <select id="radius" className="input" value={draft.radius_km} onChange={event => update('radius_km', Number(event.target.value))}>
                      <option value={5}>5 km</option><option value={10}>10 km</option>
                    </select>
                  </div>
                  {Object.values(errors).some(Boolean) && <p role="alert" className="field-error">{t.validation}</p>}
                  <div className="flex flex-wrap gap-3 pt-3">
                    <button className="primary" type="submit">{t.next} →</button>
                    <button className="secondary" type="button" onClick={() => setStep('welcome')}>{t.back}</button>
                  </div>
                </form>
              </>}
              {step === 'confirm' && <>
                <h2 className="text-2xl font-semibold">{t.confirm}</h2>
                <dl className="mt-6 divide-y divide-stone-100">
                  {[[t.village, draft.village], [t.block, draft.block], [t.district, draft.district],
                    [t.margin, formatMoney(draft.margin_capital, draft.language)], [t.category, label],
                    [t.radius, draft.radius_km + ' km']].map(([name, value]) => (
                      <div key={name} className="flex justify-between gap-4 py-3 text-sm">
                        <dt className="text-stone-600">{name}</dt><dd className="text-right font-semibold">{value}</dd>
                      </div>
                    ))}
                </dl>
                {requestState === 'error' && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{t.offline}</p>}
                <div className="mt-7 flex flex-wrap gap-3">
                  <button className="primary" type="button" disabled={requestState === 'loading'} onClick={confirm}>
                    {requestState === 'loading' ? t.loading : requestState === 'error' ? t.retry : t.submit}
                  </button>
                  <button className="secondary" type="button" onClick={() => setStep('details')}>{t.edit}</button>
                </div>
              </>}
              {step === 'evidence' && preview && <>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">{t.evidence} · {evidence?.coverage ?? preview.evidence_status}</p>
                <h2 className="mt-3 text-2xl font-semibold">{evidence?.coverage === "sample" ? "Sample prompts for field checks" : t.unavailable}</h2>
                <p className="mt-4 leading-relaxed text-stone-600">{evidence?.coverage === "sample" ? "Synthetic demonstration only. Customer counts, competitors, and local prices remain unavailable. Verify these prompts in the field." : t.caveat}</p>
                <div className="mt-6 rounded-xl bg-stone-50 p-4 text-sm">
                  <p><strong>{t.location}:</strong> {preview.input.village}, {preview.input.block}, {preview.input.district} ({preview.input.radius_km} km)</p>
                  <p className="mt-2"><strong>{t.category}:</strong> {label}</p>
                  <p className="mt-2"><strong>{t.margin}:</strong> {formatMoney(String(preview.input.margin_capital), draft.language)}</p>
                </div>
                {evidence && <EvidencePanel evidence={evidence} />}
                <FinancePanel key={draft.margin_capital + draft.category} margin={draft.margin_capital} onResult={setFinance} />
                <ComparisonPanel key={draft.category} draft={draft} />
                {evidence && <DraftReport draft={draft} evidence={evidence} finance={finance} />}
                <SaveAndReview draft={draft} />
                <p className="mt-5 text-sm text-stone-600">{t.notSaved}</p>
                <button className="secondary mt-5" type="button" onClick={() => setStep('details')}>{t.edit}</button>
              </>}
            </section>
          </div>
          <aside className="self-start rounded-3xl bg-emerald-950 p-7 text-white lg:mt-16" aria-label="Prototype limitations">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">About this prototype</p>
            <h2 className="mt-5 text-2xl font-semibold">Evidence you can inspect.</h2>
            <p className="mt-4 text-sm leading-relaxed text-emerald-100/80">Your location and budget are checked before an assessment. Market observations, financial planning, and draft reports will be added in the next levels.</p>
            <p className="mt-8 border-t border-emerald-800 pt-6 text-xs leading-relaxed text-emerald-100/70">No live market data or loan approval is provided. Your entries are sent to the local API for validation when you confirm; they are not saved at this stage.</p>
          </aside>
        </div>
      </main>
      <footer className="mx-auto max-w-5xl px-5 pb-8 text-xs text-stone-600 sm:px-8">GramUdyog.AI · SIH26091 · Intake prototype</footer>
    </>
  )
}

