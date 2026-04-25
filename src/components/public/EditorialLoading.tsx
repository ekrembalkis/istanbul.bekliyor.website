type Props = {
  label?: string
}

export function EditorialLoading({ label = 'Yükleniyor' }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-ink">
      <span
        className="editorial-mono text-ink-muted"
        style={{ letterSpacing: '0.32em' }}
      >
        — {label.toUpperCase()} —
      </span>
    </div>
  )
}
