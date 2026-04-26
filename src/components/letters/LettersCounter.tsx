import { useLettersStats } from '../../lib/letters'

export function LettersCounter() {
  const { stats, loading } = useLettersStats()
  const total = stats?.total ?? 0
  const last24 = stats?.last_24h ?? 0
  const recipients = stats?.distinct_recipients ?? 0

  return (
    <div>
      <div
        className="editorial-mono text-ink-muted"
        style={{ letterSpacing: '0.32em' }}
      >
        — MEKTUP DUVARI
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
        className="editorial-mono text-ink-muted mt-3 flex flex-wrap gap-x-4 gap-y-1"
        style={{ letterSpacing: '0.22em', fontSize: 12 }}
      >
        <span>SON 24S · <span className="text-ink">+{last24.toLocaleString('tr-TR')}</span></span>
        {recipients > 0 && (
          <span>· {recipients} KİŞİYE · {Math.max(0, total - 0)} TOPLAM</span>
        )}
      </div>
    </div>
  )
}
