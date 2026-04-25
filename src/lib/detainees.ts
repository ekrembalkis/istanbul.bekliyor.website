import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { daysSinceArrest } from './utils'

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
  bio_md: string | null
  day_count: number
}

export type DetaineeEventType =
  | 'arrest'
  | 'detention'
  | 'indictment'
  | 'hearing'
  | 'ruling'
  | 'release'
  | 'statement'
  | 'transfer'
  | 'other'

export type DetaineeEvent = {
  id: string
  detainee_id: string
  event_date: string
  event_type: DetaineeEventType
  title: string
  description: string | null
  source_url: string | null
  source_label: string | null
  display_order: number
}

const VALID_EVENT_TYPES: ReadonlySet<DetaineeEventType> = new Set([
  'arrest', 'detention', 'indictment', 'hearing', 'ruling',
  'release', 'statement', 'transfer', 'other',
])

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
    bio_md: null,
    day_count: 0,
  },
]

const DETAINEE_COLUMNS =
  'id, slug, name, title, arrest_date, release_date, photo_url, is_featured, display_order, notes, bio_md'

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

function isValidEvent(row: unknown): row is DetaineeEvent {
  if (!row || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.detainee_id === 'string' &&
    typeof r.event_date === 'string' &&
    /^\d{4}-\d{2}-\d{2}/.test(r.event_date) &&
    typeof r.event_type === 'string' &&
    VALID_EVENT_TYPES.has(r.event_type as DetaineeEventType) &&
    typeof r.title === 'string'
  )
}

function withComputedDays(rows: DetaineeRow[]): Detainee[] {
  const now = new Date()
  return rows.map(r => ({
    ...r,
    // Tek kaynak: lib/utils.ts daysSinceArrest. Istanbul TZ + 1-indexed.
    day_count: daysSinceArrest(r.arrest_date, now),
  }))
}

function withComputedDay(row: DetaineeRow): Detainee {
  return { ...row, day_count: daysSinceArrest(row.arrest_date, new Date()) }
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
        .select(DETAINEE_COLUMNS)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('arrest_date', { ascending: true })

      if (cancelled) return

      if (err || !rows) {
        const msg = (err?.message ?? 'Bilinmeyen Supabase hatası').slice(0, 80)
        console.warn('[detainees] fetch failed, using fallback')
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
        console.warn(`[detainees] ${dropped} row(s) dropped (schema mismatch)`)
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

export type DetaineeFetchState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | { status: 'ready'; detainee: Detainee }

export function useDetainee(slug: string | undefined): DetaineeFetchState {
  const [state, setState] = useState<DetaineeFetchState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!slug) {
        if (!cancelled) setState({ status: 'not-found' })
        return
      }

      if (!supabase) {
        const fallback = FALLBACK.find(d => d.slug === slug)
        if (!cancelled) {
          setState(
            fallback
              ? { status: 'ready', detainee: withComputedDay(fallback) }
              : { status: 'not-found' },
          )
        }
        return
      }

      const { data: row, error: err } = await supabase
        .from('detainees')
        .select(DETAINEE_COLUMNS)
        .eq('slug', slug)
        .maybeSingle()

      if (cancelled) return

      if (err) {
        const msg = (err.message ?? 'Bilinmeyen Supabase hatası').slice(0, 80)
        console.warn('[detainee] fetch failed')
        // Slug fallback'te varsa ona düş, yoksa hata göster.
        const fallback = FALLBACK.find(d => d.slug === slug)
        setState(
          fallback
            ? { status: 'ready', detainee: withComputedDay(fallback) }
            : { status: 'error', message: msg },
        )
        return
      }

      if (!row || !isValidRow(row)) {
        setState({ status: 'not-found' })
        return
      }

      setState({ status: 'ready', detainee: withComputedDay(row) })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  return state
}

export type DetaineeEventsState = {
  events: DetaineeEvent[]
  loading: boolean
  error: string | null
}

export function useDetaineeEvents(detaineeId: string | undefined): DetaineeEventsState {
  const [events, setEvents] = useState<DetaineeEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!detaineeId || !supabase) {
        if (!cancelled) {
          setEvents([])
          setLoading(false)
        }
        return
      }

      // Fallback id'leri (örn 'fallback-imamoglu') gerçek UUID değil — fetch atla.
      if (detaineeId.startsWith('fallback-')) {
        if (!cancelled) {
          setEvents([])
          setLoading(false)
        }
        return
      }

      const { data: rows, error: err } = await supabase
        .from('detainee_events')
        .select('id, detainee_id, event_date, event_type, title, description, source_url, source_label, display_order')
        .eq('detainee_id', detaineeId)
        .order('event_date', { ascending: false })
        .order('display_order', { ascending: false })

      if (cancelled) return

      if (err || !rows) {
        const msg = (err?.message ?? 'Bilinmeyen Supabase hatası').slice(0, 80)
        console.warn('[detainee_events] fetch failed')
        setError(msg)
        setEvents([])
        setLoading(false)
        return
      }

      const valid: DetaineeEvent[] = []
      let dropped = 0
      for (const raw of rows) {
        if (isValidEvent(raw)) {
          valid.push(raw)
        } else {
          dropped++
        }
      }
      if (dropped > 0) {
        console.warn(`[detainee_events] ${dropped} row(s) dropped (schema mismatch)`)
      }
      setEvents(valid)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [detaineeId])

  return { events, loading, error }
}

export const EVENT_TYPE_LABELS: Record<DetaineeEventType, string> = {
  arrest: 'GÖZALTI',
  detention: 'TUTUKLAMA',
  indictment: 'İDDİANAME',
  hearing: 'DURUŞMA',
  ruling: 'KARAR',
  release: 'TAHLİYE',
  statement: 'AÇIKLAMA',
  transfer: 'NAKİL',
  other: 'DİĞER',
}
