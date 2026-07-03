import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Banknote,
  CalendarDays,
  CheckCheck,
  CreditCard,
  Headphones,
  Languages,
  MessagesSquare,
  Ticket,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import { usePageMeta } from '../lib/usePageMeta'
import { Reveal } from '../components/Reveal'
import { DashboardMockup } from '../components/arenadesk/DashboardMockup'

const OPS_ICONS = [Users, CreditCard, Ticket, CheckCheck, CalendarDays, BarChart3, MessagesSquare]
const CR_ICONS = [Banknote, Languages, Headphones]

function DemoCta({ label }: { label: string }) {
  return (
    <Link
      to="/#contacto"
      className="group mono-label inline-flex items-center gap-2 border border-red bg-red px-6 py-3.5 text-on-red transition-colors duration-200 hover:border-red-bright hover:bg-red-bright"
    >
      {label}
      <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
    </Link>
  )
}

export function ArenaDeskPage() {
  const { t, lang } = useLang()
  const p = t.arenadeskPage
  usePageMeta(
    'ArenaDesk — Software white-label para academias | TyT',
    lang === 'es'
      ? 'ArenaDesk: software de gestión white-label para gimnasios y academias deportivas, con IA integrada. Un producto de TyT Software & Solutions.'
      : 'ArenaDesk: white-label management software for gyms and sports academies, with built-in AI. A product by TyT Software & Solutions.',
  )

  return (
    <>
      {/* HERO del producto — hereda la estética oscura del showcase */}
      <section className="bg-coal pt-24 pb-16 lg:pt-32 lg:pb-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <Link
              to="/"
              className="mono-label inline-flex items-center gap-2 text-coal-text/70 transition-colors duration-200 hover:text-red-soft"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              {p.back}
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <p className="mono-label mt-10 flex items-center gap-2.5 text-coal-text/70">
              <span
                className="inline-flex h-2 w-2 rounded-full bg-red-bright shadow-[0_0_8px_rgba(224,62,45,0.8)]"
                aria-hidden="true"
              />
              {p.label}
            </p>
            <h1 className="display mt-5 max-w-[18ch] text-4xl text-paper sm:text-5xl lg:text-6xl">
              {p.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-coal-text/80">{p.sub}</p>
            <div className="mt-8">
              <DemoCta label={p.cta} />
            </div>
          </Reveal>

          <Reveal delay={150} className="mt-16">
            <DashboardMockup ariaLabel={`ArenaDesk — ${p.sub}`} />
          </Reveal>
        </div>
      </section>

      {/* EL PORQUÉ — tres pilares */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <h2 className="display max-w-[16ch] text-3xl text-ink sm:text-4xl lg:text-5xl">
            {p.wedgeTitle}
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-3">
          {p.pillars.map((pillar, i) => (
            <Reveal key={pillar.name} delay={i * 90}>
              <article className="border-t-2 border-ink/70 pt-5">
                <span className="mono-label text-red-ink">0{i + 1}</span>
                <h3 className="display mt-3 text-2xl text-ink">{pillar.name}</h3>
                <p className="mt-3 text-ink-soft">{pillar.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WHITE-LABEL PROFUNDO */}
      <section className="bg-paper-deep py-20 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="mono-label text-mist">White label</p>
            <h2 className="display mt-4 max-w-[14ch] text-3xl text-ink sm:text-4xl lg:text-5xl">
              {p.brandTitle}
            </h2>
            <blockquote className="mt-8 border-l-2 border-red pl-5 text-lg text-ink">
              {p.brandNuance}
            </blockquote>
          </Reveal>
          <Reveal delay={120}>
            <ul className="space-y-6 lg:pt-12">
              {p.brandItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <ArrowRight size={18} className="mt-1 shrink-0 text-red" aria-hidden="true" />
                  <span className="text-ink-soft">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* MULTIDEPORTE REAL */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="mono-label text-mist">Multideporte</p>
            <h2 className="display mt-4 max-w-[14ch] text-3xl text-ink sm:text-4xl lg:text-5xl">
              {p.sportTitle}
            </h2>
            <ul className="mt-8 flex flex-wrap gap-2.5" aria-label={p.sportTitle}>
              {p.sports.map((s) => (
                <li
                  key={s}
                  className="mono-label border border-ink/40 px-4 py-2 text-ink transition-colors duration-200 hover:border-red hover:text-red-ink"
                >
                  {s}
                </li>
              ))}
              <li className="mono-label px-2 py-2 text-mist">+ {p.sportsMore}</li>
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <div className="lg:pt-12">
              <p className="text-ink-soft">{p.sportCopy}</p>
              <p className="mt-5 flex items-start gap-3 text-ink">
                <ArrowRight size={18} className="mt-1 shrink-0 text-red" aria-hidden="true" />
                {p.sportAuto}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* OPERACIÓN COMPLETA */}
      <section className="bg-coal py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <h2 className="display text-3xl text-paper sm:text-4xl lg:text-5xl">{p.opsTitle}</h2>
          </Reveal>
          <ul className="mt-12 grid gap-px overflow-hidden border border-coal-line bg-coal-line sm:grid-cols-2 lg:grid-cols-3">
            {p.ops.map((item, i) => {
              const Icon = OPS_ICONS[i]
              return (
                <li key={item} className="h-full">
                  <Reveal delay={i * 60} className="h-full">
                    <div className="flex h-full items-center gap-3.5 bg-coal p-5 transition-colors duration-200 hover:bg-coal-lift">
                      <Icon size={18} className="shrink-0 text-red-soft" aria-hidden="true" />
                      <span className="text-sm text-coal-text">{item}</span>
                    </div>
                  </Reveal>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* HECHO PARA COSTA RICA */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <h2 className="display text-3xl text-ink sm:text-4xl">{p.crTitle}</h2>
        </Reveal>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {p.crItems.map((item, i) => {
            const Icon = CR_ICONS[i]
            return (
              <Reveal key={item} delay={i * 90}>
                <div className="flex items-center gap-3 border-t border-ink/25 pt-5">
                  <Icon size={20} className="shrink-0 text-red" aria-hidden="true" />
                  <span className="display text-xl text-ink">{item}</span>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* Línea de confianza */}
        <Reveal delay={200}>
          <div className="mt-20 border-l-2 border-red pl-6">
            <p className="display text-2xl text-ink sm:text-3xl">{p.trustLine}</p>
            <p className="mt-3 max-w-xl text-ink-soft">{p.trustBy}</p>
          </div>
        </Reveal>
      </section>

      {/* CTA FINAL */}
      <section className="bg-coal py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
          <Reveal>
            <h2 className="display mx-auto max-w-[18ch] text-3xl text-paper sm:text-4xl lg:text-5xl">
              {p.finalTitle}
            </h2>
            <div className="mt-8">
              <DemoCta label={p.cta} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
