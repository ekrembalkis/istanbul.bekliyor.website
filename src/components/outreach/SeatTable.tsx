import { useMemo } from 'react'
import { CITIES } from '../../data/cities'
import { seatsForPlate } from '../../data/deputies'

type Props = {
  highlightSlug?: string
  onPick?: (cityName: string) => void
}

/**
 * 81-province seat-count table. Sorted by seat count descending so the
 * heavy-weight provinces (İstanbul, Ankara, İzmir) anchor the top.
 */
export function SeatTable({ highlightSlug, onPick }: Props) {
  const rows = useMemo(() => {
    return CITIES.map(c => ({
      ...c,
      seats: c.plate !== null ? seatsForPlate(c.plate) ?? 0 : 0,
    })).sort((a, b) => b.seats - a.seats || a.name.localeCompare(b.name, 'tr-TR'))
  }, [])

  return (
    <div>
      <div
        className="editorial-mono text-ink-muted border-b border-rule pb-3 grid grid-cols-12 gap-3"
        style={{ letterSpacing: '0.22em', fontSize: 11 }}
      >
        <span className="col-span-1">№</span>
        <span className="col-span-7 sm:col-span-8">İL</span>
        <span className="col-span-2 sm:col-span-2 text-right">VEKİL</span>
        <span className="hidden sm:block sm:col-span-1 text-right">PLAKA</span>
      </div>
      <ul>
        {rows.map((c, i) => {
          const highlighted = c.slug === highlightSlug
          return (
            <li
              key={c.slug}
              className={
                'grid grid-cols-12 gap-3 items-baseline border-b border-rule py-3 transition-colors ' +
                (highlighted
                  ? 'bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]'
                  : 'hover:bg-[color-mix(in_oklab,var(--ink)_4%,transparent)]')
              }
            >
              <span
                className="col-span-1 editorial-mono text-ink-muted"
                style={{ letterSpacing: '0.22em', fontSize: 11 }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => onPick?.(c.name)}
                className="col-span-7 sm:col-span-8 text-left font-serif text-ink hover:text-accent transition-colors"
                style={{ fontSize: 'clamp(15px, 1.3vw, 18px)' }}
              >
                {c.name}
              </button>
              <span
                className="col-span-2 sm:col-span-2 text-right editorial-num text-accent tabular-nums"
                style={{ fontSize: 'clamp(18px, 1.6vw, 24px)', lineHeight: 1 }}
              >
                {c.seats}
              </span>
              <span
                className="hidden sm:block sm:col-span-1 text-right editorial-mono text-ink-muted"
                style={{ letterSpacing: '0.22em', fontSize: 11 }}
              >
                {String(c.plate).padStart(2, '0')}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
