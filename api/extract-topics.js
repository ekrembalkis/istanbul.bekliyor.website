// Serverless topic extractor: X Tweet Search → Gemini summarization
// GET /api/extract-topics

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const GEMINI_KEY = process.env.GEMINI_API_KEY
  const XQUIK_KEY = process.env.XQUIK_API_KEY
  if (!GEMINI_KEY || !XQUIK_KEY) {
    return res.status(500).json({ error: 'API keys not configured' })
  }

  const QUERIES = [
    'imamoğlu OR "istanbul belediye" lang:tr',
    'demokrasi OR adalet OR özgürlük lang:tr -filter:replies',
    'tutuklu OR mahkeme OR "ibb davası" lang:tr',
  ]

  try {
    // 1. Search X for campaign-relevant tweets
    const allTweets = []
    for (const q of QUERIES) {
      try {
        const searchRes = await fetch(
          `https://xquik.com/api/v1/x/tweets/search?q=${encodeURIComponent(q)}&limit=5&queryType=Top`,
          { headers: { 'x-api-key': XQUIK_KEY } }
        )
        if (searchRes.ok) {
          const data = await searchRes.json()
          const good = (data.tweets || [])
            .filter(t => (t.likeCount || 0) > 300)
            .slice(0, 4)
          allTweets.push(...good)
        }
      } catch { /* skip failed queries */ }
    }

    if (allTweets.length === 0) {
      return res.status(200).json({ topics: [] })
    }

    // 2. Build tweet list for Gemini
    const tweetTexts = allTweets
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, 12)
      .map((t, i) => {
        const clean = t.text.replace(/https?:\/\/\S+/g, '').replace(/@\S+/g, '').trim()
        return `${i + 1}. ${clean.substring(0, 150)}`
      })
      .join('\n')

    // 3. Ask Gemini to extract topics
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Asagidaki tweetler su an X (Twitter) Turkiye gundeminde en cok konusulanlar. Bu tweetlerden 5 KISA KONU BASLIGI cikar. Her baslik 3-6 kelime, Turkce olmali. Sadece JSON array dondur, baska hicbir sey yazma.\n\nTweetler:\n${tweetTexts}\n\nJSON array:` }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 200 },
        }),
      }
    )

    if (!geminiRes.ok) {
      return res.status(200).json({ topics: [] })
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    const geminiUsage = {
      promptTokens: geminiData.usageMetadata?.promptTokenCount || 0,
      completionTokens: geminiData.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: geminiData.usageMetadata?.totalTokenCount || 0,
      calls: 1,
    }

    // Parse JSON from Gemini (may have markdown code blocks)
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    let titles = []
    try {
      titles = JSON.parse(jsonMatch?.[0] || '[]')
    } catch {
      titles = []
    }

    // 4. Build topics with context
    const topics = titles.slice(0, 5).map((title, i) => {
      // Find related tweets for this topic
      const relatedTweets = allTweets
        .filter(t => {
          const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 3)
          const tweetLower = t.text.toLowerCase()
          return words.some(w => tweetLower.includes(w))
        })
        .slice(0, 3)

      const context = relatedTweets
        .map(t => t.text.replace(/https?:\/\/\S+/g, '').trim())
        .filter(t => t.length > 20)
        .join('\n---\n')

      const bestLikes = relatedTweets.length > 0
        ? Math.max(...relatedTweets.map(t => t.likeCount || 0))
        : 0

      // Include top tweets with engagement data for preview cards
      const topTweets = relatedTweets
        .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
        .slice(0, 3)
        .map(t => ({
          text: t.text.replace(/https?:\/\/\S+/g, '').trim(),
          likeCount: t.likeCount || 0,
          retweetCount: t.retweetCount || 0,
          author: t.author?.username || t.username || '',
        }))

      return {
        title,
        source: 'live',
        relevance: Math.min(95, 60 + Math.round(bestLikes / 500)),
        reason: `${relatedTweets.length} tweet · ${bestLikes.toLocaleString()} begeni`,
        context,
        tweets: topTweets,
      }
    })

    return res.status(200).json({ topics, geminiUsage })
  } catch (error) {
    console.error('Extract topics error:', error)
    return res.status(200).json({ topics: [] })
  }
}
