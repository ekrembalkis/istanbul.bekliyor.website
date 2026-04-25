import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export type ManifestoSignature = {
  id: string
  name: string
  city: string
  message: string | null
  created_at: string
}

export type ManifestoStats = {
  total: number
  last_24h: number
  last_signed_at: string | null
}

const SIGNATURES_COLUMNS = 'id, name, city, message, created_at'
const POLL_INTERVAL_MS = 30_000

function isValidRow(row: unknown): row is ManifestoSignature {
  if (!row || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    typeof r.city === 'string' &&
    typeof r.created_at === 'string' &&
    (r.message === null || typeof r.message === 'string')
  )
}

export function useManifestoSignatures(limit = 100) {
  const [data, setData] = useState<ManifestoSignature[]>([])
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
      const { data: rows, error: err } = await supabase
        .from('manifesto_signatures')
        .select(SIGNATURES_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (cancelled) return

      if (err || !rows) {
        const msg = (err?.message ?? 'Bilinmeyen Supabase hatası').slice(0, 80)
        console.warn('[manifesto] fetch failed')
        setError(msg)
        setLoading(false)
        return
      }

      const valid: ManifestoSignature[] = []
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
  }, [limit])

  return { data, loading, error }
}

export function useManifestoStats() {
  const [stats, setStats] = useState<ManifestoStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!supabase) {
        if (!cancelled) {
          setStats({ total: 0, last_24h: 0, last_signed_at: null })
          setLoading(false)
        }
        return
      }
      const { data, error } = await supabase
        .from('manifesto_stats')
        .select('total, last_24h, last_signed_at')
        .single()

      if (cancelled) return

      if (error || !data) {
        setStats({ total: 0, last_24h: 0, last_signed_at: null })
        setLoading(false)
        return
      }
      setStats({
        total: typeof data.total === 'number' ? data.total : 0,
        last_24h: typeof data.last_24h === 'number' ? data.last_24h : 0,
        last_signed_at: typeof data.last_signed_at === 'string' ? data.last_signed_at : null,
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

// ─── Validation (mirrors the server-side rules) ────────────────────────────

export const NAME_MIN = 2
export const NAME_MAX = 50
export const CITY_MIN = 2
export const CITY_MAX = 60
export const MESSAGE_MAX = 200

export type ValidationErrors = Partial<Record<'name' | 'city' | 'message', string>>

export type SignatureInput = {
  name: string
  city: string
  message?: string
}

export function validateSignature(input: SignatureInput): ValidationErrors {
  const errors: ValidationErrors = {}
  const name = input.name.trim()
  const city = input.city.trim()
  const message = (input.message ?? '').trim()

  if (name.length < NAME_MIN) errors.name = `Adınız en az ${NAME_MIN} harf olmalı.`
  else if (name.length > NAME_MAX) errors.name = `Adınız en fazla ${NAME_MAX} harf olabilir.`

  if (city.length < CITY_MIN) errors.city = 'İl seçimi gerekli.'
  else if (city.length > CITY_MAX) errors.city = `İl en fazla ${CITY_MAX} karakter olabilir.`

  if (message.length > MESSAGE_MAX) errors.message = `Mesaj en fazla ${MESSAGE_MAX} karakter olabilir.`

  return errors
}

// ─── Submit ────────────────────────────────────────────────────────────────

export type SubmitResult =
  | { ok: true; total: number }
  | { ok: false; status: number; error: string; detail?: string }

export async function submitSignature(
  input: SignatureInput & { hp_url?: string },
): Promise<SubmitResult> {
  try {
    const res = await fetch('/api/manifesto/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name.trim(),
        city: input.city.trim(),
        message: input.message?.trim() || undefined,
        hp_url: input.hp_url || undefined,
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
  message_rejected: 'Mesajınız moderasyon tarafından reddedildi. Lütfen daha nazik bir ifade deneyin.',
  already_signed_today: 'Bu cihazdan bugün zaten imza atılmış. Yarın yine bekleriz.',
  rate_limited: 'Çok hızlı deniyorsunuz. Lütfen bir dakika bekleyin.',
  db_unavailable: 'Veri kaynağı şu an ulaşılmıyor. Birazdan tekrar deneyin.',
  config_missing: 'Sunucu yapılandırması eksik. Yetkililer bilgilendirildi.',
  db_error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
  network: 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.',
  unknown: 'Beklenmeyen bir hata. Lütfen tekrar deneyin.',
}
