import { rateLimit } from './_lib/rateLimit.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!rateLimit(req, res, { scope: 'image-proxy', limit: 120 })) return

  const { url } = req.query
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' })
  }

  // Only allow Twitter image CDN
  try {
    const parsed = new URL(url)
    if (parsed.hostname !== 'pbs.twimg.com') {
      return res.status(400).json({ error: 'Only pbs.twimg.com URLs are allowed' })
    }
    if (parsed.protocol !== 'https:') {
      return res.status(400).json({ error: 'Only HTTPS URLs are allowed' })
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  const MAX_BYTES = 10 * 1024 * 1024 // 10 MB hard cap (Twitter avatars/images well below this)
  const TIMEOUT_MS = 8_000
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IstanbulBekliyor/1.0)',
        'Accept': 'image/*',
      },
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      return res.status(415).json({ error: 'Upstream did not return an image' })
    }

    const declaredLen = Number(response.headers.get('content-length') || 0)
    if (declaredLen > MAX_BYTES) {
      return res.status(413).json({ error: 'Image too large', max: MAX_BYTES })
    }

    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400')
    res.setHeader('Content-Type', contentType)

    const buffer = await response.arrayBuffer()
    if (buffer.byteLength > MAX_BYTES) {
      return res.status(413).json({ error: 'Image too large', max: MAX_BYTES })
    }
    res.send(Buffer.from(buffer))
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Upstream image timed out' })
    }
    console.error('Image proxy error:', error)
    return res.status(500).json({ error: 'Failed to proxy image' })
  } finally {
    clearTimeout(timer)
  }
}
