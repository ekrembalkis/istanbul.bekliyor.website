// POST /api/manifesto/sign — accepts a manifesto signature.
//
// Spam protection in this order (cheapest checks first):
//   1. Rate limit (3 attempts / 60s / IP)
//   2. Honeypot field (silently dropped if filled)
//   3. Body validation (length / type)
//   4. Optional Gemini toxicity check (only when message present)
//   5. IP-day uniqueness via DB unique index
//
// IP is hashed with a server-side salt before storage so the table never
// holds raw IPs.

import { createHash } from 'node:crypto'
import { rateLimit } from '../_lib/rateLimit.js'
import { adminClient } from '../_lib/supabase-admin.js'
import { checkManifestoToxicity } from '../_lib/manifestoModeration.js'

const NAME_MIN = 2
const NAME_MAX = 50
const CITY_MIN = 2
const CITY_MAX = 60
const MESSAGE_MAX = 200

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function ipFrom(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim()
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0]
  return req.socket?.remoteAddress || 'unknown'
}

function hashIp(ip) {
  const salt = process.env.MANIFESTO_IP_SALT
  if (!salt) {
    // Without a salt, hashes would still be deterministic but trivially
    // reversible against the public IP space — refuse to write.
    throw new Error('MANIFESTO_IP_SALT not configured')
  }
  return createHash('sha256').update(ip + ':' + salt).digest('hex')
}

function validate(body) {
  const errors = []
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const city = typeof body.city === 'string' ? body.city.trim() : ''
  const messageRaw = typeof body.message === 'string' ? body.message : ''
  const message = messageRaw.trim()

  if (name.length < NAME_MIN || name.length > NAME_MAX) errors.push('name')
  if (city.length < CITY_MIN || city.length > CITY_MAX) errors.push('city')
  if (message.length > MESSAGE_MAX) errors.push('message')
  return { errors, normalized: { name, city, message: message || null } }
}

async function fetchTotal(supa) {
  const { data } = await supa.from('manifesto_stats').select('total').single()
  return data?.total ?? 0
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  // 1. Rate limit
  if (!rateLimit(req, res, { limit: 3, windowMs: 60_000, scope: 'manifesto-sign' })) {
    return  // rateLimit already wrote 429
  }

  // 2. Honeypot — silently accept (200 ok) so bots can't tell they were caught
  const body = req.body ?? {}
  if (body.hp_url || body.hp_email) {
    return res.status(200).json({ ok: true, total: 0, queued: true })
  }

  // 3. Validation
  const { errors, normalized } = validate(body)
  if (errors.length > 0) {
    return res.status(422).json({ ok: false, error: 'validation', errors })
  }

  // 4. Toxicity (only if message present)
  if (normalized.message) {
    const tox = await checkManifestoToxicity(normalized.message)
    if (tox.toxic) {
      return res.status(422).json({ ok: false, error: 'message_rejected', detail: tox.reason })
    }
  }

  // 5. Insert via service-role
  const supa = adminClient()
  if (!supa) {
    return res.status(503).json({ ok: false, error: 'db_unavailable' })
  }

  let ip_hash
  try {
    ip_hash = hashIp(ipFrom(req))
  } catch (err) {
    console.error('[manifesto] cannot hash ip', err.message)
    return res.status(503).json({ ok: false, error: 'config_missing' })
  }

  const userAgent = String(req.headers['user-agent'] ?? '').slice(0, 200) || null

  const { error } = await supa.from('manifesto_signatures').insert({
    name: normalized.name,
    city: normalized.city,
    message: normalized.message,
    ip_hash,
    user_agent: userAgent,
  })

  if (error) {
    if (error.code === '23505') {
      // Unique violation — same IP already signed today.
      return res.status(409).json({ ok: false, error: 'already_signed_today' })
    }
    console.error('[manifesto] insert failed', error.message)
    return res.status(500).json({ ok: false, error: 'db_error' })
  }

  const total = await fetchTotal(supa)
  return res.status(201).json({ ok: true, total })
}
