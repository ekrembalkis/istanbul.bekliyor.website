/**
 * Editorial loading skeleton — shown while the lazy choropleth chunk loads.
 * Lives in a separate file so the main page can statically import it without
 * pulling d3-geo + topojson-client into the main bundle (vite's lazy split
 * fails when the same module is both static and dynamic-imported).
 */
const VIEWBOX_RATIO = '1000/562' // matches TurkeyChoropleth viewport (16:9)

export function TurkeyChoroplethSkeleton() {
  return (
    <figure
      className="relative w-full bg-rule/20 flex items-center justify-center"
      style={{ aspectRatio: VIEWBOX_RATIO }}
      aria-busy="true"
      aria-label="Harita yükleniyor"
    >
      <span className="editorial-mono text-ink-muted opacity-70">
        — Harita yükleniyor —
      </span>
    </figure>
  )
}
