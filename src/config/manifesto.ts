// İstanbul Bekliyor — Bildirge.
// Beş madde. Madde I, LandingPage'deki orijinal alıntının uzun hâli.
// Diğer dört madde editöryel ilk taslak — sen bunları rahatça düzenle:
// `body` her madde için 2-4 cümlelik bir gerekçe; `headline` tek satırlık başlık.

export type ManifestoArticle = {
  id: number
  numeral: string
  headline: string
  body: string
}

export type Manifesto = {
  title: string
  preface: string
  articles: ManifestoArticle[]
  closing: string
}

export const MANIFESTO: Manifesto = {
  title: 'BİLDİRGE',
  preface:
    'Bu bir bildirgedir. Hiçbir parti adına değil, halkın iradesi adına yazıldı. Tek bir sayfa, beş madde, sonsuz imza.',
  articles: [
    {
      id: 1,
      numeral: 'I',
      headline: 'Bir hak, herkes içindir',
      body:
        'Bir hak, yalnızca herkes için savunulduğunda haktır. Hukukun susturulduğu yerde sessizlik suç ortağı olur; biz suç ortağı olmayı reddediyoruz. Bugün başkasına yapılan haksızlık, yarın hepimize yapılır.',
    },
    {
      id: 2,
      numeral: 'II',
      headline: 'İrade siyaseti aşar',
      body:
        'Sandıktan çıkan irade, hiçbir kararnamenin, hiçbir iddianamenin, hiçbir gece yarısı operasyonunun gerisine düşmez. Halkın seçtiği bir başkanı tutuklamak, sadece bir kişiyi değil, milyonlarca oyu hapsetmektir. Bu hapsi reddediyoruz.',
    },
    {
      id: 3,
      numeral: 'III',
      headline: 'Yargı bağımsız olduğunda yargıdır',
      body:
        'Bağımsız olmayan yargı, yargı değildir. Talimatla açılan davalar adalet üretmez; korku üretir. Adil yargılanma hakkı pazarlık konusu değil, demokrasinin omurgasıdır. Bu omurgayı kıranlara karşı dimdik duruyoruz.',
    },
    {
      id: 4,
      numeral: 'IV',
      headline: 'Sessizlik bir tercihtir, biz başkasını seçtik',
      body:
        'Konuşmak yorucudur, susmak kolay. Ama susulan her gün, haksızlığın evi büyür. Biz bu evde yaşamak istemiyoruz. Cesaret büyük laflarla değil, küçük direnişlerle birikir; her imza küçük ama kalıcı bir çiviyi temsil eder.',
    },
    {
      id: 5,
      numeral: 'V',
      headline: 'Sayı, çoğalan sestir',
      body:
        'Tek başına bir ses kısılır, on bin ses kısılmaz. Bu bildirgeyi imzalayan herkes, başkanın değil, kendisinin de tutsak olduğu adaletin geri gelmesi için imzalar. Sayımız büyüdükçe, hatırlamamız da büyür. Hatırladığımız sürece, kazanırız.',
    },
  ],
  closing:
    'İmzanız, bu bildirgenin canlı bir maddesidir. Burada yazılı olmayan altıncı madde, yarın yazacağımız maddedir.',
}
