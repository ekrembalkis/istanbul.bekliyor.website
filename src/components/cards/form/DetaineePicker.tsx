import type { Detainee } from '../../../lib/detainees'

type Props = {
  detainees: Detainee[]
  selectedSlug: string | null
  onChange: (slug: string) => void
  loading: boolean
}

export function DetaineePicker({ detainees, selectedSlug, onChange, loading }: Props) {
  return (
    <div>
      <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
        — KİŞİ
      </span>
      {loading ? (
        <div className="mt-3 editorial-mono text-ink-muted opacity-70" style={{ fontSize: 11 }}>
          — Yükleniyor —
        </div>
      ) : detainees.length === 0 ? (
        <div className="mt-3 editorial-mono text-ink-muted" style={{ fontSize: 11 }}>
          — Roster güncelleniyor —
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-1 max-h-48 overflow-auto pr-2">
          {detainees.map(d => (
            <button
              key={d.id}
              type="button"
              onClick={() => onChange(d.slug)}
              aria-pressed={selectedSlug === d.slug}
              className={
                'text-left px-3 py-2 border transition-colors flex items-baseline justify-between gap-3 ' +
                (selectedSlug === d.slug
                  ? 'border-accent bg-accent/10'
                  : 'border-rule hover:border-ink')
              }
            >
              <span className="font-serif text-ink" style={{ fontSize: 16 }}>
                {d.name}
              </span>
              <span className="editorial-mono text-ink-muted" style={{ fontSize: 10, letterSpacing: '0.22em' }}>
                {d.day_count} GÜN
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
