import { translateEvidence } from './evidenceTranslations'
import { translate } from '../../lib/translations'
import type { EvidenceResponse, MarketItem } from '../../lib/api'
import type { Language } from '../intake/model'

function Item({ item, language }: { item: MarketItem; language: Language }) {
  return <li className="rounded-xl border border-stone-200 p-3">
    <p className="font-medium">{language === 'ta' ? translateEvidence(item.label) : item.label}</p>
    <p className="mt-1 text-xs text-stone-600">{language === 'ta' ? 'நிலை' : 'Status'}: {language === 'ta' ? (item.status === 'sample' ? 'மாதிரி' : 'கிடைக்கவில்லை') : item.status} · {language === 'ta' ? 'ஆதாரம்' : 'Source'}: {language === 'ta' ? (item.status === 'sample' ? 'செயற்கை மாதிரி தரவு' : 'ஆதாரம் இல்லை') : item.source} · {language === 'ta' ? 'கண்காணிப்பு தேதி: கிடைக்கவில்லை' : 'Observation date: unavailable'}</p>
  </li>
}

export function EvidencePanel({ evidence, language }: { evidence: EvidenceResponse; language: Language }) {
  return <section className="mt-8 border-t border-stone-200 pt-7">
    <p className="text-xs font-bold uppercase tracking-widest text-amber-800">{translate(language, "Market evidence")} · {translate(language, evidence.coverage)}</p>
    <p className="mt-3 text-sm leading-relaxed text-stone-700">{language === 'ta' ? (evidence.coverage === 'sample' ? 'இவை செயற்கை மாதிரி குறிப்புகள்; உள்ளூர் கண்காணிப்புகள் அல்ல. தொழில்களை தரவரிசைப்படுத்த ஆதாரம் இல்லை.' : 'இந்த இடத்திற்கான மாதிரி தரவு இல்லை.') : evidence.note}</p>
    {evidence.coverage === 'sample' && <>
      <h3 className="mt-6 font-semibold">{language === 'ta' ? 'களத்தில் சரிபார்க்க வேண்டிய விற்பனை வழிகள்' : 'Possible channels to check in the field'}</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{evidence.channels.map(item => <Item key={language === 'ta' ? translateEvidence(item.label) : item.label} item={item} language={language} />)}</ul>
      <h3 className="mt-6 font-semibold">{language === 'ta' ? 'சரிபார்க்க வேண்டிய வாய்ப்புகள்' : 'Questions worth testing'}</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{evidence.opportunities.map(item => <Item key={language === 'ta' ? translateEvidence(item.label) : item.label} item={item} language={language} />)}</ul>
      <h3 className="mt-6 font-semibold">{language === 'ta' ? 'சாத்தியமான அபாயங்கள்' : 'Potential risks'}</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{evidence.risks.map(item => <Item key={language === 'ta' ? translateEvidence(item.label) : item.label} item={item} language={language} />)}</ul>
      <h3 className="mt-6 font-semibold">{language === 'ta' ? 'மாதிரி SWOT குறிப்புகள்' : 'Illustrative SWOT prompts'}</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{Object.entries(evidence.swot).map(([key, item]) =>
        <li key={key}><span className="text-sm font-semibold capitalize">{translate(language, key)}</span><ul><Item item={item} language={language} /></ul></li>
      )}</ul>
    </>}
    {evidence.seasonality.length > 0 && <div className="mt-6 rounded-xl bg-amber-50 p-4">
      <h3 className="font-semibold">{language === 'ta' ? 'பருவகால சூழல் — செயற்கை மாதிரி' : 'Seasonal scenario — synthetic sample'}</h3>
      <p className="mt-2 text-sm">{language === 'ta' ? 'இது கற்பனை செயல்பாட்டு குறியீடு; உண்மையான விற்பனை, மழை அல்லது முன்னறிவிப்பு அல்ல. அடிப்படை 100; களச் சரிபார்ப்பு தேவை.' : 'Hypothetical activity index, not observed sales, rainfall, or a forecast. Baseline 100; field verification required.'}</p>
      <div className="mt-3 grid grid-cols-4 gap-2 text-sm sm:grid-cols-6">{evidence.seasonality.map((value, index) => <div key={index} className="rounded bg-white p-2"><span>{translate(language, ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][index])}: {value}</span><div aria-hidden="true" className="mt-2 h-2 rounded bg-stone-100"><div className="h-2 rounded bg-amber-600" style={{ width: (value / 150 * 100) + '%' }} /></div></div>)}</div>
      <p className="mt-3 text-xs">{translate(language, "Status")}: {translate(language, evidence.seasonality_status)} · {translate(language, "Observation date: unavailable. Synthetic indices are not from the source.")} <a className="underline" href="https://mausam.imd.gov.in/chennai/mcdata/ne_monsoon_2024.pdf" target="_blank" rel="noreferrer">{language === 'ta' ? 'இந்திய வானிலை ஆய்வு மையத்தின் பருவமழை தகவல்' : 'IMD monsoon context'}</a>.</p>
    </div>}
    <h3 className="mt-6 font-semibold">{language === 'ta' ? 'கிடைக்காத தகவல்கள்' : 'Evidence gaps'}</h3>
    <ul className="mt-3 grid gap-2 sm:grid-cols-3">
      {[evidence.customer_reach, evidence.competitor_density, evidence.pricing].map(item => <Item key={language === 'ta' ? translateEvidence(item.label) : item.label} item={item} language={language} />)}
    </ul>
  </section>
}
