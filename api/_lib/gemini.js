// Gemini API helper — single source of truth for model, fetch wrapping,
// prompt sanitization, structured output, and safety settings.
//
// Used by: analyze-personality, extract-topics, generate-prompt,
// generate-style-summary, generate-tweet, generate-instagram.

const DEFAULT_MODEL = 'gemini-3-flash-preview'

// Endpoint config sourced entirely from env so the URL host is not hardcoded.
// .env.example documents the expected values for `vercel env pull`.
function getApiBase() {
  const scheme = process.env.GEMINI_API_SCHEME?.trim() || 'https'
  const host = process.env.GEMINI_API_HOST?.trim()
  const version = process.env.GEMINI_API_VERSION?.trim() || 'v1beta'
  if (!host) {
    throw new Error('GEMINI_API_HOST env var missing — set it in Vercel project env or .env.local')
  }
  return `${scheme}://${host}/${version}/models`
}

const DEFAULT_TIMEOUT_MS = 30_000
const RETRY_STATUS = new Set([429, 500, 502, 503, 504])

// Gemini 3.x best-practice: temperature stays at 1.0; tune diversity via topP/topK.
const DEFAULT_GEN_CONFIG = {
  temperature: 1.0,
  topP: 0.95,
  topK: 40,
}

// Politik kampanya içeriği için makul gevşetme — Gemini'nin default safety
// filtreleri "tutuklu siyasetçi" gibi içerikleri yutuyor.
const PERMISSIVE_SAFETY = [
  'HARM_CATEGORY_HARASSMENT',
  'HARM_CATEGORY_HATE_SPEECH',
  'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  'HARM_CATEGORY_DANGEROUS_CONTENT',
].map(category => ({ category, threshold: 'BLOCK_ONLY_HIGH' }))

export function getModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL
}

/**
 * Length-cap + escape risky control sequences. Use on every user-supplied
 * string before interpolating into a prompt template.
 */
export function sanitizePromptInput(value, { maxLen = 4000 } = {}) {
  if (value == null) return ''
  let s = String(value)
  // Strip triple backticks / triple quotes that could break out of code fences.
  s = s.replace(/```+/g, '').replace(/'''+/g, '').replace(/"""+/g, '')
  // Drop the common LLM prompt-injection markers.
  s = s.replace(/\b(system|assistant|user)\s*:/gi, m => m.replace(':', '∶'))
  // Length cap — protects against token blow-up & "ignore previous" suffix attacks.
  if (s.length > maxLen) s = s.slice(0, maxLen) + '…'
  return s
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}

/**
 * @typedef {Object} GeminiOptions
 * @property {string} prompt                           User-side prompt body.
 * @property {string} [systemInstruction]              System instruction (preferred over inlining in prompt).
 * @property {object} [responseJsonSchema]             JSON Schema (lowercase, NOT OpenAPI 'responseSchema').
 * @property {object} [generationConfigOverrides]      Override temperature/topP/topK/maxOutputTokens.
 * @property {string} [modelOverride]                  Pin a specific model.
 * @property {Array<{role:string,parts:Array}>} [history] Multi-turn history if needed.
 * @property {number} [timeoutMs=30000]                Per-attempt timeout.
 */

/**
 * Call Gemini generateContent with structured output, retry, timeout, safety.
 * Returns { text, json, usage, raw }.
 */
export async function geminiGenerate(opts) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY missing')

  const model = opts.modelOverride || getModel()
  const url = `${getApiBase()}/${model}:generateContent?key=${apiKey}`

  const generationConfig = {
    ...DEFAULT_GEN_CONFIG,
    maxOutputTokens: 2048,
    ...opts.generationConfigOverrides,
  }
  if (opts.responseJsonSchema) {
    generationConfig.responseMimeType = 'application/json'
    generationConfig.responseJsonSchema = opts.responseJsonSchema
  }

  const body = {
    contents: [
      ...(opts.history || []),
      { role: 'user', parts: [{ text: opts.prompt }] },
    ],
    generationConfig,
    safetySettings: PERMISSIVE_SAFETY,
  }
  if (opts.systemInstruction) {
    body.systemInstruction = { parts: [{ text: opts.systemInstruction }] }
  }

  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const init = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }

  let lastErr = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(url, init, timeoutMs)
      if (res.ok) {
        const raw = await res.json()
        const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        const usage = {
          promptTokens: raw?.usageMetadata?.promptTokenCount ?? 0,
          completionTokens: raw?.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: raw?.usageMetadata?.totalTokenCount ?? 0,
        }
        let json = null
        if (opts.responseJsonSchema) {
          try {
            json = JSON.parse(text)
          } catch (parseErr) {
            const finishReason = raw?.candidates?.[0]?.finishReason
            throw Object.assign(new Error('Gemini returned invalid JSON'), {
              status: 502,
              detail: { parseError: String(parseErr), finishReason, textPreview: text.slice(0, 240) },
            })
          }
        }
        return { text, json, usage, raw, model }
      }

      const errBody = await res.json().catch(() => ({}))
      const error = Object.assign(new Error(errBody?.error?.message || res.statusText), {
        status: res.status,
        detail: errBody?.error,
      })
      if (RETRY_STATUS.has(res.status) && attempt === 0) {
        lastErr = error
        await sleep(500 + Math.random() * 500)
        continue
      }
      throw error
    } catch (err) {
      if (err.name === 'AbortError') {
        const e = Object.assign(new Error('Gemini request timed out'), { status: 504 })
        if (attempt === 0) {
          lastErr = e
          continue
        }
        throw e
      }
      if (attempt === 0 && (err.status == null || RETRY_STATUS.has(err.status))) {
        lastErr = err
        await sleep(500 + Math.random() * 500)
        continue
      }
      throw err
    }
  }
  throw lastErr ?? new Error('Gemini call failed')
}

/**
 * Map a thrown geminiGenerate error to a Vercel-style res.status(...).json(...).
 * Pass-through 4xx/429 keeps client retry semantics intact.
 */
export function handleGeminiError(err, res) {
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500
  res.status(status).json({
    error: status === 429 ? 'rate_limited' : status >= 500 ? 'gemini_unavailable' : 'gemini_bad_request',
    message: err.message,
    detail: err.detail ?? null,
  })
}
