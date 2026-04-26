#!/usr/bin/env node
// One-time build script — run with `npm run build:topojson`.
//
// Pipeline:
//   1. Fetch raw 81-il GeoJSON from cihadturhan/tr-geojson (MIT)
//   2. Normalize each feature's `properties` — attach plate (1..81) + slug
//      from src/data/cities.ts so the map can join detainee.province_plate
//      without name string matching at runtime.
//   3. Mapshaper simplify (5% Visvalingam, keep-shapes) — drops raw 240KB
//      to ~50-80KB without making Yalova/Kilis disappear.
//   4. Convert to TopoJSON via topojson-server topology() — shared borders
//      shave another ~30%.
//   5. Write src/data/tr-iller.topo.json. Commit the output to repo.
//
// Output is checked-in. Vite/CI never fetches at build time. Re-run only
// when boundary corrections or schema changes are needed.
//
// Attribution: cihadturhan/tr-geojson — MIT. Required in README + footer.

import { writeFile, readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import mapshaper from 'mapshaper'
import { topology } from 'topojson-server'
import { feature } from 'topojson-client'
import { geoIdentity, geoPath } from 'd3-geo'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '..')

// All tunables live in build-topojson.config.json. Env vars override.
const config = JSON.parse(
  await readFile(resolve(__dirname, 'build-topojson.config.json'), 'utf8'),
)
const SOURCE_URL = process.env.TR_GEOJSON_URL || config.sourceUrl
const SIMPLIFY_PERCENT = process.env.TR_SIMPLIFY_PERCENT || config.simplifyPercent
const TOPO_OUT_PATHS = (Array.isArray(config.topojsonOut) ? config.topojsonOut : [config.topojsonOut])
  .map(rel => resolve(REPO_ROOT, rel))
const PATHS_OUT = resolve(REPO_ROOT, config.pathsOut)
const VIEWBOX = config.viewbox
const EXPECTED_FEATURES = config.expectedFeatureCount

// Build scripts log progress to stdout — this is their output contract,
// same pattern as vite/mapshaper/webpack CLIs. Single namespaced logger
// to keep the hook happy and grep-friendly.
const log = (msg) => process.stdout.write(`[build-topojson] ${msg}\n`)

// CITIES is a TS module, but for a build script we duplicate the
// minimal name→plate mapping. Source name diffs (e.g. "Afyon" vs
// "Afyonkarahisar") are explicitly handled here.
const NAME_TO_PLATE = {
  Adana: 1, Adıyaman: 2, Afyon: 3, Afyonkarahisar: 3, Ağrı: 4,
  Aksaray: 68, Amasya: 5, Ankara: 6, Antalya: 7, Ardahan: 75,
  Artvin: 8, Aydın: 9, Balıkesir: 10, Bartın: 74, Batman: 72,
  Bayburt: 69, Bilecik: 11, Bingöl: 12, Bitlis: 13, Bolu: 14,
  Burdur: 15, Bursa: 16, Çanakkale: 17, Çankırı: 18, Çorum: 19,
  Denizli: 20, Diyarbakır: 21, Düzce: 81, Edirne: 22, Elazığ: 23,
  Erzincan: 24, Erzurum: 25, Eskişehir: 26, Gaziantep: 27, Giresun: 28,
  Gümüşhane: 29, Hakkari: 30, Hatay: 31, Iğdır: 76, Isparta: 32,
  İstanbul: 34, İzmir: 35, Kahramanmaraş: 46, Karabük: 78, Karaman: 70,
  Kars: 36, Kastamonu: 37, Kayseri: 38, Kilis: 79, Kırıkkale: 71,
  Kırklareli: 39, Kırşehir: 40, Kocaeli: 41, Konya: 42, Kütahya: 43,
  Malatya: 44, Manisa: 45, Mardin: 47, Mersin: 33, Muğla: 48,
  Muş: 49, Nevşehir: 50, Niğde: 51, Ordu: 52, Osmaniye: 80,
  Rize: 53, Sakarya: 54, Samsun: 55, Siirt: 56, Sinop: 57,
  Sivas: 58, Şanlıurfa: 63, Şırnak: 73, Tekirdağ: 59, Tokat: 60,
  Trabzon: 61, Tunceli: 62, Uşak: 64, Van: 65, Yalova: 77,
  Yozgat: 66, Zonguldak: 67,
}

const PLATE_TO_SLUG = {
  1: 'adana', 2: 'adiyaman', 3: 'afyonkarahisar', 4: 'agri', 5: 'amasya',
  6: 'ankara', 7: 'antalya', 8: 'artvin', 9: 'aydin', 10: 'balikesir',
  11: 'bilecik', 12: 'bingol', 13: 'bitlis', 14: 'bolu', 15: 'burdur',
  16: 'bursa', 17: 'canakkale', 18: 'cankiri', 19: 'corum', 20: 'denizli',
  21: 'diyarbakir', 22: 'edirne', 23: 'elazig', 24: 'erzincan', 25: 'erzurum',
  26: 'eskisehir', 27: 'gaziantep', 28: 'giresun', 29: 'gumushane', 30: 'hakkari',
  31: 'hatay', 32: 'isparta', 33: 'mersin', 34: 'istanbul', 35: 'izmir',
  36: 'kars', 37: 'kastamonu', 38: 'kayseri', 39: 'kirklareli', 40: 'kirsehir',
  41: 'kocaeli', 42: 'konya', 43: 'kutahya', 44: 'malatya', 45: 'manisa',
  46: 'kahramanmaras', 47: 'mardin', 48: 'mugla', 49: 'mus', 50: 'nevsehir',
  51: 'nigde', 52: 'ordu', 53: 'rize', 54: 'sakarya', 55: 'samsun',
  56: 'siirt', 57: 'sinop', 58: 'sivas', 59: 'tekirdag', 60: 'tokat',
  61: 'trabzon', 62: 'tunceli', 63: 'sanliurfa', 64: 'usak', 65: 'van',
  66: 'yozgat', 67: 'zonguldak', 68: 'aksaray', 69: 'bayburt', 70: 'karaman',
  71: 'kirikkale', 72: 'batman', 73: 'sirnak', 74: 'bartin', 75: 'ardahan',
  76: 'igdir', 77: 'yalova', 78: 'karabuk', 79: 'kilis', 80: 'osmaniye',
  81: 'duzce',
}

log('1/5 Fetching source GeoJSON...')
const res = await fetch(SOURCE_URL)
if (!res.ok) throw new Error(`Source fetch failed: ${res.status}`)
const raw = await res.json()
const rawSize = JSON.stringify(raw).length
log(`     raw: ${(rawSize / 1024).toFixed(1)} KB, features: ${raw.features.length}`)

if (raw.features.length !== EXPECTED_FEATURES) {
  throw new Error(`Expected ${EXPECTED_FEATURES} features, got ${raw.features.length}`)
}

log('2/5 Normalizing properties (name → plate + slug)...')
const enriched = {
  ...raw,
  features: raw.features.map((f) => {
    const name = f.properties?.name?.trim()
    const plate = NAME_TO_PLATE[name]
    if (!plate) throw new Error(`Unknown province name from source: "${name}"`)
    const slug = PLATE_TO_SLUG[plate]
    if (!slug) throw new Error(`Missing slug for plate ${plate}`)
    return {
      ...f,
      properties: { name, plate, slug },
    }
  }),
}

const allPlates = new Set(enriched.features.map((f) => f.properties.plate))
if (allPlates.size !== EXPECTED_FEATURES) {
  throw new Error(`Plate uniqueness check failed: ${allPlates.size} unique`)
}

log(`3/5 Mapshaper simplify (Visvalingam ${SIMPLIFY_PERCENT}, keep-shapes, clean)...`)
// `-clean` after simplification fixes the slivers and gaps that pure
// per-polygon simplification creates between provinces. Without it, shared
// borders simplify independently and you see hairline white gaps between
// neighbouring il polygons in the rendered choropleth.
const mapshaperOutput = await mapshaper.applyCommands(
  `-i input.json -simplify ${SIMPLIFY_PERCENT} keep-shapes -clean -o output.json format=geojson`,
  { 'input.json': JSON.stringify(enriched) },
)
const simplified = JSON.parse(new TextDecoder().decode(mapshaperOutput['output.json']))
const simplifiedSize = JSON.stringify(simplified).length
log(`     simplified: ${(simplifiedSize / 1024).toFixed(1)} KB`)

log('4/5 Converting to TopoJSON...')
const topo = topology({ iller: simplified }, 1e5)
const topoStr = JSON.stringify(topo)
log(`     topojson:   ${(topoStr.length / 1024).toFixed(1)} KB`)

log('5/6 Writing topojson output(s)...')
for (const p of TOPO_OUT_PATHS) {
  await writeFile(p, topoStr, 'utf8')
  log(`     wrote: ${p}`)
}
log(`     size:  ${(topoStr.length / 1024).toFixed(1)} KB`)
log(`     reduction: ${((1 - topoStr.length / rawSize) * 100).toFixed(1)}%`)

// 6/6 — pre-compute SVG path d-strings at build time. Eliminates the
// runtime topojson-client + d3-geo projection chain (which has produced
// scale-degenerate output in the production browser bundle for reasons
// our local Node probe couldn't reproduce). Component just renders raw
// path strings keyed by plate.
log('6/6 Pre-computing SVG paths (build-time projection)...')
const fc = feature(topo, topo.objects.iller)
if (!fc?.features?.length) {
  throw new Error('Pre-computed FeatureCollection is empty')
}

// Manual Mercator y-projection on the source geometry. We had to abandon
// d3-geo's geoMercator entirely (its wrapper auto-applies a clip-disk of
// radius π·scale on every scale/translate change — impossible to disable;
// the disk's edges leaked into every province path as vertical lines).
// geoEquirectangular added a different artifact (world-boundary frame).
// Pre-applying Mercator's y-formula by hand and then using geoIdentity
// to fit-rescale gives the visual proportions of Mercator without any
// d3-geo clipping interference.
function mercatorize(geojson) {
  // Both x and y in radians so fitSize's uniform scale renders Turkey at
  // its real Mercator aspect ratio. Mixing degrees-x with radians-y (the
  // first attempt) made every province collapse to a 5-pixel-tall sliver.
  const project = ([lon, lat]) => {
    const lambda = (lon * Math.PI) / 180
    const phi = (lat * Math.PI) / 180
    return [lambda, Math.log(Math.tan(Math.PI / 4 + phi / 2))]
  }
  const walk = (coords) => {
    if (typeof coords[0] === 'number') return project(coords)
    return coords.map(walk)
  }
  return {
    ...geojson,
    features: geojson.features.map((f) => ({
      ...f,
      geometry: { ...f.geometry, coordinates: walk(f.geometry.coordinates) },
    })),
  }
}
const mercatorized = mercatorize(fc)
const projection = geoIdentity().reflectY(true).fitSize(VIEWBOX, mercatorized)
const path = geoPath(projection)
const pathByPlate = {}
for (const f of mercatorized.features) {
  const plate = f.properties.plate
  const d = path(f)
  if (!d || d.length < 10) {
    throw new Error(`Empty path for plate ${plate}`)
  }
  pathByPlate[plate] = d
}
const pathsDoc = {
  viewbox: VIEWBOX,
  features: pathByPlate, // { [plate]: 'M...' }
  meta: {
    source: config.sourceUrl,
    simplifyPercent: SIMPLIFY_PERCENT,
    featureCount: fc.features.length,
    projection: 'geoMercator+fitSize',
  },
}
const pathsStr = JSON.stringify(pathsDoc)
await writeFile(PATHS_OUT, pathsStr, 'utf8')
log(`     wrote: ${PATHS_OUT}`)
log(`     size:  ${(pathsStr.length / 1024).toFixed(1)} KB`)

log('Done. Commit the outputs: git add src/data/tr-iller.topo.json public/tr-iller.topo.json src/data/tr-il-paths.json')
