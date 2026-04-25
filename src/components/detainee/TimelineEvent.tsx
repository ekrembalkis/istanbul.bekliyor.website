import { EVENT_TYPE_LABELS, type DetaineeEvent } from '../../lib/detainees'

type Props = {
  event: DetaineeEvent
  /** Animation delay in seconds (capped upstream). */
  delay: number
}

export function TimelineEvent({ event, delay }: Props) {
  return (
    <li
      className="relative pl-10 sm:pl-14 pb-12 editorial-reveal"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Node — altın daire, çizgi ile hizalı */}
      <span
        aria-hidden="true"
        className="absolute left-0 sm:left-2 top-[10px] block w-3 h-3 rounded-full bg-accent"
        style={{
          boxShadow: '0 0 0 4px var(--bg), 0 0 24px color-mix(in oklab, var(--accent) 50%, transparent)',
        }}
      />
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="editorial-mono text-ink-muted">{formatDate(event.event_date)}</span>
        <span className="editorial-mono text-accent">{EVENT_TYPE_LABELS[event.event_type]}</span>
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
