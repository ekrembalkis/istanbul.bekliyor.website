import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Masthead } from '../components/public/Masthead'
import { Footer } from '../components/public/Footer'
import { ProfileHero } from '../components/detainee/ProfileHero'
import { Bio } from '../components/detainee/Bio'
import { Timeline } from '../components/detainee/Timeline'
import {
  EventTypeFilter,
  filterEvents,
  type EventFilterValue,
} from '../components/detainee/EventTypeFilter'
import { useDetainee, useDetaineeEvents } from '../lib/detainees'
import { SITE, PAPER_GRAIN_DATA_URL } from '../config/site'

export default function DetaineeProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const fetch = useDetainee(slug)
  const detaineeId = fetch.status === 'ready' ? fetch.detainee.id : undefined
  const { events, loading: eventsLoading, error: eventsError } = useDetaineeEvents(detaineeId)
  const [filter, setFilter] = useState<EventFilterValue>('all')

  const visibleEvents = filterEvents(events, filter)

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
        <Header day={fetch.status === 'ready' ? fetch.detainee.day_count : 0} />

        {fetch.status === 'loading' && (
          <BodyShell>
            <div className="editorial-mono text-ink-muted opacity-70 text-center py-32">
              — Profil yükleniyor —
            </div>
          </BodyShell>
        )}

        {fetch.status === 'error' && (
          <BodyShell>
            <div
              role="status"
              className="editorial-mono text-ink-muted border-l-2 border-accent pl-4 py-2 max-w-xl mx-auto my-32"
            >
              — Veri kaynağı geçici olarak ulaşılmıyor — lütfen tekrar deneyin —
            </div>
          </BodyShell>
        )}

        {fetch.status === 'not-found' && (
          <BodyShell>
            <Helmet>
              <title>Sayfa bulunamadı — İstanbul Bekliyor</title>
            </Helmet>
            <div className="text-center py-32">
              <h1
                className="editorial-h1 text-accent"
                style={{ fontSize: 'clamp(48px, 9vw, 120px)' }}
              >
                Bu sayfa yok.
              </h1>
              <p className="editorial-mono text-ink-muted mt-6">
                Aradığın kayıt bulunamadı.
              </p>
              <Link
                to="/"
                className="inline-block mt-10 editorial-mono text-ink hover:text-accent transition-colors border-b border-current pb-[2px]"
              >
                ← Ana sayfaya dön
              </Link>
            </div>
          </BodyShell>
        )}

        {fetch.status === 'ready' && (
          <>
            <Helmet>
              <title>{`${fetch.detainee.name} — ${fetch.detainee.day_count}. gün — İstanbul Bekliyor`}</title>
              <meta
                name="description"
                content={buildMetaDescription(fetch.detainee.name, fetch.detainee.title, fetch.detainee.day_count)}
              />
              <meta
                property="og:title"
                content={`${fetch.detainee.name} — ${fetch.detainee.day_count}. gün özgürlüğünden mahrum`}
              />
              <meta
                property="og:description"
                content={buildMetaDescription(fetch.detainee.name, fetch.detainee.title, fetch.detainee.day_count)}
              />
              <meta property="og:type" content="profile" />
              <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <ProfileHero detainee={fetch.detainee} />

            <section className="px-[6vw]">
              <div className="max-w-[1480px] mx-auto flex flex-wrap items-center justify-end gap-6 editorial-mono">
                <Link
                  to={`/kart?kisi=${fetch.detainee.slug}&sablon=detainee`}
                  viewTransition
                  className="text-accent border-b border-current hover:text-ink transition-colors pb-[2px]"
                >
                  → BU KİŞİ İÇİN KART ÜRET
                </Link>
              </div>
            </section>

            <Bio bioMd={fetch.detainee.bio_md} name={fetch.detainee.name} />

            <section className="relative px-[6vw] py-12 sm:py-16">
              <div className="max-w-[1480px] mx-auto">
                <div className="grid grid-cols-12 gap-6 border-b border-rule pb-4 editorial-mono text-ink-muted">
                  <span className="col-span-12 sm:col-span-4 text-accent">— Olay akışı</span>
                  <span className="col-span-12 sm:col-span-4 sm:text-center">
                    N° {String(events.length).padStart(2, '0')} kayıt
                  </span>
                  <span className="col-span-12 sm:col-span-4 sm:text-right">
                    Süzgeç · {SITE.romanYear}
                  </span>
                </div>

                <h2
                  className="editorial-h1 text-ink mt-10"
                  style={{ fontSize: 'clamp(40px, 6vw, 92px)' }}
                >
                  Davanın <em className="italic editorial-display text-ornament">seyri.</em>
                </h2>

                <div className="mt-10">
                  <EventTypeFilter value={filter} onChange={setFilter} events={events} />
                </div>

                <Timeline
                  events={visibleEvents}
                  loading={eventsLoading}
                  error={eventsError}
                  filtered={filter !== 'all'}
                />
              </div>
            </section>
          </>
        )}

        <Footer />
      </div>
    </div>
  )
}

function Header({ day }: { day: number }) {
  return (
    <header className="px-[6vw] pt-10">
      <div className="max-w-[1480px] mx-auto grid grid-cols-12 gap-6">
        <Masthead day={day} rightLabel="DOSSIER" />
        <nav className="col-span-12 mt-4 editorial-mono text-ink-muted">
          <Link to="/" className="hover:text-accent transition-colors">
            ← İstanbul Bekliyor
          </Link>
        </nav>
      </div>
    </header>
  )
}

function BodyShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="px-[6vw]">
      <div className="max-w-[1480px] mx-auto">{children}</div>
    </main>
  )
}

function buildMetaDescription(name: string, title: string | null, days: number): string {
  const role = title ? `${name}, ${title}` : name
  return `${role} ${days} gündür özgürlüğünden mahrum. Hak, hukuk, adalet — herkes için.`
}
