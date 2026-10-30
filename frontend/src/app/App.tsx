import { useState } from 'react'
import { checkApi } from '../lib/api'
export default function App() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  async function checkConnection() {
    setStatus('loading')
    try { await checkApi(); setStatus('ready') }
    catch { setStatus('error') }
  }
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <a href="/" className="text-xl font-bold tracking-tight">GramUdyog<span className="text-emerald-700">.AI</span></a>
        <span className="rounded-full border border-emerald-900/15 px-3 py-1 text-xs font-semibold">SIH26091 � Development scaffold</span>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-6 py-10 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <section>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Local enterprise. Informed decisions.</p>
            <h1 className="max-w-2xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">A clearer start for your business.</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-600">Understand your local market, plan your budget, and prepare for a funding conversation.</p>
            <div className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
              <p className="font-semibold">Repository initialized</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">The assessment journey is not available yet. This screen checks the application foundation; it does not provide financial advice or a feasibility report.</p>
              <button onClick={checkConnection} disabled={status === 'loading'} className="mt-5 min-h-12 rounded-xl bg-emerald-900 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                {status === 'loading' ? 'Checking connection.' : 'Check backend connection'}
              </button>
              <p role="status" aria-live="polite" className="mt-3 text-sm">
                {status === 'ready' && 'Backend reachable. Database connectivity is not checked by this endpoint.'}
                {status === 'error' && 'Cannot reach the backend. Check your connection and start the API, then retry.'}
                {status === 'idle' && 'Start the API locally, then check the connection.'}
              </p>
            </div>
          </section>
          <aside className="rounded-3xl bg-emerald-950 p-7 text-white sm:p-10" aria-label="Planned assessment journey">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">The journey we're building</p>
            <ol className="mt-8 space-y-8">
              {[
                ['Your idea, your location', 'Confirm your business category and available margin capital.'],
                ['Evidence before advice', 'See sources, dates, and gaps in local market information.'],
                ['A plan you can examine', 'Compare assumptions and review an indicative funding plan.'],
              ].map(([title, description], i) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-emerald-700 text-sm">0{i + 1}</span>
                  <div><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-relaxed text-emerald-100/75">{description}</p></div>
                </li>
              ))}
            </ol>
            <p className="mt-10 border-t border-emerald-800 pt-6 text-xs leading-relaxed text-emerald-100/75">Prototype only. No live market data, scheme eligibility, or loan approval is claimed.</p>
          </aside>
        </div>
      </main>
      <footer className="mx-auto max-w-6xl px-6 py-8 text-xs text-stone-600">GramUdyog.AI � Rural micro-enterprise advisory � Foundation milestone</footer>
    </>
  )
}
