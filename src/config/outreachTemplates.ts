// Pre-written outreach templates citizens can send to deputies.
//
// Each template carries two versions:
//   - `short` (≤280 char) — fits an X tweet. {city} / {seats} / {day} placeholders.
//   - `long`  (≤1000 char) — formal letter for TBMM contact form / email.
//
// Tone: civic, direct, non-partisan. Avoid hashtags or insults — these are
// public statements meant to land, not viral provocations.

export type OutreachTemplateId = 'adalet' | 'irade' | 'vicdan'

export type OutreachTemplate = {
  id: OutreachTemplateId
  /** Short label for chip selector (uppercase). */
  label: string
  /** One-line description shown under the picker. */
  hint: string
  /** Tweet-length, ≤280 char. {city} / {seats} / {day} placeholders. */
  short: string
  /** Long letter, ≤1000 char. Same placeholders. */
  long: string
}

export const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'adalet',
    label: 'ADALET İÇİN',
    hint: 'Yargı bağımsızlığı ve adil yargılama vurgusu',
    short:
      '{city} milletvekilleri ({seats} kişi), {day}. günde sesleniyorum: bağımsız yargı bir tercih değil, demokrasinin omurgasıdır. Talimatla açılan davalar adalet üretmez. Hukukun yanında durmak görevinizdir. #İstanbulBekliyor',
    long:
`Sayın milletvekili,

{city} ilini Türkiye Büyük Millet Meclisi'nde {seats} milletvekili temsil ediyor; biri de sizsiniz. {day} gündür ülkenin en kalabalık şehrinin seçilmiş başkanı tutuklu. Bu süreç tek bir kişinin değil, milyonlarca seçmenin özgürlüğüne ipotektir.

Sizden talebim açık: bağımsız yargı ve adil yargılama hakkı için sesinizi yükseltmenizi rica ediyorum. Talimatla açılan davalar, gece yarısı operasyonları, yargılanmadan tutukluluk — bunlar bir hukuk devletinde olağan değildir.

Hukukun yanında durmak parti politikası değil; meclis üyeliğinizin gereğidir. Bunu hatırlamanızı umuyorum.

Saygılarımla.`,
  },
  {
    id: 'irade',
    label: 'İRADE İÇİN',
    hint: 'Sandık iradesi ve seçilmiş başkan teması',
    short:
      '{city} vekilleri ({seats} kişi): bir başkan seçilirse gece yarısı tutuklanmaz. Bu, sadece İstanbul\'a değil, oy kullanan herkese yapılan bir saygısızlıktır. {day}. günde halkın iradesini hatırlatıyorum. #İstanbulBekliyor',
    long:
`Sayın milletvekili,

Halkın iradesi sandıkta belirlenir. 2024 yerel seçiminde İstanbul'un seçilmiş başkanına milyonlarca oy çıktı. {day} gündür o oylar duvarın arkasında.

Sizinle aynı mecliste olduğum için yazıyorum: bir başkanın tutuklanması yalnızca o kişinin değil, ona oy verenin de hapsedilmesidir. Bu, parti politikası değil, demokrasi sorunudur. {city} ili sizi {seats} milletvekiliyle temsil ediyor; her birinizin görevi sandık iradesini savunmaktır.

Halkın seçtiğini meclisin geri vermemesi mümkün değil. Tarih hatırlar; vicdan da hatırlar.

Saygılarımla.`,
  },
  {
    id: 'vicdan',
    label: 'VİCDAN İÇİN',
    hint: 'Kişisel, insani çağrı; tarihe not düşme',
    short:
      'Sayın {city} vekili, bu mektup partiniz için değil, vicdanınız için. {day} gündür bir başkan tutuklu. {seats} kişiniz ses çıkarmazsa tarih bunu da yazar. Bir cümle bile fark eder. #İstanbulBekliyor',
    long:
`Sayın milletvekili,

Bu mektup partinizden değil, vicdanınızdan rica ediyor.

{city} ili meclise {seats} vekille gidiyor; biri de sizsiniz. {day} gündür ülkenin en kalabalık şehrinin başkanı özgür değil. Konuşmak yorucudur, susmak kolay; ama susulan her gün, haksızlığın evi büyür.

Bu yazışma kayda geçer. Bugünden sonra biri size "neredeydin?" diye sorduğunda, tek bir cümleniz bile size kalkan olur. İhanet etmiyoruz, dayanışma talep ediyoruz.

Bir telefon, bir basın açıklaması, bir mecliste söz alma — herhangi biri yeter. Sayı çoğaldıkça ses kısılmaz.

Saygılarımla.`,
  },
]

export function findTemplate(id: OutreachTemplateId): OutreachTemplate {
  const t = OUTREACH_TEMPLATES.find(t => t.id === id)
  if (!t) throw new Error(`Unknown template: ${id}`)
  return t
}

export const OUTREACH_TEMPLATE_IDS: OutreachTemplateId[] = OUTREACH_TEMPLATES.map(t => t.id)
