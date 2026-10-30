import type { AssessmentDraft, AssessmentPreview } from '../features/intake/model'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1'

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(baseUrl + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('Request failed')
  return response.json() as Promise<T>
}

export interface MarketItem {
  label: string
  status: 'sample' | 'unavailable'
  source: string
  observed_at: null
}
export interface EvidenceResponse {
  coverage: 'sample' | 'unavailable'
  channels: MarketItem[]
  opportunities: MarketItem[]
  risks: MarketItem[]
  swot: Record<string, MarketItem>
  customer_reach: MarketItem
  competitor_density: MarketItem
  pricing: MarketItem
  note: string
  seasonality: number[]
  seasonality_source: string
  seasonality_status: string
}
export interface FinanceInput {
  project_cost: string
  margin_capital: string
  monthly_sales: string
  monthly_operating_cost: string
  working_capital_months: number
}
export interface ScheduleRow {
  month: number
  opening_balance: string
  interest: string
  principal: string
  payment: string
  closing_balance: string
  phase: string
}
export interface FinanceResult {
  inputs: FinanceInput
  status: 'unsupported' | 'funding_gap' | 'indicative'
  scheme: string | null
  rules_version: string
  rules_source: string
  indicative_loan: string
  required_margin: string
  funding_gap: string
  monthly_payment: string
  monthly_surplus_before_debt: string
  repayment_coverage: string | null
  working_capital_estimate: string
  assumptions: string[]
  formula: string
  schedule: ScheduleRow[]
}

export const previewAssessment = (draft: AssessmentDraft) =>
  post<AssessmentPreview>('/assessments/preview', draft)
export const loadEvidence = (draft: AssessmentDraft) =>
  post<EvidenceResponse>('/evidence', draft)
export const calculateFinance = (input: FinanceInput) =>
  post<FinanceResult>('/finance/calculate', input)
