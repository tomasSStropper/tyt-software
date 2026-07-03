import { useLang } from '../../i18n/LanguageContext'
import { useTypewriter } from '../../hooks/useTypewriter'
import { CONTACT } from '../../i18n/dictionary'
import { Avatar } from './Avatar'
import { BinaryRain } from './BinaryRain'

const PILL_BASE_DELAY = 700
const PILL_STAGGER = 90

export function Hero() {
  const { t } = useLang()
  const { text, done } = useTypewriter(t.hero.typed)

  const pills = [
    { label: t.hero.pills.quote, href: '#contacto', primary: true, external: false },
    { label: t.hero.pills.work, href: '#proyectos', primary: false, external: false },
    { label: t.hero.pills.arenadesk, href: '#arenadesk', primary: false, external: false },
    { label: t.hero.pills.talk, href: CONTACT.whatsappUrl, primary: false, external: true },
  ]

  return (
    <section id="inicio" className="relative flex min-h-dvh items-center overflow-hidden pt-24 pb-14">
      {/* lluvia binaria: capa atmosférica detrás de todo el contenido */}
      <BinaryRain />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Bloque conversacional */}
        <div>
          <p className="mono-label blur-in flex items-center gap-2.5 text-ink-soft">
            <span
              className="inline-flex h-2 w-2 rounded-full bg-red-bright shadow-[0_0_8px_rgba(225,6,0,0.8)]"
              aria-hidden="true"
            />
            {t.hero.status}
          </p>

          <h1
            className="display blur-in mt-6 max-w-[14ch] text-4xl text-ink sm:text-5xl lg:text-6xl"
            style={{ animationDelay: '150ms' }}
          >
            {t.hero.title.replace(/\.$/, '')}
            <span className="text-red">.</span>
          </h1>

          {/* El span invisible reserva el alto final: cero layout shift al tipear */}
          <p className="relative mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
            <span className="sr-only">{t.hero.typed}</span>
            <span aria-hidden="true">
              <span className="invisible">{t.hero.typed}</span>
              <span className="absolute inset-0">
                {text}
                {!done && <span className="caret" />}
              </span>
            </span>
          </p>

          <ul className="mt-8 flex flex-wrap gap-3" aria-label={t.nav.cta}>
            {pills.map((pill, i) => (
              <li
                key={pill.label}
                className="pill-in"
                style={{ animationDelay: `${PILL_BASE_DELAY + i * PILL_STAGGER}ms` }}
              >
                <a
                  href={pill.href}
                  {...(pill.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`mono-label inline-block rounded-full border px-5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_-4px_rgba(31,29,26,0.4)] ${
                    pill.primary
                      ? 'border-red bg-red text-on-red hover:bg-red-bright hover:border-red-bright'
                      : 'border-ink/40 text-ink hover:border-ink hover:bg-ink hover:text-paper'
                  }`}
                >
                  {pill.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* El personaje: la interfaz que te mira */}
        <Avatar />
      </div>

      <p
        className="mono-label absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 text-mist md:flex"
        aria-hidden="true"
      >
        <span className="block h-8 w-px bg-mist/60" />
        {t.hero.scroll}
      </p>
    </section>
  )
}
