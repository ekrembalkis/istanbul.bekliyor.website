type Props = {
  bioMd: string | null
  name: string
}

export function Bio({ bioMd, name }: Props) {
  const paragraphs = bioMd
    ? bioMd
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(Boolean)
    : []

  return (
    <section className="relative px-[6vw] py-16 sm:py-20">
      <div className="max-w-[1480px] mx-auto">
        <div className="grid grid-cols-12 gap-6 border-b border-rule pb-4 editorial-mono text-ink-muted">
          <span className="col-span-12 sm:col-span-4 text-accent">— Biyografi</span>
          <span className="col-span-12 sm:col-span-8 sm:text-right opacity-70">
            {name}
          </span>
        </div>

        {paragraphs.length > 0 ? (
          <div className="mt-10 grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-10 lg:col-span-8 lg:col-start-3 space-y-6">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="font-serif text-ink editorial-reveal"
                  style={{
                    fontSize: 'clamp(18px, 1.5vw, 22px)',
                    lineHeight: 1.55,
                    animationDelay: `${Math.min(0.1 + i * 0.08, 0.6)}s`,
                  }}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 editorial-mono text-ink-muted text-center border-l-2 border-accent pl-4 py-2 max-w-xl mx-auto">
            — Biyografi hazırlanıyor — kısa süre içinde eklenecek —
          </div>
        )}
      </div>
    </section>
  )
}
