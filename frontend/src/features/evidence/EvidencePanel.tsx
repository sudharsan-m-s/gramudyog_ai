import type { EvidenceResponse, MarketItem } from '../../lib/api'

function Item({ item }: { item: MarketItem }) {
  return <li className="rounded-xl border border-stone-200 p-3">
    <p className="font-medium">{item.label}</p>
    <p className="mt-1 text-xs text-stone-600">Status: {item.status} · Source: {item.source} · Observation date: unavailable</p>
  </li>
}

export function EvidencePanel({ evidence }: { evidence: EvidenceResponse }) {
  return <section className="mt-8 border-t border-stone-200 pt-7">
    <p className="text-xs font-bold uppercase tracking-widest text-amber-800">Market evidence · {evidence.coverage}</p>
    <p className="mt-3 text-sm leading-relaxed text-stone-700">{evidence.note}</p>
    {evidence.coverage === 'sample' && <>
      <h3 className="mt-6 font-semibold">Possible channels to check in the field</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{evidence.channels.map(item => <Item key={item.label} item={item} />)}</ul>
      <h3 className="mt-6 font-semibold">Questions worth testing</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{evidence.opportunities.map(item => <Item key={item.label} item={item} />)}</ul>
      <h3 className="mt-6 font-semibold">Potential risks</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{evidence.risks.map(item => <Item key={item.label} item={item} />)}</ul>
      <h3 className="mt-6 font-semibold">Illustrative SWOT prompts</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{Object.entries(evidence.swot).map(([key, item]) =>
        <li key={key}><span className="text-sm font-semibold capitalize">{key}</span><ul><Item item={item} /></ul></li>
      )}</ul>
    </>}
    <h3 className="mt-6 font-semibold">Evidence gaps</h3>
    <ul className="mt-3 grid gap-2 sm:grid-cols-3">
      {[evidence.customer_reach, evidence.competitor_density, evidence.pricing].map(item => <Item key={item.label} item={item} />)}
    </ul>
  </section>
}
