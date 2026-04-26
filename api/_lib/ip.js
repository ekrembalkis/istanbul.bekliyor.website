// Vercel-aware client IP extraction.
//
// Vercel sets `x-vercel-forwarded-for` (and `x-real-ip`) at the edge after
// stripping any client-supplied `x-forwarded-for`, so those two headers can
// be trusted. A raw `x-forwarded-for` from a third-party proxy is spoofable
// — we only fall back to it when the Vercel-set headers are missing (e.g.
// `vercel dev` locally).

export function clientIp(req) {
  const fromVercel = headerFirst(req.headers['x-vercel-forwarded-for'])
  if (fromVercel) return fromVercel

  const fromReal = headerFirst(req.headers['x-real-ip'])
  if (fromReal) return fromReal

  const fromXff = headerFirst(req.headers['x-forwarded-for'])
  if (fromXff) return fromXff

  return req.socket?.remoteAddress || 'unknown'
}

function headerFirst(value) {
  if (typeof value === 'string' && value.length > 0) return value.split(',')[0].trim()
  if (Array.isArray(value) && value.length > 0) {
    const v = value[0]
    if (typeof v === 'string' && v.length > 0) return v.split(',')[0].trim()
  }
  return null
}
