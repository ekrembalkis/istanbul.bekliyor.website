// Türkiye 81 il + iki özel seçenek (Yurtdışı, Belirtmek istemiyorum).
// Türkçe alfabetik sıraya göre.
//
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
}

export const CITIES: City[] = [
  { slug: 'adana',          name: 'Adana',          region: 'Akdeniz' },
  { slug: 'adiyaman',       name: 'Adıyaman',       region: 'Güneydoğu Anadolu' },
  { slug: 'afyonkarahisar', name: 'Afyonkarahisar', region: 'Ege' },
  { slug: 'agri',           name: 'Ağrı',           region: 'Doğu Anadolu' },
  { slug: 'aksaray',        name: 'Aksaray',        region: 'İç Anadolu' },
  { slug: 'amasya',         name: 'Amasya',         region: 'Karadeniz' },
  { slug: 'ankara',         name: 'Ankara',         region: 'İç Anadolu' },
  { slug: 'antalya',        name: 'Antalya',        region: 'Akdeniz' },
  { slug: 'ardahan',        name: 'Ardahan',        region: 'Doğu Anadolu' },
  { slug: 'artvin',         name: 'Artvin',         region: 'Karadeniz' },
  { slug: 'aydin',          name: 'Aydın',          region: 'Ege' },
  { slug: 'balikesir',      name: 'Balıkesir',      region: 'Marmara' },
  { slug: 'bartin',         name: 'Bartın',         region: 'Karadeniz' },
  { slug: 'batman',         name: 'Batman',         region: 'Güneydoğu Anadolu' },
  { slug: 'bayburt',        name: 'Bayburt',        region: 'Karadeniz' },
  { slug: 'bilecik',        name: 'Bilecik',        region: 'Marmara' },
  { slug: 'bingol',         name: 'Bingöl',         region: 'Doğu Anadolu' },
  { slug: 'bitlis',         name: 'Bitlis',         region: 'Doğu Anadolu' },
  { slug: 'bolu',           name: 'Bolu',           region: 'Karadeniz' },
  { slug: 'burdur',         name: 'Burdur',         region: 'Akdeniz' },
  { slug: 'bursa',          name: 'Bursa',          region: 'Marmara' },
  { slug: 'canakkale',      name: 'Çanakkale',      region: 'Marmara' },
  { slug: 'cankiri',        name: 'Çankırı',        region: 'İç Anadolu' },
  { slug: 'corum',          name: 'Çorum',          region: 'Karadeniz' },
  { slug: 'denizli',        name: 'Denizli',        region: 'Ege' },
  { slug: 'diyarbakir',     name: 'Diyarbakır',     region: 'Güneydoğu Anadolu' },
  { slug: 'duzce',          name: 'Düzce',          region: 'Karadeniz' },
  { slug: 'edirne',         name: 'Edirne',         region: 'Marmara' },
  { slug: 'elazig',         name: 'Elazığ',         region: 'Doğu Anadolu' },
  { slug: 'erzincan',       name: 'Erzincan',       region: 'Doğu Anadolu' },
  { slug: 'erzurum',        name: 'Erzurum',        region: 'Doğu Anadolu' },
  { slug: 'eskisehir',      name: 'Eskişehir',      region: 'İç Anadolu' },
  { slug: 'gaziantep',      name: 'Gaziantep',      region: 'Güneydoğu Anadolu' },
  { slug: 'giresun',        name: 'Giresun',        region: 'Karadeniz' },
  { slug: 'gumushane',      name: 'Gümüşhane',      region: 'Karadeniz' },
  { slug: 'hakkari',        name: 'Hakkari',        region: 'Doğu Anadolu' },
  { slug: 'hatay',          name: 'Hatay',          region: 'Akdeniz' },
  { slug: 'igdir',          name: 'Iğdır',          region: 'Doğu Anadolu' },
  { slug: 'isparta',        name: 'Isparta',        region: 'Akdeniz' },
  { slug: 'istanbul',       name: 'İstanbul',       region: 'Marmara' },
  { slug: 'izmir',          name: 'İzmir',          region: 'Ege' },
  { slug: 'kahramanmaras',  name: 'Kahramanmaraş',  region: 'Akdeniz' },
  { slug: 'karabuk',        name: 'Karabük',        region: 'Karadeniz' },
  { slug: 'karaman',        name: 'Karaman',        region: 'İç Anadolu' },
  { slug: 'kars',           name: 'Kars',           region: 'Doğu Anadolu' },
  { slug: 'kastamonu',      name: 'Kastamonu',      region: 'Karadeniz' },
  { slug: 'kayseri',        name: 'Kayseri',        region: 'İç Anadolu' },
  { slug: 'kilis',          name: 'Kilis',          region: 'Güneydoğu Anadolu' },
  { slug: 'kirikkale',      name: 'Kırıkkale',      region: 'İç Anadolu' },
  { slug: 'kirklareli',     name: 'Kırklareli',     region: 'Marmara' },
  { slug: 'kirsehir',       name: 'Kırşehir',       region: 'İç Anadolu' },
  { slug: 'kocaeli',        name: 'Kocaeli',        region: 'Marmara' },
  { slug: 'konya',          name: 'Konya',          region: 'İç Anadolu' },
  { slug: 'kutahya',        name: 'Kütahya',        region: 'Ege' },
  { slug: 'malatya',        name: 'Malatya',        region: 'Doğu Anadolu' },
  { slug: 'manisa',         name: 'Manisa',         region: 'Ege' },
  { slug: 'mardin',         name: 'Mardin',         region: 'Güneydoğu Anadolu' },
  { slug: 'mersin',         name: 'Mersin',         region: 'Akdeniz' },
  { slug: 'mugla',          name: 'Muğla',          region: 'Ege' },
  { slug: 'mus',            name: 'Muş',            region: 'Doğu Anadolu' },
  { slug: 'nevsehir',       name: 'Nevşehir',       region: 'İç Anadolu' },
  { slug: 'nigde',          name: 'Niğde',          region: 'İç Anadolu' },
  { slug: 'ordu',           name: 'Ordu',           region: 'Karadeniz' },
  { slug: 'osmaniye',       name: 'Osmaniye',       region: 'Akdeniz' },
  { slug: 'rize',           name: 'Rize',           region: 'Karadeniz' },
  { slug: 'sakarya',        name: 'Sakarya',        region: 'Marmara' },
  { slug: 'samsun',         name: 'Samsun',         region: 'Karadeniz' },
  { slug: 'sanliurfa',      name: 'Şanlıurfa',      region: 'Güneydoğu Anadolu' },
  { slug: 'siirt',          name: 'Siirt',          region: 'Güneydoğu Anadolu' },
  { slug: 'sinop',          name: 'Sinop',          region: 'Karadeniz' },
  { slug: 'sirnak',         name: 'Şırnak',         region: 'Güneydoğu Anadolu' },
  { slug: 'sivas',          name: 'Sivas',          region: 'İç Anadolu' },
  { slug: 'tekirdag',       name: 'Tekirdağ',       region: 'Marmara' },
  { slug: 'tokat',          name: 'Tokat',          region: 'Karadeniz' },
  { slug: 'trabzon',        name: 'Trabzon',        region: 'Karadeniz' },
  { slug: 'tunceli',        name: 'Tunceli',        region: 'Doğu Anadolu' },
  { slug: 'usak',           name: 'Uşak',           region: 'Ege' },
  { slug: 'van',            name: 'Van',            region: 'Doğu Anadolu' },
  { slug: 'yalova',         name: 'Yalova',         region: 'Marmara' },
  { slug: 'yozgat',         name: 'Yozgat',         region: 'İç Anadolu' },
  { slug: 'zonguldak',      name: 'Zonguldak',      region: 'Karadeniz' },
]

export const SPECIAL_CITY_OPTIONS: City[] = [
  { slug: 'yurtdisi', name: 'Yurtdışı', region: 'Yurtdışı' },
  { slug: 'belirtilmedi', name: 'Belirtmek istemiyorum', region: 'Belirtilmedi' },
]

export const ALL_CITY_OPTIONS: City[] = [...CITIES, ...SPECIAL_CITY_OPTIONS]

const CITY_SLUG_INDEX = new Map(ALL_CITY_OPTIONS.map(c => [c.slug, c]))
const CITY_NAME_INDEX = new Map(ALL_CITY_OPTIONS.map(c => [c.name.toLocaleLowerCase('tr-TR'), c]))

export function findCityBySlug(slug: string): City | null {
  return CITY_SLUG_INDEX.get(slug) ?? null
}

export function findCityByName(name: string): City | null {
  return CITY_NAME_INDEX.get(name.trim().toLocaleLowerCase('tr-TR')) ?? null
}

export const CITY_NAMES: string[] = ALL_CITY_OPTIONS.map(c => c.name)
