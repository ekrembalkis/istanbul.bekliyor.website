import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Masthead } from '../components/public/Masthead'
import { Footer } from '../components/public/Footer'
import { CardCanvas } from '../components/cards/CardCanvas'
import { TemplatePicker } from '../components/cards/form/TemplatePicker'
import { FormatPicker } from '../components/cards/form/FormatPicker'
import { MessageEditor } from '../components/cards/form/MessageEditor'
import { DetaineePicker } from '../components/cards/form/DetaineePicker'
import { ThemePicker } from '../components/cards/form/ThemePicker'
import { useDetainees, type Detainee } from '../lib/detainees'
import { getDayCount } from '../lib/utils'
import {
  FORMAT_DIMENSIONS,
  isCardFormat,
  isCardTemplate,
  type CardFormat,
  type CardTemplate,
  type CardTheme,
} from '../lib/cards/templates'
import { getDailyDefaultMessage } from '../lib/cards/defaults'
import { renderCardToPng, preloadCardFonts } from '../lib/cards/render'
import {
  buildShareText,
  buildXShareUrl,
  dataUrlToFile,
  downloadDataUrl,
} from '../lib/cards/share'
import { resolveTheme } from '../lib/theme'
import { PAPER_GRAIN_DATA_URL } from '../config/site'

const PREVIEW_MAX_WIDTH = 720

export default function CardGeneratorPage() {
  const day = getDayCount()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: detainees, loading: detaineesLoading } = useDetainees()

  // ── State (URL params seed initial values once) ─────────────────────────
  const initial = useMemo(() => readUrlParams(searchParams), [])
  const [template, setTemplate] = useState<CardTemplate>(initial.template)
  const [format, setFormat] = useState<CardFormat>(initial.format)
  const [message, setMessage] = useState<string>(getDailyDefaultMessage(day))
  const [authorName, setAuthorName] = useState<string>('')
  const [detaineeSlug, setDetaineeSlug] = useState<string | null>(initial.kisi)
  const [theme, setTheme] = useState<CardTheme>(() => resolveSiteTheme())
  const [busy, setBusy] = useState<'idle' | 'png' | 'share'>('idle')
  const [feedback, setFeedback] = useState<string | null>(null)

  const detainee: Detainee | null =
    template === 'detainee'
      ? detainees?.find(d => d.slug === detaineeSlug) ?? detainees?.[0] ?? null
      : null

  // ── Mirror state to URL (lightweight, replaceState) ─────────────────────
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set('sablon', template)
    params.set('format', format)
    if (template === 'detainee' && detaineeSlug) params.set('kisi', detaineeSlug)
    else params.delete('kisi')
    setSearchParams(params, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, format, detaineeSlug])

  // ── If user picks "detainee" but no slug yet, default to first detainee ─
  useEffect(() => {
    if (template === 'detainee' && !detaineeSlug && detainees && detainees.length > 0) {
      setDetaineeSlug(detainees[0].slug)
    }
  }, [template, detaineeSlug, detainees])

  // ── Preflight font cache so first export is fast ────────────────────────
  useEffect(() => {
    preloadCardFonts().catch(() => {})
  }, [])

  // ── Preview scale: largest fit inside PREVIEW_MAX_WIDTH ─────────────────
  const dim = FORMAT_DIMENSIONS[format]
  const previewScale = Math.min(1, PREVIEW_MAX_WIDTH / dim.w)

  // ── Refs for export node ────────────────────────────────────────────────
  const exportRef = useRef<HTMLDivElement>(null)

  async function exportPng(): Promise<string | null> {
    const node = exportRef.current
    if (!node) return null
    try {
      // Ensure layout is committed before rasterizing.
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      const dataUrl = await renderCardToPng(node, { pixelRatio: 2 })
      return dataUrl
    } catch (err) {
      console.warn('[card] toPng failed', err)
      setFeedback('Kart üretilirken bir hata oluştu. Yeniden dene.')
      return null
    }
  }

  function buildFilename(): string {
    const parts = ['kart-istanbul-bekliyor', String(day), template, format]
    return parts.join('-') + '.png'
  }

  async function onDownload() {
    setBusy('png')
    setFeedback(null)
    const dataUrl = await exportPng()
    if (dataUrl) {
      downloadDataUrl(dataUrl, buildFilename())
      setFeedback('PNG indirildi. Şimdi X\'te paylaş ve görseli ekle.')
    }
    setBusy('idle')
  }

  async function onShare() {
    setBusy('share')
    setFeedback(null)
    const text = buildShareText({ day, message })
    const dataUrl = await exportPng()
    if (!dataUrl) {
      setBusy('idle')
      return
    }
    const filename = buildFilename()
    const file = dataUrlToFile(dataUrl, filename)
    // Try Web Share API (mobile + supported desktop)
    const nav = navigator as Navigator & {
      canShare?: (data: { files?: File[] }) => boolean
      share?: (data: { files?: File[]; text?: string; title?: string }) => Promise<void>
    }
    if (nav.canShare?.({ files: [file] }) && nav.share) {
      try {
        await nav.share({ files: [file], text, title: 'İstanbul Bekliyor' })
        setFeedback('Paylaşıldı.')
      } catch {
        // User cancel — silent
      }
    } else {
      // Desktop fallback: download + open X intent.
      downloadDataUrl(dataUrl, filename)
      window.open(buildXShareUrl(text), '_blank', 'noopener,noreferrer')
      setFeedback('PNG indirildi ve X açıldı. Tweet\'e görseli ekle.')
    }
    setBusy('idle')
  }

  return (
    <div className="min-h-screen bg-bg text-ink relative">
      <Helmet>
        <title>Kartını Üret — İstanbul Bekliyor</title>
        <meta
          name="description"
          content="Kendi dayanışma kartını üret. İstanbul Bekliyor için bir cümle, bir gün sayısı, bir paylaşım."
        />
      </Helmet>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("${PAPER_GRAIN_DATA_URL}")`,
          opacity: 'var(--grain-opacity)',
        }}
      />

      <div className="relative z-10">
        <header className="px-[6vw] pt-10">
          <div className="max-w-[1480px] mx-auto grid grid-cols-12 gap-6">
            <Masthead day={day} rightLabel="ATÖLYE" />
            <nav className="col-span-12 mt-4 editorial-mono text-ink-muted">
              <Link to="/" className="hover:text-accent transition-colors">
                ← İstanbul Bekliyor
              </Link>
            </nav>
          </div>
        </header>

        <main className="px-[6vw] pt-12 pb-12">
          <div className="max-w-[1480px] mx-auto grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
              <div>
                <span className="editorial-mono text-accent" style={{ letterSpacing: '0.32em' }}>
                  — KART ATÖLYESİ
                </span>
                <h1
                  className="editorial-h1 text-ink mt-3"
                  style={{ fontSize: 'clamp(40px, 6vw, 88px)' }}
                >
                  Kartını <em className="italic editorial-display text-ornament">üret.</em>
                </h1>
                <p
                  className="font-serif italic text-ink-muted mt-3 max-w-[44ch]"
                  style={{ fontSize: 'clamp(16px, 1.4vw, 20px)', lineHeight: 1.45 }}
                >
                  Bir cümlen, bir gün sayısı, bir paylaşım. Her kart bu kampanyayı yeniden gündemde tutar.
                </p>
              </div>

              <TemplatePicker value={template} onChange={setTemplate} />
              <FormatPicker value={format} onChange={setFormat} />
              {template === 'detainee' && (
                <DetaineePicker
                  detainees={detainees ?? []}
                  selectedSlug={detaineeSlug}
                  onChange={setDetaineeSlug}
                  loading={detaineesLoading}
                />
              )}
              <MessageEditor
                value={message}
                onChange={setMessage}
                authorName={authorName}
                onAuthorChange={setAuthorName}
              />
              <ThemePicker value={theme} onChange={setTheme} />

              <div className="flex flex-wrap gap-3 pt-4 border-t border-rule">
                <button
                  type="button"
                  onClick={onDownload}
                  disabled={busy !== 'idle'}
                  className="editorial-mono px-5 py-3 bg-accent text-white border border-accent hover:bg-transparent hover:text-accent transition-colors disabled:opacity-50"
                  style={{ letterSpacing: '0.22em' }}
                >
                  {busy === 'png' ? '— ÜRETİLİYOR' : 'PNG İNDİR'}
                </button>
                <button
                  type="button"
                  onClick={onShare}
                  disabled={busy !== 'idle'}
                  className="editorial-mono px-5 py-3 border border-rule text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                  style={{ letterSpacing: '0.22em' }}
                >
                  {busy === 'share' ? '— HAZIRLANIYOR' : "X'TE PAYLAŞ"}
                </button>
              </div>
              {feedback && (
                <div
                  role="status"
                  className="editorial-mono text-ink-muted border-l-2 border-accent pl-4 py-2"
                  style={{ fontSize: 11, letterSpacing: '0.22em' }}
                >
                  {feedback}
                </div>
              )}
            </div>

            <div className="col-span-12 lg:col-span-7">
              <div className="lg:sticky lg:top-8">
                <div className="editorial-mono text-ink-muted mb-3" style={{ letterSpacing: '0.32em' }}>
                  — ÖNİZLEME · {dim.w} × {dim.h}
                </div>
                <div className="border border-rule p-2 inline-block">
                  <CardCanvas
                    template={template}
                    format={format}
                    day={day}
                    message={message.trim() || getDailyDefaultMessage(day)}
                    authorName={authorName.trim() || undefined}
                    detainee={detainee}
                    theme={theme}
                    scale={previewScale}
                  />
                </div>
                <p className="font-serif italic text-ink-muted mt-3" style={{ fontSize: 13 }}>
                  Üretilen PNG, gerçek çözünürlükte ({dim.w} × {dim.h}) ve 2x retina yoğunluğunda kaydedilir.
                </p>
              </div>
            </div>
          </div>

          {/* Hidden export node — full-resolution, off-screen */}
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              left: -99999,
              top: 0,
              pointerEvents: 'none',
              opacity: 0,
            }}
          >
            <div ref={exportRef}>
              <CardCanvas
                template={template}
                format={format}
                day={day}
                message={message.trim() || getDailyDefaultMessage(day)}
                authorName={authorName.trim() || undefined}
                detainee={detainee}
                theme={theme}
                scale={1}
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}

function readUrlParams(params: URLSearchParams): {
  template: CardTemplate
  format: CardFormat
  kisi: string | null
} {
  const sablon = params.get('sablon')
  const format = params.get('format')
  const kisi = params.get('kisi')
  return {
    template: isCardTemplate(sablon) ? sablon : kisi ? 'detainee' : 'manifesto',
    format: isCardFormat(format) ? format : '1x1',
    kisi: kisi || null,
  }
}

function resolveSiteTheme(): CardTheme {
  if (typeof document === 'undefined') return 'dark'
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr
  return resolveTheme('system') as CardTheme
}
