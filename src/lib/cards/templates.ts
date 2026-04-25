// Card generator — types and constants shared between form, canvas, and tests.

export type CardTemplate = 'manifesto' | 'detainee' | 'solidarity'
export type CardFormat = '1x1' | '16x9' | '9x16' | 'header'
export type CardTheme = 'light' | 'dark'

export const FORMAT_DIMENSIONS: Record<CardFormat, { w: number; h: number }> = {
  '1x1': { w: 1080, h: 1080 },
  '16x9': { w: 1200, h: 675 },
  '9x16': { w: 1080, h: 1920 },
  'header': { w: 1500, h: 500 },
}

export const FORMAT_LABELS: Record<CardFormat, string> = {
  '1x1': '1:1 · POST',
  '16x9': '16:9 · GENİŞ',
  '9x16': '9:16 · STORY',
  'header': '1500×500 · HEADER',
}

export const TEMPLATE_LABELS: Record<CardTemplate, string> = {
  manifesto: 'MANİFESTO',
  detainee: 'TUTUKLU',
  solidarity: 'BEN DE',
}

export const TEMPLATE_DESCRIPTIONS: Record<CardTemplate, string> = {
  manifesto: 'Gün sayacı + manifesto cümlesi',
  detainee: 'Tutuklu fotoğrafı + dayanışma',
  solidarity: 'Anonim destek mesajı',
}

export const ALL_TEMPLATES: CardTemplate[] = ['manifesto', 'detainee', 'solidarity']
export const ALL_FORMATS: CardFormat[] = ['1x1', '16x9', '9x16', 'header']

export function isCardTemplate(v: unknown): v is CardTemplate {
  return typeof v === 'string' && ALL_TEMPLATES.includes(v as CardTemplate)
}

export function isCardFormat(v: unknown): v is CardFormat {
  return typeof v === 'string' && ALL_FORMATS.includes(v as CardFormat)
}
