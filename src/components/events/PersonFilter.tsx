import type { Detainee, DetaineeEvent } from '../../lib/detainees'

/** "all" = no person filter; "general" = events with detainee_id IS NULL. */
export type PersonFilterValue = 'all' | 'general' | string

type Props = {
  value: PersonFilterValue
  onChange: (next: PersonFilterValue) => void
  detainees: Detainee[]
  events: DetaineeEvent[]
}

export function PersonFilter({ value, onChange, detainees, events }: Props) {
  const generalCount = events.filter(e => e.detainee_id === null).length
  const perDetaineeCount = new Map<string, number>()
  for (const e of events) {
    if (e.detainee_id) {
      perDetaineeCount.set(e.detainee_id, (perDetaineeCount.get(e.detainee_id) ?? 0) + 1)
    }
  }

  // Show only detainees that actually have at least one event.
  const visibleDetainees = detainees.filter(d => (perDetaineeCount.get(d.id) ?? 0) > 0)

  if (events.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Kişi süzgeci">
      <Chip
        label="TÜMÜ"
        selected={value === 'all'}
        count={events.length}
        onClick={() => onChange('all')}
      />
      {generalCount > 0 && (
        <Chip
          label="GENEL"
          selected={value === 'general'}
          count={generalCount}
          onClick={() => onChange('general')}
        />
      )}
      {visibleDetainees.map(d => (
        <Chip
          key={d.id}
          label={d.name.toLocaleUpperCase('tr-TR')}
          selected={value === d.id}
          count={perDetaineeCount.get(d.id) ?? 0}
          onClick={() => onChange(d.id)}
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
