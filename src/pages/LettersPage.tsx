import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Masthead } from '../components/public/Masthead'
import { Footer } from '../components/public/Footer'
import { LetterForm } from '../components/letters/LetterForm'
import { LettersWall } from '../components/letters/LettersWall'
import { LettersCounter } from '../components/letters/LettersCounter'
import { LetterFilterChips } from '../components/letters/LetterFilterChips'
import { useDetainees, type Detainee } from '../lib/detainees'
import type { LettersFilter } from '../lib/letters'
import { getDayCount } from '../lib/utils'
import { PAPER_GRAIN_DATA_URL, SITE } from '../config/site'

export default function LettersPage() {
  const day = getDayCount()
  const [searchParams] = useSearchParams()
  const { data: detainees } = useDetainees()
  const [filter, setFilter] = useState<LettersFilter>({ kind: 'all' })

  // URL ?kisi=<slug> pre-selects the recipient in the form (not the filter).
  const initialDetaineeId = useMemo<string>(() => {
    const slug = searchParams.get('kisi')
    if (!slug || !detainees) return ''
    return detainees.find((d: Detainee) => d.slug === slug)?.id ?? ''
  }, [searchParams, detainees])

  return (
    <div className="min-h-screen bg-bg text-ink relative">
      <Helmet>
        <title>Mektup Duvarı — İstanbul Bekliyor</title>
        <meta
          name="description"
          content="Bir cümle bırak. Tutsaklar yalnız değil — biriken her mektup bunu hatırlatır."
        />
        <meta property="og:title" content="Mektup Duvarı — İstanbul Bekliyor" />
        <meta
          property="og:description"
          content="Bir cümle bırak. Tutsaklar yalnız değil — biriken her mektup bunu hatırlatır."
        />
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
            <Masthead day={day} rightLabel="MEKTUP DUVARI" />
            <nav className="col-span-12 mt-4 editorial-mono text-ink-muted">
              <Link to="/" className="hover:text-accent transition-colors">
                ← İstanbul Bekliyor
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="relative px-[6vw] pt-12 pb-16 sm:pt-20">
          <div className="max-w-[1480px] mx-auto grid grid-cols-12 gap-6">
            <div
              className="col-span-12 md:col-span-7 mt-8 editorial-reveal"
              style={{ animationDelay: '0.15s' }}
            >
              <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
                — DUYULMAYAN SES, SES DEĞİLDİR
              </span>
              <h1
                className="editorial-h1 text-ink mt-4"
                style={{ fontSize: 'clamp(56px, 11vw, 180px)' }}
              >
                Bir cümle <em className="italic editorial-display text-ornament">bırak.</em>
              </h1>
              <p
                className="font-serif italic text-ink mt-8 max-w-[44ch]"
                style={{ fontSize: 'clamp(20px, 1.8vw, 26px)', lineHeight: 1.4 }}
              >
                Tek tek mektuplar birikir. Her birinin altında bir kişi vardır; üst üste durduğunda yalnızlık duvarına çarpan kalkan olur. {day}. günde, sen de bir cümle bırak.
              </p>
            </div>

            <div
              className="col-span-12 md:col-span-5 mt-12 md:mt-0 flex items-end editorial-reveal"
              style={{ animationDelay: '0.35s' }}
            >
              <LettersCounter />
            </div>
          </div>
        </section>

        {/* Form + wall */}
        <section className="relative px-[6vw] py-16 sm:py-24 border-t border-rule">
          <div className="max-w-[1480px] mx-auto grid grid-cols-12 gap-12">
            <div className="col-span-12 lg:col-span-5">
              <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
                — YAZ
              </span>
              <h2
                className="editorial-h1 text-ink mt-3"
                style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
              >
                Sözün <em className="italic editorial-display text-ornament">duvarda</em> kalsın.
              </h2>
              <p
                className="font-serif italic text-ink-muted mt-4 max-w-[42ch]"
                style={{ fontSize: 'clamp(16px, 1.3vw, 19px)', lineHeight: 1.5 }}
              >
                Mesajınız genel duvara veya bir tutsağa özel yazılabilir. Adınızı yazmak istemiyorsanız boş bırakın — duvarda "ANONİM" rozetiyle yer alır.
              </p>
              <div className="mt-10">
                <LetterForm initialDetaineeId={initialDetaineeId} />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <div
                className="flex items-baseline justify-between border-b border-rule pb-4 editorial-mono text-ink-muted"
                style={{ letterSpacing: '0.32em', fontSize: 11 }}
              >
                <span className="text-accent">— DUVAR</span>
                <span>{SITE.romanYear}</span>
              </div>

              <div className="mt-6">
                <LetterFilterChips
                  detainees={detainees ?? []}
                  value={filter}
                  onChange={setFilter}
                />
              </div>

              <div className="mt-8">
                <LettersWall filter={filter} />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
