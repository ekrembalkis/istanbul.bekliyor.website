import { SITE } from '../../config/site'

type Props = {
  /** Footer font size in CSS px. */
  fontSize?: number
  /** Vertical/horizontal padding for the rule line. */
  padTop?: number
}

export function CardFooter({ fontSize = 14, padTop = 12 }: Props) {
  return (
    <div
      className="border-t border-rule editorial-mono text-ink-muted flex items-center justify-between gap-6"
      style={{ fontSize, paddingTop: padTop, letterSpacing: '0.22em' }}
    >
      <span className="text-ink">
        <b className="font-semibold">{SITE.manifestoTitle}</b>
      </span>
      <span className="text-accent hidden sm:inline">{SITE.primaryHashtag}</span>
      <span className="opacity-80">
        <b className="text-ink">{SITE.xHandle}</b>
        <span className="ml-3 opacity-70">{SITE.publicHost}</span>
      </span>
    </div>
  )
}
