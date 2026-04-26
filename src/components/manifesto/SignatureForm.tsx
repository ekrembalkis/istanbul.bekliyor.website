import { useId, useState } from 'react'
import {
  MESSAGE_MAX,
  NAME_MAX,
  submitSignature,
  validateSignature,
  SUBMIT_ERROR_MESSAGES,
  type ValidationErrors,
} from '../../lib/manifesto'
import { CityPicker } from './CityPicker'

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; total: number }
  | { kind: 'error'; message: string }

type Props = {
  onSubmitted?: (total: number) => void
}

export function SignatureForm({ onSubmitted }: Props) {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('')
  const [hpUrl, setHpUrl] = useState('') // honeypot
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const nameId = useId()
  const messageId = useId()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status.kind === 'submitting') return

    const v = validateSignature({ name, city, message })
    setErrors(v)
    if (Object.keys(v).length > 0) {
      setStatus({ kind: 'error', message: SUBMIT_ERROR_MESSAGES.validation })
      return
    }

    setStatus({ kind: 'submitting' })
    const result = await submitSignature({ name, city, message, hp_url: hpUrl })
    if (result.ok) {
      setStatus({ kind: 'success', total: result.total })
      setMessage('')
      onSubmitted?.(result.total)
    } else {
      const msg = SUBMIT_ERROR_MESSAGES[result.error] ?? SUBMIT_ERROR_MESSAGES.unknown
      setStatus({ kind: 'error', message: msg })
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
          — TEŞEKKÜRLER
        </div>
        <h3
          className="editorial-h1 text-ink mt-3"
          style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
        >
          İmzanız <em className="italic editorial-display text-accent">aramızda.</em>
        </h3>
        <p
          className="font-serif text-ink-muted mt-3"
          style={{ fontSize: 'clamp(16px, 1.4vw, 20px)', lineHeight: 1.5 }}
        >
          Şu an {status.total.toLocaleString('tr-TR')} kişi bu bildirgenin altında. Sayı her saatte büyür — dönüp bakın.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div>
        <label
          htmlFor={nameId}
          className="editorial-mono text-accent block"
          style={{ letterSpacing: '0.32em' }}
        >
          — ADINIZ
        </label>
        <input
          id={nameId}
          type="text"
          value={name}
          onChange={e => setName(e.target.value.slice(0, NAME_MAX))}
          maxLength={NAME_MAX}
          autoComplete="name"
          aria-required="true"
          aria-invalid={Boolean(errors.name)}
          placeholder="Ad Soyad veya rumuz"
          className="mt-3 w-full font-serif text-ink bg-transparent border border-rule focus:border-accent focus:outline-none p-3 transition-colors"
          style={{ fontSize: 18 }}
        />
        {errors.name && (
          <div className="editorial-mono text-accent mt-2" style={{ fontSize: 11, letterSpacing: '0.22em' }}>
            {errors.name}
          </div>
        )}
      </div>

      <CityPicker value={city} onChange={setCity} error={errors.city} />

      <div>
        <label
          htmlFor={messageId}
          className="editorial-mono text-accent block"
          style={{ letterSpacing: '0.32em' }}
        >
          — MESAJ (opsiyonel)
        </label>
        <textarea
          id={messageId}
          value={message}
          onChange={e => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
          maxLength={MESSAGE_MAX}
          rows={3}
          aria-invalid={Boolean(errors.message)}
          placeholder="İmzanın yanında geçmek istediğiniz tek bir cümle…"
          className="mt-3 w-full font-serif italic text-ink bg-transparent border border-rule focus:border-accent focus:outline-none p-3 transition-colors"
          style={{ fontSize: 18, lineHeight: 1.45, resize: 'vertical' }}
        />
        <div className="flex items-center justify-between mt-2 editorial-mono text-ink-muted" style={{ fontSize: 11, letterSpacing: '0.22em' }}>
          <span>{message.length} / {MESSAGE_MAX}</span>
          {errors.message && <span className="text-accent">{errors.message}</span>}
        </div>
      </div>

      {/* Honeypot — hidden from real users (CSS + a11y), tempting for naive bots. */}
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
          {status.kind === 'submitting' ? '— GÖNDERİLİYOR' : 'BEN DE İMZALIYORUM'}
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
