import { DEFAULT_MESSAGES } from '../../../lib/cards/defaults'

type Props = {
  value: string
  onChange: (next: string) => void
  authorName: string
  onAuthorChange: (next: string) => void
  maxLength?: number
}

const DEFAULT_MAX = 160

export function MessageEditor({
  value,
  onChange,
  authorName,
  onAuthorChange,
  maxLength = DEFAULT_MAX,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span
          className="editorial-mono text-accent"
          style={{ letterSpacing: '0.32em' }}
        >
          — MESAJ
        </span>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value.slice(0, maxLength))}
          rows={3}
          maxLength={maxLength}
          aria-label="Kart mesajı"
          className="mt-3 w-full font-serif italic text-ink bg-transparent border border-rule focus:border-accent focus:outline-none p-3 transition-colors"
          style={{ fontSize: 18, lineHeight: 1.45, resize: 'vertical' }}
          placeholder="Bir cümle yaz…"
        />
        <div className="flex items-center justify-between mt-2 editorial-mono text-ink-muted" style={{ fontSize: 11 }}>
          <span>{value.length} / {maxLength}</span>
          <span className="opacity-70">↓ Önerilenlerden seç</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {DEFAULT_MESSAGES.slice(0, 6).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className="text-left editorial-mono text-ink-muted hover:text-accent border border-rule hover:border-accent transition-colors px-2 py-1"
              style={{ fontSize: 10, letterSpacing: '0.18em' }}
            >
              {m.length > 36 ? m.slice(0, 35) + '…' : m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span
          className="editorial-mono text-accent"
          style={{ letterSpacing: '0.32em' }}
        >
          — İMZA (opsiyonel)
        </span>
        <input
          type="text"
          value={authorName}
          onChange={e => onAuthorChange(e.target.value.slice(0, 32))}
          maxLength={32}
          aria-label="Adın veya rumuzun"
          className="mt-3 w-full font-serif text-ink bg-transparent border border-rule focus:border-accent focus:outline-none p-3 transition-colors"
          style={{ fontSize: 17 }}
          placeholder="Adın veya rumuzun"
        />
      </div>
    </div>
  )
}
