// Topic suggestion engine: serverless Gemini extraction + campaign theme

import { getDayPlan } from '../data/campaign'
import { getDayCount } from './utils'
import type { StyleProfile } from './xquik'

export interface TopicSuggestion {
  title: string
  source: 'live' | 'campaign'
  relevance: number
  reason: string
  context?: string
}

function getCampaignTopic(): TopicSuggestion {
  const day = getDayCount()
  const plan = getDayPlan(day)
  return {
    title: `GUN ${day}: ${plan.theme}`,
    source: 'campaign',
    relevance: 90,
    reason: 'Bugunku kampanya temasi',
  }
}

export async function getTopicSuggestions(
  _apiFn: unknown,
  _currentStyle: StyleProfile | null,
): Promise<TopicSuggestion[]> {
  const campaign = getCampaignTopic()

  // Fetch live topics from serverless endpoint (Gemini + X Search)
  try {
    const res = await fetch('/api/extract-topics')
    if (res.ok) {
      const data = await res.json()
      const live: TopicSuggestion[] = (data.topics || []).map((t: TopicSuggestion) => ({
        ...t,
        source: 'live' as const,
      }))
      return [campaign, ...live].slice(0, 7)
    }
  } catch { /* fallback to campaign only */ }

  return [campaign]
}
