import type { Detainee } from '../../lib/detainees'
import type { CardFormat, CardTemplate, CardTheme } from '../../lib/cards/templates'
import { ManifestoCard } from './templates/ManifestoCard'
import { DetaineeCard } from './templates/DetaineeCard'
import { SolidarityCard } from './templates/SolidarityCard'

type CardCanvasProps = {
  template: CardTemplate
  format: CardFormat
  day: number
  message: string
  authorName?: string
  detainee?: Detainee | null
  theme: CardTheme
  /** <1 for in-page preview, 1 for export. */
  scale?: number
}

export function CardCanvas(props: CardCanvasProps) {
  const { template, format, theme, day, message, authorName, detainee, scale } = props

  if (template === 'manifesto') {
    return (
      <ManifestoCard
        format={format}
        theme={theme}
        day={day}
        message={message}
        authorName={authorName}
        scale={scale}
      />
    )
  }
  if (template === 'detainee') {
    if (!detainee) {
      // Fall back to manifesto if no detainee selected — keeps preview alive.
      return (
        <ManifestoCard
          format={format}
          theme={theme}
          day={day}
          message={message}
          authorName={authorName}
          scale={scale}
        />
      )
    }
    return (
      <DetaineeCard
        format={format}
        theme={theme}
        detainee={detainee}
        message={message}
        authorName={authorName}
        scale={scale}
      />
    )
  }
  return (
    <SolidarityCard
      format={format}
      theme={theme}
      day={day}
      message={message}
      authorName={authorName}
      scale={scale}
    />
  )
}
