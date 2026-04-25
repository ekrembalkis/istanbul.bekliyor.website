import { describe, expect, it } from 'vitest'
import { daysSinceArrest, getDayCount } from '../utils'

describe('daysSinceArrest', () => {
  it('returns 1 on the arrest day itself (1-indexed)', () => {
    const arrest = '2025-03-19'
    const sameDay = new Date('2025-03-19T15:00:00+03:00')
    expect(daysSinceArrest(arrest, sameDay)).toBe(1)
  })

  it('increments by 1 each calendar day', () => {
    const arrest = '2025-03-19'
    const oneWeek = new Date('2025-03-26T12:00:00+03:00')
    expect(daysSinceArrest(arrest, oneWeek)).toBe(8)
  })

  it('clamps to 1 if "now" is before the arrest date', () => {
    const arrest = '2026-01-01'
    const past = new Date('2025-12-01T00:00:00+03:00')
    expect(daysSinceArrest(arrest, past)).toBe(1)
  })

  it('parses Istanbul-locked arrest date regardless of caller TZ', () => {
    // Same wall-clock instant; the helper assumes +03:00 for date-only strings.
    const arrest = '2025-03-19'
    const inUTC = new Date('2025-03-19T20:59:59Z')   // = 23:59:59 +03:00 same day
    expect(daysSinceArrest(arrest, inUTC)).toBe(1)
  })

  it('getDayCount and daysSinceArrest agree for the campaign default', () => {
    const now = new Date('2026-04-25T09:00:00+03:00')
    expect(getDayCount(now)).toBe(daysSinceArrest('2025-03-19', now))
  })
})
