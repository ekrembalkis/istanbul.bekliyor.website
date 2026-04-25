// Manifesto signature toxicity check. Wraps Gemini with a strict JSON schema
// so the API endpoint can reject toxic messages before insert.
//
// Returns { toxic: boolean, reason: string }. Errors fail-open (toxic=false)
// because Gemini being unreachable should not block legitimate signatures.

import { geminiGenerate, sanitizePromptInput } from './gemini.js'

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

  try {
    const { json } = await geminiGenerate({
      systemInstruction: SYSTEM_INSTRUCTION,
      prompt: `Mesaj: """${cleaned}"""\n\nDeğerlendir.`,
      responseJsonSchema: SCHEMA,
      generationConfigOverrides: { maxOutputTokens: 256 },
      timeoutMs: 6_000,
    })
    return {
      toxic: Boolean(json?.toxic),
      reason: typeof json?.reason === 'string' ? json.reason : '',
    }
  } catch (err) {
    // Fail-open: don't block legitimate signatures because of an upstream blip.
    console.warn('[manifesto] toxicity check failed', err?.message ?? err)
    return { toxic: false, reason: '' }
  }
}
