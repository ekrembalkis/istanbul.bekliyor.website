import type { DetaineeEvent } from '../../lib/detainees'
import { TimelineEvent } from './TimelineEvent'

type Props = {
  events: DetaineeEvent[]
  loading: boolean
  error: string | null
  /** When user has filtered out everything, show an "empty filter" message instead of "no records". */
  filtered?: boolean
}

const STAGGER_STEP = 0.08
const STAGGER_CAP = 1.5

export function Timeline({ events, loading, error, filtered = false }: Props) {
  if (loading) {
    return (
      <div className="mt-10 editorial-mono text-ink-muted opacity-70 text-center">
        — Olay kayıtları yükleniyor —
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
      {/* Sol kenar dikey çizgi */}
      <span
        aria-hidden="true"
        className="absolute left-[5px] sm:left-[13px] top-2 bottom-2 w-px bg-rule"
      />
      {events.map((e, i) => (
        <TimelineEvent
          key={e.id}
          event={e}
          delay={Math.min(0.1 + i * STAGGER_STEP, STAGGER_CAP)}
        />
      ))}
    </ol>
  )
}
