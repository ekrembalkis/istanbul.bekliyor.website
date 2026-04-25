type Props = {
  size?: number
}

/**
 * Brand mark — the "kum saati" (hourglass) logo from public/logo.png.
 * Pure <img> so html-to-image can serialize it without canvas tainting.
 */
export function KumSaati({ size = 48 }: Props) {
  return (
    <img
      src="/logo.png"
      alt="İstanbul Bekliyor logo"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        display: 'block',
        objectFit: 'contain',
        filter: 'drop-shadow(0 0 16px color-mix(in oklab, var(--accent) 25%, transparent))',
      }}
    />
  )
}
