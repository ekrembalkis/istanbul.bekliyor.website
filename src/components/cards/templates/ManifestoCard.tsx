import type { CardFormat, CardTheme } from '../../../lib/cards/templates'
import { CardFrame } from '../CardFrame'
import { CardFooter } from '../CardFooter'
import { DayCounter } from '../DayCounter'
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
  messageSize: number
  manifestoSize: number
  direction: 'row' | 'column'
  logo: number
  footerSize: number
}

const LAYOUT: Record<CardFormat, Layout> = {
  '1x1':    { padding: 80, counter: 360, messageSize: 52, manifestoSize: 18, direction: 'column', logo: 64, footerSize: 14 },
  '16x9':   { padding: 64, counter: 280, messageSize: 40, manifestoSize: 16, direction: 'row',    logo: 56, footerSize: 13 },
  '9x16':   { padding: 90, counter: 480, messageSize: 60, manifestoSize: 22, direction: 'column', logo: 72, footerSize: 16 },
  'header': { padding: 56, counter: 240, messageSize: 32, manifestoSize: 14, direction: 'row',    logo: 48, footerSize: 12 },
}

export function ManifestoCard({ format, theme, day, message, authorName, scale }: Props) {
  const L = LAYOUT[format]

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
          gap: L.padding * 0.4,
        }}
      >
        {/* Top — masthead */}
        <div className="flex items-start justify-between" style={{ gap: 24 }}>
          <div className="flex items-center" style={{ gap: 16 }}>
            <KumSaati size={L.logo} />
            <span
              className="editorial-mono text-ink"
              style={{ fontSize: L.manifestoSize, letterSpacing: '0.32em', fontWeight: 600 }}
            >
              İSTANBUL · BEKLİYOR
            </span>
          </div>
          <span
            className="editorial-mono text-accent"
            style={{ fontSize: L.manifestoSize, letterSpacing: '0.22em' }}
          >
            HAK · HUKUK · ADALET
          </span>
        </div>

        {/* Body */}
        <div
          style={{
            display: 'flex',
            flexDirection: L.direction,
            alignItems: L.direction === 'row' ? 'center' : 'flex-start',
            justifyContent: 'space-between',
            gap: L.padding * 0.6,
            flex: 1,
            paddingTop: L.padding * 0.2,
          }}
        >
          <DayCounter
            day={day}
            fontSize={L.counter}
            sublabel="ÖZGÜRLÜK BORCU"
          />

          <div
            style={{
              flex: L.direction === 'row' ? 1 : undefined,
              maxWidth: L.direction === 'row' ? '52%' : '100%',
              position: 'relative',
              paddingLeft: L.padding * 0.4,
              borderLeft: '3px solid var(--accent)',
            }}
          >
            <p
              className="text-ink font-serif"
              style={{
                fontSize: L.messageSize,
                lineHeight: 1.22,
                letterSpacing: '-0.01em',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              {message}
            </p>
            {authorName && (
              <div
                className="editorial-mono text-ink-muted"
                style={{ fontSize: L.manifestoSize, marginTop: 18, letterSpacing: '0.22em' }}
              >
                — {authorName.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <CardFooter fontSize={L.footerSize} padTop={L.padding * 0.3} />
      </div>
    </CardFrame>
  )
}
