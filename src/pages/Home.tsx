import { useLang } from '../i18n/LanguageContext'
import { usePageMeta } from '../lib/usePageMeta'
import { Hero } from '../components/hero/Hero'
import { Services } from '../components/Services'
import { ArenaDesk } from '../components/arenadesk/ArenaDesk'
import { Projects } from '../components/Projects'
import { Process } from '../components/Process'
import { Contact } from '../components/Contact'

export function Home() {
  const { lang } = useLang()
  usePageMeta(
    'TyT Software & Solutions — San Vito, Costa Rica',
    lang === 'es'
      ? 'Sitios web, sistemas internos y automatización a la medida para empresas. TyT Software & Solutions — San Vito, Costa Rica.'
      : 'Custom websites, internal systems and automation for businesses. TyT Software & Solutions — San Vito, Costa Rica.',
  )

  return (
    <>
      <Hero />
      <Services />
      <ArenaDesk />
      <Projects />
      <Process />
      <Contact />
    </>
  )
}
