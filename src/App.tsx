import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DetaineeProfilePage from './pages/DetaineeProfilePage'
import ManifestoPage from './pages/ManifestoPage'
import OutreachPage from './pages/OutreachPage'
import LettersPage from './pages/LettersPage'
import EventStreamPage from './pages/EventStreamPage'
import NotFoundPage from './pages/NotFoundPage'
import { EditorialLoading } from './components/public/EditorialLoading'

const CardGeneratorPage = lazy(() => import('./pages/CardGeneratorPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tutuklu/:slug" element={<DetaineeProfilePage />} />
        <Route path="/bildirge" element={<ManifestoPage />} />
        <Route path="/vekiline-yaz" element={<OutreachPage />} />
        <Route path="/mektuplar" element={<LettersPage />} />
        <Route path="/olay-akisi" element={<EventStreamPage />} />
        <Route
          path="/kart"
          element={
            <Suspense fallback={<EditorialLoading label="Atölye yükleniyor" />}>
              <CardGeneratorPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
