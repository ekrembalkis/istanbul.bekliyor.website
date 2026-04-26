import { Link } from 'react-router-dom'
import { QUOTE_KIND_LABELS, type Quote } from '../../data/quotes'
import { SITE } from '../../config/site'

type Props = {
  quote: Quote
  day: number
  /** Whether to render this as a section header on the public landing. */
  variant?: 'landing' | 'page'
}

export function QuoteCard({ quote, day, variant = 'landing' }: Props) {
  const isPage = variant === 'page'
  const fontMin = isPage ? 28 : 22
  const fontMax = isPage ? 56 : 44

  return (
    <article
      className="relative editorial-reveal"
      style={{ animationDelay: '0.2s' }}
      aria-label="Günün sözü"
    >
      <div className="grid grid-cols-12 gap-6 border-b border-rule pb-4 editorial-mono text-ink-muted">
        <span className="col-span-12 sm:col-span-4 text-accent">— Günün Sözü</span>
        <span className="col-span-12 sm:col-span-4 sm:text-center">
          GÜN {String(day).padStart(3, '0')}
        </span>
        <span className="col-span-12 sm:col-span-4 sm:text-right">
          {QUOTE_KIND_LABELS[quote.kind]} · {SITE.romanYear}
        </span>
      </div>

      <blockquote
        className="relative font-serif text-ink mt-10"
        style={{
          fontSize: `clamp(${fontMin}px, 4vw, ${fontMax}px)`,
          lineHeight: 1.28,
          letterSpacing: '-0.01em',
          textIndent: '-0.45em',
        }}
      >
        <span
          aria-hidden="true"
          className="editorial-display float-left text-accent"
          style={{
            fontSize: '4.5em',
            lineHeight: 0.85,
            margin: '0.06em 0.12em -0.05em -0.04em',
          }}
        >
          {quote.text.charAt(0)}
        </span>
        {quote.text.slice(1)}
      </blockquote>

      <footer className="mt-8 grid grid-cols-12 gap-6 border-t border-rule pt-5 editorial-mono">
        <cite className="col-span-12 md:col-span-7 not-italic">
          <span className="text-ink">— {quote.author}</span>
          <span className="block text-ink-muted mt-1" style={{ letterSpacing: '0.18em', fontSize: 12 }}>
            {quote.source}
          </span>
        </cite>
        <div className="col-span-12 md:col-span-5 flex flex-wrap md:justify-end items-baseline gap-x-6 gap-y-2">
          <a
            href={buildShareUrl(quote, day)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent border-b border-current hover:text-ink transition-colors pb-[2px]"
          >
            → PAYLAŞ
          </a>
          {!isPage && (
            <Link
              to="/gunun-sozu"
              className="text-ink-muted border-b border-current hover:text-accent transition-colors pb-[2px]"
            >
              → KALICI BAĞLANTI
            </Link>
          )}
        </div>
      </footer>
    </article>
  )
}

/**
 * X intent share URL. Single hashtag matches campaign rule (Xquik allows 0-1).
 * Source label trimmed if it would push the tweet over a comfortable length.
 */
export function buildShareUrl(quote: Quote, day: number): string {
  const base = SITE.xIntentBase
  const text = composeShareText(quote, day)
  const url = `https://${SITE.publicHost}/gunun-sozu`
  return `${base}?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
}

/**
 * Pure helper for tests. Stays under ~280 chars so the X intent doesn't get
 * truncated by the platform.
 */
export function composeShareText(quote: Quote, day: number): string {
  const header = `GÜN ${day} · Günün Sözü`
  const attribution = `— ${quote.author}`
  const hashtag = SITE.primaryHashtag
  // Reserve ~80 chars for header + attribution + hashtag + URL framing.
  const reserve = header.length + attribution.length + hashtag.length + 30
  const budget = Math.max(60, 280 - reserve)
  const body = quote.text.length > budget ? quote.text.slice(0, budget - 1).trimEnd() + '…' : quote.text
  return `${header}\n\n"${body}"\n${attribution}\n\n${hashtag}`
}
