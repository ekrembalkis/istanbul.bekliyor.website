import { useId, useState } from 'react'
import { useDetainees } from '../../lib/detainees'
import {
  MESSAGE_MAX,
  NAME_MAX,
  submitLetter,
  validateLetter,
  SUBMIT_ERROR_MESSAGES,
  type LetterValidationErrors,
} from '../../lib/letters'
import { RecipientPicker } from './RecipientPicker'

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; total: number }
  | { kind: 'error'; message: string }

type Props = {
  /** Pre-select a detainee. */
  initialDetaineeId?: string
  onSubmitted?: (total: number) => void
}

export function LetterForm({ initialDetaineeId = '', onSubmitted }: Props) {
  const { data: detainees } = useDetainees()
  const [detaineeId, setDetaineeId] = useState<string>(initialDetaineeId)
  const [message, setMessage] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [hpUrl, setHpUrl] = useState('')
  const [errors, setErrors] = useState<LetterValidationErrors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const messageId = useId()
  const nameId = useId()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status.kind === 'submitting') return

    const v = validateLetter({ message, author_name: authorName })
    setErrors(v)
    if (Object.keys(v).length > 0) {
      setStatus({ kind: 'error', message: SUBMIT_ERROR_MESSAGES.validation })
      return
    }

    setStatus({ kind: 'submitting' })
    const result = await submitLetter({
      message,
      author_name: authorName,
      detainee_id: detaineeId || null,
      hp_url: hpUrl,
    })
    if (result.ok) {
      setStatus({ kind: 'success', total: result.total })
      setMessage('')
      onSubmitted?.(result.total)
    } else {
      setStatus({
        kind: 'error',
        message: SUBMIT_ERROR_MESSAGES[result.error] ?? SUBMIT_ERROR_MESSAGES.unknown,
      })
    }
  }

  if (status.kind === 'success') {
    return (
      <div
        className="border-l-2 border-accent pl-6 py-6"
        role="status"
        aria-live="polite"
      >
        <div className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
          — DUVARDA
        </div>
        <h3
          className="editorial-h1 text-ink mt-3"
          style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
        >
          Mektubun <em className="italic editorial-display text-accent">duvarda.</em>
        </h3>
        <p
          className="font-serif text-ink-muted mt-3"
          style={{ fontSize: 'clamp(16px, 1.4vw, 20px)', lineHeight: 1.5 }}
        >
          Şu an {status.total.toLocaleString('tr-TR')} mektup birikmiş. Birazdan başkası da yazar — geri bakmak kolay.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: 'idle' })}
          className="mt-6 editorial-mono text-accent border-b border-current hover:text-ink transition-colors pb-[2px]"
          style={{ letterSpacing: '0.22em' }}
        >
          → BİR MEKTUP DAHA YAZ
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <RecipientPicker
        detainees={detainees ?? []}
        value={detaineeId}
        onChange={setDetaineeId}
      />

      <div>
        <label
          htmlFor={messageId}
          className="editorial-mono text-accent block"
          style={{ letterSpacing: '0.32em' }}
        >
          — MESAJ (en az 4, en fazla {MESSAGE_MAX})
        </label>
        <textarea
          id={messageId}
          value={message}
          onChange={e => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
          rows={4}
          maxLength={MESSAGE_MAX}
          aria-required="true"
          aria-invalid={Boolean(errors.message)}
          placeholder="Bir cümle yeter. Yarın okumak için."
          className="mt-3 w-full font-serif italic text-ink bg-transparent border border-rule focus:border-accent focus:outline-none p-3 transition-colors"
          style={{ fontSize: 18, lineHeight: 1.45, resize: 'vertical' }}
        />
        <div
          className="flex items-center justify-between mt-2 editorial-mono text-ink-muted"
          style={{ fontSize: 11, letterSpacing: '0.22em' }}
        >
          <span>{message.length} / {MESSAGE_MAX}</span>
          {errors.message && <span className="text-accent">{errors.message}</span>}
        </div>
      </div>

      <div>
        <label
          htmlFor={nameId}
          className="editorial-mono text-accent block"
          style={{ letterSpacing: '0.32em' }}
        >
          — ADIN (opsiyonel — boşsa "ANONİM")
        </label>
        <input
          id={nameId}
          type="text"
          value={authorName}
          onChange={e => setAuthorName(e.target.value.slice(0, NAME_MAX))}
          maxLength={NAME_MAX}
          autoComplete="name"
          aria-invalid={Boolean(errors.author_name)}
          placeholder="Bir ad veya rumuz, ya da boş"
          className="mt-3 w-full font-serif text-ink bg-transparent border border-rule focus:border-accent focus:outline-none p-3 transition-colors"
          style={{ fontSize: 17 }}
        />
        {errors.author_name && (
          <div
            className="editorial-mono text-accent mt-2"
            style={{ fontSize: 11, letterSpacing: '0.22em' }}
          >
            {errors.author_name}
          </div>
        )}
      </div>

      {/* Honeypot */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
      >
        <label>
          Web siteniz (boş bırakın)
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={hpUrl}
            onChange={e => setHpUrl(e.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-rule items-center">
        <button
          type="submit"
          disabled={status.kind === 'submitting'}
          className="editorial-mono px-6 py-3 bg-accent text-white border border-accent hover:bg-transparent hover:text-accent transition-colors disabled:opacity-50"
          style={{ letterSpacing: '0.22em' }}
        >
          {status.kind === 'submitting' ? '— GÖNDERİLİYOR' : 'MEKTUBU BIRAK'}
        </button>
        {status.kind === 'error' && (
          <span
            className="editorial-mono text-accent border-l-2 border-accent pl-3"
            style={{ fontSize: 11, letterSpacing: '0.22em' }}
            role="alert"
          >
            {status.message}
          </span>
        )}
      </div>
    </form>
  )
}
