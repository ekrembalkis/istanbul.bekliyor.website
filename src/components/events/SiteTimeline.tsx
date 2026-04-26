import { Link } from 'react-router-dom'
import { EVENT_TYPE_LABELS, type DetaineeEvent } from '../../lib/detainees'

const STAGGER_STEP = 0.06
const STAGGER_CAP = 1.2

export type DetaineeLookup = Record<string, { slug: string; name: string }>

type Props = {
  events: DetaineeEvent[]
  loading: boolean
  error: string | null
  /** id → { slug, name } so we can render person badge + link without a join. */
  detaineeLookup: DetaineeLookup
  filtered?: boolean
}

export function SiteTimeline({ events, loading, error, detaineeLookup, filtered = false }: Props) {
  if (loading) {
    return (
      <div className="mt-10 editorial-mono text-ink-muted opacity-70 text-center">
        — Olay akışı yükleniyor —
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="status"
        className="mt-10 editorial-mono text-ink-muted border-l-2 border-accent pl-4 py-2 max-w-xl mx-auto"
      >
        — Veri kaynağı geçici olarak ulaşılmıyor —
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="mt-10 editorial-mono text-ink-muted text-center opacity-80">
        {filtered
          ? '— Bu süzgeçte gösterilecek kayıt yok —'
          : '— Olay kaydı henüz eklenmedi —'}
      </div>
    )
  }

  return (
    <ol className="relative mt-10 ml-1 sm:ml-3">
      <span
        aria-hidden="true"
        className="absolute left-[5px] sm:left-[13px] top-2 bottom-2 w-px bg-rule"
      />
      {events.map((e, i) => (
        <SiteTimelineRow
          key={e.id}
          event={e}
          person={e.detainee_id ? detaineeLookup[e.detainee_id] : undefined}
          delay={Math.min(0.08 + i * STAGGER_STEP, STAGGER_CAP)}
        />
      ))}
    </ol>
  )
}

function SiteTimelineRow({
  event,
  person,
  delay,
}: {
  event: DetaineeEvent
  person: { slug: string; name: string } | undefined
  delay: number
}) {
  return (
    <li
      className="relative pl-10 sm:pl-14 pb-12 editorial-reveal"
      style={{ animationDelay: `${delay}s` }}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 sm:left-2 top-[10px] block w-3 h-3 rounded-full bg-accent"
        style={{
          boxShadow:
            '0 0 0 4px var(--bg), 0 0 24px color-mix(in oklab, var(--accent) 50%, transparent)',
        }}
      />
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="editorial-mono text-ink-muted">{formatDate(event.event_date)}</span>
        <span className="editorial-mono text-accent">{EVENT_TYPE_LABELS[event.event_type]}</span>
        {person ? (
          <Link
            to={`/tutuklu/${person.slug}`}
            className="editorial-mono text-ink hover:text-accent transition-colors border-b border-current pb-[1px]"
          >
            → {person.name}
          </Link>
        ) : (
          <span
            className="editorial-mono text-ink-muted px-2 py-[2px] border border-rule"
            style={{ letterSpacing: '0.22em', fontSize: 11 }}
          >
            GENEL
          </span>
        )}
      </div>
      <h3
        className="font-serif text-ink mt-2"
        style={{ fontSize: 'clamp(22px, 2.2vw, 30px)', lineHeight: 1.25, letterSpacing: '-0.01em' }}
      >
        {event.title}
      </h3>
      {event.description && (
        <p
          className="font-serif text-ink-muted mt-3 max-w-[62ch]"
          style={{ fontSize: 'clamp(16px, 1.3vw, 19px)', lineHeight: 1.55 }}
        >
          {event.description}
        </p>
      )}
      {event.source_url && (
        <a
          href={event.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 editorial-mono text-ink hover:text-accent transition-colors border-b border-current pb-[2px]"
        >
          → {event.source_label || 'Kaynak'}
        </a>
      )}
    </li>
  )
}

function formatDate(iso: string): string {
  const d = new Date(/[Tt]/.test(iso) ? iso : `${iso}T00:00:00+03:00`)
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}
