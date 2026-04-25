import { useManifestoStats } from '../../lib/manifesto'

type Props = {
  /** When true, renders only the headline number (used inline in the hero). */
  compact?: boolean
}

export function ManifestoCounter({ compact = false }: Props) {
  const { stats, loading } = useManifestoStats()
  const total = stats?.total ?? 0
  const last24 = stats?.last_24h ?? 0

  if (compact) {
    return (
      <span className="editorial-num text-accent tabular-nums" style={{ fontSize: 'inherit' }}>
        {loading ? '—' : total.toLocaleString('tr-TR')}
      </span>
    )
  }

  return (
    <div>
      <div className="editorial-mono text-ink-muted" style={{ letterSpacing: '0.32em' }}>
        — İMZACI SAYISI
      </div>
      <div
        className="editorial-num text-accent tabular-nums leading-[0.86]"
        style={{
          fontSize: 'clamp(96px, 18vw, 280px)',
          textShadow: '0 0 80px color-mix(in oklab, var(--accent) 30%, transparent)',
          marginTop: 8,
        }}
      >
        {loading ? '—' : total.toLocaleString('tr-TR')}
      </div>
      <div
        className="editorial-mono text-ink-muted mt-3"
        style={{ letterSpacing: '0.22em', fontSize: 12 }}
      >
        SON 24 SAAT · <span className="text-ink">+{last24.toLocaleString('tr-TR')}</span>
      </div>
    </div>
  )
}
