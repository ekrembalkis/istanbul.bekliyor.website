// Site-wide public identity & external links.
// Centralized so swapping handle / domain doesn't require touching components.

export const SITE = {
  campaignName: 'İstanbul Bekliyor',
  manifestoTitle: 'HAK · HUKUK · ADALET',
  arrestDateLabel: '19 Mart 2025',
  romanYear: 'MMXXVI',
  primaryHashtag: '#İstanbulBekliyor',
  xHandle: '@istbekliyor',
  xProfileUrl: 'https://x.com/istbekliyor',
  xIntentBase: 'https://x.com/intent/tweet',
  publicHost: 'istanbulbekliyor.com',
  // /iletisim (lowercase) returns a blank page; /Sayfa/Iletisim (capitalised)
  // is the actual TBMM contact landing page.
  tbmmContactUrl: 'https://www.tbmm.gov.tr/Sayfa/Iletisim',
  // E-Dilekçe — practical citizen petition portal (real form, accepts text +
  // attachments). The closest thing TBMM offers to a usable contact form.
  tbmmEDilekceUrl: 'https://edilekce.tbmm.gov.tr/',
  // Deputy search by name/province/party — for citizens who want to find
  // a specific deputy and reach them through their personal page.
  tbmmDeputySearchUrl: 'https://www.tbmm.gov.tr/milletvekili-arama/form',
} as const

// Paper-grain noise overlay (encoded once, referenced by background-image).
// SVG namespace is XML-spec, not a network endpoint.
export const PAPER_GRAIN_DATA_URL =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns='http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width='220'%20height='220'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20baseFrequency='.9'%20numOctaves='2'%20stitchTiles='stitch'%2F%3E%3CfeColorMatrix%20values='0%200%200%200%201%20%200%200%200%200%201%20%200%200%200%200%201%20%200%200%200%20.35%200'%2F%3E%3C%2Ffilter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'%2F%3E%3C%2Fsvg%3E"
