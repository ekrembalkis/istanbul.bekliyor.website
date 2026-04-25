import type { ReactNode, CSSProperties } from 'react'
import type { CardFormat, CardTheme } from '../../lib/cards/templates'
import { FORMAT_DIMENSIONS } from '../../lib/cards/templates'
import { PAPER_GRAIN_DATA_URL } from '../../config/site'

type Props = {
  format: CardFormat
  theme: CardTheme
  scale?: number
  children: ReactNode
}

/**
 * Theme variables inlined here so the card is fully self-contained:
 * - selector chain (`[data-theme=...]`) is bypassed
 * - Tailwind 4 `@theme` indirection (`--color-ink: var(--ink)`) still resolves
 *   correctly because lazy `var()` evaluation looks up the nearest scope
 * - exporting via html-to-image preserves the card's own theme regardless of
 *   the host page's `data-theme` attribute
 */
// Both the raw tokens (used by inline style references like `var(--ink)`)
// AND the Tailwind-prefixed tokens (used by utility classes such as
// `text-ink`, which compile to `color: var(--color-ink)`) must be set,
// because Tailwind 4 declares `--color-ink: var(--ink)` only on `:root`
// and that reference is computed against `:root`'s scope, not the using
// element's. Setting `--color-X` directly here bypasses the indirection.
function buildVars(palette: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = { ...palette }
  for (const [k, v] of Object.entries(palette)) {
    if (k.startsWith('--') && !k.startsWith('--color-') && !k.startsWith('--grain')) {
      out[`--color-${k.slice(2)}`] = v
    }
  }
  return out
}

const LIGHT_PALETTE: Record<string, string> = {
  '--bg': '#f1ece4',
  '--paper': '#fbf7ef',
  '--ink': '#141210',
  '--ink-muted': '#7a6a55',
  '--rule': 'rgba(20, 18, 16, 0.18)',
  '--accent': '#c1121f',
  '--accent-strong': '#8c0c16',
  '--ornament': '#7a6a55',
  '--grain-opacity': '0.05',
}

const DARK_PALETTE: Record<string, string> = {
  '--bg': '#0a0a0a',
  '--paper': '#141014',
  '--ink': '#f1ece4',
  '--ink-muted': '#a89880',
  '--rule': '#3a342c',
  '--accent': '#e22b35',
  '--accent-strong': '#ff4953',
  '--ornament': '#a89880',
  '--grain-opacity': '0.04',
}

const THEME_VARS: Record<CardTheme, Record<string, string>> = {
  light: buildVars(LIGHT_PALETTE),
  dark: buildVars(DARK_PALETTE),
}

export function CardFrame({ format, theme, scale = 1, children }: Props) {
  const { w, h } = FORMAT_DIMENSIONS[format]

  const themeStyle = THEME_VARS[theme] as CSSProperties

  const innerStyle: CSSProperties =
    scale === 1
      ? { width: w, height: h, position: 'relative', overflow: 'hidden' }
      : {
          width: w,
          height: h,
          position: 'relative',
          overflow: 'hidden',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }

  return (
    <div
      data-card-frame
      style={{
        ...themeStyle,
        width: w * scale,
        height: h * scale,
        overflow: 'hidden',
        background: 'var(--bg)',
        color: 'var(--ink)',
      }}
    >
      <div style={innerStyle}>
        {/* Paper grain overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            mixBlendMode: 'overlay',
            backgroundImage: `url("${PAPER_GRAIN_DATA_URL}")`,
            opacity: Number(THEME_VARS[theme]['--grain-opacity']),
            pointerEvents: 'none',
          }}
        />
        {/* Body */}
        <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
      </div>
    </div>
  )
}
