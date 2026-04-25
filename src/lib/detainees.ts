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

function withComputedDays(rows: Omit<Detainee, 'day_count'>[]): Detainee[] {
  const today = new Date()
  return rows.map(r => {
    const start = new Date(r.arrest_date + 'T00:00:00')
    const ms = today.getTime() - start.getTime()
    const days = Math.max(0, Math.floor(ms / 86_400_000))
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
        setError(err?.message ?? 'unknown error')
        setData(withComputedDays(FALLBACK))
      } else {
        setData(withComputedDays(rows as Omit<Detainee, 'day_count'>[]))
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}
