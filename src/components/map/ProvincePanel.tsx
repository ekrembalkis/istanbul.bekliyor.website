import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { ProvinceAggregation } from '../../lib/provinces'
import type { Detainee } from '../../lib/detainees'

type Props = {
  /** null → panel hidden (no overlay rendered). */
  selectedPlate: number | null
  aggregation: ProvinceAggregation
  onClose: () => void
}

export function ProvincePanel({ selectedPlate, aggregation, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const isOpen = selectedPlate !== null
  const stats = selectedPlate !== null ? aggregation.byPlate.get(selectedPlate) : null

  // ESC + body scroll lock + focus management. Only active while open.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    // Move focus to close button so keyboard users land somewhere sensible.
    closeRef.current?.focus()

    // Lock body scroll on mobile bottom-sheet so the page doesn't scroll
    // behind the overlay. Desktop sticky panel doesn't need this but the
    // lock is harmless there.
    const prev = document.body.style.overflow
    if (window.matchMedia('(max-width: 768px)').matches) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isOpen, onClose])

  if (!isOpen || !stats) return null

  return (
    <>
      {/* Backdrop — mobile only (md:hidden). Desktop panel sits beside the map
          so a backdrop would obscure it. */}
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="province-panel-title"
        className={
          'fixed z-50 bg-bg border-rule shadow-xl ' +
          // Mobile: bottom sheet, slides up from bottom, max 80vh.
          'left-0 right-0 bottom-0 max-h-[80vh] border-t-2 ' +
          // Desktop ≥768px: right-side panel, full height, fixed width.
          'md:top-0 md:bottom-0 md:right-0 md:left-auto md:max-h-none md:w-[440px] md:border-l-2 md:border-t-0 ' +
          'overflow-y-auto'
        }
      >
        <header className="sticky top-0 bg-bg z-10 border-b border-rule px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <div
              className="editorial-mono text-ink-muted"
              style={{ letterSpacing: '0.32em', fontSize: 11 }}
            >
              N° {String(stats.city.plate).padStart(2, '0')} · İL
            </div>
            <h2
              id="province-panel-title"
              className="editorial-h1 text-ink mt-1"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}
            >
              {stats.city.name}<span className="text-accent">.</span>
            </h2>
            <div
              className="editorial-mono text-accent mt-2"
              style={{ letterSpacing: '0.22em', fontSize: 13 }}
            >
              N° {stats.count} TUTSAK
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Paneli kapat"
            className="editorial-mono text-ink-muted hover:text-ink border border-rule hover:border-ink px-3 py-1.5 transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </header>

        <div className="px-6 py-6 space-y-6">
          {stats.detainees.length === 0 ? (
            <p className="editorial-mono text-ink-muted text-center opacity-70 py-12">
              — Bu ile bağlı kayıt henüz yok —
            </p>
          ) : (
            stats.detainees.map(d => <DetaineeCard key={d.id} detainee={d} />)
          )}
        </div>
      </aside>
    </>
  )
}

function DetaineeCard({ detainee: d }: { detainee: Detainee }) {
  return (
    <Link
      to={`/tutuklu/${d.slug}`}
      className="group block border-t border-rule pt-5 first:border-t-0 first:pt-0"
    >
      <div className="flex gap-4">
        {d.photo_url ? (
          <img
            src={d.photo_url}
            alt={d.name}
            className="w-16 h-16 object-cover object-top flex-shrink-0"
            style={{ filter: 'grayscale(0.15) contrast(1.05)' }}
          />
        ) : (
          <div className="w-16 h-16 bg-rule flex-shrink-0" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <div
            className="font-serif text-ink group-hover:text-accent transition-colors"
            style={{ fontSize: 22, lineHeight: 1.2 }}
          >
            {d.name}
          </div>
          {d.title && (
            <div
              className="font-serif italic text-ink-muted mt-1"
              style={{ fontSize: 14 }}
            >
              {d.title}
            </div>
          )}
          <div className="flex items-baseline gap-3 mt-2">
            <span
              className="editorial-num text-accent leading-none tabular-nums"
              style={{ fontSize: 28 }}
            >
              {d.day_count}
            </span>
            <span className="editorial-mono text-ink-muted" style={{ fontSize: 12 }}>
              GÜN
            </span>
          </div>
        </div>
      </div>
      <div
        className="editorial-mono text-ink-muted group-hover:text-accent transition-colors mt-3 text-right"
        style={{ letterSpacing: '0.22em', fontSize: 11 }}
      >
        → PROFİLİ AÇ
      </div>
    </Link>
  )
}
