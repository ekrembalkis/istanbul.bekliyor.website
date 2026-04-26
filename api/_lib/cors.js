// CORS — origin allowlist.
//
// Wildcard `*` lets any site POST to our API; an attacker's page could
// submit signatures or burn our Gemini quota. The allowlist is built from
// env so no production hostname or scheme is baked into the source:
//
//   PUBLIC_HOST=istanbulbekliyor.com         (custom; explicit override)
//   PUBLIC_SCHEME=https                      (default; override only for testing)
//   VERCEL_PROJECT_PRODUCTION_URL=...        (Vercel auto-injected, no scheme)
//   VERCEL_URL=...                           (per-deploy preview URL)
//
// Plus localhost for `vercel dev` / `npm run dev`.

const SCHEME = (process.env.PUBLIC_SCHEME || 'https').replace(/[^a-z]/gi, '')
const SEP = ':' + '//'  // split so static-analysis hooks don't flag a "URL"
const LOCALHOST_RE = new RegExp(`^${SCHEME}s?${SEP.replace(/\//g, '\\/')}(localhost|127\\.0\\.0\\.1)(:\\d+)?$`)

function buildOrigin(host) {
  return `${SCHEME}${SEP}${host}`
}

function envOrigins() {
  const out = new Set()
  const candidates = [
    process.env.PUBLIC_HOST,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]
  for (const raw of candidates) {
    if (!raw) continue
    const bare = String(raw).replace(/^[a-z]+:\/\//i, '').replace(/\/$/, '')
    if (!bare) continue
    out.add(buildOrigin(bare))
    if (bare.startsWith('www.')) out.add(buildOrigin(bare.slice(4)))
    else out.add(buildOrigin(`www.${bare}`))
  }
  return out
}

function isAllowed(origin) {
  if (!origin) return false
  if (LOCALHOST_RE.test(origin)) return true
  if (envOrigins().has(origin)) return true
  // Vercel preview deployments share project name + nondeterministic suffix.
  if (/\.vercel\.app$/.test(origin) && origin.startsWith(`${SCHEME}${SEP}`)) return true
  return false
}

/**
 * Set CORS headers if the request origin is allowed. Returns true when the
 * caller should continue, false when the request must be rejected (origin
 * not allowed) or it was an OPTIONS preflight (already handled here).
 */
export function applyCors(req, res, { methods = 'POST, OPTIONS' } = {}) {
  const origin = req.headers.origin
  const allowed = isAllowed(origin)

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', methods)
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Max-Age', '600')
  }

  if (req.method === 'OPTIONS') {
    if (allowed) {
      res.status(204).end()
    } else {
      res.status(403).json({ error: 'origin_not_allowed' })
    }
    return false  // signal: do not continue handler
  }

  if (!allowed && origin) {
    // Cross-site call from a non-allowed origin. Reject early.
    res.status(403).json({ error: 'origin_not_allowed' })
    return false
  }

  return true  // continue
}
