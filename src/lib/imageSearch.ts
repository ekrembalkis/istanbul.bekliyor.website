export interface SearchImage {
  id: string
  url: string
  thumbnail: string
  title: string
  source: string
  width: number
  height: number
}

// Turkish stop words to strip from news titles for better image search
const STOP_WORDS = new Set([
  'bir', 'bu', 'da', 'de', 'den', 'dan', 'ile', 'için', 'gibi', 'kadar',
  'çok', 'daha', 'en', 'ancak', 'ama', 'fakat', 'ise', 'ya', 'ki',
  'olan', 'olarak', 'oldu', 'olduğu', 'olduğunu', 'olacak', 'olan',
  'hakkında', 'hakkında', 'gerekçesiyle', 'nedeniyle', 'dolayısıyla',
  'tarafından', 'üzerinden', 'karşı', 'sonra', 'önce', 'arasında',
  've', 'veya', 'hem', 'ne', 'mi', 'mu', 'mı', 'mü',
  'bulundu', 'bulunduğu', 'yapıldı', 'açıklandı', 'duyuruldu',
  'belirtildi', 'bildirildi', 'iddia', 'iddiasıyla',
])

function extractKeyTerms(title: string): string {
  // Split into words, remove stop words, keep meaningful terms
  const words = title
    .replace(/[''`""\-–—:;,\.!\?]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()))

  // Take up to 5 most meaningful words (proper nouns first, then longest)
  const sorted = words.sort((a, b) => {
    const aUpper = a[0] === a[0].toUpperCase() ? 1 : 0
    const bUpper = b[0] === b[0].toUpperCase() ? 1 : 0
    if (aUpper !== bUpper) return bUpper - aUpper // Proper nouns first
    return b.length - a.length // Then by length
  })

  const unique = [...new Set(sorted.map(w => w.toLowerCase()))]
    .slice(0, 5)
    .map(lower => sorted.find(w => w.toLowerCase() === lower)!)

  return unique.join(' ')
}

function cleanQuery(raw: string): string {
  const q = raw.trim()
  if (q.length <= 60) return q

  // For long news titles, extract key terms instead of truncating
  const extracted = extractKeyTerms(q)
  return extracted.length >= 5 ? extracted : q.slice(0, 60)
}

export async function searchImages(query: string, count = 10): Promise<SearchImage[]> {
  const q = cleanQuery(query)
  if (q.length < 2) return []

  const params = new URLSearchParams({ q, num: String(count) })
  const res = await fetch(`/api/serpapi?${params}`)

  if (!res.ok) return []

  const data = await res.json()
  if (!data.images_results?.length) return []

  return data.images_results.map((img: any, i: number) => ({
    id: `serp-${Date.now()}-${i}`,
    url: img.original,
    thumbnail: img.thumbnail,
    title: img.title || q,
    source: img.source || 'Google Images',
    width: img.original_width || 0,
    height: img.original_height || 0,
  }))
}
