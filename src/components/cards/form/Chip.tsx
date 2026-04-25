type Props = {
  label: string
  selected: boolean
  onClick: () => void
  hint?: string
}

export function Chip({ label, selected, onClick, hint }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      title={hint}
      className={
        'editorial-mono px-3 py-1.5 border transition-colors ' +
        (selected
          ? 'bg-accent text-white border-accent'
          : 'border-rule text-ink-muted hover:text-ink hover:border-ink')
      }
    >
      {label}
    </button>
  )
}
