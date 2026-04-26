import { useMemo, useState, useRef, useEffect, type CSSProperties } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import type { FeatureCollection, Feature, Geometry } from 'geojson'
import type { ProvinceAggregation } from '../../lib/provinces'
import { colorForCount } from '../../lib/provinces'

const VIEWBOX_WIDTH = 1000
const VIEWBOX_HEIGHT = 562
const ASPECT_RATIO = VIEWBOX_WIDTH / VIEWBOX_HEIGHT
const TOPOJSON_URL = '/tr-iller.topo.json'

type ProvinceProps = { name: string; plate: number; slug: string }

type Props = {
  aggregation: ProvinceAggregation
  selectedPlate: number | null
  onSelect: (plate: number | null) => void
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; topology: Topology }

export function TurkeyChoropleth({ aggregation, selectedPlate, onSelect }: Props) {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' })
  const [hovered, setHovered] = useState<{ plate: number; x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Runtime fetch of the topojson asset. Bypasses Vite's JSON transform
  // entirely — gets a fresh fetch + JSON.parse, no bundler-specific quirks.
  useEffect(() => {
    let cancelled = false
    fetch(TOPOJSON_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((topology: Topology) => {
        if (cancelled) return
        if (topology?.type !== 'Topology' || !topology.objects?.iller) {
          throw new Error('Topology shape invalid')
        }
        setLoad({ status: 'ready', topology })
      })
      .catch((err: Error) => {
        if (cancelled) return
        setLoad({ status: 'error', message: err.message.slice(0, 100) })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const computed = useMemo(() => {
    if (load.status !== 'ready') return null
    const t = load.topology
    const obj = t.objects.iller
    const fc = feature(t, obj) as unknown as FeatureCollection<Geometry, ProvinceProps>
    if (!fc?.features?.length) return null

    const projection = geoMercator().fitSize([VIEWBOX_WIDTH, VIEWBOX_HEIGHT], fc)
    const pathFor = geoPath(projection)

    let max = 0
    for (const stats of aggregation.byPlate.values()) {
      if (stats.count > max) max = stats.count
    }
    return { features: fc.features, pathFor, max }
  }, [load, aggregation])

  function handleMove(plate: number, evt: React.MouseEvent | React.FocusEvent) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    if ('clientX' in evt) {
      setHovered({ plate, x: evt.clientX - rect.left, y: evt.clientY - rect.top })
    } else if (computed) {
      const f = computed.features.find(g => g.properties.plate === plate)
      if (!f) return
      const c = computed.pathFor.centroid(f as Feature<Geometry, ProvinceProps>)
      const scaleX = rect.width / VIEWBOX_WIDTH
      const scaleY = rect.height / VIEWBOX_HEIGHT
      setHovered({ plate, x: c[0] * scaleX, y: c[1] * scaleY })
    }
  }

  function handleClick(plate: number, count: number) {
    if (count === 0) return
    onSelect(selectedPlate === plate ? null : plate)
  }

  // Visible runtime status surfaced inside the figure (not console) so the
  // user can see exactly what state the chunk is in without opening devtools.
  const statusBadge = (() => {
    if (load.status === 'loading') return '— Harita yükleniyor —'
    if (load.status === 'error') return `— Harita yüklenemedi: ${load.message} —`
    if (!computed) return '— Harita verisi geçersiz —'
    return null
  })()

  return (
    <figure
      className="relative w-full"
      style={{ aspectRatio: ASPECT_RATIO }}
    >
      {statusBadge ? (
        <div
          className="absolute inset-0 flex items-center justify-center editorial-mono text-ink-muted opacity-70"
          style={{ background: 'rgba(20, 18, 16, 0.04)' }}
        >
          {statusBadge}
        </div>
      ) : (
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
            {computed!.features.map(f => {
              const plate = f.properties.plate
              const stats = aggregation.byPlate.get(plate)
              const count = stats?.count ?? 0
              const fill = colorForCount(count, computed!.max)
              const isSelected = selectedPlate === plate
              const interactive = count > 0
              const d = computed!.pathFor(f as Feature<Geometry, ProvinceProps>) ?? ''
              return (
                <path
                  key={plate}
                  d={d}
                  fill={fill}
                  stroke={isSelected ? 'var(--accent)' : 'rgba(20, 18, 16, 0.55)'}
                  strokeWidth={isSelected ? 3.5 : 1.5}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
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
      )}

      {hovered && computed && <ChoroplethTooltip aggregation={aggregation} hovered={hovered} />}
    </figure>
  )
}

function pathStyle(interactive: boolean, _selected: boolean): CSSProperties {
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
