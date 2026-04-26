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
  | 'protest'
  | 'legal'
  | 'press'
  | 'milestone'

export type DetaineeEvent = {
  id: string
  /** null = site-wide / general event (not bound to a specific detainee). */
  detainee_id: string | null
  event_date: string
  event_type: DetaineeEventType
  title: string
  description: string | null
  source_url: string | null
  source_label: string | null
  display_order: number
}

export const VALID_EVENT_TYPES: ReadonlySet<DetaineeEventType> = new Set([
  'arrest', 'detention', 'indictment', 'hearing', 'ruling',
  'release', 'statement', 'transfer', 'other',
  'protest', 'legal', 'press', 'milestone',
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

function isStringOrNull(v: unknown): v is string | null {
  return v === null || typeof v === 'string'
}

function isBool(v: unknown): v is boolean {
  return typeof v === 'boolean'
}

function isFiniteInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && Math.floor(v) === v
}

function isValidRow(row: unknown): row is DetaineeRow {
  if (!row || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.slug === 'string' &&
    typeof r.name === 'string' &&
    typeof r.arrest_date === 'string' &&
    /^\d{4}-\d{2}-\d{2}/.test(r.arrest_date) &&
    isStringOrNull(r.title) &&
    isStringOrNull(r.release_date) &&
    isStringOrNull(r.photo_url) &&
    isStringOrNull(r.notes) &&
    isStringOrNull(r.bio_md) &&
    isBool(r.is_featured) &&
    isFiniteInt(r.display_order)
  )
}

export function isValidEvent(row: unknown): row is DetaineeEvent {
  if (!row || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    isStringOrNull(r.detainee_id) &&
    typeof r.event_date === 'string' &&
    /^\d{4}-\d{2}-\d{2}/.test(r.event_date) &&
    typeof r.event_type === 'string' &&
    VALID_EVENT_TYPES.has(r.event_type as DetaineeEventType) &&
    typeof r.title === 'string' &&
    isStringOrNull(r.description) &&
    isStringOrNull(r.source_url) &&
    isStringOrNull(r.source_label) &&
    isFiniteInt(r.display_order)
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
    // Reset to 'loading' on every key change so the previous detainee's
    // 'ready' state doesn't flash for a frame.
    setState({ status: 'loading' })

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
  protest: 'EYLEM',
  legal: 'HUKUKİ ADIM',
  press: 'BASIN',
  milestone: 'DÖNÜM NOKTASI',
}

export type EventStreamFilter = {
  types?: DetaineeEventType[]
  /** null = "general" (no detainee), string = specific detainee id, undefined = no filter. */
  detaineeId?: string | 'general'
}

/** Pure helper for `useEventsStream` consumers + tests. */
export function filterEventsStream(
  events: DetaineeEvent[],
  filter: EventStreamFilter,
): DetaineeEvent[] {
  const typeSet = filter.types && filter.types.length > 0 ? new Set(filter.types) : null
  return events.filter(e => {
    if (typeSet && !typeSet.has(e.event_type)) return false
    if (filter.detaineeId === 'general') {
      return e.detainee_id === null
    }
    if (typeof filter.detaineeId === 'string') {
      return e.detainee_id === filter.detaineeId
    }
    return true
  })
}

export type EventsStreamState = {
  events: DetaineeEvent[]
  loading: boolean
  error: string | null
}

const EVENT_COLUMNS =
  'id, detainee_id, event_date, event_type, title, description, source_url, source_label, display_order'

const EVENTS_STREAM_POLL_MS = 30_000

/**
 * Site-wide event stream hook.
 * Fetches every event ordered by date DESC. Filtering is done in the page layer
 * via filterEventsStream so chip toggles stay snappy without re-querying.
 * 30s polling keeps the feed live for visitors leaving the tab open.
 */
export function useEventsStream(opts: { limit?: number } = {}): EventsStreamState {
  const [events, setEvents] = useState<DetaineeEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const limit = opts.limit ?? 200

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!supabase) {
        if (!cancelled) {
          setEvents([])
          setLoading(false)
        }
        return
      }

      const { data: rows, error: err } = await supabase
        .from('detainee_events')
        .select(EVENT_COLUMNS)
        .order('event_date', { ascending: false })
        .order('display_order', { ascending: false })
        .limit(limit)

      if (cancelled) return

      if (err || !rows) {
        const msg = (err?.message ?? 'Bilinmeyen Supabase hatası').slice(0, 80)
        console.warn('[events_stream] fetch failed')
        setError(msg)
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
        console.warn(`[events_stream] ${dropped} row(s) dropped (schema mismatch)`)
      }
      setEvents(valid)
      setError(null)
      setLoading(false)
    }

    load()
    const interval = setInterval(load, EVENTS_STREAM_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [limit])

  return { events, loading, error }
}
