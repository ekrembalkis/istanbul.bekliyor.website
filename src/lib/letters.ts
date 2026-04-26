import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export type Letter = {
  id: string
  detainee_id: string | null
  author_name: string | null
  message: string
  created_at: string
}

export type LettersStats = {
  total: number
  last_24h: number
  distinct_recipients: number
}

const COLUMNS = 'id, detainee_id, author_name, message, created_at'
const POLL_INTERVAL_MS = 30_000

function isValidRow(row: unknown): row is Letter {
  if (!row || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    (r.detainee_id === null || typeof r.detainee_id === 'string') &&
    (r.author_name === null || typeof r.author_name === 'string') &&
    typeof r.message === 'string' &&
    typeof r.created_at === 'string' &&
    /^\d{4}-\d{2}-\d{2}/.test(r.created_at)
  )
}

export type LettersFilter =
  | { kind: 'all' }
  | { kind: 'general' }  // detainee_id IS NULL
  | { kind: 'detainee'; id: string }

export type UseLettersOptions = {
  /** Defaults to { kind: 'all' }. */
  filter?: LettersFilter
  limit?: number
}

function filterKey(f: LettersFilter): string {
  if (f.kind === 'detainee') return `detainee:${f.id}`
  return f.kind
}

export function useLetters({ filter = { kind: 'all' }, limit = 100 }: UseLettersOptions = {}) {
  const [data, setData] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!supabase) {
        if (!cancelled) {
          setData([])
          setLoading(false)
        }
        return
      }
      let q = supabase
        .from('letters')
        .select(COLUMNS)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (filter.kind === 'general') q = q.is('detainee_id', null)
      else if (filter.kind === 'detainee') q = q.eq('detainee_id', filter.id)

      const { data: rows, error: err } = await q
      if (cancelled) return

      if (err || !rows) {
        const msg = (err?.message ?? 'Bilinmeyen Supabase hatası').slice(0, 80)
        console.warn('[letters] fetch failed')
        setError(msg)
        setLoading(false)
        return
      }

      const valid: Letter[] = []
      for (const r of rows) if (isValidRow(r)) valid.push(r)
      setData(valid)
      setLoading(false)
    }

    load()
    const handle = window.setInterval(load, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(handle)
    }
  }, [filterKey(filter), limit])

  return { data, loading, error }
}

export function useLettersStats() {
  const [stats, setStats] = useState<LettersStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!supabase) {
        if (!cancelled) {
          setStats({ total: 0, last_24h: 0, distinct_recipients: 0 })
          setLoading(false)
        }
        return
      }
      const { data, error } = await supabase
        .from('letters_stats')
        .select('total, last_24h, distinct_recipients')
        .single()

      if (cancelled) return

      if (error || !data) {
        setStats({ total: 0, last_24h: 0, distinct_recipients: 0 })
        setLoading(false)
        return
      }
      setStats({
        total: typeof data.total === 'number' ? data.total : 0,
        last_24h: typeof data.last_24h === 'number' ? data.last_24h : 0,
        distinct_recipients:
          typeof data.distinct_recipients === 'number' ? data.distinct_recipients : 0,
      })
      setLoading(false)
    }

    load()
    const handle = window.setInterval(load, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(handle)
    }
  }, [])

  return { stats, loading }
}

// ─── Validation (mirrors server-side rules) ────────────────────────────────

export const NAME_MIN = 2
export const NAME_MAX = 50
export const MESSAGE_MIN = 4
export const MESSAGE_MAX = 280

export type LetterValidationErrors = Partial<
  Record<'message' | 'author_name', string>
>

export type LetterInput = {
  message: string
  author_name?: string
  detainee_id?: string | null
}

export function validateLetter(input: LetterInput): LetterValidationErrors {
  const errors: LetterValidationErrors = {}
  const message = input.message.trim()
  const author = (input.author_name ?? '').trim()

  if (message.length < MESSAGE_MIN) errors.message = `Mesaj en az ${MESSAGE_MIN} karakter olmalı.`
  else if (message.length > MESSAGE_MAX) errors.message = `Mesaj en fazla ${MESSAGE_MAX} karakter olabilir.`

  if (author.length > 0 && author.length < NAME_MIN) {
    errors.author_name = `Ad en az ${NAME_MIN} harf olmalı, ya da boş bırak.`
  } else if (author.length > NAME_MAX) {
    errors.author_name = `Ad en fazla ${NAME_MAX} harf olabilir.`
  }
  return errors
}

// ─── Submit ────────────────────────────────────────────────────────────────

export type LetterSubmitResult =
  | { ok: true; total: number }
  | { ok: false; status: number; error: string; detail?: string }

export async function submitLetter(
  input: LetterInput & { hp_url?: string; hp_email?: string },
): Promise<LetterSubmitResult> {
  try {
    const res = await fetch('/api/letters/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input.message.trim(),
        author_name: input.author_name?.trim() || undefined,
        detainee_id: input.detainee_id || undefined,
        hp_url: input.hp_url || undefined,
        hp_email: input.hp_email || undefined,
      }),
    })
    const json = await res.json().catch(() => ({}))
    if (res.ok) {
      return { ok: true, total: typeof json.total === 'number' ? json.total : 0 }
    }
    return {
      ok: false,
      status: res.status,
      error: typeof json.error === 'string' ? json.error : 'unknown',
      detail: typeof json.detail === 'string' ? json.detail : undefined,
    }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: 'network',
      detail: err instanceof Error ? err.message : undefined,
    }
  }
}

export const SUBMIT_ERROR_MESSAGES: Record<string, string> = {
  validation: 'Bir alan eksik veya geçersiz. Lütfen kontrol edin.',
  message_rejected: 'Mesajınız moderasyon tarafından reddedildi. Daha nazik bir ifade deneyin.',
  moderation_unavailable: 'Moderasyon servisi şu an ulaşılmıyor. 30 saniye sonra tekrar deneyin.',
  too_fast: 'Çok hızlı yazıyorsunuz. Bir dakika sonra tekrar deneyin.',
  rate_limited: 'Çok hızlı deniyorsunuz. Birkaç dakika bekleyin.',
  unknown_detainee: 'Seçilen kişi bulunamadı. Lütfen yeniden seçin.',
  db_unavailable: 'Veri kaynağı şu an ulaşılmıyor. Birazdan tekrar deneyin.',
  config_missing: 'Sunucu yapılandırması eksik. Yetkililer bilgilendirildi.',
  db_error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
  origin_not_allowed: 'Bu site bu işleme izin vermiyor.',
  method_not_allowed: 'Geçersiz istek yöntemi.',
  network: 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.',
  unknown: 'Beklenmeyen bir hata. Lütfen tekrar deneyin.',
}
