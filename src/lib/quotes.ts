import { QUOTES, type Quote } from '../data/quotes'
import { getDayCount } from './utils'

/**
 * Deterministic daily quote selection.
 *
 * Why a hash mix instead of `day % length`?
 *   Pure modulo over consecutive days creates a visible "pattern" — every
 *   quote always appears on the same weekday-of-cycle. A small mix function
 *   spreads the rotation so two consecutive days never feel sequential.
 *   Still 100% deterministic: same `day` → same quote.
 */
function mix(day: number, len: number): number {
  // golden-ratio multiplier — keeps consecutive days far apart in the array.
  const x = Math.abs(Math.floor(day * 2654435761) >>> 0)
  return x % len
}

export function getDailyQuote(day: number = getDayCount()): Quote {
  if (QUOTES.length === 0) {
    throw new Error('QUOTES dataset is empty')
  }
  if (!Number.isFinite(day) || day < 1) {
    return QUOTES[0]
  }
  return QUOTES[mix(day, QUOTES.length)]
}

/** Returns the quote that will appear on day `day + offset`. */
export function getQuoteForOffset(offset: number, baseDay: number = getDayCount()): Quote {
  return getDailyQuote(baseDay + offset)
}
