import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Masthead } from '../components/public/Masthead'
import { Footer } from '../components/public/Footer'
import { ManifestoCounter } from '../components/manifesto/Counter'
import { SignatureForm } from '../components/manifesto/SignatureForm'
import { SignaturesWall } from '../components/manifesto/SignaturesWall'
import { MANIFESTO } from '../config/manifesto'
import { getDayCount } from '../lib/utils'
import { PAPER_GRAIN_DATA_URL, SITE } from '../config/site'

export default function ManifestoPage() {
  const day = getDayCount()
  const formRef = useRef<HTMLDivElement>(null)

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-bg text-ink relative">
      <Helmet>
        <title>{`${MANIFESTO.title} — İstanbul Bekliyor`}</title>
        <meta
          name="description"
          content={MANIFESTO.preface}
        />
        <meta property="og:title" content={`${MANIFESTO.title} — İstanbul Bekliyor`} />
        <meta property="og:description" content={MANIFESTO.preface} />
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
            <Masthead day={day} rightLabel="BİLDİRGE" />
            <nav className="col-span-12 mt-4 editorial-mono text-ink-muted">
              <Link to="/" className="hover:text-accent transition-colors">
                ← İstanbul Bekliyor
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="relative px-[6vw] pt-12 pb-20 sm:pt-20">
          <div className="max-w-[1480px] mx-auto grid grid-cols-12 gap-6">
            <div
              className="col-span-12 md:col-span-7 mt-8 editorial-reveal"
              style={{ animationDelay: '0.15s' }}
            >
              <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
                — HALKIN İRADESİ ÜZERİNE BİR BİLDİRİ
              </span>
              <h1
                className="editorial-h1 text-ink mt-4"
                style={{ fontSize: 'clamp(64px, 12vw, 200px)' }}
              >
                {MANIFESTO.title}
                <span className="text-accent">.</span>
              </h1>
              <p
                className="font-serif italic text-ink mt-8 max-w-[44ch]"
                style={{ fontSize: 'clamp(20px, 2vw, 28px)', lineHeight: 1.4 }}
              >
                {MANIFESTO.preface}
              </p>
              <button
                type="button"
                onClick={scrollToForm}
                className="mt-12 editorial-mono text-accent border-b border-current hover:text-ink transition-colors pb-[2px]"
                style={{ letterSpacing: '0.22em' }}
              >
                ↓ BEN DE İMZALIYORUM
              </button>
            </div>

            <div
              className="col-span-12 md:col-span-5 mt-12 md:mt-0 flex items-end editorial-reveal"
              style={{ animationDelay: '0.35s' }}
            >
              <ManifestoCounter />
            </div>
          </div>
        </section>

        {/* Articles */}
        <section className="relative px-[6vw] py-16 sm:py-24">
          <div className="max-w-[1480px] mx-auto">
            {MANIFESTO.articles.map((art, i) => (
              <article
                key={art.id}
                className="grid grid-cols-12 gap-6 border-t border-rule py-12 sm:py-16 editorial-reveal"
                style={{ animationDelay: `${Math.min(0.1 + i * 0.08, 0.6)}s` }}
              >
                <div className="col-span-12 md:col-span-3">
                  <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
                    MADDE
                  </span>
                  <div
                    className="editorial-num text-accent leading-none mt-1 tabular-nums"
                    style={{ fontSize: 'clamp(56px, 8vw, 120px)' }}
                  >
                    {art.numeral}
                  </div>
                </div>
                <div className="col-span-12 md:col-span-9">
                  <h2
                    className="editorial-h1 text-ink"
                    style={{ fontSize: 'clamp(32px, 4.5vw, 64px)', lineHeight: 1.05 }}
                  >
                    {art.headline}
                    <span className="text-accent">.</span>
                  </h2>
                  <p
                    className="font-serif text-ink mt-6 max-w-[58ch]"
                    style={{ fontSize: 'clamp(18px, 1.5vw, 22px)', lineHeight: 1.55 }}
                  >
                    {art.body}
                  </p>
                </div>
              </article>
            ))}
            <div className="border-t border-rule pt-10 mt-4">
              <p
                className="font-serif italic text-ink-muted max-w-[58ch] mx-auto text-center"
                style={{ fontSize: 'clamp(17px, 1.4vw, 20px)', lineHeight: 1.5 }}
              >
                {MANIFESTO.closing}
              </p>
              <div className="text-center mt-6">
                <Link
                  to="/mektuplar"
                  className="editorial-mono text-ink-muted hover:text-accent border-b border-current transition-colors pb-[2px]"
                  style={{ letterSpacing: '0.22em', fontSize: 11 }}
                >
                  → YA DA BİR MEKTUP YAZ
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Form + wall */}
        <section
          ref={formRef}
          className="relative px-[6vw] py-16 sm:py-24 border-t border-rule"
        >
          <div className="max-w-[1480px] mx-auto grid grid-cols-12 gap-12">
            <div className="col-span-12 lg:col-span-5">
              <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
                — İMZALA
              </span>
              <h2
                className="editorial-h1 text-ink mt-3"
                style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
              >
                Adın <em className="italic editorial-display text-ornament">aramızda</em> olsun.
              </h2>
              <p
                className="font-serif italic text-ink-muted mt-4 max-w-[42ch]"
                style={{ fontSize: 'clamp(16px, 1.3vw, 19px)', lineHeight: 1.5 }}
              >
                Bu form bir kayıt değil; bir taraf alma jestidir. Bilgileriniz sadece bu duvar için tutulur, üçüncü tarafa verilmez.
              </p>
              <div className="mt-10">
                <SignatureForm />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <div className="flex items-baseline justify-between border-b border-rule pb-4 editorial-mono text-ink-muted" style={{ letterSpacing: '0.32em', fontSize: 11 }}>
                <span className="text-accent">— İMZALAR</span>
                <span>{SITE.romanYear}</span>
              </div>
              <div className="mt-8">
                <SignaturesWall />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
