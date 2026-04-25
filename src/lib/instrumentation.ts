// Sentry boot — strictly no-op when VITE_SENTRY_DSN isn't configured so dev
// runs and Vercel previews without a DSN don't ship anything to Sentry.
import * as Sentry from '@sentry/react'

let initialized = false

export function initInstrumentation() {
  if (initialized) return
  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim()
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_RELEASE,
    // Conservative defaults — kampanya tek kişilik, traffic düşük.
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    // Don't send the campaign hashtag or user-typed tweet drafts to Sentry.
    beforeSend(event) {
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url)
          u.search = ''
          event.request.url = u.toString()
        } catch {
          /* leave as-is */
        }
      }
      return event
    },
  })

  initialized = true
}

export const SentryErrorBoundary = Sentry.ErrorBoundary
