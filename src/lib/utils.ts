import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ARREST_DATE = new Date('2025-03-19T00:00:00+03:00');
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Days since an arrest date, 1-indexed (the arrest day itself is day 1).
 * Single source of truth — used by Hero counter AND DetaineeRow so a roster
 * row never shows N-1 while the masthead shows N for the same person.
 *
 * @param arrestDate ISO string OR Date — defaults to İmamoğlu's arrest.
 * @param now        Optional override for tests.
 */
export function daysSinceArrest(arrestDate: string | Date = ARREST_DATE, now: Date = new Date()): number {
  const start = typeof arrestDate === 'string'
    ? new Date(/[Tt]/.test(arrestDate) ? arrestDate : `${arrestDate}T00:00:00+03:00`)
    : arrestDate;
  const diff = now.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / MS_PER_DAY) + 1);
}

/** Backwards-compatible alias for the campaign-default arrest date. */
export function getDayCount(date?: Date): number {
  return daysSinceArrest(ARREST_DATE, date ?? new Date());
}

export function getDateForDay(dayNumber: number): Date {
  const date = new Date(ARREST_DATE);
  date.setDate(date.getDate() + dayNumber - 1);
  return date;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getTimeBreakdown(days: number) {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;
  return { years, months, days: remainingDays, total: days };
}

export interface CampaignCheck {
  rule: string;
  passed: boolean;
  tip: string;
}

export function checkCampaignRules(tweetText: string): { score: number; checks: CampaignCheck[] } {
  const checks: CampaignCheck[] = [];
  const startsWithGun = /^GÜN\s+\d+/i.test(tweetText.trim());
  checks.push({ rule: 'GÜN sayacı', passed: startsWithGun, tip: startsWithGun ? 'Marka tutarlılığı korunuyor.' : 'Tweet "GÜN [sayı]" ile başlamalı.' });
  const lineBreaks = (tweetText.match(/\n/g) || []).length;
  checks.push({ rule: 'Görsel yapı', passed: lineBreaks >= 2, tip: lineBreaks < 2 ? 'Satır araları ekle.' : 'Görsel yapı iyi.' });
  const hasHashtag = /#İstanbulBekliyor/i.test(tweetText);
  checks.push({ rule: '#İstanbulBekliyor', passed: hasHashtag, tip: hasHashtag ? 'Hashtag mevcut.' : '#İstanbulBekliyor ekle.' });
  const passed = checks.filter(c => c.passed).length;
  return { score: Math.round((passed / checks.length) * 100), checks };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/10 border border-emerald-500/20';
  if (score >= 60) return 'bg-amber-500/10 border border-amber-500/20';
  return 'bg-red-500/10 border border-red-500/20';
}
