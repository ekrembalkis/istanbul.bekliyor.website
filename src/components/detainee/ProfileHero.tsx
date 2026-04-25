import type { Detainee } from '../../lib/detainees'

type Props = {
  detainee: Detainee
}

export function ProfileHero({ detainee }: Props) {
  const arrestStamp = formatArrestStamp(detainee.arrest_date)

  return (
    <section className="relative px-[6vw] pt-12 pb-20 sm:pt-20">
      <div className="max-w-[1480px] mx-auto grid grid-cols-12 gap-6">
        <div className="col-span-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-rule pb-4 editorial-mono text-ink-muted">
          <span className="text-accent">— Siyasi tutuklu · Profil</span>
          <span className="hidden md:inline">Ş.NO {arrestStamp}</span>
          <span className="hidden lg:inline text-ink-muted opacity-70">
            {String(detainee.day_count).padStart(3, '0')} gün
          </span>
        </div>

        <div className="col-span-12 md:col-span-5 lg:col-span-4 mt-10 editorial-reveal">
          <div className="relative aspect-square w-full max-w-[460px]">
            {detainee.photo_url ? (
              <img
                src={detainee.photo_url}
                alt={detainee.name}
                className="w-full h-full object-cover object-top"
                style={{ filter: 'grayscale(0.15) contrast(1.05)' }}
              />
            ) : (
              <div className="w-full h-full bg-rule" />
            )}
            <div className="absolute -left-2 top-0 bottom-0 w-[3px] bg-accent" />
            <div className="absolute -bottom-3 left-0 right-0 h-[2px] bg-rule" />
          </div>
        </div>

        <div
          className="col-span-12 md:col-span-7 lg:col-span-8 mt-10 md:mt-12 flex flex-col justify-end editorial-reveal"
          style={{ animationDelay: '0.15s' }}
        >
          <span className="editorial-mono text-accent">— Madde 01 · Featured</span>
          <h1
            className="editorial-h1 text-ink mt-3"
            style={{ fontSize: 'clamp(48px, 9vw, 132px)' }}
          >
            {detainee.name}
            <span className="text-accent">.</span>
          </h1>
          {detainee.title && (
            <p
              className="font-serif italic text-ink-muted mt-3"
              style={{ fontSize: 'clamp(20px, 1.6vw, 26px)' }}
            >
              {detainee.title}
            </p>
          )}

          <div className="mt-10 grid grid-cols-3 border-t border-rule pt-6 max-w-xl gap-6">
            <div>
              <div className="editorial-mono text-ink-muted">Tutsaklık</div>
              <div
                className="editorial-num text-accent mt-1 leading-none tabular-nums"
                style={{
                  fontSize: 'clamp(56px, 7vw, 96px)',
                  textShadow: '0 0 60px color-mix(in oklab, var(--accent) 28%, transparent)',
                }}
              >
                {detainee.day_count}
              </div>
              <div className="editorial-mono text-ink-muted mt-1">gün</div>
            </div>
            <div className="col-span-2">
              <div className="editorial-mono text-ink-muted">Başlangıç</div>
              <div
                className="font-serif text-ink mt-1"
                style={{ fontSize: 'clamp(20px, 1.6vw, 24px)' }}
              >
                {formatTurkishDate(detainee.arrest_date)}
              </div>
              <p className="font-serif italic text-ink-muted mt-3 max-w-[40ch]" style={{ fontSize: '17px', lineHeight: 1.45 }}>
                Her doğan güneş, ödenmemiş bir borçtur; her batan, çoğalan bir ses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function formatTurkishDate(iso: string): string {
  // arrest_date is YYYY-MM-DD; render in Istanbul TZ for stable display.
  const d = new Date(/[Tt]/.test(iso) ? iso : `${iso}T00:00:00+03:00`)
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatArrestStamp(iso: string): string {
  const d = new Date(/[Tt]/.test(iso) ? iso : `${iso}T00:00:00+03:00`)
  return (
    String(d.getDate()).padStart(2, '0') +
    '/' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '/' +
    d.getFullYear()
  )
}
