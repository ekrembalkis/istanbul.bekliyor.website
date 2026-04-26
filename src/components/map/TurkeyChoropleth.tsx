import { useMemo, useState, useRef, useEffect, type CSSProperties } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import type { FeatureCollection, Feature, Geometry } from 'geojson'
import topology from '../../data/tr-iller.topo.json'
import type { ProvinceAggregation } from '../../lib/provinces'
import { colorForCount } from '../../lib/provinces'

const VIEWBOX_WIDTH = 1000
const VIEWBOX_HEIGHT = 562 // 16:9

type ProvinceProps = { name: string; plate: number; slug: string }
type ProvinceFeature = Feature<Geometry, ProvinceProps>

type Props = {
  aggregation: ProvinceAggregation
  selectedPlate: number | null
  onSelect: (plate: number | null) => void
}

export function TurkeyChoropleth({ aggregation, selectedPlate, onSelect }: Props) {
  const [hovered, setHovered] = useState<{ plate: number; x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Compute features + projected paths once. TopoJSON parsing is cheap but
  // d3-geoPath on 81 features is a few KB of math we don't want to redo.
  const { features, pathFor, max } = useMemo(() => {
    const fc = feature(
      topology as unknown as Topology,
      (topology as unknown as Topology).objects.iller,
    ) as unknown as FeatureCollection<Geometry, ProvinceProps>

    const projection = geoMercator().fitSize([VIEWBOX_WIDTH, VIEWBOX_HEIGHT], fc)
    const pathFor = geoPath(projection)

    let max = 0
    for (const stats of aggregation.byPlate.values()) {
      if (stats.count > max) max = stats.count
    }
    return { features: fc.features, pathFor, max }
  }, [aggregation])

  // Track hover position for the popover. Using clientX/Y relative to the SVG
  // viewport is enough because the popover is positioned absolutely inside
  // the same wrapper.
  function handleMove(plate: number, evt: React.MouseEvent | React.FocusEvent) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const e = 'clientX' in evt ? evt : null
    if (e) {
      setHovered({ plate, x: e.clientX - rect.left, y: e.clientY - rect.top })
    } else {
      // Keyboard focus — anchor at province centroid.
      const f = features.find(g => g.properties.plate === plate)
      if (!f) return
      const c = pathFor.centroid(f as Feature<Geometry, ProvinceProps>)
      const scaleX = rect.width / VIEWBOX_WIDTH
      const scaleY = rect.height / VIEWBOX_HEIGHT
      setHovered({ plate, x: c[0] * scaleX, y: c[1] * scaleY })
    }
  }

  function handleClick(plate: number, count: number) {
    if (count === 0) return
    onSelect(selectedPlate === plate ? null : plate)
  }

  return (
    <figure
      className="relative w-full"
      style={{ aspectRatio: `${VIEWBOX_WIDTH}/${VIEWBOX_HEIGHT}` }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        role="img"
        aria-label="Türkiye il bazlı tutuklu yoğunluk haritası"
        className="w-full h-full"
        onMouseLeave={() => setHovered(null)}
      >
        <g>
          {features.map(f => {
            const plate = f.properties.plate
            const stats = aggregation.byPlate.get(plate)
            const count = stats?.count ?? 0
            const fill = colorForCount(count, max)
            const isSelected = selectedPlate === plate
            const interactive = count > 0
            const d = pathFor(f as Feature<Geometry, ProvinceProps>) ?? ''
            return (
              <path
                key={plate}
                d={d}
                fill={fill}
                stroke={isSelected ? 'var(--accent)' : 'var(--rule)'}
                strokeWidth={isSelected ? 2 : 0.5}
                style={pathStyle(interactive, isSelected)}
                tabIndex={interactive ? 0 : -1}
                role={interactive ? 'button' : 'presentation'}
                aria-label={
                  interactive
                    ? `${f.properties.name} — ${count} tutsak — profili aç`
                    : `${f.properties.name} — kayıt yok`
                }
                onMouseEnter={evt => handleMove(plate, evt)}
                onMouseMove={evt => handleMove(plate, evt)}
                onFocus={evt => handleMove(plate, evt)}
                onBlur={() => setHovered(null)}
                onClick={() => handleClick(plate, count)}
                onKeyDown={evt => {
                  if (evt.key === 'Enter' || evt.key === ' ') {
                    evt.preventDefault()
                    handleClick(plate, count)
                  }
                }}
              >
                <title>
                  {f.properties.name} — {count}
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

function pathStyle(interactive: boolean, selected: boolean): CSSProperties {
  return {
    cursor: interactive ? 'pointer' : 'default',
    outline: 'none',
    transition: 'fill 160ms ease, stroke 160ms ease',
    filter: selected
      ? 'drop-shadow(0 0 8px color-mix(in oklab, var(--accent) 40%, transparent))'
      : undefined,
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

