// POST /api/letters/send — accepts a short letter for the wall.
//
// Spam protection (cheapest first):
//   1. CORS origin allowlist
//   2. Rate limit (5 attempts / 5min / IP)
//   3. Honeypot (silently accepted, indistinguishable shape)
//   4. Body validation (message required 4-280; author_name optional 2-50;
//      detainee_id optional UUID)
//   5. Gemini toxicity check (fail-closed)
//   6. IP-minute uniqueness via DB unique index

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
const MESSAGE_MIN = 4
const MESSAGE_MAX = 280
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function hashIp(ip) {
  const salt = process.env.MANIFESTO_IP_SALT
  if (!salt) throw new Error('MANIFESTO_IP_SALT not configured')
  return createHash('sha256').update(ip + ':' + salt).digest('hex')
}

function validate(body) {
  const errors = []
  const messageRaw = typeof body.message === 'string' ? body.message : ''
  const message = messageRaw.trim()
  const nameRaw = typeof body.author_name === 'string' ? body.author_name : ''
  const author_name = nameRaw.trim() || null
  const detainee_id =
    typeof body.detainee_id === 'string' && body.detainee_id.trim()
      ? body.detainee_id.trim()
      : null

  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) errors.push('message')
  if (author_name !== null && (author_name.length < NAME_MIN || author_name.length > NAME_MAX)) {
    errors.push('author_name')
  }
  if (detainee_id !== null && !UUID_RE.test(detainee_id)) {
    errors.push('detainee_id')
  }

  return { errors, normalized: { message, author_name, detainee_id } }
}

async function fetchTotal(supa) {
  const { data } = await supa.from('letters_stats').select('total').single()
  return data?.total ?? 0
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default async function handler(req, res) {
  if (!applyCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  if (!rateLimit(req, res, { limit: 5, windowMs: 5 * 60_000, scope: 'letters-send' })) {
    return
  }

  const body = req.body ?? {}

  // Honeypot — succeed indistinguishably from real path.
  if (body.hp_url || body.hp_email) {
    const supa = adminClient()
    const total = supa ? await fetchTotal(supa).catch(() => 0) : 0
    await sleep(800 + Math.floor(Math.random() * 700))
    return res.status(201).json({ ok: true, total })
  }

  const { errors, normalized } = validate(body)
  if (errors.length > 0) {
    return res.status(422).json({ ok: false, error: 'validation', errors })
  }

  // Toxicity is mandatory for letters (message always present).
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

  const supa = adminClient()
  if (!supa) {
    return res.status(503).json({ ok: false, error: 'db_unavailable' })
  }

  // If a detainee_id was supplied, confirm it exists. The FK would catch
  // bad ids on insert anyway but this gives a clearer 422.
  if (normalized.detainee_id) {
    const { data: row, error: lookupErr } = await supa
      .from('detainees')
      .select('id')
      .eq('id', normalized.detainee_id)
      .maybeSingle()
    if (lookupErr || !row) {
      return res.status(422).json({ ok: false, error: 'unknown_detainee' })
    }
  }

  let ip_hash
  try {
    ip_hash = hashIp(clientIp(req))
  } catch (err) {
    console.error('[letters] cannot hash ip', err.message)
    return res.status(503).json({ ok: false, error: 'config_missing' })
  }

  const userAgent = String(req.headers['user-agent'] ?? '').slice(0, 200) || null

  const { error } = await supa.from('letters').insert({
    detainee_id: normalized.detainee_id,
    author_name: normalized.author_name,
    message: normalized.message,
    ip_hash,
    user_agent: userAgent,
  })

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ ok: false, error: 'too_fast' })
    }
    console.error('[letters] insert failed', error.message)
    return res.status(500).json({ ok: false, error: 'db_error' })
  }

  const total = await fetchTotal(supa)
  return res.status(201).json({ ok: true, total })
}
