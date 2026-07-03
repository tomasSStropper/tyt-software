import { LanguageProvider, useLang } from './i18n/LanguageContext'
import { Nav } from './components/Nav'
import { Hero } from './components/hero/Hero'
import { Services } from './components/Services'
import { Spotlight } from './components/Spotlight'
import { ArenaDesk } from './components/arenadesk/ArenaDesk'
import { Projects } from './components/Projects'
import { Process } from './components/Process'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

function Shell() {
  const { t } = useLang()
  return (
    <div className="grain vignette">
      <a
        href="#servicios"
        className="mono-label sr-only rounded-none bg-red px-4 py-3 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100"
      >
        {t.a11y.skip}
      </a>
      <Nav />
      <main>
        <Hero />
        <Services />
        <Spotlight />
        <ArenaDesk />
        <Projects />
        <Process />
        <Contact />
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
