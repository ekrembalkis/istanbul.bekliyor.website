import { useMemo, useState, useRef, type CSSProperties } from 'react'
import paths from '../../data/tr-il-paths.json'
import { findCityByPlate } from '../../data/cities'
import type { ProvinceAggregation } from '../../lib/provinces'
import { colorForCount } from '../../lib/provinces'

/**
 * The province paths are pre-projected at build time (see
 * scripts/build-topojson.mjs step 6). We render raw SVG `d` strings here —
 * no topojson decoding, no d3-geo projection, no runtime math.
 *
 * Why pre-compute: an earlier version that ran feature() + geoMercator()
 * + fitSize() at runtime worked perfectly under Node but degenerated to
 * scale ≈ 1 in the production browser bundle (single dot rendered at the
 * projection center). Build-time projection eliminates that whole class
 * of failure — same exact pixel coordinates in dev, prod, and Node.
 */

type PathsDoc = {
  viewbox: [number, number]
  features: Record<string, string> // { [plate]: 'M...' }
  meta: { featureCount: number }
}

const PATHS = paths as unknown as PathsDoc
const [VIEWBOX_WIDTH, VIEWBOX_HEIGHT] = PATHS.viewbox
const ASPECT_RATIO = VIEWBOX_WIDTH / VIEWBOX_HEIGHT

type Props = {
  aggregation: ProvinceAggregation
  selectedPlate: number | null
  onSelect: (plate: number | null) => void
}

export function TurkeyChoropleth({ aggregation, selectedPlate, onSelect }: Props) {
  const [hovered, setHovered] = useState<{ plate: number; x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Build a sorted list of [plate, d, name] tuples once. Sort by plate so
  // render order is stable and z-stacking is deterministic.
  const rows = useMemo(() => {
    const out: { plate: number; d: string; name: string }[] = []
    for (const [plateStr, d] of Object.entries(PATHS.features)) {
      const plate = Number(plateStr)
      const city = findCityByPlate(plate)
      if (!city) continue
      out.push({ plate, d, name: city.name })
    }
    out.sort((a, b) => a.plate - b.plate)
    return out
  }, [])

  const max = useMemo(() => {
    let m = 0
    for (const stats of aggregation.byPlate.values()) {
      if (stats.count > m) m = stats.count
    }
    return m
  }, [aggregation])

  function handleMove(plate: number, evt: React.MouseEvent) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    setHovered({ plate, x: evt.clientX - rect.left, y: evt.clientY - rect.top })
  }

  function handleClick(plate: number, count: number) {
    if (count === 0) return
    onSelect(selectedPlate === plate ? null : plate)
  }

  return (
    <figure
      className="relative w-full"
      style={{ aspectRatio: ASPECT_RATIO }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Türkiye il bazlı tutuklu yoğunluk haritası"
        style={{ display: 'block', width: '100%', height: '100%' }}
        onMouseLeave={() => setHovered(null)}
      >
        <g>
          {rows.map(({ plate, d, name }) => {
            const stats = aggregation.byPlate.get(plate)
            const count = stats?.count ?? 0
            const fill = colorForCount(count, max)
            const isSelected = selectedPlate === plate
            const interactive = count > 0
            return (
              <path
                key={plate}
                d={d}
                fill={fill}
                stroke={isSelected ? 'var(--accent)' : 'rgba(20, 18, 16, 0.4)'}
                strokeWidth={isSelected ? 2.5 : 0.8}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={pathStyle(interactive)}
                tabIndex={interactive ? 0 : -1}
                role={interactive ? 'button' : 'presentation'}
                aria-label={
                  interactive
                    ? `${name} — ${count} tutsak — profili aç`
                    : `${name} — kayıt yok`
                }
                onMouseEnter={evt => handleMove(plate, evt)}
                onMouseMove={evt => handleMove(plate, evt)}
                onClick={() => handleClick(plate, count)}
                onKeyDown={evt => {
                  if (evt.key === 'Enter' || evt.key === ' ') {
                    evt.preventDefault()
                    handleClick(plate, count)
                  }
                }}
              >
                <title>
                  {name} — {count}
                </title>
              </path>
            )
          })}
        </g>
      </svg>

      {hovered && <ChoroplethTooltip aggregation={aggregation} hovered={hovered} />}
    </figure>
  )
}

function pathStyle(interactive: boolean): CSSProperties {
  return {
    cursor: interactive ? 'pointer' : 'default',
    outline: 'none',
  }
}

function ChoroplethTooltip({
  aggregation,
  hovered,
}: {
  aggregation: ProvinceAggregation
  hovered: { plate: number; x: number; y: number }
}) {
  const stats = aggregation.byPlate.get(hovered.plate)
  if (!stats) return null
  return (
    <div
      role="tooltip"
      className="absolute pointer-events-none editorial-mono px-3 py-2 bg-bg border border-rule shadow-md whitespace-nowrap"
      style={{
        left: hovered.x + 14,
        top: hovered.y + 14,
        zIndex: 5,
        letterSpacing: '0.18em',
        fontSize: 12,
      }}
    >
      <span className="text-ink">{stats.city.name.toLocaleUpperCase('tr-TR')}</span>
      <span className="ml-2 text-accent">N° {stats.count}</span>
    </div>
  )
}
