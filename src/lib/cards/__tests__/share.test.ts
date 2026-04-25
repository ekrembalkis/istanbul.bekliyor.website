import { describe, expect, it } from 'vitest'
import { buildShareText, buildXShareUrl } from '../share'
import { SITE } from '../../../config/site'

describe('buildShareText', () => {
  it('starts with day counter and primary hashtag', () => {
    const text = buildShareText({ day: 38, message: 'Ben de bekliyorum.' })
    expect(text.startsWith(`GÜN 38 · ${SITE.primaryHashtag}`)).toBe(true)
  })

  it('always includes the public host URL', () => {
    const text = buildShareText({ day: 1, message: 'Test' })
    expect(text).toContain(SITE.publicHost)
    expect(text).toContain('/kart')
  })

  it('stays within X 280-character limit even for long messages', () => {
    const long = 'lorem ipsum dolor sit amet '.repeat(50)
    const text = buildShareText({ day: 999, message: long })
    expect(text.length).toBeLessThanOrEqual(280)
  })

  it('truncates long messages with an ellipsis', () => {
    const long = 'a'.repeat(400)
    const text = buildShareText({ day: 1, message: long })
    expect(text).toContain('…')
  })

  it('preserves short messages verbatim', () => {
    const text = buildShareText({ day: 5, message: 'Kısa mesaj.' })
    expect(text).toContain('Kısa mesaj.')
    expect(text).not.toContain('…')
  })
})

describe('buildXShareUrl', () => {
  it('uses the configured X intent base', () => {
    const url = buildXShareUrl('hello world')
    expect(url.startsWith(SITE.xIntentBase)).toBe(true)
  })

  it('URL-encodes the text', () => {
    const url = buildXShareUrl('a b & c')
    expect(url).toContain('a%20b%20%26%20c')
  })

  it('preserves Turkish characters under encoding', () => {
    const url = buildXShareUrl('GÜN 1')
    // After decoding the query, original text comes back intact.
    const decoded = decodeURIComponent(url.split('?text=')[1])
    expect(decoded).toBe('GÜN 1')
  })

  it('preserves the # in hashtags through encoding', () => {
    const url = buildXShareUrl('#İstanbulBekliyor')
    const decoded = decodeURIComponent(url.split('?text=')[1])
    expect(decoded).toBe('#İstanbulBekliyor')
  })
})
