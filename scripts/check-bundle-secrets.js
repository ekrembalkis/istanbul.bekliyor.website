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
const ANON_ALLOWLIST = ['VITE_SUPABASE_ANON_KEY', 'supabase.anonKey', 'sbp_anon']

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
    const isAnon = name.startsWith('JWT') && ANON_ALLOWLIST.some(a => line.includes(a))
    if (isAnon) continue
    findings.push({ file, name, sample: m[0].slice(0, 24) + '…' })
  }
}

if (findings.length > 0) {
  process.stderr.write('\n✖ Bundle secret check FAILED — possible secret in client bundle:\n\n')
  for (const f of findings) process.stderr.write(`  • ${f.file}  →  ${f.name}  (${f.sample})\n`)
  process.stderr.write('\nIf the value is intentionally public, add its name to ANON_ALLOWLIST in scripts/check-bundle-secrets.js.\n\n')
  process.exit(1)
}
process.stdout.write('✓ Bundle secret check passed.\n')
