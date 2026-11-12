import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { LanguageProvider, useLang } from './i18n/LanguageContext'
import { ScrollManager } from './lib/ScrollManager'
import { CrtNav } from './components/crt/CrtNav'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'

// Las subpáginas se cargan aparte: no pesan en la portada.
const ArenaDeskPage = lazy(() => import('./pages/ArenaDeskPage').then((m) => ({ default: m.ArenaDeskPage })))
const LegalPage = lazy(() => import('./pages/LegalPage').then((m) => ({ default: m.LegalPage })))

/** Rayas de interferencia sobre el DOM (el lienzo dibuja las suyas). */
const DASHES = [
  { left: '12%', top: '31%', width: 22, delay: '0s' },
  { left: '58%', top: '18%', width: 34, delay: '-0.9s' },
  { left: '74%', top: '67%', width: 18, delay: '-1.7s' },
  { left: '33%', top: '82%', width: 28, delay: '-2.2s' },
]

function Shell() {
  const { t } = useLang()
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  return (
    <>
      <a
        href="#main"
        className="mono-label sr-only bg-red px-4 py-3 text-on-red focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100"
      >
        {t.a11y.skip}
      </a>
      <ScrollManager />
      <CrtNav />
      <main id="main">
        <Suspense fallback={<div className="min-h-screen" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/arenadesk" element={<ArenaDeskPage />} />
            <Route path="/privacidad-agenda" element={<LegalPage doc="privacidad-agenda" />} />
            <Route path="/condiciones-agenda" element={<LegalPage doc="condiciones-agenda" />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      {/* en la portada el pie vive dentro de la pantalla de contacto */}
      {!isHome && <Footer />}
      <div className="crt-veil" aria-hidden="true" />
      <div className="crt-dashes" aria-hidden="true">
        {DASHES.map((d, i) => (
          <i key={i} style={{ left: d.left, top: d.top, width: d.width, animationDelay: d.delay }} />
        ))}
      </div>
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Shell />
    </LanguageProvider>
  )
}
