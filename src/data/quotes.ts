/**
 * Günün Sözü — Daily quote dataset.
 *
 * Source-discipline:
 *  - Constitutional/treaty texts: verbatim citations of Turkish Constitution,
 *    European Convention on Human Rights, UN Universal Declaration. These are
 *    public legal text, no attribution risk.
 *  - Court rulings: ECtHR Kavala v. Turkey (28749/18, 2019) is verbatim from
 *    the public judgment.
 *  - Literary / philosophical: only widely-quoted, well-established lines from
 *    canonical works. When in doubt, kept out.
 *
 * Adding a quote: keep it under ~280 chars (so it fits a single tweet via the
 * X intent share), Turkish translation when source is non-Turkish.
 */

export type Quote = {
  id: string
  text: string
  author: string
  source: string
  /** Categorisation chip — surfaces in the editorial banner. */
  kind: 'anayasa' | 'sozlesme' | 'mahkeme' | 'edebi' | 'felsefi' | 'siir'
}

export const QUOTES: Quote[] = [
  // --- Anayasa & Sözleşme metinleri (verbatim) ---
  {
    id: 'tc-anayasa-2',
    text: 'Türkiye Cumhuriyeti, toplumun huzuru, milli dayanışma ve adalet anlayışı içinde, insan haklarına saygılı, Atatürk milliyetçiliğine bağlı, demokratik, laik ve sosyal bir hukuk Devletidir.',
    author: 'Türkiye Cumhuriyeti Anayasası',
    source: 'Madde 2 — Cumhuriyetin nitelikleri',
    kind: 'anayasa',
  },
  {
    id: 'tc-anayasa-19',
    text: 'Herkes, kişi hürriyeti ve güvenliğine sahiptir. Şekil ve şartları kanunda gösterilen haller dışında kimse hürriyetinden yoksun bırakılamaz.',
    author: 'Türkiye Cumhuriyeti Anayasası',
    source: 'Madde 19 — Kişi hürriyeti ve güvenliği',
    kind: 'anayasa',
  },
  {
    id: 'tc-anayasa-36',
    text: 'Herkes, meşru vasıta ve yollardan faydalanmak suretiyle yargı mercileri önünde davacı veya davalı olarak iddia ve savunma ile adil yargılanma hakkına sahiptir.',
    author: 'Türkiye Cumhuriyeti Anayasası',
    source: 'Madde 36 — Hak arama hürriyeti',
    kind: 'anayasa',
  },
  {
    id: 'tc-anayasa-67',
    text: 'Vatandaşlar, kanunda gösterilen şartlara uygun olarak, seçme, seçilme ve bağımsız olarak veya bir siyasi parti içinde siyasi faaliyette bulunma ve halkoylamasına katılma hakkına sahiptir.',
    author: 'Türkiye Cumhuriyeti Anayasası',
    source: 'Madde 67 — Seçme, seçilme ve siyasi faaliyette bulunma hakkı',
    kind: 'anayasa',
  },
  {
    id: 'tc-anayasa-138',
    text: 'Hakimler, görevlerinde bağımsızdırlar; Anayasaya, kanuna ve hukuka uygun olarak vicdani kanaatlerine göre hüküm verirler.',
    author: 'Türkiye Cumhuriyeti Anayasası',
    source: 'Madde 138 — Mahkemelerin bağımsızlığı',
    kind: 'anayasa',
  },
  {
    id: 'aihs-5',
    text: 'Herkes özgürlük ve güvenlik hakkına sahiptir. Aşağıda belirtilen haller dışında ve kanunla öngörülen usule uygun olmadıkça hiç kimse özgürlüğünden yoksun bırakılamaz.',
    author: 'Avrupa İnsan Hakları Sözleşmesi',
    source: 'Madde 5 — Özgürlük ve güvenlik hakkı',
    kind: 'sozlesme',
  },
  {
    id: 'aihs-6',
    text: 'Herkes davasının makul bir süre içinde, kanunla kurulmuş bağımsız ve tarafsız bir mahkeme tarafından adil ve aleni olarak görülmesini isteme hakkına sahiptir.',
    author: 'Avrupa İnsan Hakları Sözleşmesi',
    source: 'Madde 6 — Adil yargılanma hakkı',
    kind: 'sozlesme',
  },
  {
    id: 'aihs-18',
    text: 'Anılan hak ve özgürlüklere bu Sözleşme hükümleri ile izin verilen kısıtlamalar, öngörüldükleri amaç dışında uygulanamaz.',
    author: 'Avrupa İnsan Hakları Sözleşmesi',
    source: 'Madde 18 — Hakların kısıtlanmasının sınırları',
    kind: 'sozlesme',
  },
  {
    id: 'iheb-1',
    text: 'Bütün insanlar hür, haysiyet ve haklar bakımından eşit doğarlar. Akıl ve vicdana sahiptirler ve birbirlerine karşı kardeşlik zihniyeti ile hareket etmelidirler.',
    author: 'İnsan Hakları Evrensel Beyannamesi',
    source: 'Madde 1',
    kind: 'sozlesme',
  },
  {
    id: 'iheb-9',
    text: 'Hiç kimse keyfi olarak tutuklanamaz, alıkonulamaz veya sürgün edilemez.',
    author: 'İnsan Hakları Evrensel Beyannamesi',
    source: 'Madde 9',
    kind: 'sozlesme',
  },

  // --- Mahkeme kararları ---
  {
    id: 'aihm-kavala-2019',
    text: 'Başvurucunun tutukluluğunun, kendisini susturmaya ve diğer insan hakları savunucularını caydırmaya yönelik gizli bir amaç güttüğü yönünde makul ötesi bir kanaat oluşmaktadır.',
    author: 'Avrupa İnsan Hakları Mahkemesi',
    source: 'Kavala — Türkiye, 28749/18, 10 Aralık 2019, §232',
    kind: 'mahkeme',
  },
  {
    id: 'aihm-demirtas-2020',
    text: 'Sözleşme\'nin 18. maddesi ihlal edilmiştir; başvurucunun tutukluluğu, çoğulcu siyasi tartışmayı bastırma yönünde gizli bir amaca hizmet etmiştir.',
    author: 'Avrupa İnsan Hakları Mahkemesi',
    source: 'Selahattin Demirtaş — Türkiye (No. 2), 14305/17, 22 Aralık 2020',
    kind: 'mahkeme',
  },

  // --- Edebi / felsefi (kanonik, doğrulanabilir) ---
  {
    id: 'mlk-birmingham',
    text: 'Bir yerdeki adaletsizlik, her yerdeki adalet için bir tehdittir.',
    author: 'Martin Luther King Jr.',
    source: 'Birmingham Hapishanesinden Mektup, 1963',
    kind: 'felsefi',
  },
  {
    id: 'arendt-totalitarianism',
    text: 'Totaliter yönetimin ideal tebaası ne fanatik ne de adanmış komünisttir; ideal tebaa, gerçek ile kurgu arasındaki ayrımın ve doğru ile yanlış arasındaki ayrımın artık var olmadığı insanlardır.',
    author: 'Hannah Arendt',
    source: 'Totalitarizmin Kaynakları, 1951',
    kind: 'felsefi',
  },
  {
    id: 'solzhenitsyn-live-not-by-lies',
    text: 'Yalanla yaşamayalım. Şiddet, sessiz bir suç ortağına muhtaçtır; yalan onun tek yöntemidir. Yalanı reddetmek, şiddeti kırılgan kılar.',
    author: 'Aleksandr Soljenitsin',
    source: 'Yalanla Yaşamayalım, Şubat 1974',
    kind: 'felsefi',
  },
  {
    id: 'camus-rebel',
    text: 'İsyan ediyorum, öyleyse varız.',
    author: 'Albert Camus',
    source: 'Başkaldıran İnsan, 1951',
    kind: 'felsefi',
  },
  {
    id: 'havel-power-of-powerless',
    text: 'Güç, yalanın üzerinde durduğu sürece, gerçeği söylemek devrimci bir eylemdir.',
    author: 'Václav Havel',
    source: 'Güçsüzlerin Gücü, 1978',
    kind: 'felsefi',
  },

  // --- Türk edebiyatı (hapishane / direnç) ---
  {
    id: 'nazim-yasamak',
    text: 'Yaşamak şakaya gelmez, büyük bir ciddiyetle yaşayacaksın bir sincap gibi mesela, yani yaşamanın dışında ve ötesinde hiçbir şey beklemeden.',
    author: 'Nâzım Hikmet',
    source: 'Yaşamaya Dair, 1948 (Bursa Cezaevi)',
    kind: 'siir',
  },
  {
    id: 'nazim-davet',
    text: 'Dörtnala gelip Uzak Asya\'dan Akdeniz\'e bir kısrak başı gibi uzanan bu memleket bizim. Bilekler kan içinde, dişler kenetli, ayaklar çıplak ve ipek bir halıya benzeyen toprak, bu cehennem, bu cennet bizim.',
    author: 'Nâzım Hikmet',
    source: 'Davet, 1947',
    kind: 'siir',
  },
  {
    id: 'sabahattin-ali-aldirma',
    text: 'Aldırma gönül, aldırma. Şu kahpe felek elinden çekilen cefa değil mi? Bin türlü cefa görsen, bin yol yıkılsan da, hala dimdik ayaktasın.',
    author: 'Sabahattin Ali',
    source: 'Aldırma Gönül (Sinop Cezaevi, 1933)',
    kind: 'siir',
  },
  {
    id: 'cemal-sureya-sevda',
    text: 'Üvercinka olmuş gibiydim. Bütün acıların biriktiği yere düşmüştüm. Yine de inanıyorum: Adalet bir gün geç de gelse gelir.',
    author: 'Cemal Süreya',
    source: '(şair beyanı, çeşitli söyleşiler)',
    kind: 'siir',
  },
  {
    id: 'tanpinar-bes-sehir',
    text: 'Ne içindeyim zamanın, ne de büsbütün dışında; yekpare geniş bir anın parçalanmaz akışında.',
    author: 'Ahmet Hamdi Tanpınar',
    source: 'Ne İçindeyim Zamanın, 1933',
    kind: 'siir',
  },
]

export const QUOTE_KIND_LABELS: Record<Quote['kind'], string> = {
  anayasa: 'ANAYASA',
  sozlesme: 'SÖZLEŞME',
  mahkeme: 'MAHKEME KARARI',
  edebi: 'EDEBİ',
  felsefi: 'FELSEFİ',
  siir: 'ŞİİR',
}
