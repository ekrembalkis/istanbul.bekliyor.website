import type { CardFormat, CardTheme } from '../../../lib/cards/templates'
import { CardFrame } from '../CardFrame'
import { CardFooter } from '../CardFooter'
import { KumSaati } from '../KumSaati'

type Props = {
  format: CardFormat
  theme: CardTheme
  day: number
  message: string
  authorName?: string
  scale?: number
}

type Layout = {
  padding: number
  counter: number
  bigPhrase: number
  messageSize: number
  monoSize: number
  logo: number
  footerSize: number
}

const LAYOUT: Record<CardFormat, Layout> = {
  '1x1':    { padding: 80, counter: 420, bigPhrase: 56, messageSize: 36, monoSize: 14, logo: 64, footerSize: 14 },
  '16x9':   { padding: 64, counter: 280, bigPhrase: 44, messageSize: 28, monoSize: 12, logo: 52, footerSize: 12 },
  '9x16':   { padding: 100, counter: 540, bigPhrase: 72, messageSize: 44, monoSize: 18, logo: 80, footerSize: 16 },
  'header': { padding: 48, counter: 200, bigPhrase: 32, messageSize: 22, monoSize: 11, logo: 44, footerSize: 11 },
}

export function SolidarityCard({ format, theme, day, message, authorName, scale }: Props) {
  const L = LAYOUT[format]
  const isWide = format === 'header' || format === '16x9'

  return (
    <CardFrame format={format} theme={theme} scale={scale}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: L.padding,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: L.padding * 0.3,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: 14 }}>
            <KumSaati size={L.logo} />
            <span
              className="editorial-mono text-ink"
              style={{ fontSize: L.monoSize, letterSpacing: '0.32em', fontWeight: 600 }}
            >
              {authorName ? authorName.toUpperCase() : 'BİRİ DAHA'}
            </span>
          </div>
          <span
            className="editorial-mono text-accent"
            style={{ fontSize: L.monoSize, letterSpacing: '0.22em' }}
          >
            #{String(day).padStart(3, '0')} · GÜN
          </span>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: isWide ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: L.padding * 0.4,
            paddingTop: L.padding * 0.2,
          }}
        >
          <span
            className="editorial-num text-accent tabular-nums"
            style={{
              fontSize: L.counter,
              lineHeight: 0.86,
              textShadow: '0 0 80px color-mix(in oklab, var(--accent) 32%, transparent)',
            }}
          >
            {day}
          </span>

          <div style={{ maxWidth: isWide ? '52%' : '100%', textAlign: isWide ? 'left' : 'center' }}>
            <div
              className="editorial-h1 text-ink"
              style={{
                fontSize: L.bigPhrase,
                lineHeight: 1.0,
                letterSpacing: '-0.03em',
              }}
            >
              BEN DE <em className="italic editorial-display text-accent">bekliyorum.</em>
            </div>
            <p
              className="font-serif text-ink"
              style={{
                fontSize: L.messageSize,
                lineHeight: 1.3,
                marginTop: 24,
                fontStyle: 'italic',
                opacity: 0.92,
              }}
            >
              {message}
            </p>
          </div>
        </div>

        <CardFooter fontSize={L.footerSize} padTop={L.padding * 0.3} />
      </div>
    </CardFrame>
  )
}
