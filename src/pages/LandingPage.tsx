import { getDayCount } from '../lib/utils'

const ARREST_DATE_LABEL = '19 Mart 2025'

function HeroSection({ day }: { day: number }) {
  const digits = String(day).split('')

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#d20512]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#1e5ca6]/5 blur-[100px]" />

      {/* Curved SVG text */}
      <div className="animate-blur-in w-full max-w-5xl mx-auto relative" style={{ height: 'clamp(120px, 28vw, 280px)' }}>
        <svg
          viewBox="0 0 1200 280"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <path id="curve-title" d="M 30,240 Q 600,20 1170,240" fill="transparent" />
            <path id="curve-subtitle" d="M 150,270 Q 600,130 1050,270" fill="transparent" />
          </defs>
          <text
            textAnchor="middle"
            style={{ fontFamily: 'Newsreader, Georgia, serif' }}
          >
            <textPath
              href="#curve-title"
              startOffset="50%"
              fill="white"
              fontSize="82"
              fontWeight="800"
              letterSpacing="4"
            >
              HAK  HUKUK  ADALET
            </textPath>
          </text>
          <text
            textAnchor="middle"
            style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}
          >
            <textPath
              href="#curve-subtitle"
              startOffset="50%"
              fill="rgba(255,255,255,0.35)"
              fontSize="18"
            >
              Adalet herkes için adalet olduğunda adalettir
            </textPath>
          </text>
        </svg>
      </div>

      {/* Day counter — flip-clock style */}
      <div className="animate-blur-in delay-400 opacity-0 mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          {digits.map((digit, i) => (
            <div
              key={i}
              className="w-14 h-20 sm:w-20 sm:h-28 md:w-24 md:h-32 rounded-xl bg-white/[0.06] ring-1 ring-white/10 flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.03]" />
              <span className="stat-number text-[#d20512] text-4xl sm:text-5xl md:text-6xl relative z-10">
                {digit}
              </span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-black/40" />
            </div>
          ))}
        </div>
        <span className="text-white/40 text-xs sm:text-sm font-sans tracking-[0.2em] uppercase">
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

export default function LandingPage() {
  const day = getDayCount()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <HeroSection day={day} />
      <DetaineesSection />
      <Footer />
    </div>
  )
}
