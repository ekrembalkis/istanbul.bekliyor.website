import { useState } from 'react'
import { useDetainees } from '../../lib/detainees'
import { useLetters, type Letter, type LettersFilter } from '../../lib/letters'

const PAGE_SIZE = 50

type Props = {
  filter?: LettersFilter
  initialLimit?: number
}

export function LettersWall({ filter, initialLimit = PAGE_SIZE }: Props) {
  const [limit, setLimit] = useState(initialLimit)
  const { data: letters, loading, error } = useLetters({
    filter,
    limit,
  })
  const { data: detainees } = useDetainees()

  const detaineeMap = new Map((detainees ?? []).map(d => [d.id, d]))

  if (loading && letters.length === 0) {
    return (
      <div
        className="editorial-mono text-ink-muted opacity-70 text-center py-12"
        style={{ letterSpacing: '0.32em' }}
      >
        — MEKTUPLAR YÜKLENİYOR —
      </div>
    )
  }

  if (error && letters.length === 0) {
    return (
      <div
        role="status"
        className="editorial-mono text-ink-muted border-l-2 border-accent pl-4 py-2 max-w-xl mx-auto"
        style={{ letterSpacing: '0.22em', fontSize: 11 }}
      >
        — VERİ KAYNAĞI ŞU AN ULAŞILMIYOR —
      </div>
    )
  }

  if (letters.length === 0) {
    return (
      <div
        className="editorial-mono text-ink-muted text-center py-16"
        style={{ letterSpacing: '0.32em' }}
      >
        — İLK MEKTUBU SEN YAZ —
      </div>
    )
  }

  return (
    <div>
      <ul className="space-y-1">
        {letters.map(l => (
          <LetterRow
            key={l.id}
            letter={l}
            recipientName={
              l.detainee_id ? detaineeMap.get(l.detainee_id)?.name ?? null : null
            }
            recipientSlug={
              l.detainee_id ? detaineeMap.get(l.detainee_id)?.slug ?? null : null
            }
          />
        ))}
      </ul>
      {letters.length >= limit && (
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => setLimit(limit + PAGE_SIZE)}
            className="editorial-mono text-ink-muted hover:text-accent border-b border-current transition-colors pb-[2px]"
            style={{ letterSpacing: '0.22em', fontSize: 11 }}
          >
            DAHA FAZLA GÖSTER
          </button>
        </div>
      )}
    </div>
  )
}

function LetterRow({
  letter,
  recipientName,
  recipientSlug,
}: {
  letter: Letter
  recipientName: string | null
  recipientSlug: string | null
}) {
  const author = letter.author_name?.trim() || 'ANONİM'
  const isAnon = !letter.author_name
  return (
    <li className="border-b border-rule py-5 grid grid-cols-12 gap-4 items-start">
      <div className="col-span-12 sm:col-span-3 flex flex-col gap-1">
        <span
          className={
            'editorial-mono ' +
            (isAnon ? 'text-ink-muted opacity-70' : 'text-ink')
          }
          style={{ letterSpacing: '0.22em', fontSize: 11 }}
        >
          {author.toLocaleUpperCase('tr-TR')}
        </span>
        <span
          className="editorial-mono text-ink-muted"
          style={{ letterSpacing: '0.22em', fontSize: 10 }}
        >
          → {recipientSlug && recipientName ? recipientName.toLocaleUpperCase('tr-TR') : 'GENEL'}
        </span>
      </div>
      <p
        className="col-span-12 sm:col-span-7 font-serif text-ink"
        style={{
          fontSize: 'clamp(15px, 1.3vw, 18px)',
          lineHeight: 1.45,
          fontStyle: 'italic',
        }}
      >
        {letter.message}
      </p>
      <span
        className="col-span-12 sm:col-span-2 sm:text-right editorial-mono text-ink-muted"
        style={{ letterSpacing: '0.22em', fontSize: 11 }}
      >
        {formatRelative(letter.created_at)}
      </span>
    </li>
  )
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.max(0, Math.floor((now - then) / 1000))
  if (diffSec < 60) return 'şimdi'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}dk`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}sa`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 30) return `${diffDay}g`
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}
