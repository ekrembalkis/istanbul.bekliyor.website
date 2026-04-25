import type { CardFormat, CardTheme } from '../../../lib/cards/templates'
import type { Detainee } from '../../../lib/detainees'
import { CardFrame } from '../CardFrame'
import { CardFooter } from '../CardFooter'
import { KumSaati } from '../KumSaati'

type Props = {
  format: CardFormat
  theme: CardTheme
  detainee: Detainee
  message: string
  authorName?: string
  scale?: number
}

type Layout = {
  padding: number
  photoSize: number
  nameSize: number
  titleSize: number
  dayBadgeSize: number
  dayCounterSize: number
  messageSize: number
  monoSize: number
  direction: 'row' | 'column'
  logo: number
  footerSize: number
}

const LAYOUT: Record<CardFormat, Layout> = {
  '1x1':    { padding: 72, photoSize: 380, nameSize: 92,  titleSize: 28, dayBadgeSize: 16, dayCounterSize: 96,  messageSize: 36, monoSize: 14, direction: 'row',    logo: 56, footerSize: 13 },
  '16x9':   { padding: 56, photoSize: 460, nameSize: 76,  titleSize: 24, dayBadgeSize: 14, dayCounterSize: 84,  messageSize: 30, monoSize: 13, direction: 'row',    logo: 52, footerSize: 12 },
  '9x16':   { padding: 80, photoSize: 760, nameSize: 110, titleSize: 32, dayBadgeSize: 18, dayCounterSize: 132, messageSize: 44, monoSize: 16, direction: 'column', logo: 64, footerSize: 14 },
  'header': { padding: 48, photoSize: 380, nameSize: 56,  titleSize: 18, dayBadgeSize: 12, dayCounterSize: 64,  messageSize: 22, monoSize: 11, direction: 'row',    logo: 44, footerSize: 11 },
}

export function DetaineeCard({ format, theme, detainee, message, authorName, scale }: Props) {
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
          gap: L.padding * 0.3,
        }}
      >
        {/* Top */}
        <div className="flex items-start justify-between" style={{ gap: 20 }}>
          <div className="flex items-center" style={{ gap: 14 }}>
            <KumSaati size={L.logo} />
            <span
              className="editorial-mono text-ink"
              style={{ fontSize: L.monoSize, letterSpacing: '0.32em', fontWeight: 600 }}
            >
              SİYASİ TUTUKLU · DOSSIER
            </span>
          </div>
          <span
            className="editorial-mono text-accent"
            style={{ fontSize: L.monoSize, letterSpacing: '0.22em' }}
          >
            #{String(detainee.day_count).padStart(3, '0')} GÜN
          </span>
        </div>

        {/* Body */}
        <div
          style={{
            display: 'flex',
            flexDirection: L.direction,
            alignItems: L.direction === 'row' ? 'flex-end' : 'flex-start',
            gap: L.padding * 0.6,
            flex: 1,
            paddingTop: L.padding * 0.3,
          }}
        >
          {/* Photo */}
          <div
            style={{
              position: 'relative',
              width: L.photoSize,
              height: L.photoSize,
              flexShrink: 0,
            }}
          >
            {detainee.photo_url ? (
              <img
                src={detainee.photo_url}
                alt={detainee.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  filter: 'grayscale(0.15) contrast(1.05)',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--rule)' }} />
            )}
            <div
              style={{
                position: 'absolute',
                left: -8,
                top: 0,
                bottom: 0,
                width: 4,
                background: 'var(--accent)',
              }}
            />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              className="editorial-mono text-accent"
              style={{ fontSize: L.dayBadgeSize, letterSpacing: '0.22em' }}
            >
              — MADDE 01 · FEATURED
            </span>
            <h1
              className="editorial-h1 text-ink"
              style={{ fontSize: L.nameSize, marginTop: 12, lineHeight: 0.92 }}
            >
              {detainee.name}
              <span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
            {detainee.title && (
              <p
                className="font-serif text-ink-muted"
                style={{
                  fontSize: L.titleSize,
                  marginTop: 8,
                  fontStyle: 'italic',
                }}
              >
                {detainee.title}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 18,
                marginTop: 24,
                borderTop: '1px solid var(--rule)',
                paddingTop: 16,
              }}
            >
              <span
                className="editorial-num text-accent tabular-nums"
                style={{ fontSize: L.dayCounterSize, lineHeight: 1 }}
              >
                {detainee.day_count}
              </span>
              <span
                className="editorial-mono text-ink-muted"
                style={{ fontSize: L.monoSize, letterSpacing: '0.32em' }}
              >
                GÜNDÜR ÖZGÜRLÜĞÜNDEN<br />MAHRUM
              </span>
            </div>

            <p
              className="font-serif text-ink"
              style={{
                fontSize: L.messageSize,
                marginTop: 28,
                lineHeight: 1.3,
                fontStyle: 'italic',
                maxWidth: '38ch',
              }}
            >
              {message}
              {authorName && (
                <>
                  <br />
                  <span
                    className="editorial-mono text-ink-muted"
                    style={{ fontSize: L.monoSize, letterSpacing: '0.22em', fontStyle: 'normal' }}
                  >
                    — {authorName.toUpperCase()}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <CardFooter fontSize={L.footerSize} padTop={L.padding * 0.3} />
      </div>
    </CardFrame>
  )
}
