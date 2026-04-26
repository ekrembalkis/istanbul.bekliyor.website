import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProvinceStats } from '../../lib/provinces'
import { barRatio } from '../../lib/provinces'

type Props = {
  ranked: ProvinceStats[]
  /** Hide rows with zero detainees. */
  hideEmpty?: boolean
  /**
   * If provided, clicking a province delegates to the parent (used by MapPage
   * to open the shared ProvincePanel). When omitted, falls back to the
   * inline accordion behaviour so existing consumers keep working.
   */
  onSelectProvince?: (plate: number) => void
}

export function ProvinceHeatmap({ ranked, hideEmpty = false, onSelectProvince }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const visible = hideEmpty ? ranked.filter(r => r.count > 0) : ranked

  if (visible.length === 0) {
    return (
      <div className="mt-10 editorial-mono text-ink-muted text-center opacity-80">
        — Henüz il bilgisi girilmiş kayıt yok —
      </div>
    )
  }

  const max = visible[0]?.count ?? 0

  return (
    <ul className="border-t border-rule">
      {visible.map((row) => (
        <ProvinceRow
          key={row.city.plate ?? row.city.slug}
          row={row}
          max={max}
          expanded={!onSelectProvince && expanded === row.city.plate}
          onToggle={() => {
            if (row.count === 0) return
            if (onSelectProvince) {
              if (row.city.plate != null) onSelectProvince(row.city.plate)
              return
            }
            setExpanded(prev => (prev === row.city.plate ? null : row.city.plate))
          }}
        />
      ))}
    </ul>
  )
}

function ProvinceRow({
  row,
  max,
  expanded,
  onToggle,
}: {
  row: ProvinceStats
  max: number
  expanded: boolean
  onToggle: () => void
}) {
  const ratio = barRatio(row.count, max)
  const interactive = row.count > 0

  return (
    <li className="border-b border-rule">
      <button
        type="button"
        onClick={onToggle}
        disabled={!interactive}
        aria-expanded={expanded}
        aria-controls={`province-${row.city.plate}-detainees`}
        className={
          'w-full grid grid-cols-12 gap-3 sm:gap-4 items-baseline py-4 sm:py-5 transition-colors text-left ' +
          (interactive
            ? 'group hover:bg-[color-mix(in_oklab,var(--ink)_4%,transparent)] cursor-pointer'
            : 'opacity-50 cursor-default')
        }
      >
        <span className="col-span-1 editorial-mono text-ink-muted text-right pr-2">
          {String(row.city.plate ?? '').padStart(2, '0')}
        </span>
        <span
          className={
            'col-span-5 sm:col-span-4 font-serif transition-colors ' +
            (interactive ? 'text-ink group-hover:text-accent' : 'text-ink-muted')
          }
          style={{ fontSize: 'clamp(18px, 1.6vw, 22px)' }}
        >
          {row.city.name}
        </span>
        <span
          aria-hidden="true"
          className="hidden sm:block col-span-5 relative h-[10px] mt-2 self-center"
        >
          <span className="absolute inset-0 bg-rule opacity-40" />
          <span
            className="absolute inset-y-0 left-0 bg-accent transition-all"
            style={{ width: `${ratio * 100}%` }}
          />
        </span>
        <span
          className="col-span-6 sm:col-span-2 text-right editorial-num text-accent leading-none tabular-nums"
          style={{ fontSize: 'clamp(24px, 2.6vw, 36px)' }}
        >
          {row.count}
        </span>
      </button>

      {expanded && row.detainees.length > 0 && (
        <div
          id={`province-${row.city.plate}-detainees`}
          className="grid grid-cols-12 gap-4 px-4 sm:px-6 pb-6 -mt-1"
        >
          <div className="col-span-12 sm:col-start-2 sm:col-span-11">
            <ul className="space-y-2 border-l-2 border-accent pl-4 sm:pl-6">
              {row.detainees.map(d => (
                <li key={d.id}>
                  <Link
                    to={`/tutuklu/${d.slug}`}
                    className="editorial-mono text-ink hover:text-accent border-b border-current transition-colors pb-[2px]"
                    style={{ letterSpacing: '0.18em', fontSize: 13 }}
                  >
                    → {d.name.toLocaleUpperCase('tr-TR')}
                    {d.title && (
                      <span
                        className="ml-2 text-ink-muted normal-case"
                        style={{ letterSpacing: '0.06em', fontSize: 12 }}
                      >
                        · {d.title}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  )
}
