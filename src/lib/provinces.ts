import { CITIES, type City } from '../data/cities'
import type { Detainee } from './detainees'

export type ProvinceStats = {
  city: City
  count: number
  /** Detainees registered to this province, in original ordering. */
  detainees: Detainee[]
}

/** Total detainees with no province set (province_plate === null). */
export type ProvinceAggregation = {
  /** All 81 plates, ordered by count DESC then by name (Turkish collation). */
  ranked: ProvinceStats[]
  /** Per-plate lookup so consumers can pull a specific il without scanning. */
  byPlate: Map<number, ProvinceStats>
  /** Province known. */
  totalAssigned: number
  /** Province unknown / null. */
  totalUnassigned: number
  /** Distinct provinces with at least one detainee. */
  provincesCovered: number
}

/**
 * Aggregate detainees by province plate. Always returns a row for every one
 * of the 81 provinces (zeros included) so the heatmap has a stable shape
 * regardless of who has been seeded.
 */
export function aggregateByProvince(detainees: Detainee[]): ProvinceAggregation {
  const collator = new Intl.Collator('tr-TR')
  const stats = new Map<number, ProvinceStats>()
  for (const c of CITIES) {
    if (c.plate == null) continue
    stats.set(c.plate, { city: c, count: 0, detainees: [] })
  }

  let totalAssigned = 0
  let totalUnassigned = 0
  for (const d of detainees) {
    if (d.province_plate == null) {
      totalUnassigned++
      continue
    }
    const slot = stats.get(d.province_plate)
    if (!slot) {
      // Plate outside 1..81 range — defensive; CHECK constraint guards DB side
      // but if a fallback row leaks through, surface it as unassigned rather
      // than crashing.
      totalUnassigned++
      continue
    }
    slot.count++
    slot.detainees.push(d)
    totalAssigned++
  }

  const ranked = Array.from(stats.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return collator.compare(a.city.name, b.city.name)
  })

  const provincesCovered = ranked.filter(r => r.count > 0).length

  return {
    ranked,
    byPlate: stats,
    totalAssigned,
    totalUnassigned,
    provincesCovered,
  }
}

/**
 * Bar fill ratio (0..1) for the heatmap. Logarithmic scaling keeps a single
 * outlier (e.g. İstanbul with 5 while everywhere else has 0-1) from flatlining
 * the rest of the chart. Pure helper — easy to test, easy to swap.
 */
export function barRatio(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0
  if (max === 1) return count > 0 ? 1 : 0
  return Math.log1p(count) / Math.log1p(max)
}

/**
 * Choropleth fill ramp — paper-tinted → brand red (#E30A17), 5 discrete bins.
 * Discrete chosen over interpolation: editorial maps (NYT/Guardian) use bins
 * because they're visually legible and printer-safe.
 *
 * Bin 0 ("no data") is intentionally a touch darker than --bg (#f1ece4) so
 * province silhouettes read as paper-on-paper rather than disappearing into
 * the page. Bin assignment goes through `barRatio` (log1p) so a single
 * outlier doesn't flatten the rest of the map.
 */
export const CHOROPLETH_RAMP = [
  '#e6dccb', // 0 — aged paper, just below bg for silhouette contrast
  '#f0c8b8', // 1 — softest pink
  '#e89a8c', // 2 — pink
  '#dd5848', // 3 — red-orange
  '#E30A17', // 4 — brand red
] as const

export function colorForCount(count: number, max: number): string {
  if (count <= 0) return CHOROPLETH_RAMP[0]
  const ratio = barRatio(count, max)
  // Map ratio (0..1] into bins 1..4 (skip bin 0 = "no data").
  // Bin 1: (0, 0.25], Bin 2: (0.25, 0.5], Bin 3: (0.5, 0.75], Bin 4: (0.75, 1].
  if (ratio <= 0.25) return CHOROPLETH_RAMP[1]
  if (ratio <= 0.5) return CHOROPLETH_RAMP[2]
  if (ratio <= 0.75) return CHOROPLETH_RAMP[3]
  return CHOROPLETH_RAMP[4]
}
