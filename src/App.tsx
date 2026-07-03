import { Route, Routes } from 'react-router-dom'
import { LanguageProvider, useLang } from './i18n/LanguageContext'
import { ScrollManager } from './lib/ScrollManager'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { ArenaDeskPage } from './pages/ArenaDeskPage'

function Shell() {
  const { t } = useLang()
  return (
    <div className="grain vignette">
      <a
        href="#main"
        className="mono-label sr-only rounded-none bg-red px-4 py-3 text-on-red focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100"
      >
        {t.a11y.skip}
      </a>
      <ScrollManager />
      <Nav />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/arenadesk" element={<ArenaDeskPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Shell />
    </LanguageProvider>
  )
}
