// Türkiye 81 il + iki özel seçenek (Yurtdışı, Belirtmek istemiyorum).
// Türkçe alfabetik sıraya göre.
//
// `plate`: official plaka kodu 1-81 — used to cross-reference deputy
// distribution (`data/deputies.ts`). Special options carry plate=null.
// `region` ileride harita / istatistik feature'ları için kullanılacak
// (Faz 2 #8 — tutuklu haritası, manifesto imzacı yoğunluğu).

export type CityRegion =
  | 'Marmara'
  | 'Ege'
  | 'Akdeniz'
  | 'İç Anadolu'
  | 'Karadeniz'
  | 'Doğu Anadolu'
  | 'Güneydoğu Anadolu'
  | 'Yurtdışı'
  | 'Belirtilmedi'

export type City = {
  /** URL-safe slug, ASCII, lowercase. */
  slug: string
  /** Display name in Turkish. */
  name: string
  region: CityRegion
  /** Official plaka kodu (1..81); null for special options. */
  plate: number | null
}

export const CITIES: City[] = [
  { slug: 'adana',          name: 'Adana',          region: 'Akdeniz',           plate: 1 },
  { slug: 'adiyaman',       name: 'Adıyaman',       region: 'Güneydoğu Anadolu', plate: 2 },
  { slug: 'afyonkarahisar', name: 'Afyonkarahisar', region: 'Ege',               plate: 3 },
  { slug: 'agri',           name: 'Ağrı',           region: 'Doğu Anadolu',      plate: 4 },
  { slug: 'aksaray',        name: 'Aksaray',        region: 'İç Anadolu',        plate: 68 },
  { slug: 'amasya',         name: 'Amasya',         region: 'Karadeniz',         plate: 5 },
  { slug: 'ankara',         name: 'Ankara',         region: 'İç Anadolu',        plate: 6 },
  { slug: 'antalya',        name: 'Antalya',        region: 'Akdeniz',           plate: 7 },
  { slug: 'ardahan',        name: 'Ardahan',        region: 'Doğu Anadolu',      plate: 75 },
  { slug: 'artvin',         name: 'Artvin',         region: 'Karadeniz',         plate: 8 },
  { slug: 'aydin',          name: 'Aydın',          region: 'Ege',               plate: 9 },
  { slug: 'balikesir',      name: 'Balıkesir',      region: 'Marmara',           plate: 10 },
  { slug: 'bartin',         name: 'Bartın',         region: 'Karadeniz',         plate: 74 },
  { slug: 'batman',         name: 'Batman',         region: 'Güneydoğu Anadolu', plate: 72 },
  { slug: 'bayburt',        name: 'Bayburt',        region: 'Karadeniz',         plate: 69 },
  { slug: 'bilecik',        name: 'Bilecik',        region: 'Marmara',           plate: 11 },
  { slug: 'bingol',         name: 'Bingöl',         region: 'Doğu Anadolu',      plate: 12 },
  { slug: 'bitlis',         name: 'Bitlis',         region: 'Doğu Anadolu',      plate: 13 },
  { slug: 'bolu',           name: 'Bolu',           region: 'Karadeniz',         plate: 14 },
  { slug: 'burdur',         name: 'Burdur',         region: 'Akdeniz',           plate: 15 },
  { slug: 'bursa',          name: 'Bursa',          region: 'Marmara',           plate: 16 },
  { slug: 'canakkale',      name: 'Çanakkale',      region: 'Marmara',           plate: 17 },
  { slug: 'cankiri',        name: 'Çankırı',        region: 'İç Anadolu',        plate: 18 },
  { slug: 'corum',          name: 'Çorum',          region: 'Karadeniz',         plate: 19 },
  { slug: 'denizli',        name: 'Denizli',        region: 'Ege',               plate: 20 },
  { slug: 'diyarbakir',     name: 'Diyarbakır',     region: 'Güneydoğu Anadolu', plate: 21 },
  { slug: 'duzce',          name: 'Düzce',          region: 'Karadeniz',         plate: 81 },
  { slug: 'edirne',         name: 'Edirne',         region: 'Marmara',           plate: 22 },
  { slug: 'elazig',         name: 'Elazığ',         region: 'Doğu Anadolu',      plate: 23 },
  { slug: 'erzincan',       name: 'Erzincan',       region: 'Doğu Anadolu',      plate: 24 },
  { slug: 'erzurum',        name: 'Erzurum',        region: 'Doğu Anadolu',      plate: 25 },
  { slug: 'eskisehir',      name: 'Eskişehir',      region: 'İç Anadolu',        plate: 26 },
  { slug: 'gaziantep',      name: 'Gaziantep',      region: 'Güneydoğu Anadolu', plate: 27 },
  { slug: 'giresun',        name: 'Giresun',        region: 'Karadeniz',         plate: 28 },
  { slug: 'gumushane',      name: 'Gümüşhane',      region: 'Karadeniz',         plate: 29 },
  { slug: 'hakkari',        name: 'Hakkari',        region: 'Doğu Anadolu',      plate: 30 },
  { slug: 'hatay',          name: 'Hatay',          region: 'Akdeniz',           plate: 31 },
  { slug: 'igdir',          name: 'Iğdır',          region: 'Doğu Anadolu',      plate: 76 },
  { slug: 'isparta',        name: 'Isparta',        region: 'Akdeniz',           plate: 32 },
  { slug: 'istanbul',       name: 'İstanbul',       region: 'Marmara',           plate: 34 },
  { slug: 'izmir',          name: 'İzmir',          region: 'Ege',               plate: 35 },
  { slug: 'kahramanmaras',  name: 'Kahramanmaraş',  region: 'Akdeniz',           plate: 46 },
  { slug: 'karabuk',        name: 'Karabük',        region: 'Karadeniz',         plate: 78 },
  { slug: 'karaman',        name: 'Karaman',        region: 'İç Anadolu',        plate: 70 },
  { slug: 'kars',           name: 'Kars',           region: 'Doğu Anadolu',      plate: 36 },
  { slug: 'kastamonu',      name: 'Kastamonu',      region: 'Karadeniz',         plate: 37 },
  { slug: 'kayseri',        name: 'Kayseri',        region: 'İç Anadolu',        plate: 38 },
  { slug: 'kilis',          name: 'Kilis',          region: 'Güneydoğu Anadolu', plate: 79 },
  { slug: 'kirikkale',      name: 'Kırıkkale',      region: 'İç Anadolu',        plate: 71 },
  { slug: 'kirklareli',     name: 'Kırklareli',     region: 'Marmara',           plate: 39 },
  { slug: 'kirsehir',       name: 'Kırşehir',       region: 'İç Anadolu',        plate: 40 },
  { slug: 'kocaeli',        name: 'Kocaeli',        region: 'Marmara',           plate: 41 },
  { slug: 'konya',          name: 'Konya',          region: 'İç Anadolu',        plate: 42 },
  { slug: 'kutahya',        name: 'Kütahya',        region: 'Ege',               plate: 43 },
  { slug: 'malatya',        name: 'Malatya',        region: 'Doğu Anadolu',      plate: 44 },
  { slug: 'manisa',         name: 'Manisa',         region: 'Ege',               plate: 45 },
  { slug: 'mardin',         name: 'Mardin',         region: 'Güneydoğu Anadolu', plate: 47 },
  { slug: 'mersin',         name: 'Mersin',         region: 'Akdeniz',           plate: 33 },
  { slug: 'mugla',          name: 'Muğla',          region: 'Ege',               plate: 48 },
  { slug: 'mus',            name: 'Muş',            region: 'Doğu Anadolu',      plate: 49 },
  { slug: 'nevsehir',       name: 'Nevşehir',       region: 'İç Anadolu',        plate: 50 },
  { slug: 'nigde',          name: 'Niğde',          region: 'İç Anadolu',        plate: 51 },
  { slug: 'ordu',           name: 'Ordu',           region: 'Karadeniz',         plate: 52 },
  { slug: 'osmaniye',       name: 'Osmaniye',       region: 'Akdeniz',           plate: 80 },
  { slug: 'rize',           name: 'Rize',           region: 'Karadeniz',         plate: 53 },
  { slug: 'sakarya',        name: 'Sakarya',        region: 'Marmara',           plate: 54 },
  { slug: 'samsun',         name: 'Samsun',         region: 'Karadeniz',         plate: 55 },
  { slug: 'sanliurfa',      name: 'Şanlıurfa',      region: 'Güneydoğu Anadolu', plate: 63 },
  { slug: 'siirt',          name: 'Siirt',          region: 'Güneydoğu Anadolu', plate: 56 },
  { slug: 'sinop',          name: 'Sinop',          region: 'Karadeniz',         plate: 57 },
  { slug: 'sirnak',         name: 'Şırnak',         region: 'Güneydoğu Anadolu', plate: 73 },
  { slug: 'sivas',          name: 'Sivas',          region: 'İç Anadolu',        plate: 58 },
  { slug: 'tekirdag',       name: 'Tekirdağ',       region: 'Marmara',           plate: 59 },
  { slug: 'tokat',          name: 'Tokat',          region: 'Karadeniz',         plate: 60 },
  { slug: 'trabzon',        name: 'Trabzon',        region: 'Karadeniz',         plate: 61 },
  { slug: 'tunceli',        name: 'Tunceli',        region: 'Doğu Anadolu',      plate: 62 },
  { slug: 'usak',           name: 'Uşak',           region: 'Ege',               plate: 64 },
  { slug: 'van',            name: 'Van',            region: 'Doğu Anadolu',      plate: 65 },
  { slug: 'yalova',         name: 'Yalova',         region: 'Marmara',           plate: 77 },
  { slug: 'yozgat',         name: 'Yozgat',         region: 'İç Anadolu',        plate: 66 },
  { slug: 'zonguldak',      name: 'Zonguldak',      region: 'Karadeniz',         plate: 67 },
]

export const SPECIAL_CITY_OPTIONS: City[] = [
  { slug: 'yurtdisi',     name: 'Yurtdışı',                region: 'Yurtdışı',     plate: null },
  { slug: 'belirtilmedi', name: 'Belirtmek istemiyorum',   region: 'Belirtilmedi', plate: null },
]

export const ALL_CITY_OPTIONS: City[] = [...CITIES, ...SPECIAL_CITY_OPTIONS]

const CITY_SLUG_INDEX = new Map(ALL_CITY_OPTIONS.map(c => [c.slug, c]))
const CITY_NAME_INDEX = new Map(ALL_CITY_OPTIONS.map(c => [c.name.toLocaleLowerCase('tr-TR'), c]))
const CITY_PLATE_INDEX = new Map(
  CITIES.map(c => [c.plate as number, c]),
)

export function findCityBySlug(slug: string): City | null {
  return CITY_SLUG_INDEX.get(slug) ?? null
}

export function findCityByName(name: string): City | null {
  return CITY_NAME_INDEX.get(name.trim().toLocaleLowerCase('tr-TR')) ?? null
}

export function findCityByPlate(plate: number): City | null {
  return CITY_PLATE_INDEX.get(plate) ?? null
}

export const CITY_NAMES: string[] = ALL_CITY_OPTIONS.map(c => c.name)
