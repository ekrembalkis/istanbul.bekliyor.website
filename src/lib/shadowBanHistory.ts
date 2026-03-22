// Shadow ban check history — localStorage-based tracker

export type OverallStatus = 'clean' | 'suspicious' | 'likely_banned' | 'confirmed_banned'
export type CheckStatus = 'pass' | 'fail' | 'inconclusive' | 'skipped' | 'error'

export interface CheckResult {
  status: CheckStatus
  detail: string
  confidence: number
}

export interface EngagementSnapshot {
  avgViews: number
  avgEngRate: number
  tweetCount: number
  trend: 'up' | 'stable' | 'down'
}

export interface ShadowBanRecord {
  username: string
  checkedAt: string
  overall: OverallStatus
  confidence: number
  checks: {
    monitorProbe: CheckResult
    searchBan: CheckResult
    ghostBan: CheckResult
    engagementDrop: CheckResult
    profileVisible: CheckResult
  }
  engagement?: EngagementSnapshot
}

const SHADOW_KEY = 'ib_shadow_checks'

export function getShadowHistory(username?: string): ShadowBanRecord[] {
  try {
    const all: ShadowBanRecord[] = JSON.parse(localStorage.getItem(SHADOW_KEY) || '[]')
    return username ? all.filter(r => r.username === username) : all
  } catch { return [] }
}

export function saveShadowCheck(record: ShadowBanRecord) {
  const all = getShadowHistory()
  all.unshift(record)
  localStorage.setItem(SHADOW_KEY, JSON.stringify(all.slice(0, 100)))
}

export function getLatestCheck(username: string): ShadowBanRecord | null {
  const history = getShadowHistory(username)
  return history.length > 0 ? history[0] : null
}

export function getEngagementTrend(username: string): EngagementSnapshot[] {
  return getShadowHistory(username)
    .filter(r => r.engagement)
    .map(r => r.engagement!)
}
