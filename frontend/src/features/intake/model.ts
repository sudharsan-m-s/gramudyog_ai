export type Language = 'en' | 'ta'
export type Category = 'food_processing' | 'tailoring' | 'dairy' | 'retail'

export interface AssessmentDraft {
  language: Language
  village: string
  block: string
  district: string
  margin_capital: string
  category: Category | ''
  radius_km: number
}

export interface AssessmentPreview {
  input: AssessmentDraft & { category: Category }
  evidence_status: 'unavailable'
  message: string
}

export const categories: { value: Category; en: string; ta: string }[] = [
  { value: 'food_processing', en: 'Food processing', ta: 'உணவு பதப்படுத்துதல்' },
  { value: 'tailoring', en: 'Tailoring', ta: 'தையல் தொழில்' },
  { value: 'dairy', en: 'Dairy', ta: 'பால் பண்ணை' },
  { value: 'retail', en: 'Small retail', ta: 'சிறு விற்பனை' },
]

export const copy = {
  en: {
    home: 'Business starts with clarity.', subtitle: 'Explore your business idea with a clear view of the information available.',
    start: 'Start an assessment', language: 'Choose language', next: 'Continue', back: 'Back',
    details: 'Tell us about your idea', location: 'Your location', village: 'Village or town',
    block: 'Block or taluk', district: 'District', margin: 'Available margin capital (₹)',
    category: 'Business category', radius: 'Area to examine', confirm: 'Review your details',
    edit: 'Edit details', submit: 'Confirm and check evidence', evidence: 'Local evidence',
    unavailable: 'Local market evidence is unavailable for this location.',
    caveat: 'No local observations are loaded yet. You can review your submitted details, but a feasibility report cannot be generated from them alone.',
    retry: 'Retry', offline: 'Could not contact the assessment service. Check your connection and try again.',
    change: 'Start another assessment', validation: 'Check the highlighted fields before continuing.',
    required: 'Enter 2–120 characters.', positive: 'Enter an amount greater than zero and no more than ₹50 lakh.',
    select: 'Select a category.', loading: 'Checking evidence…', notSaved: 'This preview has not been saved.',
  },
  ta: {
    home: 'தெளிவுடன் தொழிலைத் தொடங்குங்கள்.', subtitle: 'உங்கள் தொழில் யோசனைக்கு கிடைக்கும் தகவலை அறியுங்கள்.',
    start: 'மதிப்பீட்டைத் தொடங்குங்கள்', language: 'மொழியைத் தேர்ந்தெடுக்கவும்', next: 'தொடரவும்', back: 'பின்செல்',
    details: 'உங்கள் தொழில் யோசனை', location: 'உங்கள் இடம்', village: 'கிராமம் அல்லது ஊர்',
    block: 'வட்டாரம் அல்லது வட்டம்', district: 'மாவட்டம்', margin: 'உங்களிடம் உள்ள முதலீடு (₹)',
    category: 'தொழில் வகை', radius: 'ஆய்வு செய்யும் சுற்றளவு', confirm: 'விவரங்களைச் சரிபார்க்கவும்',
    edit: 'விவரங்களை மாற்றவும்', submit: 'உறுதிசெய்து ஆதாரங்களைப் பார்க்கவும்', evidence: 'உள்ளூர் ஆதாரங்கள்',
    unavailable: 'இந்த இடத்திற்கான உள்ளூர் சந்தைத் தகவல் கிடைக்கவில்லை.',
    caveat: 'உள்ளூர் கண்காணிப்புத் தரவு இன்னும் சேர்க்கப்படவில்லை. உங்கள் விவரங்களைச் சரிபார்க்கலாம்; இவற்றை மட்டும் வைத்து சாத்தியக்கூறு அறிக்கை தர இயலாது.',
    retry: 'மீண்டும் முயற்சிக்கவும்', offline: 'சேவையை அணுக முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
    change: 'மற்றொரு மதிப்பீடு', validation: 'தொடரும் முன் குறிக்கப்பட்ட விவரங்களைச் சரிபார்க்கவும்.',
    required: '2–120 எழுத்துகள் உள்ளிடவும்.', positive: 'பூஜ்ஜியத்தை விட அதிகமாகவும் ₹50 லட்சத்திற்குள் உள்ள தொகையை உள்ளிடவும்.',
    select: 'தொழில் வகையைத் தேர்ந்தெடுக்கவும்.', loading: 'ஆதாரங்களைச் சரிபார்க்கிறது…', notSaved: 'இந்த முன்னோட்டம் சேமிக்கப்படவில்லை.',
  },
} as const
