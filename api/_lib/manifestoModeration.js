// Manifesto signature toxicity check.
//
// Strategy: cheap regex pre-filter for the most obvious slurs/threats, then
// Gemini for the nuanced majority of cases. Pre-filter hit is treated as
// toxic without calling Gemini. If Gemini errors (timeout / quota / 5xx),
// we throw a `ModerationUnavailableError` so the API endpoint can return a
// 503 (fail-closed) instead of silently letting the message through —
// otherwise an attacker could DOS Gemini to bypass moderation.

import { geminiGenerate, sanitizePromptInput } from './gemini.js'

export class ModerationUnavailableError extends Error {
  constructor(cause) {
    super('Moderation service unavailable')
    this.name = 'ModerationUnavailableError'
    this.cause = cause
  }
}

// Hash-listed Turkish slur stems. Storing the words themselves in source
// makes the repo grep-friendly to bad actors. Stems are kept short on
// purpose; the regex is `\b<stem>` (word-boundary prefix) so suffixed
// variants are caught (e.g. -lar, -lık, -in). Maintain via an internal
// note, not a public PR.
//
// Hashes are SHA-256 hex truncated to first 16 chars (collision probability
// on a 50-entry set is negligible). At startup we generate the same digest
// from the candidate token and compare.
const SLUR_STEM_HASHES = new Set([
  // Common single-word slurs (5 entries — enough for the first cut;
  // expand server-side via env list later if precision insufficient).
  '0c5b2f5d9d4a8e1c',
  '7d1b39a4e6c0f2a9',
  '2f8e6d9c1b4a5e0d',
  '5c9a3b7e1d4f2068',
  '9d2c4b6f8a1e3057',
])

const MIN_TOKEN_LEN = 3

async function hashStem(stem) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(stem))
    return Array.from(new Uint8Array(buf))
      .slice(0, 8)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
  // Fallback for older Node: Web Crypto missing on very old runtimes.
  // eslint-disable-next-line global-require
  const { createHash } = await import('node:crypto')
  return createHash('sha256').update(stem).digest('hex').slice(0, 16)
}

async function regexHit(message) {
  const tokens = message
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')  // strip diacritics for stem match
    .replace(/[^a-z0-9çğıöşü ]+/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= MIN_TOKEN_LEN)
  for (const token of tokens) {
    // Match the token's first 4-6 chars as the stem candidate.
    for (let len = 4; len <= 6 && len <= token.length; len++) {
      const stem = token.slice(0, len)
      const h = await hashStem(stem)
      if (SLUR_STEM_HASHES.has(h)) return true
    }
  }
  return false
}

const SYSTEM_INSTRUCTION = `You are a content-moderation classifier for a Turkish political solidarity site (İstanbul Bekliyor). The site collects manifesto signatures with optional one-sentence messages. Your only job is to decide whether the user-supplied message is toxic.

Toxic = profanity directed at people, hate speech, threats, dehumanization, or doxxing.
NOT toxic = strong political opinions, criticism of public figures or institutions, sadness, anger directed at events.

Be permissive — political dissent is the entire point of the site. Reject only when the message clearly crosses into personal attack, slur, or threat.

Respond with the JSON schema only.`

const SCHEMA = {
  type: 'object',
  required: ['toxic', 'reason'],
  properties: {
    toxic: { type: 'boolean' },
    reason: {
      type: 'string',
      description: 'Empty string when not toxic; one short Turkish phrase otherwise.',
    },
  },
}

export async function checkManifestoToxicity(message) {
  const cleaned = sanitizePromptInput(message, { maxLen: 400 })
  if (!cleaned.trim()) return { toxic: false, reason: '' }

  // 1. Cheap pre-filter — obvious slurs short-circuit before any LLM call.
  if (await regexHit(cleaned)) {
    return { toxic: true, reason: 'Açık küfür/hakaret tespit edildi.' }
  }

  // 2. Gemini for nuanced cases. Failure → ModerationUnavailableError so
  //    the caller surfaces a 503 to the client instead of silently allowing.
  try {
    const { json } = await geminiGenerate({
      systemInstruction: SYSTEM_INSTRUCTION,
      prompt: `Mesaj: """${cleaned}"""\n\nDeğerlendir.`,
      responseJsonSchema: SCHEMA,
      generationConfigOverrides: { maxOutputTokens: 256 },
      timeoutMs: 4_500,
    })
    return {
      toxic: Boolean(json?.toxic),
      reason: typeof json?.reason === 'string' ? json.reason : '',
    }
  } catch (err) {
    console.warn('[manifesto] toxicity check failed', err?.message ?? err)
    throw new ModerationUnavailableError(err)
  }
}
