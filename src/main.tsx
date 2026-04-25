import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { initInstrumentation, SentryErrorBoundary } from './lib/instrumentation'
import './index.css'

initInstrumentation()

function Fallback({ error }: { error: unknown }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-ink p-8">
      <h1 className="editorial-h1 text-accent" style={{ fontSize: 'clamp(48px, 9vw, 120px)' }}>
        Bir şey ters gitti.
      </h1>
      <p className="editorial-mono text-ink-muted mt-6 text-center max-w-prose">
        Sayfa yüklenirken beklenmeyen bir hata oluştu. Sorun bize bildirildi —
        tekrar denemek için sayfayı yenile.
      </p>
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="mt-8 max-w-3xl text-xs text-ink-muted whitespace-pre-wrap overflow-auto opacity-70">
          {error.message}
        </pre>
      )}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={({ error }) => <Fallback error={error} />}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </SentryErrorBoundary>
  </React.StrictMode>
)
