type Props = {
  day: number
  /** Font size in CSS px. Caller decides based on format. */
  fontSize: number
  /** Optional label shown above the number (default: "GÜN"). */
  label?: string
  /** Optional sub-label (default: "ÖZGÜRLÜK BORCU"). */
  sublabel?: string
  align?: 'left' | 'center'
}

export function DayCounter({
  day,
  fontSize,
  label = 'GÜN',
  sublabel = 'ÖZGÜRLÜK BORCU',
  align = 'left',
}: Props) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <div
        className="editorial-mono text-ink-muted"
        style={{ fontSize: 12, letterSpacing: '0.32em' }}
      >
        {label}
      </div>
      <div
        className="editorial-num text-accent leading-[0.86] tabular-nums"
        style={{
          fontSize,
          textShadow: '0 0 60px color-mix(in oklab, var(--accent) 28%, transparent)',
          marginTop: 4,
        }}
      >
        {day}
      </div>
      {sublabel && (
        <div
          className="editorial-mono text-ink-muted"
          style={{ fontSize: 11, letterSpacing: '0.32em', marginTop: 8 }}
        >
          {sublabel}
        </div>
      )}
    </div>
  )
}
