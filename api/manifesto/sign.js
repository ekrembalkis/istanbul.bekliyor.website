// POST /api/manifesto/sign — accepts a manifesto signature.
//
// Spam protection in this order (cheapest checks first):
//   1. CORS origin allowlist (rejects cross-site form posts up front)
//   2. Rate limit (3 attempts / 60s / IP)
//   3. Honeypot field — silently accepted with the same shape as a real
//      signature so bots can't tell they were caught
//   4. Body validation (length / type)
//   5. Gemini toxicity check (fail-closed: errors return 503)
//   6. IP-day uniqueness via DB unique index
//
// IP is hashed with a server-side salt before storage so the table never
// holds raw IPs.

import { createHash } from 'node:crypto'
import { applyCors } from '../_lib/cors.js'
import { clientIp } from '../_lib/ip.js'
import { rateLimit } from '../_lib/rateLimit.js'
import { adminClient } from '../_lib/supabase-admin.js'
import {
  checkManifestoToxicity,
  ModerationUnavailableError,
} from '../_lib/manifestoModeration.js'

const NAME_MIN = 2
const NAME_MAX = 50
const CITY_MIN = 2
const CITY_MAX = 60
const MESSAGE_MAX = 200

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default async function handler(req, res) {
  if (!applyCors(req, res)) return  // 204 / 403 already written

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  // 1. Rate limit
  if (!rateLimit(req, res, { limit: 3, windowMs: 60_000, scope: 'manifesto-sign' })) {
    return  // rateLimit already wrote 429
  }

  const body = req.body ?? {}

  // 2. Honeypot — succeed indistinguishably from the real path.
  // We fetch the real total and pad with the typical latency of a Gemini
  // call so a bot can't side-channel the rejection by status, total, or
  // timing. No insert happens.
  if (body.hp_url || body.hp_email) {
    const supa = adminClient()
    const total = supa ? await fetchTotal(supa).catch(() => 0) : 0
    await sleep(800 + Math.floor(Math.random() * 700))
    return res.status(201).json({ ok: true, total })
  }

  // 3. Validation
  const { errors, normalized } = validate(body)
  if (errors.length > 0) {
    return res.status(422).json({ ok: false, error: 'validation', errors })
  }

  // 4. Toxicity (only if message present). Fail-closed: a Gemini outage
  //    surfaces as 503 so the client can retry rather than letting toxic
  //    content slip through.
  if (normalized.message) {
    try {
      const tox = await checkManifestoToxicity(normalized.message)
      if (tox.toxic) {
        return res.status(422).json({
          ok: false,
          error: 'message_rejected',
          detail: tox.reason,
        })
      }
    } catch (err) {
      if (err instanceof ModerationUnavailableError) {
        res.setHeader('Retry-After', '30')
        return res.status(503).json({ ok: false, error: 'moderation_unavailable' })
      }
      throw err
    }
  }

  // 5. Insert via service-role
  const supa = adminClient()
  if (!supa) {
    return res.status(503).json({ ok: false, error: 'db_unavailable' })
  }

  let ip_hash
  try {
    ip_hash = hashIp(clientIp(req))
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
