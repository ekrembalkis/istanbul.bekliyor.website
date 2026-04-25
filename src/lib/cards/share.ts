// Social share helpers.

import { SITE } from '../../config/site'

const X_TEXT_LIMIT = 280

export type ShareTextInput = {
  day: number
  message: string
}

/** Compose the tweet body shown in X intent. Trims so URL stays in payload. */
export function buildShareText({ day, message }: ShareTextInput): string {
  const header = `GÜN ${day} · ${SITE.primaryHashtag}`
  const footer = `${SITE.publicHost}/kart`
  // Reserve newlines + footer + header in budget.
  const reserved = header.length + footer.length + 4 // 2 blank lines
  const available = Math.max(20, X_TEXT_LIMIT - reserved)
  const trimmed = message.length > available
    ? message.slice(0, available - 1).trimEnd() + '…'
    : message
  return `${header}\n\n${trimmed}\n\n${footer}`
}

export function buildXShareUrl(text: string): string {
  return `${SITE.xIntentBase}?text=${encodeURIComponent(text)}`
}

/** Trigger a browser download for an in-memory blob. Caller revokes the URL. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Defer revocation; some browsers fire click async.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** data: URL → blob, then trigger download. html-to-image returns dataURL. */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, b64] = dataUrl.split(',')
  const mime = meta.match(/data:(.*?);base64/)?.[1] ?? 'image/png'
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], filename, { type: mime })
}
