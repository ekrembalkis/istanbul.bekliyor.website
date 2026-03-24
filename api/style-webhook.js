// Webhook receiver: Xquik sends tweet.new events here
// Updates the style profile with new tweets automatically

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.XQUIK_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'XQUIK_API_KEY not configured' })
  }

  const event = req.body
  if (!event || event.eventType !== 'tweet.new') {
    return res.status(200).json({ ok: true, skipped: true })
  }

  const username = event.xUsername
  const tweetText = event.payload?.text || event.payload?.tweetText
  if (!username || !tweetText) {
    return res.status(200).json({ ok: true, skipped: 'missing data' })
  }

  // Filter: skip replies, RTs, and very short tweets
  if (tweetText.startsWith('@') || tweetText.startsWith('RT ') || tweetText.length < 30) {
    return res.status(200).json({ ok: true, skipped: 'filtered' })
  }

  try {
    // Fetch current style profile
    const styleRes = await fetch(`https://xquik.com/api/v1/styles/${encodeURIComponent(username)}`, {
      headers: { 'x-api-key': apiKey },
    })

    if (!styleRes.ok) {
      return res.status(200).json({ ok: true, skipped: 'no existing style' })
    }

    const style = await styleRes.json()
    const existingTweets = (style.tweets || []).map(t => ({ text: t.text }))

    // Add new tweet to the front, keep max 200
    const updatedTweets = [{ text: tweetText }, ...existingTweets].slice(0, 200)

    // Update style profile
    await fetch(`https://xquik.com/api/v1/styles/${encodeURIComponent(username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ label: username, tweets: updatedTweets }),
    })

    // Increment style freshness counters in Supabase (fire-and-forget)
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL?.trim()
    const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY?.trim()
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_style_counters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ target_username: username }),
        })
      } catch { /* counter update optional */ }
    }

    return res.status(200).json({ ok: true, added: tweetText.substring(0, 50) })
  } catch (error) {
    console.error('Style webhook error:', error)
    return res.status(200).json({ ok: true, error: error.message })
  }
}
