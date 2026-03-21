// Cost tracker: accumulates Gemini token usage in localStorage
// Xquik usage comes from live API (/account endpoint)

const STORAGE_KEY = 'ib_cost_tracker'

// Gemini 2.0 Flash pricing (per 1M tokens)
const GEMINI_PRICING = {
  input: 0.10,   // $0.10 per 1M input tokens
  output: 0.40,  // $0.40 per 1M output tokens
}

export interface GeminiUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  calls: number
}

interface CostRecord {
  date: string // YYYY-MM-DD
  gemini: GeminiUsage
}

interface CostData {
  records: CostRecord[]
  totalGemini: GeminiUsage
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function load(): CostData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* fresh start */ }
  return { records: [], totalGemini: { promptTokens: 0, completionTokens: 0, totalTokens: 0, calls: 0 } }
}

function save(data: CostData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/** Add Gemini usage from an API response */
export function trackGeminiUsage(usage: GeminiUsage) {
  if (!usage || usage.totalTokens === 0) return
  const data = load()
  const today = getToday()

  let record = data.records.find(r => r.date === today)
  if (!record) {
    record = { date: today, gemini: { promptTokens: 0, completionTokens: 0, totalTokens: 0, calls: 0 } }
    data.records.push(record)
  }

  record.gemini.promptTokens += usage.promptTokens
  record.gemini.completionTokens += usage.completionTokens
  record.gemini.totalTokens += usage.totalTokens
  record.gemini.calls += usage.calls

  data.totalGemini.promptTokens += usage.promptTokens
  data.totalGemini.completionTokens += usage.completionTokens
  data.totalGemini.totalTokens += usage.totalTokens
  data.totalGemini.calls += usage.calls

  // Keep last 90 days
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  data.records = data.records.filter(r => r.date >= cutoffStr)

  save(data)
}

/** Get cost summary */
export function getCostSummary() {
  const data = load()
  const today = getToday()
  const todayRecord = data.records.find(r => r.date === today)

  // Last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cutoff30 = thirtyDaysAgo.toISOString().slice(0, 10)
  const last30 = data.records.filter(r => r.date >= cutoff30)

  const sum30 = last30.reduce((acc, r) => ({
    promptTokens: acc.promptTokens + r.gemini.promptTokens,
    completionTokens: acc.completionTokens + r.gemini.completionTokens,
    totalTokens: acc.totalTokens + r.gemini.totalTokens,
    calls: acc.calls + r.gemini.calls,
  }), { promptTokens: 0, completionTokens: 0, totalTokens: 0, calls: 0 })

  return {
    today: todayRecord?.gemini || { promptTokens: 0, completionTokens: 0, totalTokens: 0, calls: 0 },
    last30Days: sum30,
    allTime: data.totalGemini,
    dailyRecords: data.records.slice(-30),
  }
}

/** Calculate cost in USD */
export function calculateGeminiCost(usage: GeminiUsage): number {
  return (usage.promptTokens / 1_000_000) * GEMINI_PRICING.input
    + (usage.completionTokens / 1_000_000) * GEMINI_PRICING.output
}

/** Reset all tracking data */
export function resetCostTracker() {
  localStorage.removeItem(STORAGE_KEY)
}
