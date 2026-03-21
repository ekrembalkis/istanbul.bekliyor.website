// Topic suggestion engine: Campaign context + Radar filtering + Style patterns

import { getDayPlan } from '../data/campaign'
import { getDayCount } from './utils'
import type { StyleProfile } from './xquik'

export interface TopicSuggestion {
  title: string
  source: 'campaign' | 'radar' | 'style' | 'angle'
  relevance: number  // 0-100
  reason: string
}

// ── Campaign Themes (from actual getDayPlan) ──

function getCampaignTopics(): TopicSuggestion[] {
  const day = getDayCount()
  const plan = getDayPlan(day)
  const suggestions: TopicSuggestion[] = []

  // Today's theme
  suggestions.push({
    title: `GUN ${day}: ${plan.theme}`,
    source: 'campaign',
    relevance: 95,
    reason: 'Bugunku kampanya temasi',
  })

  // Scene as topic angle
  if (plan.scene) {
    suggestions.push({
      title: plan.scene,
      source: 'campaign',
      relevance: 85,
      reason: 'Bugunku gorsel sahnesi',
    })
  }

  return suggestions
}

// ── Emotional Angles (always relevant for this campaign) ──

function getEmotionalAngles(): TopicSuggestion[] {
  const day = getDayCount()
  const angles = [
    { title: `${day} gundur bekliyoruz, istanbul unutmadi`, relevance: 80 },
    { title: 'tutuklu belediye baskani, demokrasi', relevance: 75 },
    { title: 'bos koltuk, dolu meydan', relevance: 70 },
    { title: 'ozgurluk, adalet, sabir', relevance: 65 },
    { title: 'secimle gelen irade, hukukla korunmali', relevance: 60 },
  ]

  // Rotate: show 2-3 different angles each day
  const rotated = [...angles.slice(day % angles.length), ...angles.slice(0, day % angles.length)]
  return rotated.slice(0, 3).map(a => ({
    ...a,
    source: 'angle' as const,
    reason: 'Kampanya acisi',
  }))
}

// ── Radar Filtering (only campaign-relevant trending topics) ──

interface RadarItem {
  title: string
  source: string
  score: number
  category: string
}

const CAMPAIGN_KEYWORDS = new Set([
  'istanbul', 'belediye', 'tutuk', 'hapsi', 'mahkeme', 'secim', 'demokrasi',
  'ozgurluk', 'adalet', 'hukuk', 'irade', 'oy', 'chp', 'muhalefet',
  'basin', 'gazetecilik', 'ifade', 'protesto', 'miting', 'yargi',
  'anayasa', 'insan haklari', 'ab', 'avrupa', 'siyaset',
])

function isRelevantToCompaign(title: string): boolean {
  const lower = title.toLowerCase()
  return [...CAMPAIGN_KEYWORDS].some(kw => lower.includes(kw))
}

async function fetchFilteredRadar(
  apiFn: (path: string) => Promise<{ items: RadarItem[] }>
): Promise<TopicSuggestion[]> {
  try {
    const data = await apiFn('/radar?region=TR&hours=48&limit=30')
    return (data.items || [])
      .filter(item => isRelevantToCompaign(item.title))
      .slice(0, 3)
      .map(item => ({
        title: item.title,
        source: 'radar' as const,
        relevance: Math.min(90, 50 + Math.round(item.score / 200)),
        reason: `TR gundem (${item.source})`,
      }))
  } catch {
    return []
  }
}

// ── Style Pattern Analysis (meaningful phrases, not single words) ──

function analyzeStylePatterns(style: StyleProfile | null): TopicSuggestion[] {
  if (!style?.tweets?.length) return []

  // Extract tweet topics by looking at sentence structure, not word frequency
  const topicMap = new Map<string, number>()

  const categoryPatterns: [RegExp, string][] = [
    [/futbol|mac|gol|lig|sampiy|takim|transfer|teknik|hakem/i, 'futbol ve spor'],
    [/siyaset|secim|oy|hukumet|muhalefet|parti|baskan|tutuk|mahkeme/i, 'siyaset'],
    [/hayat|yasam|insan|kiz|erkek|para|okul|universite/i, 'gunluk hayat'],
    [/komedj|komik|espri|sacma|absurt/i, 'mizah ve ironi'],
  ]

  for (const tweet of style.tweets) {
    if (!tweet.text || tweet.text.startsWith('@')) continue
    for (const [pattern, category] of categoryPatterns) {
      if (pattern.test(tweet.text)) {
        topicMap.set(category, (topicMap.get(category) || 0) + 1)
      }
    }
  }

  return [...topicMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([topic, count]) => ({
      title: topic,
      source: 'style' as const,
      relevance: Math.min(70, count * 10),
      reason: `Bu kullanicinin sik yazdigi konu (${count} tweet)`,
    }))
}

// ── Combined Suggestions ──

export async function getTopicSuggestions(
  apiFn: (path: string) => Promise<{ items: RadarItem[] }>,
  currentStyle: StyleProfile | null,
): Promise<TopicSuggestion[]> {
  const [radar, stylePatterns] = await Promise.all([
    fetchFilteredRadar(apiFn),
    Promise.resolve(analyzeStylePatterns(currentStyle)),
  ])

  const campaignTopics = getCampaignTopics()
  const angles = getEmotionalAngles()

  const all: TopicSuggestion[] = [
    ...campaignTopics,  // Today's theme + scene (always first)
    ...angles.slice(0, 2),  // 2 emotional angles
    ...radar,  // Only campaign-relevant trending (0-3)
    ...stylePatterns,  // Style topic categories (0-2)
  ]

  // Deduplicate and sort
  const seen = new Set<string>()
  return all.filter(s => {
    const key = s.title.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a, b) => b.relevance - a.relevance).slice(0, 7)
}
