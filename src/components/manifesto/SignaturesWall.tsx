import { useState } from 'react'
import { useManifestoSignatures, type ManifestoSignature } from '../../lib/manifesto'

const PAGE_SIZE = 100

export function SignaturesWall() {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const { data: signatures, loading, error } = useManifestoSignatures(limit)

  if (loading && signatures.length === 0) {
    return (
      <div className="editorial-mono text-ink-muted opacity-70 text-center py-12" style={{ letterSpacing: '0.32em' }}>
        — İMZALAR YÜKLENİYOR —
      </div>
    )
  }

  if (error && signatures.length === 0) {
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

  if (signatures.length === 0) {
    return (
      <div className="editorial-mono text-ink-muted text-center py-16" style={{ letterSpacing: '0.32em' }}>
        — İLK İMZACI SİZ OLUN —
      </div>
    )
  }

  return (
    <div>
      <div className="editorial-mono text-ink-muted border-b border-rule pb-3 grid grid-cols-12 gap-4" style={{ letterSpacing: '0.22em', fontSize: 11 }}>
        <span className="col-span-1">№</span>
        <span className="col-span-4 sm:col-span-3">İSİM</span>
        <span className="col-span-3 sm:col-span-2">İL</span>
        <span className="hidden sm:block sm:col-span-5">MESAJ</span>
        <span className="col-span-4 sm:col-span-1 text-right">GÜN</span>
      </div>
      <ul>
        {signatures.map((s, i) => (
          <SignatureRow key={s.id} sig={s} index={i + 1} />
        ))}
      </ul>
      {signatures.length >= limit && (
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

function SignatureRow({ sig, index }: { sig: ManifestoSignature; index: number }) {
  return (
    <li className="grid grid-cols-12 gap-4 items-baseline border-b border-rule py-4 transition-colors hover:bg-[color-mix(in_oklab,var(--ink)_4%,transparent)]">
      <span className="col-span-1 editorial-mono text-ink-muted" style={{ letterSpacing: '0.22em', fontSize: 11 }}>
        {String(index).padStart(3, '0')}
      </span>
      <span
        className="col-span-4 sm:col-span-3 font-serif text-ink"
        style={{ fontSize: 'clamp(15px, 1.3vw, 18px)' }}
      >
        {sig.name}
      </span>
      <span
        className="col-span-3 sm:col-span-2 font-serif italic text-ink-muted"
        style={{ fontSize: 'clamp(13px, 1.1vw, 16px)' }}
      >
        {sig.city}
      </span>
      <span
        className="hidden sm:block sm:col-span-5 font-serif text-ink-muted truncate"
        style={{ fontSize: 'clamp(13px, 1.1vw, 15px)', fontStyle: sig.message ? 'italic' : 'normal' }}
        title={sig.message ?? ''}
      >
        {sig.message ?? '—'}
      </span>
      <span
        className="col-span-4 sm:col-span-1 text-right editorial-mono text-ink-muted"
        style={{ letterSpacing: '0.22em', fontSize: 11 }}
      >
        {formatRelative(sig.created_at)}
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
