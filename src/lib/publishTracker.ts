// Published tweet tracking — localStorage-based performance tracker

export interface PublishedTweet {
  tweetId: string
  text: string
  publishedAt: string
  account: string
  topic?: string
  tone?: string
  styleUsername?: string
  lengthHint?: string
  engagement?: {
    likes: number
    replies: number
    retweets: number
    views: number
    fetchedAt: string
  }
}

const PUBLISHED_KEY = 'ib_published'

export function getPublishedTweets(): PublishedTweet[] {
  try { return JSON.parse(localStorage.getItem(PUBLISHED_KEY) || '[]') } catch { return [] }
}

export function trackPublished(tweet: PublishedTweet) {
  const all = getPublishedTweets()
  all.unshift(tweet)
  localStorage.setItem(PUBLISHED_KEY, JSON.stringify(all.slice(0, 200)))
}

export function updateEngagement(tweetId: string, engagement: PublishedTweet['engagement']) {
  const all = getPublishedTweets()
  const idx = all.findIndex(t => t.tweetId === tweetId)
  if (idx >= 0) {
    all[idx].engagement = engagement
    localStorage.setItem(PUBLISHED_KEY, JSON.stringify(all))
  }
}

export function getPerformanceSummary() {
  const all = getPublishedTweets()
  const withEng = all.filter(t => t.engagement)
  if (withEng.length === 0) return null

  const totalLikes = withEng.reduce((s, t) => s + (t.engagement?.likes || 0), 0)
  const totalReplies = withEng.reduce((s, t) => s + (t.engagement?.replies || 0), 0)
  const totalRetweets = withEng.reduce((s, t) => s + (t.engagement?.retweets || 0), 0)
  const totalViews = withEng.reduce((s, t) => s + (t.engagement?.views || 0), 0)

  // Best performing tweet
  const best = withEng.sort((a, b) => (b.engagement?.likes || 0) - (a.engagement?.likes || 0))[0]

  // Topic breakdown
  const topicMap: Record<string, { count: number; totalLikes: number }> = {}
  for (const t of withEng) {
    const topic = t.topic || 'diğer'
    if (!topicMap[topic]) topicMap[topic] = { count: 0, totalLikes: 0 }
    topicMap[topic].count++
    topicMap[topic].totalLikes += t.engagement?.likes || 0
  }
  const topTopics = Object.entries(topicMap)
    .map(([topic, data]) => ({ topic, ...data, avgLikes: Math.round(data.totalLikes / data.count) }))
    .sort((a, b) => b.avgLikes - a.avgLikes)

  return {
    totalPublished: all.length,
    tracked: withEng.length,
    totalLikes,
    totalReplies,
    totalRetweets,
    totalViews,
    avgLikes: Math.round(totalLikes / withEng.length),
    avgReplies: Math.round(totalReplies / withEng.length),
    best,
    topTopics: topTopics.slice(0, 5),
  }
}
