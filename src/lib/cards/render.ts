// html-to-image wrapper with mandatory font preload.
// Fonts MUST be hot before toPng — otherwise glyphs fall back to
// generic sans-serif and the brand identity is lost in the export.

import { toPng } from 'html-to-image'

export type RenderOptions = {
  /** Pixel ratio for the export. 2 = retina-ready PNG. */
  pixelRatio?: number
  /** Background color (CSS value). Defaults to current --bg. */
  backgroundColor?: string
}

const FONT_FACES = [
  '300 220px "Fraunces"',
  '400 80px "Fraunces"',
  '300 220px italic "Fraunces"',
  '400 80px italic "DM Serif Display"',
  '500 11px "JetBrains Mono"',
  '600 11px "JetBrains Mono"',
  '400 22px "DM Sans"',
] as const

let preloadPromise: Promise<void> | null = null

export function preloadCardFonts(): Promise<void> {
  if (preloadPromise) return preloadPromise
  preloadPromise = (async () => {
    if (typeof document === 'undefined' || !document.fonts) return
    await Promise.all(FONT_FACES.map(spec => document.fonts.load(spec).catch(() => null)))
    await document.fonts.ready
  })()
  return preloadPromise
}

export async function renderCardToPng(
  node: HTMLElement,
  options: RenderOptions = {},
): Promise<string> {
  await preloadCardFonts()
  return toPng(node, {
    pixelRatio: options.pixelRatio ?? 2,
    cacheBust: true,
    backgroundColor: options.backgroundColor,
    filter: el => {
      // Skip elements explicitly excluded from the export (e.g. preview-only chrome).
      if ('classList' in el && (el as Element).classList?.contains('no-export')) return false
      return true
    },
  })
}
