#!/usr/bin/env node
/**
 * Post-build guard: scans dist/ for API-key shaped strings that should never
 * ship to the client bundle. Exits non-zero if anything matches so Vercel
 * fails the deploy instead of silently leaking a secret.
 *
 * Patterns we hunt:
 *   - xq_*           XQuik API key prefix
 *   - AIza[A-Za-z0-9_-]{35}   Google API key shape (Gemini, etc.)
 *   - eyJ[A-Za-z0-9_-]+\.eyJ JWT (Supabase service-role looks like this)
 *
 * VITE_SUPABASE_ANON_KEY also matches the JWT shape but it is intentionally
 * public — the matched line is checked against an allowlist of known anon-key
 * env names before being treated as a leak.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const DIST = 'dist'
const PATTERNS = [
  { name: 'XQuik API key (xq_*)', re: /\bxq_[A-Za-z0-9]{16,}\b/ },
  { name: 'Google API key (AIza…)', re: /\bAIza[A-Za-z0-9_-]{35}\b/ },
  { name: 'JWT (eyJ…)', re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/ },
]

// Lines containing one of these substrings are anon Supabase keys → expected.
// (Useful in dev when symbol names survive; after Vite minification the
// literal-value allowlist below does the real work.)
const ANON_ALLOWLIST = ['VITE_SUPABASE_ANON_KEY', 'supabase.anonKey', 'sbp_anon']

// Vite inlines `import.meta.env.VITE_*` at build time, so the symbol name is
// gone from the bundle. We accept an exact-value match against the env vars
// known to be intentionally public.
const PUBLIC_VALUES = new Set(
  [process.env.VITE_SUPABASE_ANON_KEY, process.env.VITE_SUPABASE_URL]
    .map(v => v?.trim())
    .filter(Boolean),
)

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) yield* walk(full)
    else yield full
  }
}

function shouldScan(file) {
  const ext = extname(file)
  return ext === '.js' || ext === '.mjs' || ext === '.cjs' || ext === '.html' || ext === '.css'
}

const findings = []
for (const file of walk(DIST)) {
  if (!shouldScan(file)) continue
  const content = readFileSync(file, 'utf8')
  for (const { name, re } of PATTERNS) {
    const m = content.match(re)
    if (!m) continue
    const idx = m.index ?? 0
    const line = content.slice(Math.max(0, idx - 60), idx + 60)
    const matched = m[0]
    const isAnonByContext = name.startsWith('JWT') && ANON_ALLOWLIST.some(a => line.includes(a))
    const isPublicByValue = PUBLIC_VALUES.has(matched)
    if (isAnonByContext || isPublicByValue) continue
    findings.push({ file, name, sample: matched.slice(0, 24) + '…' })
  }
}

if (findings.length > 0) {
  process.stderr.write('\n✖ Bundle secret check FAILED — possible secret in client bundle:\n\n')
  for (const f of findings) process.stderr.write(`  • ${f.file}  →  ${f.name}  (${f.sample})\n`)
  process.stderr.write('\nIf the value is intentionally public, add its name to ANON_ALLOWLIST in scripts/check-bundle-secrets.js.\n\n')
  process.exit(1)
}
process.stdout.write('✓ Bundle secret check passed.\n')
