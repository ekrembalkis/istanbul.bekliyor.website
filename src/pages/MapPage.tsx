import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Masthead } from '../components/public/Masthead'
import { Footer } from '../components/public/Footer'
import { ProvinceHeatmap } from '../components/map/ProvinceHeatmap'
import { ProvincePanel } from '../components/map/ProvincePanel'
import { TurkeyChoroplethSkeleton } from '../components/map/TurkeyChoroplethSkeleton'
import { useDetainees } from '../lib/detainees'
import { aggregateByProvince } from '../lib/provinces'
import { findCityBySlug, findCityByPlate } from '../data/cities'
import { getDayCount } from '../lib/utils'
import { PAPER_GRAIN_DATA_URL, SITE } from '../config/site'

// Lazy choropleth → its TopoJSON (~31KB) + d3-geo + topojson-client land
// in a separate chunk, untouched by the main bundle.
const TurkeyChoropleth = lazy(() =>
  import('../components/map/TurkeyChoropleth').then(m => ({ default: m.TurkeyChoropleth })),
)

export default function MapPage() {
  const day = getDayCount()
  const { data: detainees, error } = useDetainees()
  const [hideEmpty, setHideEmpty] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const aggregation = useMemo(
    () => aggregateByProvince(detainees ?? []),
    [detainees],
  )

  const selectedSlug = searchParams.get('il')
  const selectedPlate = useMemo<number | null>(() => {
    if (!selectedSlug) return null
    return findCityBySlug(selectedSlug)?.plate ?? null
  }, [selectedSlug])

  const handleSelect = useCallback(
    (plate: number | null) => {
      if (plate === null) {
        setSearchParams(prev => {
          const next = new URLSearchParams(prev)
          next.delete('il')
          return next
        }, { replace: true })
        return
      }
      const slug = findCityByPlate(plate)?.slug
      if (!slug) return
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.set('il', slug)
        return next
      }, { replace: true })
    },
    [setSearchParams],
  )

  return (
    <div className="min-h-screen bg-bg text-ink relative">
      <Helmet>
        <title>Tutsaklık Haritası — İstanbul Bekliyor</title>
        <meta
          name="description"
          content="Türkiye genelinde siyasi tutuklu yoğunluğunun il bazlı haritası. 81 il, sıralı yoğunluk. Tıkla — o ildeki tutukluları aç."
        />
        <meta property="og:title" content="Tutsaklık Haritası — İstanbul Bekliyor" />
        <meta
          property="og:description"
          content="Türkiye genelinde siyasi tutuklu yoğunluğunun il bazlı haritası."
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
            <Masthead day={day} rightLabel="HARİTA" />
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
                — 81 İL · YOĞUNLUK HARİTASI
              </span>
              <h1
                className="editorial-h1 text-ink mt-4"
                style={{ fontSize: 'clamp(56px, 11vw, 180px)' }}
              >
                Tutsaklık <em className="italic editorial-display text-ornament">haritası.</em>
              </h1>
              <p
                className="font-serif text-ink-muted mt-6 max-w-[58ch]"
                style={{ fontSize: 'clamp(18px, 1.5vw, 22px)', lineHeight: 1.45 }}
              >
                Hangi ilden ne kadar — siyasi tutuklu yoğunluğunun coğrafi
                dağılımı. Bir ile tıkla, o ildeki tutuklu profillerine git.
              </p>
            </div>

            <div
              className="col-span-12 md:col-span-5 mt-8 editorial-reveal"
              style={{ animationDelay: '0.35s' }}
            >
              <div className="flex justify-between items-end border-b border-rule pb-2 editorial-mono text-ink-muted">
                <span>İl · kapsanan</span>
                <span>Toplam · kayıt</span>
              </div>
              <div className="flex items-end justify-between gap-6 mt-2">
                <div
                  className="editorial-num text-accent leading-[0.86] tabular-nums"
                  style={{ fontSize: 'clamp(80px, 14vw, 200px)' }}
                >
                  {aggregation.provincesCovered}
                </div>
                <div
                  className="editorial-num text-ink leading-[0.86] tabular-nums opacity-80"
                  style={{ fontSize: 'clamp(40px, 7vw, 96px)' }}
                >
                  {aggregation.totalAssigned}
                </div>
              </div>
              <p
                className="font-serif italic text-ink-muted mt-2"
                style={{ fontSize: 'clamp(15px, 1.2vw, 18px)', lineHeight: 1.35 }}
              >
                81 ilden kapsanan · ile bağlı kayıt sayısı.
                {aggregation.totalUnassigned > 0 && (
                  <> İl bilgisi olmayan: <strong className="not-italic text-ink">{aggregation.totalUnassigned}</strong>.</>
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="relative px-[6vw] py-8 sm:py-12">
          <div className="max-w-[1180px] mx-auto">
            <div className="grid grid-cols-12 gap-6 border-b border-rule pb-4 editorial-mono text-ink-muted">
              <span className="col-span-12 sm:col-span-4 text-accent">— Görsel harita</span>
              <span className="col-span-12 sm:col-span-4 sm:text-center">
                Türkiye · Mercator
              </span>
              <span className="col-span-12 sm:col-span-4 sm:text-right">
                Veri: cihadturhan/tr-geojson
              </span>
            </div>

            <div className="mt-8">
              <Suspense fallback={<TurkeyChoroplethSkeleton />}>
                <TurkeyChoropleth
                  aggregation={aggregation}
                  selectedPlate={selectedPlate}
                  onSelect={handleSelect}
                />
              </Suspense>
            </div>
          </div>
        </section>

        <section className="relative px-[6vw] py-12 sm:py-16">
          <div className="max-w-[1180px] mx-auto">
            <div className="grid grid-cols-12 gap-6 border-b border-rule pb-4 editorial-mono text-ink-muted">
              <span className="col-span-12 sm:col-span-4 text-accent">— İl listesi</span>
              <span className="col-span-12 sm:col-span-4 sm:text-center">
                Sıralı · yoğunluk
              </span>
              <span className="col-span-12 sm:col-span-4 sm:text-right">
                Roster · {SITE.romanYear}
              </span>
            </div>

            {error && (
              <div
                role="status"
                className="mt-6 editorial-mono text-ink-muted border-l-2 border-accent pl-4 py-2"
              >
                — Veri kaynağı geçici olarak ulaşılmıyor. Yerel yedek kullanılıyor. —
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setHideEmpty(prev => !prev)}
                aria-pressed={!hideEmpty}
                className="editorial-mono px-3 py-1.5 border border-rule text-ink-muted hover:text-ink hover:border-ink transition-colors"
              >
                {hideEmpty ? 'TÜMÜNÜ GÖSTER' : 'SADECE KAYITLI İLLER'}
              </button>
            </div>

            <div className="mt-6">
              <ProvinceHeatmap
                ranked={aggregation.ranked}
                hideEmpty={hideEmpty}
                onSelectProvince={handleSelect}
              />
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <ProvincePanel
        selectedPlate={selectedPlate}
        aggregation={aggregation}
        onClose={() => handleSelect(null)}
      />
    </div>
  )
}
