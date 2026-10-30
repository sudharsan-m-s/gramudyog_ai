import { AssessmentHistory, AudioGuide, BreakEven, CostBuilder, SurveyChecklist } from '../features/stage3/Tools'
import { translate } from '../lib/translations'
import { useEffect, useState, type FormEvent } from 'react'
import { previewAssessment, loadEvidence, type EvidenceResponse, type FinanceResult, type FinanceInput } from '../lib/api'
import { EvidencePanel } from '../features/evidence/EvidencePanel'
import { FinancePanel } from '../features/finance/FinancePanel'
import { ComparisonPanel } from '../features/comparison/ComparisonPanel'
import { DraftReport } from '../features/report/DraftReport'
import { SaveAndReview } from '../features/officer/SaveAndReview'
import { categories, copy, type AssessmentDraft, type AssessmentPreview, type Language } from '../features/intake/model'

const initial: AssessmentDraft = {
  language: 'en', village: '', block: '', district: '', margin_capital: '', category: '', radius_km: 5,
}

const regions = [
  { village: 'Sulur', block: 'Sulur', district: 'Coimbatore' },
  { village: 'Palladam', block: 'Palladam', district: 'Tiruppur' },
  { village: 'Perundurai', block: 'Perundurai', district: 'Erode' },
  { village: 'Omalur', block: 'Omalur', district: 'Salem' },
  { village: 'Melur', block: 'Melur', district: 'Madurai' },
]

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
  const [projectCost, setProjectCost] = useState('140000')
  const [restoredFinance, setRestoredFinance] = useState<FinanceInput | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [requestState, setRequestState] = useState<'idle' | 'loading' | 'error'>('idle')
  const t = copy[draft.language]
  useEffect(() => { document.documentElement.lang = draft.language }, [draft.language])

  function update<K extends keyof AssessmentDraft>(key: K, value: AssessmentDraft[K]) {
    setDraft(previous => ({ ...previous, [key]: value }))
    setErrors(previous => ({ ...previous, [key]: '' }))
    setPreview(null)
    setEvidence(null)
    setFinance(null)
    setProjectCost('140000')
    setRestoredFinance(null)
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
      <select id={key} name={key} value={draft[key]} required
        aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? key + '-error' : undefined}
        onChange={event => {
          const region = regions.find(item => item[key] === event.target.value)
          if (region) { setDraft(previous => ({ ...previous, ...region })); setErrors({}); setPreview(null); setEvidence(null); setFinance(null); setProjectCost('140000'); setRestoredFinance(null) }
        }} className="input">
        <option value="">{translate(draft.language, "-- Select --")}</option>
        {regions.map(region => <option key={region.district} value={region[key]}>{translate(draft.language, region[key])}</option>)}
      </select>
      {errors[key] && <p id={key + '-error'} className="field-error">{errors[key]}</p>}
    </div>
  )

  return (
    <>
      <a className="skip-link" href="#main">{translate(draft.language, "Skip to content")}</a>
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-5 sm:px-8">
        <a href="/" className="text-xl font-bold tracking-tight" aria-label={draft.language === 'ta' ? 'GramUdyog AI முகப்பு' : 'GramUdyog AI home'}>GramUdyog<span className="text-emerald-700">.AI</span></a>
        <span className="rounded-full border border-emerald-900/15 px-3 py-1 text-xs font-semibold">SIH26091 · MVP</span>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-5 pb-20 pt-8 sm:px-8 sm:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_330px] lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">GramUdyog.AI</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{t.home}</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600">{t.subtitle}</p>
            {step !== 'welcome' && (
              <ol className="mt-9 flex gap-2" aria-label={draft.language === 'ta' ? 'மதிப்பீட்டு முன்னேற்றம்' : 'Assessment progress'}>
                {['details', 'confirm', 'evidence'].map((item, index) => (
                  <li key={item} className={'h-1.5 flex-1 rounded-full ' + (
                    ['details', 'confirm', 'evidence'].indexOf(step) >= index ? 'bg-emerald-800' : 'bg-stone-200'
                  )}><span className="sr-only">{draft.language === 'ta' ? 'படி' : 'Step'} {index + 1}: {translate(draft.language, item)}</span></li>
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
                <AudioGuide language={draft.language} />
                <AssessmentHistory language={draft.language} onOpen={saved => { setDraft(saved.payload.assessment); setPreview(null); setEvidence(null); setFinance(null); setRestoredFinance(saved.payload.finance ?? null); setProjectCost(saved.payload.finance?.project_cost ?? '140000'); setStep('details') }} />
                <button type="button" onClick={() => setStep('details')} className="primary mt-8">{t.start} <span aria-hidden="true">→</span></button>
              </>}
              {step === 'details' && <>
                <h2 className="text-2xl font-semibold">{t.details}</h2>
                <p className="mt-2 text-sm text-stone-600">{t.location}</p>
                <form onSubmit={submitDetails} noValidate className="mt-6 space-y-5">
                  {field('village', t.village)}
                  
                  <div className="grid gap-5 sm:grid-cols-2">{field('block', t.block)}{field('district', t.district)}</div>
                  <div>
                    <label htmlFor="margin_capital" className="label">{t.margin}</label>
                    <select id="margin_capital" value={draft.margin_capital} onChange={event => update('margin_capital', event.target.value)}
                      aria-invalid={Boolean(errors.margin_capital)} aria-describedby={errors.margin_capital ? 'capital-error' : undefined}
                      className="input" required>
                      <option value="">{translate(draft.language, "Select available capital")}</option>
                      {[5000,10000,15000,20000,25000,50000,75000,100000,150000,200000,300000,500000,1000000,2000000,5000000].map(value =>
                        <option key={value} value={value}>{formatMoney(String(value), draft.language)}</option>)}
                    </select>
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
                  {[[t.village, translate(draft.language, draft.village)], [t.block, translate(draft.language, draft.block)], [t.district, translate(draft.language, draft.district)],
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
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">{t.evidence} · {translate(draft.language, evidence?.coverage ?? preview.evidence_status)}</p>
                <h2 className="mt-3 text-2xl font-semibold">{evidence?.coverage === "sample" ? translate(draft.language, "Sample prompts for field checks") : t.unavailable}</h2>
                <p className="mt-4 leading-relaxed text-stone-600">{evidence?.coverage === "sample" ? translate(draft.language, "Synthetic demonstration only. Customer counts, competitors, and local prices remain unavailable. Verify these prompts in the field.") : t.caveat}</p>
                <div className="mt-6 rounded-xl bg-stone-50 p-4 text-sm">
                  <p><strong>{t.location}:</strong> {translate(draft.language, preview.input.village)}, {translate(draft.language, preview.input.block)}, {translate(draft.language, preview.input.district)} ({preview.input.radius_km} km)</p>
                  <p className="mt-2"><strong>{t.category}:</strong> {label}</p>
                  <p className="mt-2"><strong>{t.margin}:</strong> {formatMoney(String(preview.input.margin_capital), draft.language)}</p>
                </div>
                {evidence && <EvidencePanel evidence={evidence} language={draft.language} />}
                <AudioGuide language={draft.language} summary={draft.language === 'ta'
                  ? 'இவை செயற்கை மாதிரித் தகவல்கள். வாடிக்கையாளர் எண்ணிக்கை, போட்டியாளர்கள் மற்றும் உள்ளூர் விலைகள் கிடைக்கவில்லை. ' + (finance ? 'உத்தேசக் கடன் ' + finance.indicative_loan + ' ரூபாய். மாதத் தவணை ' + finance.monthly_payment + ' ரூபாய். இவை மதிப்பீடுகள் மட்டுமே; கடன் ஒப்புதல் அல்ல.' : 'நிதித் திட்டத்தைக் கணக்கிட்டு முடிவுகளை அறியவும்.')
                  : 'These are synthetic sample observations. Customer counts, competitors, and local prices are unavailable. ' + (finance ? 'Indicative loan is ' + finance.indicative_loan + ' rupees. Monthly payment is ' + finance.monthly_payment + ' rupees. These are estimates, not loan approval.' : 'Calculate the financial plan to hear the results.')} />
                <SurveyChecklist language={draft.language} />
                <CostBuilder language={draft.language} onCost={value => { setProjectCost(value); setFinance(null); setRestoredFinance(null) }} />
                <FinancePanel key={draft.margin_capital + draft.category + projectCost} margin={draft.margin_capital} onResult={setFinance} language={draft.language} projectCost={projectCost} restored={restoredFinance} />
                <BreakEven key={finance?.monthly_payment ?? "none"} language={draft.language} debtPayment={finance?.monthly_payment ?? "0"} />
                <ComparisonPanel key={draft.category} draft={draft} />
                {evidence && <DraftReport draft={draft} evidence={evidence} finance={finance} />}
                <SaveAndReview draft={draft} finance={finance} />
                <p className="mt-5 text-sm text-stone-600">{t.notSaved}</p>
                <button className="secondary mt-5" type="button" onClick={() => setStep('details')}>{t.edit}</button>
              </>}
            </section>
          </div>
          <aside className="self-start rounded-3xl bg-emerald-950 p-7 text-white lg:mt-16" aria-label={draft.language === 'ta' ? 'மாதிரியின் வரம்புகள்' : 'Prototype limitations'}>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">{translate(draft.language, "About this prototype")}</p>
            <h2 className="mt-5 text-2xl font-semibold">{translate(draft.language, "Evidence you can inspect.")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-emerald-100/80">{translate(draft.language, "Your location and budget are checked before an assessment. Explore sample market prompts, financial scenarios, and a draft report.")}</p>
            <p className="mt-8 border-t border-emerald-800 pt-6 text-xs leading-relaxed text-emerald-100/70">{translate(draft.language, "No live market data or loan approval is provided. Your entries are sent to the local API for validation when you confirm; they are only saved when you choose Save assessment.")}</p>
          </aside>
        </div>
      </main>
      <footer className="mx-auto max-w-5xl px-5 pb-8 text-xs text-stone-600 sm:px-8">GramUdyog.AI · SIH26091 · {draft.language === 'ta' ? 'மாதிரி செயலி' : 'Intake prototype'}</footer>
    </>
  )
}

