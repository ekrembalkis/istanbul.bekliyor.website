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
