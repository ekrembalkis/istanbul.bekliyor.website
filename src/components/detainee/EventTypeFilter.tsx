import {
  EVENT_TYPE_LABELS,
  type DetaineeEvent,
  type DetaineeEventType,
} from '../../lib/detainees'

export type EventFilterValue = DetaineeEventType | 'all'

type Props = {
  value: EventFilterValue
  onChange: (next: EventFilterValue) => void
  /** Filter chips are only shown for types that actually have events. */
  events: DetaineeEvent[]
}

const ORDER: DetaineeEventType[] = [
  'arrest', 'detention', 'indictment', 'hearing', 'ruling',
  'release', 'statement', 'transfer', 'other',
]

export function EventTypeFilter({ value, onChange, events }: Props) {
  const presentTypes = new Set(events.map(e => e.event_type))
  const visible = ORDER.filter(t => presentTypes.has(t))

  // Hiç olay yoksa filtreyi gizle.
  if (visible.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Olay tipi süzgeci">
      <Chip
        label="TÜMÜ"
        selected={value === 'all'}
        count={events.length}
        onClick={() => onChange('all')}
      />
      {visible.map(type => (
        <Chip
          key={type}
          label={EVENT_TYPE_LABELS[type]}
          selected={value === type}
          count={events.filter(e => e.event_type === type).length}
          onClick={() => onChange(type)}
        />
      ))}
    </div>
  )
}

function Chip({
  label,
  selected,
  count,
  onClick,
}: {
  label: string
  selected: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        'editorial-mono px-3 py-1.5 border transition-colors ' +
        (selected
          ? 'bg-accent text-white border-accent'
          : 'border-rule text-ink-muted hover:text-ink hover:border-ink')
      }
    >
      {label}
      <span className="ml-2 opacity-60">{count}</span>
    </button>
  )
}

/** Pure helper for tests + page. */
export function filterEvents(
  events: DetaineeEvent[],
  filter: EventFilterValue,
): DetaineeEvent[] {
  if (filter === 'all') return events
  return events.filter(e => e.event_type === filter)
}
