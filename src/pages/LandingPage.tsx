import { Link } from 'react-router-dom'
import { getDayCount } from '../lib/utils'
import { useDetainees, type Detainee } from '../lib/detainees'
import { SITE, PAPER_GRAIN_DATA_URL } from '../config/site'
import { Masthead } from '../components/public/Masthead'
import { Footer } from '../components/public/Footer'

const ROMAN_YEAR = SITE.romanYear

function HeroHeadline() {
  return (
    <>
      <div className="col-span-12 md:col-span-8 mt-16 editorial-mono text-accent editorial-reveal">
        — Halkın iradesi üzerine bir bildiri
      </div>

      <h1
        className="col-span-12 mt-4 editorial-h1 text-ink editorial-reveal"
        style={{
          fontSize: 'clamp(64px, 13vw, 220px)',
          animationDelay: '0.15s',
        }}
      >
        Adalet <em className="italic font-medium text-accent">herkes</em> için
        <br />
        adalet{' '}
        <span
          className="editorial-display text-ornament inline-block"
          style={{ transform: 'translateY(-0.05em)' }}
        >
          olduğunda
        </span>
        <br />
        adalet<em className="italic font-medium text-accent">tir.</em>
      </h1>

      <div className="col-span-12 mt-12 relative">
        <div className="h-px bg-rule" />
        <div className="absolute -top-[3px] left-0 h-[7px] w-32 bg-accent" />
      </div>
    </>
  )
}

function HeroFigure({ day, dateStamp }: { day: number; dateStamp: string }) {
  return (
    <div
      className="col-span-12 md:col-span-5 mt-12 editorial-reveal"
      style={{ animationDelay: '0.35s' }}
    >
      <div className="flex justify-between items-end border-b border-rule pb-2 editorial-mono text-ink-muted">
        <span>Tutsaklık · gün sayacı</span>
        <span>Ş.NO {dateStamp}</span>
      </div>
      <div
        role="text"
        aria-label={`${day} gündür özgürlüğünden mahrum`}
        className="editorial-num text-accent leading-[0.86] -mt-2 tabular-nums"
        style={{
          fontSize: 'clamp(120px, 22vw, 320px)',
          textShadow: '0 0 60px color-mix(in oklab, var(--accent) 28%, transparent)',
        }}
      >
        {day}
      </div>
      <p
        className="font-serif italic text-ink-muted mt-2 max-w-[38ch]"
        style={{ fontSize: 'clamp(18px, 1.6vw, 22px)', lineHeight: 1.3 }}
      >
        Gündür özgürlüğünden mahrum. Her doğan güneş, ödenmemiş bir borçtur; her batan, çoğalan bir ses.
      </p>
    </div>
  )
}

function HeroQuote() {
  return (
    <div
      className="col-span-12 md:col-span-7 md:mt-16 mt-8 flex flex-col justify-center editorial-reveal"
      style={{ animationDelay: '0.5s' }}
    >
      <blockquote
        className="font-serif text-ink relative"
        style={{
          fontSize: 'clamp(22px, 2.4vw, 34px)',
          lineHeight: 1.32,
          letterSpacing: '-0.01em',
          textIndent: '-0.45em',
        }}
      >
        <span
          className="editorial-display float-left text-accent"
          style={{
            fontSize: '5em',
            lineHeight: 0.85,
            margin: '0.06em 0.12em -0.05em -0.04em',
          }}
        >
          B
        </span>
        ir hak, yalnızca herkes için savunulduğunda haktır. Hukukun susturulduğu yerde sessizlik suç ortağı olur; biz suç ortağı olmayı reddediyoruz.
      </blockquote>
      <cite className="block mt-7 not-italic editorial-mono text-ink-muted">
        —&nbsp;&nbsp;Bildirgeden, Madde I
      </cite>
      <Link
        to="/bildirge"
        className="inline-block mt-6 editorial-mono text-accent border-b border-current hover:text-ink transition-colors pb-[2px]"
      >
        → BİLDİRGEYİ OKU VE İMZALA
      </Link>
    </div>
  )
}

function HeroSection({ day }: { day: number }) {
  const today = new Date()
  const dateStamp =
    String(today.getDate()).padStart(2, '0') +
    '/' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '/' +
    today.getFullYear()

  return (
    <section className="relative min-h-screen px-[6vw] py-16 pb-32 overflow-hidden">
      <div className="relative grid grid-cols-12 gap-6 max-w-[1480px] mx-auto">
        <Masthead day={day} />
        <HeroHeadline />
        <HeroFigure day={day} dateStamp={dateStamp} />
        <HeroQuote />
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 editorial-mono">
        <span className="text-ink-muted opacity-60">↓ AŞAĞI</span>
        <Link
          to="/kart"
          className="text-accent border-b border-current hover:text-ink transition-colors pb-[2px]"
        >
          → KARTINI ÜRET
        </Link>
        <Link
          to="/vekiline-yaz"
          className="text-accent border-b border-current hover:text-ink transition-colors pb-[2px]"
        >
          → VEKİLİNE YAZ
        </Link>
        <Link
          to="/mektuplar"
          className="text-accent border-b border-current hover:text-ink transition-colors pb-[2px]"
        >
          → MEKTUP YAZ
        </Link>
      </div>
    </section>
  )
}

function DetaineesSection() {
  const { data, error } = useDetainees()
  const detainees = data ?? []
  const featured = detainees.find(d => d.is_featured) ?? detainees[0]
  const others = detainees.filter(d => d.id !== featured?.id)

  return (
    <section className="relative px-[6vw] py-24 sm:py-32">
      <div className="max-w-[1480px] mx-auto">
        <div className="grid grid-cols-12 gap-6 border-b border-rule pb-4 editorial-mono text-ink-muted">
          <span className="col-span-12 sm:col-span-4 text-accent">— Siyasi tutuklular</span>
          <span className="col-span-12 sm:col-span-4 sm:text-center">N° {String(detainees.length).padStart(2, '0')} kişi</span>
          <span className="col-span-12 sm:col-span-4 sm:text-right">Roster · {ROMAN_YEAR}</span>
        </div>

        {error && (
          <div
            role="status"
            className="mt-6 editorial-mono text-ink-muted border-l-2 border-accent pl-4 py-2"
          >
            — Veri kaynağı geçici olarak ulaşılmıyor. Aşağıdaki kayıt yerel yedektir. —
          </div>
        )}

        <h2
          className="editorial-h1 text-ink mt-10"
          style={{ fontSize: 'clamp(48px, 7vw, 110px)' }}
        >
          Özgürlüklerini{' '}
          <em className="italic editorial-display text-ornament">bekleyenler.</em>
        </h2>

        {featured && (
          <Link
            to={`/tutuklu/${featured.slug}`}
            viewTransition
            aria-label={`${featured.name} — profili aç`}
            className="group grid grid-cols-12 gap-6 mt-16"
          >
            <div className="col-span-12 md:col-span-5 lg:col-span-4">
              <div className="relative aspect-square w-full max-w-[420px]">
                {featured.photo_url ? (
                  <img
                    src={featured.photo_url}
                    alt={featured.name}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.01]"
                    style={{ filter: 'grayscale(0.15) contrast(1.05)' }}
                  />
                ) : (
                  <div className="w-full h-full bg-rule" />
                )}
                <div className="absolute -left-2 top-0 bottom-0 w-[3px] bg-accent" />
                <div className="absolute -bottom-3 left-0 right-0 h-[2px] bg-rule" />
              </div>
            </div>

            <div className="col-span-12 md:col-span-7 lg:col-span-8 flex flex-col justify-end">
              <span className="editorial-mono text-accent">— Madde 01 · Featured</span>
              <h3
                className="editorial-h1 text-ink mt-3 group-hover:text-accent transition-colors"
                style={{ fontSize: 'clamp(40px, 6vw, 92px)' }}
              >
                {featured.name}<span className="text-accent">.</span>
              </h3>
              {featured.title && (
                <p className="font-serif italic text-ink-muted mt-2" style={{ fontSize: 'clamp(18px, 1.4vw, 22px)' }}>
                  {featured.title}
                </p>
              )}
              <div className="mt-8 grid grid-cols-3 border-t border-rule pt-5 max-w-md gap-6">
                <div>
                  <div className="editorial-mono text-ink-muted">Tutsaklık</div>
                  <div className="editorial-num text-accent mt-1 leading-none" style={{ fontSize: '56px' }}>
                    {featured.day_count}
                  </div>
                  <div className="editorial-mono text-ink-muted mt-1">gün</div>
                </div>
                <div className="col-span-2">
                  <div className="editorial-mono text-ink-muted">Başlangıç</div>
                  <div className="font-serif text-ink mt-1" style={{ fontSize: '22px' }}>
                    {new Date(featured.arrest_date).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
              <span className="mt-6 editorial-mono text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity">
                → Profili aç
              </span>
            </div>
          </Link>
        )}

        {others.length > 0 && (
          <div className="mt-24">
            <div className="editorial-mono text-ink-muted border-b border-rule pb-3 grid grid-cols-12 gap-4">
              <span className="col-span-1">№</span>
              <span className="col-span-7 sm:col-span-6">İsim</span>
              <span className="hidden sm:block col-span-3">Ünvan</span>
              <span className="col-span-4 sm:col-span-2 text-right">Gün</span>
            </div>
            <ul>
              {others.map((d, i) => (
                <DetaineeRow key={d.id} d={d} index={i + 2} />
              ))}
            </ul>
          </div>
        )}

        {others.length === 0 && (
          <div className="mt-20 editorial-mono text-ink-muted text-center">
            — Roster güncelleniyor —
          </div>
        )}
      </div>
    </section>
  )
}

function DetaineeRow({ d, index }: { d: Detainee; index: number }) {
  const ariaLabel = `${d.name}${d.title ? `, ${d.title}` : ''} — ${d.day_count} gündür özgürlüğünden mahrum`
  return (
    <li className="border-b border-rule">
      <Link
        to={`/tutuklu/${d.slug}`}
        viewTransition
        aria-label={ariaLabel}
        className="grid grid-cols-12 gap-4 items-baseline py-5 group transition-colors hover:bg-[color-mix(in_oklab,var(--ink)_4%,transparent)]"
      >
        <span aria-hidden="true" className="col-span-1 editorial-mono text-ink-muted">{String(index).padStart(2, '0')}</span>
        <span
          aria-hidden="true"
          className="col-span-7 sm:col-span-6 font-serif text-ink group-hover:text-accent transition-colors"
          style={{ fontSize: 'clamp(20px, 2vw, 28px)' }}
        >
          {d.name}
        </span>
        <span aria-hidden="true" className="hidden sm:block col-span-3 font-serif italic text-ink-muted">
          {d.title ?? '—'}
        </span>
        <span
          aria-hidden="true"
          className="col-span-4 sm:col-span-2 text-right editorial-num text-accent leading-none"
          style={{ fontSize: 'clamp(28px, 3vw, 44px)' }}
        >
          {d.day_count}
        </span>
      </Link>
    </li>
  )
}

export default function LandingPage() {
  const day = getDayCount()

  return (
    <div className="min-h-screen bg-bg text-ink relative">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("${PAPER_GRAIN_DATA_URL}")`,
          opacity: 'var(--grain-opacity)',
        }}
      />

      <div className="relative z-10">
        <HeroSection day={day} />
        <DetaineesSection />
        <Footer />
      </div>
    </div>
  )
}
