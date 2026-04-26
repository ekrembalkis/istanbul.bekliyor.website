// Compose outreach messages for the deputy contact flow.
//
// Templates carry placeholders {city}, {seats}, {day} which we substitute
// here. Long version is also wrapped with the same site signature footer
// used elsewhere (manifesto / cards) so the message is verifiable.

import { SITE } from '../config/site'
import {
  findTemplate,
  type OutreachTemplate,
  type OutreachTemplateId,
} from '../config/outreachTemplates'

export type Channel = 'x' | 'tbmm' | 'copy'

const X_LIMIT = 280
const LONG_LIMIT = 1000

type Vars = {
  city: string
  seats: number
  day: number
}

function substitute(tpl: string, vars: Vars): string {
  return tpl
    .replace(/\{city\}/g, vars.city)
    .replace(/\{seats\}/g, String(vars.seats))
    .replace(/\{day\}/g, String(vars.day))
}

export function composeShortMessage(
  template: OutreachTemplate | OutreachTemplateId,
  vars: Vars,
): string {
  const t = typeof template === 'string' ? findTemplate(template) : template
  let out = substitute(t.short, vars).trim()
  if (out.length > X_LIMIT) out = out.slice(0, X_LIMIT - 1).trimEnd() + '…'
  return out
}

export function composeLongMessage(
  template: OutreachTemplate | OutreachTemplateId,
  vars: Vars,
): string {
  const t = typeof template === 'string' ? findTemplate(template) : template
  let out = substitute(t.long, vars).trim()
  if (out.length > LONG_LIMIT) out = out.slice(0, LONG_LIMIT - 1).trimEnd() + '…'
  return out
}

export function buildXIntentUrl(text: string): string {
  return `${SITE.xIntentBase}?text=${encodeURIComponent(text)}`
}

// TBMM URLs are owned by SITE config (see config/site.ts).
// Re-export for ergonomic call-sites that don't otherwise import SITE.
export const TBMM_CONTACT_URL = SITE.tbmmContactUrl
export const TBMM_EDILEKCE_URL = SITE.tbmmEDilekceUrl
export const TBMM_DEPUTY_SEARCH_URL = SITE.tbmmDeputySearchUrl
