import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Masthead } from '../components/public/Masthead'
import { Footer } from '../components/public/Footer'
import { OutreachForm } from '../components/outreach/OutreachForm'
import { SeatTable } from '../components/outreach/SeatTable'
import { DISTRIBUTION_2023 } from '../data/deputies'
import { getDayCount } from '../lib/utils'
import { PAPER_GRAIN_DATA_URL } from '../config/site'

export default function OutreachPage() {
  const day = getDayCount()
  const totalSeats = DISTRIBUTION_2023.totalSeats

  return (
    <div className="min-h-screen bg-bg text-ink relative">
      <Helmet>
        <title>Vekiline Yaz — İstanbul Bekliyor</title>
        <meta
          name="description"
          content="İlinizi seçin, milletvekillerinize ulaşın. 600 vekil, 81 il — sesin orada yankılansın."
        />
        <meta property="og:title" content="Vekiline Yaz — İstanbul Bekliyor" />
        <meta
          property="og:description"
          content="İlinizi seçin, milletvekillerinize ulaşın. 600 vekil, 81 il — sesin orada yankılansın."
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
            <Masthead day={day} rightLabel="VEKİLİNE YAZ" />
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
                — SİVİL EYLEM
              </span>
              <h1
                className="editorial-h1 text-ink mt-4"
                style={{ fontSize: 'clamp(56px, 11vw, 180px)' }}
              >
                Vekiline <em className="italic editorial-display text-ornament">yaz.</em>
              </h1>
              <p
                className="font-serif italic text-ink mt-8 max-w-[44ch]"
                style={{ fontSize: 'clamp(20px, 1.8vw, 26px)', lineHeight: 1.4 }}
              >
                Türkiye Büyük Millet Meclisi'nde {totalSeats} milletvekili var. {day}. günde sesinizi onlara duyurmak için ilinizi seçin: hazır mektup, X'te tek tık, TBMM e-Dilekçe portalı.
              </p>
            </div>

            <div
              className="col-span-12 md:col-span-5 mt-12 md:mt-0 flex items-end editorial-reveal"
              style={{ animationDelay: '0.35s' }}
            >
              <div>
                <span className="editorial-mono text-ink-muted" style={{ letterSpacing: '0.32em' }}>
                  — MECLİS
                </span>
                <div
                  className="editorial-num text-accent tabular-nums leading-[0.86]"
                  style={{
                    fontSize: 'clamp(96px, 18vw, 280px)',
                    textShadow: '0 0 80px color-mix(in oklab, var(--accent) 30%, transparent)',
                  }}
                >
                  {totalSeats}
                </div>
                <div
                  className="editorial-mono text-ink-muted mt-3"
                  style={{ letterSpacing: '0.22em', fontSize: 12 }}
                >
                  28. DÖNEM · 81 İL · KAYNAK YSK 2023/224
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="relative px-[6vw] pb-16 sm:pb-24 border-t border-rule">
          <div className="max-w-[1480px] mx-auto pt-12 grid grid-cols-12 gap-12">
            <div className="col-span-12 lg:col-span-7">
              <OutreachForm />
            </div>
            <aside className="col-span-12 lg:col-span-5">
              <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
                — NASIL ÇALIŞIR
              </span>
              <ol className="mt-4 space-y-4 list-decimal list-inside font-serif text-ink-muted" style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', lineHeight: 1.55 }}>
                <li>İlini seç. O ilin milletvekili sayısı YSK kararıyla doğrulanmış.</li>
                <li>Üç hazır şablondan birini seç ya da kendi mesajını yaz.</li>
                <li><strong>X'te paylaş</strong>: tweet metniyle X açılır, sen yayınlarsın.</li>
                <li><strong>E-Dilekçe Gönder</strong>: uzun mektup panoya kopyalanır, TBMM e-Dilekçe portalı yeni sekmede açılır — yapıştırıp gönderirsin.</li>
                <li><strong>Vekili Bul</strong>: TBMM vekil arama formunda ilini ve partiyi süzgeçleyerek tek tek vekil sayfasına ulaşır, kişisel kanaldan iletirsin.</li>
              </ol>
              <p
                className="font-serif italic text-ink-muted mt-6 border-l-2 border-accent pl-4"
                style={{ fontSize: 14, lineHeight: 1.5 }}
              >
                Şu an bu sayfa tek tek vekil kişisel hesabını taramaz; ilin tüm vekillerine yönelik toplu çağrı yapar. Tek tek hesap entegrasyonu sonraki bir aşamada eklenir.
              </p>
            </aside>
          </div>
        </section>

        {/* Seat table */}
        <section className="relative px-[6vw] py-16 sm:py-20 border-t border-rule">
          <div className="max-w-[1480px] mx-auto">
            <div className="grid grid-cols-12 gap-6 border-b border-rule pb-4 editorial-mono text-ink-muted" style={{ letterSpacing: '0.22em', fontSize: 11 }}>
              <span className="col-span-12 sm:col-span-4 text-accent">— TÜM İLLER</span>
              <span className="col-span-12 sm:col-span-4 sm:text-center">N° {totalSeats} VEKİL</span>
              <span className="col-span-12 sm:col-span-4 sm:text-right">81 İL · YSK 2023/224</span>
            </div>
            <h2
              className="editorial-h1 text-ink mt-10 mb-8"
              style={{ fontSize: 'clamp(40px, 6vw, 88px)' }}
            >
              Hangi ilde <em className="italic editorial-display text-ornament">kaç vekil?</em>
            </h2>
            <SeatTable />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
