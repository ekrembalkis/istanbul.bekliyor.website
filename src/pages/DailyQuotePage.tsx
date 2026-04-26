import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Masthead } from '../components/public/Masthead'
import { Footer } from '../components/public/Footer'
import { QuoteCard } from '../components/quote/QuoteCard'
import { getDailyQuote } from '../lib/quotes'
import { getDayCount } from '../lib/utils'
import { PAPER_GRAIN_DATA_URL } from '../config/site'

export default function DailyQuotePage() {
  const day = getDayCount()
  const quote = getDailyQuote(day)

  const description = `${quote.text.slice(0, 160)}${quote.text.length > 160 ? '…' : ''} — ${quote.author}`

  return (
    <div className="min-h-screen bg-bg text-ink relative">
      <Helmet>
        <title>{`Günün Sözü — Gün ${day} — İstanbul Bekliyor`}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`Günün Sözü — Gün ${day}`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("${PAPER_GRAIN_DATA_URL}")`,
          opacity: 'var(--grain-opacity)',
        }}
      />

      <div className="relative z-10">
        <header className="px-[6vw] pt-10">
          <div className="max-w-[1480px] mx-auto grid grid-cols-12 gap-6">
            <Masthead day={day} rightLabel="GÜNÜN SÖZÜ" />
            <nav className="col-span-12 mt-4 editorial-mono text-ink-muted">
              <Link to="/" className="hover:text-accent transition-colors">
                ← İstanbul Bekliyor
              </Link>
            </nav>
          </div>
        </header>

        <section className="relative px-[6vw] pt-12 pb-16 sm:pt-20">
          <div className="max-w-[1480px] mx-auto grid grid-cols-12 gap-6">
            <div
              className="col-span-12 md:col-span-8 mt-8 editorial-reveal"
              style={{ animationDelay: '0.15s' }}
            >
              <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
                — HER SABAH BİR CÜMLE
              </span>
              <h1
                className="editorial-h1 text-ink mt-4"
                style={{ fontSize: 'clamp(56px, 11vw, 180px)' }}
              >
                Günün <em className="italic editorial-display text-ornament">sözü.</em>
              </h1>
              <p
                className="font-serif text-ink-muted mt-6 max-w-[58ch]"
                style={{ fontSize: 'clamp(18px, 1.5vw, 22px)', lineHeight: 1.45 }}
              >
                Anayasa, sözleşme, mahkeme kararı, edebiyat. Her gün bir cümle —
                hatırlamak, paylaşmak, dirilmek için.
              </p>
            </div>
          </div>
        </section>

        <section className="relative px-[6vw] py-12 sm:py-16">
          <div className="max-w-[1180px] mx-auto">
            <QuoteCard quote={quote} day={day} variant="page" />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
