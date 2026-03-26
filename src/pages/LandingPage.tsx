import { getDayCount, getTimeBreakdown } from '../lib/utils'

const ARREST_DATE_LABEL = '19 Mart 2025'

function HeroSection({ day }: { day: number }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#d20512]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#1e5ca6]/5 blur-[100px]" />

      {/* Curved SVG text */}
      <div className="animate-blur-in w-full max-w-4xl mx-auto relative" style={{ height: 'clamp(180px, 40vw, 360px)' }}>
        <svg
          viewBox="0 0 1000 360"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <path id="curve-title" d="M 50,280 Q 500,40 950,280" fill="transparent" />
            <path id="curve-subtitle" d="M 80,330 Q 500,160 920,330" fill="transparent" />
          </defs>
          <text
            textAnchor="middle"
            className="font-serif"
            style={{ fontFamily: 'Newsreader, Georgia, serif' }}
          >
            <textPath
              href="#curve-title"
              startOffset="50%"
              className="fill-white text-[48px] sm:text-[64px] md:text-[80px] lg:text-[110px] font-extrabold tracking-tight"
              style={{ fontSize: 'clamp(48px, 8vw, 110px)' }}
            >
              HAK HUKUK ADALET
            </textPath>
          </text>
          <text
            textAnchor="middle"
            style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}
          >
            <textPath
              href="#curve-subtitle"
              startOffset="50%"
              className="fill-white/40 text-[12px] sm:text-[15px] md:text-[18px] lg:text-[22px]"
              style={{ fontSize: 'clamp(12px, 2vw, 22px)' }}
            >
              Adalet herkes için adalet olduğunda adalettir
            </textPath>
          </text>
        </svg>
      </div>

      {/* Day counter */}
      <div className="animate-blur-in delay-400 opacity-0 mt-8 flex flex-col items-center gap-2">
        <span className="stat-number text-[#d20512] text-6xl sm:text-7xl md:text-8xl animate-counter-pulse">
          {day}
        </span>
        <span className="text-white/50 text-sm sm:text-base font-sans tracking-wide uppercase">
          Gündür Özgürlüğünden Mahrum
        </span>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-blur-in delay-800 opacity-0">
        <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-white/40 animate-bounce" />
        </div>
      </div>
    </section>
  )
}

function ContentSection({ day, time }: { day: number; time: ReturnType<typeof getTimeBreakdown> }) {
  return (
    <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10 bg-white/[0.02] backdrop-blur">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#d20512]/8 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="p-6 sm:p-10">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 text-[11px] text-white/60 bg-white/5 w-fit border border-white/10 rounded-full px-3 py-1.5 uppercase tracking-widest">
            {ARREST_DATE_LABEL}'ten beri
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mt-6">
            İstanbul Seçilmiş
            <span className="block text-[#d20512]">Başkanını Bekliyor</span>
          </h2>

          <p className="text-base sm:text-lg text-white/50 max-w-2xl mt-4 font-sans leading-relaxed">
            Milyonların oyuyla seçilen İstanbul Büyükşehir Belediye Başkanı Ekrem İmamoğlu,
            hukuksuz bir şekilde tutuklu. Demokrasi ve adalet mücadelesi devam ediyor.
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            <StatCard value={day} label="Toplam Gün" highlight />
            {time.years > 0 && (
              <StatCard value={time.years} label="Yıl" />
            )}
            <StatCard value={time.months} label="Ay" />
            <StatCard value={time.days} label="Gün" />
          </div>

          {/* Message cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <MessageCard
              icon={<ScaleIcon />}
              title="Hukuk"
              text="Evrensel hukuk normları ve Anayasa, temel hak ve özgürlüklerin korunmasını güvence altına alır. Hiç kimse yargı kararı olmadan özgürlüğünden mahrum bırakılamaz."
            />
            <MessageCard
              icon={<ShieldIcon />}
              title="Demokrasi"
              text="Halkın iradesiyle seçilen belediye başkanının tutuklanması, milyonlarca vatandaşın iradesinin yok sayılması anlamına gelir."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function StatCard({ value, label, highlight }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className="inner-card p-4 sm:p-5">
      <p className={`stat-number text-3xl sm:text-4xl ${highlight ? 'text-[#d20512]' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-xs sm:text-sm text-white/40 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  )
}

function MessageCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="inner-card p-5 sm:p-6">
      <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
        {icon}
        <span className="font-medium font-sans">{title}</span>
      </div>
      <p className="text-sm text-white/50 leading-relaxed font-sans">{text}</p>
    </div>
  )
}

function DetaineesSection() {
  return (
    <section className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 text-[11px] text-white/60 bg-white/5 w-fit border border-white/10 rounded-full px-3 py-1.5 uppercase tracking-widest mx-auto">
          Siyasi Tutuklular
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mt-4">
          Özgürlüklerini Bekleyenler
        </h2>
        <p className="text-sm sm:text-base text-white/40 mt-2 font-sans">
          Adalet herkesin hakkıdır
        </p>
      </div>

      {/* Avatar row */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* Placeholder avatars (left) */}
        <PlaceholderAvatar />
        <PlaceholderAvatar />
        <PlaceholderAvatar />

        {/* Central figure — Ekrem İmamoğlu */}
        <div className="flex flex-col items-center gap-3 mx-4">
          <div className="relative">
            <img
              src="/imamoglu.jpg"
              alt="Ekrem İmamoğlu"
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover object-top rounded-full ring-2 ring-[#d20512] shadow-lg shadow-[#d20512]/20"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#d20512] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm sm:text-base font-sans">Ekrem İmamoğlu</p>
            <p className="text-white/40 text-xs font-mono">İBB Başkanı</p>
          </div>
        </div>

        {/* Placeholder avatars (right) */}
        <PlaceholderAvatar />
        <PlaceholderAvatar />
        <PlaceholderAvatar />
      </div>
    </section>
  )
}

function PlaceholderAvatar() {
  return (
    <div className="transition-all duration-300 hover:w-16 hover:h-16 hover:ring-white/25 hover:z-10 w-8 h-8 rounded-full ring-1 ring-white/20 bg-white/[0.06] flex items-center justify-center flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-xs font-sans">
        <span>{ARREST_DATE_LABEL}'ten beri</span>
        <div className="flex items-center gap-4">
          <span className="text-[#d20512]/60">#İstanbulBekliyor</span>
          <a
            href="https://x.com/istbekliyor"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/50 transition-colors"
          >
            @istbekliyor
          </a>
        </div>
      </div>
    </footer>
  )
}

/* Icons */
function ScaleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}

export default function LandingPage() {
  const day = getDayCount()
  const time = getTimeBreakdown(day)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <HeroSection day={day} />
      <ContentSection day={day} time={time} />
      <DetaineesSection />
      <Footer />
    </div>
  )
}
