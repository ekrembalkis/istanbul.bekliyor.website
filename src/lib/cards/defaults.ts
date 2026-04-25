// Default message pool for card generator. Day-modulo rotation gives the
// same default for the whole day, so casual visitors and shared cards align.

export const DEFAULT_MESSAGES: readonly string[] = [
  'Ben de bekliyorum.',
  'Hak · Hukuk · Adalet.',
  'Sessizlik suç ortağı olur.',
  'Adalet herkes için adalet olduğunda adalettir.',
  'Bir hak, herkes için savunulduğunda haktır.',
  'Karanlık ne kadar derin olursa olsun, tek bir ışık yeter.',
  'Bayraklar rüzgâra rağmen dalgalanır.',
  'Kapılar kapanabilir, ışık her aralıktan sızar.',
] as const

export function getDailyDefaultMessage(day: number): string {
  if (!Number.isFinite(day) || day < 1) return DEFAULT_MESSAGES[0]
  const idx = Math.floor(day - 1) % DEFAULT_MESSAGES.length
  return DEFAULT_MESSAGES[idx]
}
