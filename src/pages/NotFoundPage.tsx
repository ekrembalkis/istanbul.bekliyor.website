import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Masthead } from '../components/public/Masthead'
import { Footer } from '../components/public/Footer'
import { getDayCount } from '../lib/utils'
import { PAPER_GRAIN_DATA_URL } from '../config/site'

export default function NotFoundPage() {
  const day = getDayCount()

  return (
    <div className="min-h-screen bg-bg text-ink relative">
      <Helmet>
        <title>Sayfa bulunamadı — İstanbul Bekliyor</title>
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
            <Masthead day={day} rightLabel="404" />
          </div>
        </header>

        <main className="px-[6vw] py-32 text-center">
          <span className="editorial-mono text-accent">— 404</span>
          <h1
            className="editorial-h1 text-ink mt-4"
            style={{ fontSize: 'clamp(56px, 11vw, 160px)' }}
          >
            Sayfa <em className="italic editorial-display text-ornament">bulunamadı.</em>
          </h1>
          <p className="font-serif italic text-ink-muted mt-6 max-w-prose mx-auto" style={{ fontSize: 'clamp(18px, 1.5vw, 22px)' }}>
            Aradığınız kayıt mevcut değil. Belki taşındı, belki hiç var olmadı.
          </p>
          <Link
            to="/"
            className="inline-block mt-12 editorial-mono text-ink hover:text-accent transition-colors border-b border-current pb-[2px]"
          >
            ← Ana sayfaya dön
          </Link>
        </main>

        <Footer />
      </div>
    </div>
  )
}
