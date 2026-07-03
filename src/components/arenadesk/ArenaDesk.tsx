import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../../i18n/LanguageContext'
import { SectionHeading } from '../SectionHeading'
import { Reveal } from '../Reveal'
import { DashboardMockup } from './DashboardMockup'

export function ArenaDesk() {
  const { t } = useLang()

  return (
    <section id="arenadesk" className="bg-coal py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <SectionHeading index="02" label={t.arenadesk.label} title={t.arenadesk.title} dark />
          <Reveal delay={100}>
            <div className="max-w-sm lg:pb-2 lg:text-right">
              <p className="text-coal-text/80">{t.arenadesk.copy}</p>
              <Link
                to="/arenadesk"
                className="group mono-label mt-5 inline-flex items-center gap-2 border border-red bg-red px-5 py-3 text-on-red transition-colors duration-200 hover:border-red-bright hover:bg-red-bright"
              >
                {t.arenadesk.learnMore}
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={150} className="mt-14">
          {/* el mockup completo también entra al producto */}
          <Link
            to="/arenadesk"
            aria-label={`ArenaDesk — ${t.arenadesk.learnMore}`}
            className="group block transition-transform duration-300 hover:-translate-y-1"
          >
            <DashboardMockup ariaLabel={`ArenaDesk — ${t.arenadesk.copy}`} />
            <p className="mono-label mt-4 text-center text-coal-text/60">
              {t.arenadesk.note}
              <span className="ml-3 inline-flex items-center gap-1 text-red-soft opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {t.arenadesk.learnMore} <span aria-hidden="true">→</span>
              </span>
            </p>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
