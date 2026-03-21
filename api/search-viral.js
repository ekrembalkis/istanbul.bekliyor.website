// Serverless viral tweet search — 2-layer merge strategy
// GET /api/search-viral?category=siyaset&limit=8
// Layer 1: Broad viral pool (min_faves:500, no keywords) → catches all viral Turkish tweets
// Layer 2: Category-specific keywords + min_faves:200 → catches niche category tweets
// Merge: dedup by ID, sort by likes

// Broad keyword sets per category (much wider than before)
const CATEGORY_KEYWORDS = {
  siyaset: '(bakan OR meclis OR CHP OR AKP OR MHP OR HDP OR İYİ OR seçim OR cumhurbaş OR mahkeme OR adalet OR muhalefet OR hükümet OR tutukl OR siyaset OR milletvekil OR erdoğan OR imamoğlu OR özel OR bahçeli OR kılıçdaroğlu OR vali OR belediye OR ysk OR anayasa OR tbmm OR parti)',
  ekonomi: '(dolar OR euro OR borsa OR enflasyon OR faiz OR altın OR petrol OR zam OR maaş OR emekli OR bist OR kira OR konut OR merkez OR TL OR ekonomi OR ihracat OR ithalat OR vergi OR sgk OR asgari OR motorin OR benzin OR mazot)',
  spor: '(galatasaray OR fenerbahçe OR beşiktaş OR trabzonspor OR süper lig OR şampiyon OR osimhen OR maç OR gol OR hakem OR futbol OR milli takım OR basketbol OR voleybol OR olimpiyat OR derbi OR transfer OR teknik direktör)',
  teknoloji: '(yapay zeka OR teknoloji OR yazılım OR uygulama OR iha OR drone OR robot OR siber OR dijital OR startup OR bilişim OR kodlama OR intel OR nvidia OR apple OR google OR tesla OR spacex)',
  bilim: '(bilim OR uzay OR araştırma OR NASA OR keşif OR fizik OR kimya OR biyoloji OR üniversite OR akademi OR tübitak OR genom OR iklim OR deprem)',
  kultur: '(film OR dizi OR müzik OR kitap OR sinema OR sanat OR konser OR tiyatro OR roman OR albüm OR netflix OR spotify OR ödül OR festival OR sergi)',
  gundem: '(son dakika OR gündem OR flaş OR acil OR deprem OR sel OR yangın OR kaza OR patlama OR savaş OR ateşkes OR bm OR nato)',
}

// Regex patterns for client-side categorization of pool tweets
const CATEGORY_REGEX = {
  spor: /galatasaray|fenerbah|beşiktaş|trabzon|süper lig|osimhen|maç\b|gol\b|futbol|hakem|şampiyon|milli tak|basketbol|voleybol|derbi|teknik direktör/i,
  ekonomi: /dolar|euro|borsa|enflasyon|faiz|altın|petrol|ekonomi|zam\b|maaş|kira\b|bist|merkez bank|emekli|asgari|motorin|benzin|mazot|ihracat|vergi/i,
  siyaset: /bakan|meclis|chp\b|akp\b|mhp\b|hdp\b|iyi parti|seçim|cumhurbaş|milletvekil|mahkeme|tutuklam|adalet|hükümet|muhalefet|erdoğan|kılıçdaroğlu|özel\b|bahçeli|imamoğlu|belediye|anayasa|tbmm/i,
  teknoloji: /yapay zeka|teknoloji|yazılım|uygulama|iha\b|drone|robot|ai\b|siber|dijital|startup|bilişim/i,
  kultur: /film\b|dizi\b|müzik|kitap|sinema|sanat|konser|tiyatro|roman\b|albüm|netflix|spotify|ödül|festival/i,
  bilim: /bilim|uzay|araştırma|nasa|keşif|fizik|kimya|biyoloji|üniversite|tübitak|genom|iklim/i,
}

function categorizeText(text) {
  const t = (text || '').toLowerCase()
  for (const [cat, regex] of Object.entries(CATEGORY_REGEX)) {
    if (regex.test(t)) return cat
  }
  return 'gündem'
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const XQUIK_KEY = process.env.XQUIK_API_KEY
  if (!XQUIK_KEY) return res.status(500).json({ error: 'XQUIK_API_KEY not configured' })

  const { category = 'siyaset', limit = '8' } = req.query || {}
  const today = new Date().toISOString().slice(0, 10)
  const maxResults = Math.min(parseInt(limit) || 8, 20)
  const isTumu = category === 'tumu'

  const headers = { 'x-api-key': XQUIK_KEY }

  try {
    // ── Layer 1: Broad viral pool (all viral Turkish tweets today) ──
    const poolQuery = `lang:tr since:${today} min_faves:500 -filter:replies -filter:retweets`
    const poolRes = await fetch(
      `https://xquik.com/api/v1/x/tweets/search?q=${encodeURIComponent(poolQuery)}&limit=30&queryType=Top`,
      { headers }
    )
    let poolTweets = []
    if (poolRes.ok) {
      const poolData = await poolRes.json()
      poolTweets = poolData.tweets || []
    }

    // ── Layer 2: Category-specific search (if not "tumu") ──
    let catTweets = []
    if (!isTumu && CATEGORY_KEYWORDS[category]) {
      const catQuery = `${CATEGORY_KEYWORDS[category]} lang:tr since:${today} min_faves:200 -filter:replies -filter:retweets`
      const catRes = await fetch(
        `https://xquik.com/api/v1/x/tweets/search?q=${encodeURIComponent(catQuery)}&limit=20&queryType=Top`,
        { headers }
      )
      if (catRes.ok) {
        const catData = await catRes.json()
        catTweets = catData.tweets || []
      }
    }

    // ── Merge: dedup by ID, filter by category, sort by likes ──
    const seen = new Set()
    const merged = []

    // Add category-specific tweets first (higher priority for relevance)
    for (const t of catTweets) {
      if (!seen.has(t.id) && t.text && t.text.length > 20) {
        seen.add(t.id)
        merged.push(t)
      }
    }

    // Add pool tweets (filtered by category regex, or all for "tumu")
    for (const t of poolTweets) {
      if (!seen.has(t.id) && t.text && t.text.length > 20) {
        if (isTumu || categorizeText(t.text) === category || categorizeText(t.text) === 'gündem' && category === 'gundem') {
          seen.add(t.id)
          merged.push(t)
        }
      }
    }

    // Sort by engagement, take top N
    const results = merged
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, maxResults)
      .map(t => ({
        id: t.id,
        text: (t.text || '').replace(/https?:\/\/\S+/g, '').trim(),
        author: t.author?.username || t.authorUsername || '',
        likeCount: t.likeCount || 0,
        retweetCount: t.retweetCount || 0,
        replyCount: t.replyCount || 0,
      }))

    return res.status(200).json({
      tweets: results,
      category,
      layers: { pool: poolTweets.length, category: catTweets.length, merged: merged.length },
    })
  } catch (error) {
    console.error('Search viral error:', error)
    return res.status(500).json({ error: 'Search failed', detail: error.message, tweets: [] })
  }
}
