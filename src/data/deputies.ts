// Deputy (milletvekili) seat distribution per Turkish province.
//
// Source: SecimAtlas src/engine/mvDistribution.ts (KNOWN_MV_DISTRIBUTIONS),
// derived from YSK Karar No 2023/224 (3 March 2023, based on Dec 2022
// population). Total 600 seats across 81 provinces, allocated by Hare quota
// + largest remainder (Kanun 2839).
//
// Verbatim copy — no recalculation here. Recompute upstream if YSK publishes
// a new election decree.

import { findCityBySlug, findCityByPlate } from './cities'

export type DeputyDistribution = {
  year: number
  totalSeats: number
  /** secim_ID used by YSK / SecimAtlas. */
  secimId: number
  /** plaka (1..81) → seat count for that province */
  seats: Record<number, number>
}

export const DISTRIBUTION_2023: DeputyDistribution = {
  year: 2023,
  totalSeats: 600,
  secimId: 20230,
  seats: {
    1:  15, // Adana
    2:  5,  // Adıyaman
    3:  6,  // Afyonkarahisar
    4:  4,  // Ağrı
    5:  3,  // Amasya
    6:  36, // Ankara (3 bölge)
    7:  17, // Antalya
    8:  2,  // Artvin
    9:  8,  // Aydın
    10: 9,  // Balıkesir
    11: 2,  // Bilecik
    12: 3,  // Bingöl
    13: 3,  // Bitlis
    14: 3,  // Bolu
    15: 3,  // Burdur
    16: 20, // Bursa (2 bölge)
    17: 4,  // Çanakkale
    18: 2,  // Çankırı
    19: 4,  // Çorum
    20: 7,  // Denizli
    21: 12, // Diyarbakır
    22: 4,  // Edirne
    23: 5,  // Elazığ
    24: 2,  // Erzincan
    25: 6,  // Erzurum
    26: 6,  // Eskişehir
    27: 14, // Gaziantep
    28: 4,  // Giresun
    29: 2,  // Gümüşhane
    30: 3,  // Hakkari
    31: 11, // Hatay
    32: 4,  // Isparta
    33: 13, // Mersin
    34: 98, // İstanbul (3 bölge)
    35: 28, // İzmir (2 bölge)
    36: 3,  // Kars
    37: 3,  // Kastamonu
    38: 10, // Kayseri
    39: 3,  // Kırklareli
    40: 2,  // Kırşehir
    41: 14, // Kocaeli
    42: 15, // Konya
    43: 5,  // Kütahya
    44: 6,  // Malatya
    45: 10, // Manisa
    46: 8,  // Kahramanmaraş
    47: 6,  // Mardin
    48: 7,  // Muğla
    49: 3,  // Muş
    50: 3,  // Nevşehir
    51: 3,  // Niğde
    52: 6,  // Ordu
    53: 3,  // Rize
    54: 8,  // Sakarya
    55: 9,  // Samsun
    56: 3,  // Siirt
    57: 2,  // Sinop
    58: 5,  // Sivas
    59: 8,  // Tekirdağ
    60: 5,  // Tokat
    61: 6,  // Trabzon
    62: 1,  // Tunceli
    63: 14, // Şanlıurfa
    64: 3,  // Uşak
    65: 8,  // Van
    66: 4,  // Yozgat
    67: 5,  // Zonguldak
    68: 4,  // Aksaray
    69: 1,  // Bayburt
    70: 3,  // Karaman
    71: 3,  // Kırıkkale
    72: 5,  // Batman
    73: 4,  // Şırnak
    74: 2,  // Bartın
    75: 2,  // Ardahan
    76: 2,  // Iğdır
    77: 3,  // Yalova
    78: 3,  // Karabük
    79: 2,  // Kilis
    80: 4,  // Osmaniye
    81: 3,  // Düzce
  },
}

/** Look up seat count by plaka kodu. */
export function seatsForPlate(plate: number): number | null {
  return DISTRIBUTION_2023.seats[plate] ?? null
}

/** Look up seat count by city slug ('istanbul'). Special options return null. */
export function seatsForCity(slug: string): number | null {
  const city = findCityBySlug(slug)
  if (!city || city.plate === null) return null
  return seatsForPlate(city.plate)
}

/** Look up seat count by display name ('İstanbul'). */
export function seatsForCityName(name: string): number | null {
  const trimmed = name.trim()
  for (let plate = 1; plate <= 81; plate++) {
    const c = findCityByPlate(plate)
    if (c && c.name === trimmed) return seatsForPlate(plate)
  }
  return null
}
