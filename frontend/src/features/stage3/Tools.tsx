import { translate } from '../../lib/translations'
import { HISTORY_KEY } from './history'
import { useEffect, useState, type FormEvent } from 'react'
import type { AssessmentDraft } from '../intake/model'
import type { FinanceInput } from '../../lib/api'

const base = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? '/api/v1' : 'http://127.0.0.1:8000/api/v1')
const rupees = (value: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value))
type Lang = 'en' | 'ta'
const label = (lang: Lang, en: string, ta: string) => lang === 'ta' ? ta : en
const amounts = [0, 5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 125000, 140000, 150000, 200000, 300000, 500000, 1000000, 2000000, 5000000]

async function post<T>(url: string, body: unknown, token?: string): Promise<T> {
  const response = await fetch(base + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: JSON.stringify(body), signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error(String(response.status))
  return response.json() as Promise<T>
}

function MoneySelect({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return <select className="input" id={id} value={value} onChange={event => onChange(event.target.value)}>
    {!amounts.includes(Number(value)) && <option value={value}>{rupees(value)}</option>}
    {amounts.map(value => <option key={value} value={value}>{rupees(value)}</option>)}
  </select>
}

export function SurveyChecklist({ language }: { language: Lang }) {
  const questions = [
    ['Customers: What do you buy, how often, and what would you pay?', 'வாடிக்கையாளர்கள்: என்ன வாங்குகிறீர்கள், எவ்வளவு அடிக்கடி, என்ன விலை செலுத்துவீர்கள்?'],
    ['Competitors: Who already offers this nearby, and at what price?', 'போட்டியாளர்கள்: அருகில் யார் இதை விற்கிறார்கள்? விலை எவ்வளவு?'],
    ['Suppliers: What are the prices, minimum order, and delivery time?', 'விநியோகஸ்தர்கள்: விலை, குறைந்தபட்ச ஆர்டர், விநியோக நேரம் என்ன?'],
    ['Seasonality: Which months are busy or quiet, and why?', 'பருவகாலம்: எந்த மாதங்களில் தேவை அதிகம் அல்லது குறைவு? ஏன்?'],
    ['Payments: How and when do customers prefer to pay?', 'கட்டணம்: வாடிக்கையாளர்கள் எவ்வாறு, எப்போது செலுத்த விரும்புகிறார்கள்?'],
  ]
  return <section className="mt-8 border-t border-stone-200 pt-7">
    <h3 className="text-xl font-semibold">{label(language, 'Field survey checklist', 'கள ஆய்வுச் சரிபார்ப்புப் பட்டியல்')}</h3>
    <p className="mt-2 text-sm text-stone-600">{label(language, 'Questions are prompts, not evidence. Record the source and date of any findings.', 'இவை கேள்விகள் மட்டுமே; ஆதாரங்கள் அல்ல. கண்டறிந்த தகவலின் மூலம் மற்றும் தேதியைப் பதிவு செய்யவும்.')}</p>
    <ul className="mt-4 space-y-3">{questions.map(([en, ta]) => <li key={en}><label className="flex gap-3 rounded-xl border border-stone-200 p-3"><input type="checkbox" />{label(language, en, ta)}</label></li>)}</ul>
    <p className="mt-2 text-xs text-stone-600">{label(language, 'Checklist selections last only while this page is open.', 'இந்தப் பக்கம் திறந்திருக்கும் வரை மட்டுமே தேர்வுகள் இருக்கும்.')}</p>
  </section>
}

export function CostBuilder({ language, onCost }: { language: Lang; onCost: (value: string) => void }) {
  const entries = [
    ['equipment','Equipment','உபகரணங்கள்'], ['premises','Premises setup','இட அமைப்பு'],
    ['initial_stock','Initial stock','ஆரம்ப இருப்பு'], ['setup','Other setup','பிற தொடக்கச் செலவு'],
    ['working_capital','Initial working capital','ஆரம்ப நடைமுறை மூலதனம்'],
  ] as const
  const [values, setValues] = useState<Record<string, string>>({ equipment: '0', premises: '0', initial_stock: '0', setup: '0', working_capital: '0' })
  const [total, setTotal] = useState<string | null>(null)
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    try {
      const result = await post<{ project_cost: string }>('/finance/cost-builder', { items: entries.map(([name]) => ({ name, amount: values[name] })) })
      setTotal(result.project_cost)
    } catch { setError(label(language, 'Unable to calculate cost. Check the connection.', 'செலவைக் கணக்கிட முடியவில்லை. இணைப்பைச் சரிபார்க்கவும்.')) }
  }
  return <section className="mt-8 border-t border-stone-200 pt-7">
    <h3 className="text-xl font-semibold">{label(language, 'Startup cost builder', 'தொடக்கச் செலவுக் கணிப்பான்')}</h3>
    <p className="mt-2 text-sm text-stone-600">{label(language, 'Select your own estimates. Do not count working capital twice.', 'உங்கள் செலவு மதிப்பீடுகளைத் தேர்ந்தெடுக்கவும். நடைமுறை மூலதனத்தை இருமுறை சேர்க்க வேண்டாம்.')}</p>
    <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">{entries.map(([key,en,ta]) => <div key={key}>
      <label className="label" htmlFor={'cost-'+key}>{label(language,en,ta)}</label>
      <MoneySelect id={'cost-'+key} value={values[key]} onChange={value => { setValues(current => ({...current, [key]: value})); setTotal(null) }} />
    </div>)}<button className="secondary self-end" type="submit">{label(language, 'Add costs', 'செலவுகளைக் கூட்டவும்')}</button></form>
    {error && <p role="alert" className="field-error">{error}</p>}
    {total !== null && <div className="mt-4 rounded-xl bg-emerald-50 p-4"><p>{label(language, 'Estimated project cost', 'மதிப்பிட்ட திட்டச் செலவு')}: <strong>{rupees(total)}</strong></p>
      {Number(total) > 0 && <button className="primary mt-3" type="button" onClick={() => onCost(total)}>{label(language, 'Use in financial plan', 'நிதித் திட்டத்தில் பயன்படுத்தவும்')}</button>}
    </div>}
  </section>
}

export function BreakEven({ language, debtPayment }: { language: Lang; debtPayment: string }) {
  const [fixed, setFixed] = useState('20000')
  const [debt, setDebt] = useState(debtPayment)
  const [margin, setMargin] = useState('50')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    try {
      const data = await post<{ monthly_revenue_required: string }>('/finance/break-even', {
        monthly_fixed_cost: fixed, contribution_percent: margin, monthly_debt_payment: debt,
      })
      setResult(data.monthly_revenue_required)
    } catch { setError(label(language, 'Unable to calculate. Check the connection.', 'கணக்கிட முடியவில்லை. இணைப்பைச் சரிபார்க்கவும்.')) }
  }
  return <section className="mt-8 border-t border-stone-200 pt-7">
    <h3 className="text-xl font-semibold">{label(language, 'Break-even estimate', 'சமநிலை விற்பனை மதிப்பீடு')}</h3>
    <p className="mt-2 text-sm text-stone-600">{label(language, 'Choose fixed costs, monthly debt payment, and contribution margin: the share of sales left after variable costs. Do not count variable costs as fixed costs.', 'நிலையான மாதச் செலவு, கடன் தவணை மற்றும் பங்களிப்பு விகிதத்தைத் தேர்ந்தெடுக்கவும். பங்களிப்பு என்பது மாறும் செலவுகளுக்குப் பிறகு மீதமுள்ள விற்பனைப் பங்கு. மாறும் செலவுகளை நிலையான செலவுகளில் சேர்க்க வேண்டாம்.')}</p>
    <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
      <div><label className="label" htmlFor="break-fixed">{label(language,'Monthly fixed operating costs','மாத நிலையான இயக்கச் செலவு')}</label><MoneySelect id="break-fixed" value={fixed} onChange={v => { setFixed(v); setResult(null) }} /></div>
      <div><label className="label" htmlFor="break-debt">{label(language,'Monthly debt payment','மாதக் கடன் தவணை')}</label><MoneySelect id="break-debt" value={debt} onChange={v => { setDebt(v); setResult(null) }} /></div>
      <div><label className="label" htmlFor="break-margin">{label(language,'Contribution margin (%)','பங்களிப்பு விகிதம் (%)')}</label><select className="input" id="break-margin" value={margin} onChange={e => { setMargin(e.target.value); setResult(null) }}>{[10,20,25,30,40,50,60,70,75,80,90,100].map(v => <option key={v} value={v}>{v}%</option>)}</select></div>
      <button className="secondary self-end" type="submit">{label(language,'Calculate break-even','சமநிலையைக் கணக்கிடவும்')}</button>
    </form>
    {error && <p role="alert" className="field-error">{error}</p>}
    {result !== null && <div className="mt-4 rounded-xl bg-amber-50 p-4"><p>{label(language,'Estimated monthly revenue needed','தேவையான மாத விற்பனை மதிப்பீடு')}: <strong>{rupees(result)}</strong></p><p className="mt-2 text-xs">{label(language,'Formula: (fixed costs + debt payment) ÷ contribution margin. This is an estimate, not a prediction of success.','சூத்திரம்: (நிலையான செலவு + கடன் தவணை) ÷ பங்களிப்பு விகிதம். இது மதிப்பீடு; வெற்றி முன்னறிவிப்பு அல்ல.')}</p></div>}
  </section>
}

export function AudioGuide({ language, summary }: { language: Lang; summary?: string }) {
  const [message, setMessage] = useState('')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    const refreshVoices = () => setVoices(synth.getVoices())
    refreshVoices()
    synth.addEventListener('voiceschanged', refreshVoices)
    return () => { synth.removeEventListener('voiceschanged', refreshVoices); synth.cancel() }
  }, [])

  function speak() {
    if (!('speechSynthesis' in window)) {
      setMessage(label(language, 'Speech is unavailable in this browser.', 'இந்த உலாவியில் குரல் வசதி இல்லை.'))
      return
    }
    const synth = window.speechSynthesis
    // Some browsers fill the voice list after page load and emit voiceschanged.
    const available = synth.getVoices()
    const preferred = (available.length ? available : voices).find(
      voice => voice.lang.toLowerCase().startsWith(language === 'ta' ? 'ta' : 'en'),
    )
    if (!preferred) {
      setMessage(label(language,
        'No English voice is available yet. Check device speech settings and try again.',
        'தமிழ் குரல் கிடைக்கவில்லை. சாதனத்தின் குரல் அமைப்புகளில் தமிழ் குரலைச் சேர்த்து மீண்டும் முயற்சிக்கவும்.'))
      return
    }
    synth.cancel()
    const text = label(language,
      'Choose your location, capital and business. Review the sample evidence, check your assumptions, and save the assessment.',
      'உங்கள் இடம், முதலீடு மற்றும் தொழிலைத் தேர்வு செய்யுங்கள். மாதிரித் தகவல்களைப் பாருங்கள். உங்கள் மதிப்பீடுகளைச் சரிபார்த்து சேமிக்கவும்.')
    const utterance = new SpeechSynthesisUtterance(summary ?? text)
    utterance.voice = preferred
    utterance.lang = preferred.lang
    utterance.onstart = () => setMessage(label(language, 'Playing guidance.', 'வழிகாட்டுதல் ஒலிக்கிறது.'))
    utterance.onend = () => setMessage(label(language, 'Guidance finished.', 'வழிகாட்டுதல் முடிந்தது.'))
    utterance.onerror = event => { if (event.error !== 'interrupted' && event.error !== 'canceled') setMessage(label(language, 'Audio could not play. Check device sound and speech settings.', 'ஒலியை இயக்க முடியவில்லை. சாதனத்தின் ஒலி மற்றும் குரல் அமைப்புகளைச் சரிபார்க்கவும்.')) }
    try {
      synth.speak(utterance)
      setMessage(label(language, 'Starting audio…', 'ஒலி தொடங்குகிறது…'))
    } catch {
      setMessage(label(language, 'Audio could not play. Check device sound and speech settings.', 'ஒலியை இயக்க முடியவில்லை. சாதனத்தின் ஒலி மற்றும் குரல் அமைப்புகளைச் சரிபார்க்கவும்.'))
    }
  }

  function stop() {
    window.speechSynthesis?.cancel()
    setMessage(label(language, 'Audio stopped.', 'ஒலி நிறுத்தப்பட்டது.'))
  }

  return <div className="mt-5 flex flex-wrap items-center gap-3">
    <button className="secondary text-sm" type="button" onClick={speak}>{label(language,'Listen to guidance','வழிகாட்டுதலைக் கேளுங்கள்')}</button>
    <button className="secondary text-sm" type="button" onClick={stop}>{label(language,'Stop audio','ஒலியை நிறுத்தவும்')}</button>
    <span role="status" aria-live="polite" className="text-xs">{message}</span>
  </div>
}

export type SavedAssessment = { id: string; created_at: string; payload: { assessment: AssessmentDraft; finance?: FinanceInput | null } }

type FieldObservation = { id: string; reviewer: string; observed_on: string; source: string; description: string; status: string; kind: string; recorded_at: string }
export function ObservationReview({ language, assessmentId }: { language: Lang; assessmentId: string }) {
  const [token, setToken] = useState('')
  const [reviewer, setReviewer] = useState('')
  const [description, setDescription] = useState('')
  const [source, setSource] = useState('')
  const [observed, setObserved] = useState('')
  const [kind, setKind] = useState('customer_demand')
  const [rows, setRows] = useState<FieldObservation[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const url = '/officer/assessments/' + encodeURIComponent(assessmentId) + '/observations'
  async function load() {
    setBusy(true); setError('')
    try {
      const response = await fetch(base + url, { headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(10000) })
      if (!response.ok) throw new Error(String(response.status))
      setRows(await response.json() as FieldObservation[])
    } catch { setError(label(language, 'Could not load observations. Check the officer token and connection.', 'தகவல்களைப் பெற முடியவில்லை. அதிகாரி குறியீடு மற்றும் இணைப்பைச் சரிபார்க்கவும்.')) }
    finally { setBusy(false) }
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const item = await post<FieldObservation>(url, { kind, description, source, observed_on: observed, reviewer }, token)
      setRows(current => [...current, item]); setDescription(''); setSource('')
    } catch { setError(label(language, 'Could not record observation. Check all fields, date, and officer token.', 'பதிவு செய்ய முடியவில்லை. விவரங்கள், தேதி மற்றும் அதிகாரி குறியீட்டைச் சரிபார்க்கவும்.')) }
    finally { setBusy(false) }
  }
  if (!assessmentId) return <p className="mt-3 text-sm text-stone-600">{label(language, 'Save an assessment before recording observations.', 'தகவல்களைப் பதிவு செய்ய முதலில் மதிப்பீட்டைச் சேமிக்கவும்.')}</p>
  return <details className="mt-5 rounded-xl border border-stone-200 p-4">
    <summary className="cursor-pointer font-semibold">{label(language, 'Officer field observations', 'அதிகாரியின் களத் தகவல்கள்')}</summary>
    <p className="mt-3 text-sm">{label(language, 'An authorized officer attests to each observation. The source, date, reviewer, and original entry are preserved; the system does not independently verify claims.', 'ஒவ்வொரு தகவலையும் அங்கீகரிக்கப்பட்ட அதிகாரி உறுதிப்படுத்துகிறார். மூலம், தேதி, அதிகாரி, அசல் பதிவு பாதுகாக்கப்படும்; செயலி தனியாகச் சரிபார்க்காது.')}</p>
    <form className="mt-4 space-y-3" onSubmit={submit}>
      <div><label className="label" htmlFor="field-token">{label(language,'Officer token','அதிகாரி குறியீடு')}</label><input id="field-token" className="input" type="password" autoComplete="off" required value={token} onChange={e => setToken(e.target.value)} /></div>
      <div><label className="label" htmlFor="field-reviewer">{label(language,'Reviewer','சரிபார்ப்பாளர்')}</label><input id="field-reviewer" className="input" minLength={2} maxLength={120} required value={reviewer} onChange={e => setReviewer(e.target.value)} /></div>
      <div><label className="label" htmlFor="field-kind">{label(language,'Observation type','தகவல் வகை')}</label><select id="field-kind" className="input" value={kind} onChange={e => setKind(e.target.value)}>{[['customer_demand','Customer demand','வாடிக்கையாளர் தேவை'],['supplier','Supplier','விநியோகஸ்தர்'],['price','Price','விலை'],['competitor','Competitor','போட்டியாளர்'],['other','Other','மற்றவை']].map(([v,en,ta]) => <option key={v} value={v}>{label(language,en,ta)}</option>)}</select></div>
      <div><label className="label" htmlFor="field-description">{label(language,'Observation','கண்டறிந்த தகவல்')}</label><textarea id="field-description" className="input" minLength={3} maxLength={1000} required value={description} onChange={e => setDescription(e.target.value)} /></div>
      <div><label className="label" htmlFor="field-source">{label(language,'Source','தகவல் மூலம்')}</label><input id="field-source" className="input" minLength={2} maxLength={300} required value={source} onChange={e => setSource(e.target.value)} /></div>
      <div><label className="label" htmlFor="field-date">{label(language,'Observation date','கண்டறிந்த தேதி')}</label><input id="field-date" className="input" type="date" max={new Date().toLocaleDateString('en-CA')} required value={observed} onChange={e => setObserved(e.target.value)} /></div>
      <div className="flex flex-wrap gap-3"><button className="primary" disabled={busy} type="submit">{label(language,'Record verified observation','சரிபார்த்த தகவலைப் பதிவு செய்யவும்')}</button><button className="secondary" disabled={busy || !token} type="button" onClick={load}>{label(language,'Load history','பதிவுகளைப் பார்க்கவும்')}</button></div>
    </form>
    {error && <p role="alert" className="field-error">{error}</p>}
    <ol className="mt-4 space-y-3">{rows.map(row => <li key={row.id} className="rounded-xl bg-stone-50 p-3 text-sm"><p><strong>{row.description}</strong></p><p>{label(language,'Status: officer verified','நிலை: அதிகாரி உறுதிப்படுத்தியது')} · {row.source} · {row.observed_on}</p><p>{row.reviewer} · {new Date(row.recorded_at).toLocaleString()}</p></li>)}</ol>
  </details>
}

export function AssessmentHistory({ language, onOpen }: { language: Lang; onOpen: (record: SavedAssessment) => void }) {
  const [records, setRecords] = useState<SavedAssessment[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState('')
  async function load() {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
      const ids = Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string').slice(0,20) : []
      if (!ids.length) { setMessage(label(language, 'No saved assessments on this browser.', 'இந்த உலாவியில் சேமிக்கப்பட்ட மதிப்பீடுகள் இல்லை.')); return }
      const results = await Promise.allSettled(ids.map(async id => {
        const response = await fetch(base + '/assessments/' + encodeURIComponent(id), { signal: AbortSignal.timeout(10000) })
        if (!response.ok) throw new Error('unavailable')
        return response.json() as Promise<SavedAssessment>
      }))
      const ok = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : [])
      setRecords(ok)
      setMessage(ok.length < ids.length ? label(language,'Some records could not be loaded.','சில பதிவுகளைப் பெற முடியவில்லை.') : '')
    } catch { setMessage(label(language,'History is unavailable. Check browser storage and connection.','பதிவுகளைப் பெற முடியவில்லை. உலாவி சேமிப்பையும் இணைப்பையும் சரிபார்க்கவும்.')) }
  }
  const compared = records.filter(record => selected.includes(record.id))
  return <details className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
    <summary className="cursor-pointer font-semibold">{label(language,'Saved assessments','சேமித்த மதிப்பீடுகள்')}</summary>
    <p className="mt-2 text-sm text-stone-600">{label(language,'This browser stores only saved assessment IDs. Select up to two to compare inputs; reopen one to revise it.','இந்த உலாவியில் மதிப்பீட்டு எண்கள் மட்டும் இருக்கும். இரண்டைத் தேர்ந்தெடுத்து ஒப்பிடலாம்; ஒன்றைத் திறந்து மாற்றலாம்.')}</p>
    <button type="button" className="secondary mt-3" onClick={load}>{label(language,'Load saved assessments','சேமித்த மதிப்பீடுகளைப் பார்க்கவும்')}</button>
    {message && <p role="status" className="mt-3 text-sm">{message}</p>}
    <div className="mt-3 grid gap-3 sm:grid-cols-2">{records.map(record => <article key={record.id} className="rounded-xl border border-stone-200 p-3 text-sm">
      <label className="flex gap-2"><input type="checkbox" checked={selected.includes(record.id)} disabled={!selected.includes(record.id) && selected.length >= 2} onChange={() => setSelected(current => current.includes(record.id) ? current.filter(id => id !== record.id) : [...current, record.id])} />{new Date(record.created_at).toLocaleString()}</label>
      <p className="mt-2">{translate(language, record.payload.assessment.village)}, {translate(language, record.payload.assessment.district)}</p>
      <p>{translate(language, record.payload.assessment.category)} · {rupees(record.payload.assessment.margin_capital)}</p>
      <button type="button" className="secondary mt-3" onClick={() => onOpen(record)}>{label(language,'Open and revise','திறந்து மாற்றவும்')}</button>
    </article>)}</div>
    {compared.length === 2 && <div className="mt-4 overflow-auto"><table className="w-full min-w-[400px] text-left text-sm">
      <caption className="mb-2 text-left font-semibold">{label(language,'Compare saved inputs','சேமித்த உள்ளீடுகளை ஒப்பிடவும்')}</caption>
      <thead><tr><th>{label(language,'Field','விவரம்')}</th>{compared.map(item => <th key={item.id}>{new Date(item.created_at).toLocaleDateString()}</th>)}</tr></thead>
      <tbody>
        <tr><th>{label(language,'Location','இடம்')}</th>{compared.map(item => <td key={item.id}>{translate(language, item.payload.assessment.village)}, {translate(language, item.payload.assessment.district)}</td>)}</tr>
        <tr><th>{label(language,'Category','தொழில் வகை')}</th>{compared.map(item => <td key={item.id}>{translate(language, item.payload.assessment.category)}</td>)}</tr>
        <tr><th>{label(language,'Margin','முதலீடு')}</th>{compared.map(item => <td key={item.id}>{rupees(item.payload.assessment.margin_capital)}</td>)}</tr>
        <tr><th>{label(language,'Project cost','திட்டச் செலவு')}</th>{compared.map(item => <td key={item.id}>{item.payload.finance ? rupees(item.payload.finance.project_cost) : label(language,'Not saved','சேமிக்கப்படவில்லை')}</td>)}</tr>
        <tr><th>{label(language,'Monthly sales','மாத விற்பனை')}</th>{compared.map(item => <td key={item.id}>{item.payload.finance ? rupees(item.payload.finance.monthly_sales) : label(language,'Not saved','சேமிக்கப்படவில்லை')}</td>)}</tr>
        <tr><th>{label(language,'Operating costs','இயக்கச் செலவு')}</th>{compared.map(item => <td key={item.id}>{item.payload.finance ? rupees(item.payload.finance.monthly_operating_cost) : label(language,'Not saved','சேமிக்கப்படவில்லை')}</td>)}</tr>
      </tbody>
    </table><p className="mt-2 text-xs">{label(language,'Revised assessments are saved separately; earlier inputs remain intact.','மாற்றிய மதிப்பீடு தனியாகச் சேமிக்கப்படும்; முந்தைய பதிவு பாதுகாக்கப்படும்.')}</p></div>}
  </details>
}
