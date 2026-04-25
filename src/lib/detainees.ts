import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export type Detainee = {
  id: string
  slug: string
  name: string
  title: string | null
  arrest_date: string
  release_date: string | null
  photo_url: string | null
  is_featured: boolean
  display_order: number
  notes: string | null
  day_count: number
}

const ISTANBUL_TZ_SUFFIX = '+03:00' // Türkiye sabit UTC+3 (DST yok). lib/utils.ts ile aynı.

const FALLBACK: Detainee[] = [
  {
    id: 'fallback-imamoglu',
    slug: 'ekrem-imamoglu',
    name: 'Ekrem İmamoğlu',
    title: 'İBB Başkanı',
    arrest_date: '2025-03-19',
    release_date: null,
    photo_url: '/imamoglu.jpg',
    is_featured: true,
    display_order: 1,
    notes: null,
    day_count: 0,
  },
]

type DetaineeRow = Omit<Detainee, 'day_count'>

function isValidRow(row: unknown): row is DetaineeRow {
  if (!row || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.slug === 'string' &&
    typeof r.name === 'string' &&
    typeof r.arrest_date === 'string' &&
    /^\d{4}-\d{2}-\d{2}/.test(r.arrest_date)
  )
}

function withComputedDays(rows: DetaineeRow[]): Detainee[] {
  const now = Date.now()
  return rows.map(r => {
    // Istanbul TZ'ye sabitle — kullanıcının yerel TZ'sinden bağımsız tutarlı sayım.
    const start = new Date(`${r.arrest_date}T00:00:00${ISTANBUL_TZ_SUFFIX}`).getTime()
    const days = Math.max(0, Math.floor((now - start) / 86_400_000))
    return { ...r, day_count: days }
  })
}

export function useDetainees() {
  const [data, setData] = useState<Detainee[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!supabase) {
        if (!cancelled) {
          setData(withComputedDays(FALLBACK))
          setLoading(false)
        }
        return
      }
      const { data: rows, error: err } = await supabase
        .from('detainees')
        .select('id, slug, name, title, arrest_date, release_date, photo_url, is_featured, display_order, notes')
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('arrest_date', { ascending: true })

      if (cancelled) return

      if (err || !rows) {
        const msg = err?.message ?? 'Bilinmeyen Supabase hatası'
        console.warn('[detainees] Supabase fetch failed, using fallback:', msg)
        setError(msg)
        setData(withComputedDays(FALLBACK))
        setLoading(false)
        return
      }

      const valid: DetaineeRow[] = []
      let dropped = 0
      for (const raw of rows) {
        if (isValidRow(raw)) {
          valid.push(raw)
        } else {
          dropped++
        }
      }
      if (dropped > 0) {
        console.warn(`[detainees] ${dropped} row(s) dropped — schema mismatch`)
      }
      setData(withComputedDays(valid.length > 0 ? valid : FALLBACK))
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}
