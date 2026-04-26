import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Masthead } from '../components/public/Masthead'
import { Footer } from '../components/public/Footer'
import { EventTypeFilter, type EventFilterValue } from '../components/detainee/EventTypeFilter'
import { PersonFilter, type PersonFilterValue } from '../components/events/PersonFilter'
import { SiteTimeline, type DetaineeLookup } from '../components/events/SiteTimeline'
import {
  useDetainees,
  useEventsStream,
  filterEventsStream,
} from '../lib/detainees'
import { getDayCount } from '../lib/utils'
import { PAPER_GRAIN_DATA_URL, SITE } from '../config/site'

const RECENT_WINDOW_DAYS = 7

export default function EventStreamPage() {
  const day = getDayCount()
  const { data: detainees } = useDetainees()
  const { events, loading, error } = useEventsStream()
  const [typeFilter, setTypeFilter] = useState<EventFilterValue>('all')
  const [personFilter, setPersonFilter] = useState<PersonFilterValue>('all')

  const detaineeLookup = useMemo<DetaineeLookup>(() => {
    const out: DetaineeLookup = {}
    for (const d of detainees ?? []) {
      out[d.id] = { slug: d.slug, name: d.name }
    }
    return out
  }, [detainees])

  const visibleEvents = useMemo(() => {
    return filterEventsStream(events, {
      types: typeFilter === 'all' ? undefined : [typeFilter],
      detaineeId:
        personFilter === 'all'
          ? undefined
          : personFilter === 'general'
            ? 'general'
            : personFilter,
    })
  }, [events, typeFilter, personFilter])

  const recentCount = useMemo(() => countRecentEvents(events, RECENT_WINDOW_DAYS), [events])
  const isFiltered = typeFilter !== 'all' || personFilter !== 'all'

  return (
    <div className="min-h-screen bg-bg text-ink relative">
      <Helmet>
        <title>Olay Akışı — İstanbul Bekliyor</title>
        <meta
          name="description"
          content="Tutsaklık sürecinin kronolojik akışı: protestolar, hukuki başvurular, basın açıklamaları, dönüm noktaları ve kişiye bağlı tüm olaylar."
        />
        <meta property="og:title" content="Olay Akışı — İstanbul Bekliyor" />
        <meta
          property="og:description"
          content="Tutsaklık sürecinin kronolojik akışı: protestolar, hukuki başvurular, basın açıklamaları, dönüm noktaları."
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
            <Masthead day={day} rightLabel="OLAY AKIŞI" />
            <nav className="col-span-12 mt-4 editorial-mono text-ink-muted">
              <Link to="/" className="hover:text-accent transition-colors">
                ← İstanbul Bekliyor
              </Link>
            </nav>
          </div>
        </header>

        <section className="relative px-[6vw] pt-12 pb-12 sm:pt-20">
          <div className="max-w-[1480px] mx-auto grid grid-cols-12 gap-6">
            <div
              className="col-span-12 md:col-span-7 mt-8 editorial-reveal"
              style={{ animationDelay: '0.15s' }}
            >
              <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
                — KRONOLOJİK AKIŞ
              </span>
              <h1
                className="editorial-h1 text-ink mt-4"
                style={{ fontSize: 'clamp(56px, 11vw, 180px)' }}
              >
                Olay <em className="italic editorial-display text-ornament">akışı.</em>
              </h1>
              <p
                className="font-serif text-ink-muted mt-6 max-w-[58ch]"
                style={{ fontSize: 'clamp(18px, 1.5vw, 22px)', lineHeight: 1.45 }}
              >
                {SITE.arrestDateLabel}'ten bu yana yaşananların özet akışı. Protesto,
                hukuki adım, basın, dönüm noktası — kişiye bağlı veya genel.
              </p>
            </div>

            <div
              className="col-span-12 md:col-span-5 mt-8 editorial-reveal"
              style={{ animationDelay: '0.35s' }}
            >
              <div className="flex justify-between items-end border-b border-rule pb-2 editorial-mono text-ink-muted">
                <span>Toplam · kayıt</span>
                <span>Son {RECENT_WINDOW_DAYS} gün</span>
              </div>
              <div className="flex items-end justify-between gap-6 mt-2">
                <div
                  className="editorial-num text-accent leading-[0.86] tabular-nums"
                  style={{ fontSize: 'clamp(80px, 14vw, 200px)' }}
                >
                  {events.length}
                </div>
                <div
                  className="editorial-num text-ink leading-[0.86] tabular-nums opacity-80"
                  style={{ fontSize: 'clamp(40px, 7vw, 96px)' }}
                >
                  +{recentCount}
                </div>
              </div>
              <p
                className="font-serif italic text-ink-muted mt-2"
                style={{ fontSize: 'clamp(15px, 1.2vw, 18px)', lineHeight: 1.35 }}
              >
                Kayıtlı olay · son haftada eklenen.
              </p>
            </div>
          </div>
        </section>

        <section className="relative px-[6vw] py-12 sm:py-16">
          <div className="max-w-[1480px] mx-auto">
            <div className="grid grid-cols-12 gap-6 border-b border-rule pb-4 editorial-mono text-ink-muted">
              <span className="col-span-12 sm:col-span-4 text-accent">— Süzgeç</span>
              <span className="col-span-12 sm:col-span-4 sm:text-center">
                {visibleEvents.length} / {events.length} kayıt
              </span>
              <span className="col-span-12 sm:col-span-4 sm:text-right">
                Akış · {SITE.romanYear}
              </span>
            </div>

            <div className="mt-8">
              <div className="editorial-mono text-ink-muted mb-3" style={{ letterSpacing: '0.22em', fontSize: 11 }}>
                TİP
              </div>
              <EventTypeFilter value={typeFilter} onChange={setTypeFilter} events={events} />
            </div>

            <div className="mt-8">
              <div className="editorial-mono text-ink-muted mb-3" style={{ letterSpacing: '0.22em', fontSize: 11 }}>
                KİŞİ
              </div>
              <PersonFilter
                value={personFilter}
                onChange={setPersonFilter}
                detainees={detainees ?? []}
                events={events}
              />
            </div>

            <SiteTimeline
              events={visibleEvents}
              loading={loading}
              error={error}
              detaineeLookup={detaineeLookup}
              filtered={isFiltered}
            />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}

/**
 * Pure helper exported for tests: how many events landed within `windowDays`
 * relative to "now". `now` injectable so tests don't depend on system clock.
 */
export function countRecentEvents(
  events: { event_date: string }[],
  windowDays: number,
  now: Date = new Date(),
): number {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - windowDays)
  const cutoffMs = cutoff.getTime()
  let count = 0
  for (const e of events) {
    const t = new Date(/[Tt]/.test(e.event_date) ? e.event_date : `${e.event_date}T00:00:00+03:00`).getTime()
    if (Number.isFinite(t) && t >= cutoffMs) count++
  }
  return count
}
