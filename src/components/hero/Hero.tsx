import { useLang } from '../../i18n/LanguageContext'
import { useTypewriter } from '../../hooks/useTypewriter'
import { CONTACT } from '../../i18n/dictionary'
import { Avatar } from './Avatar'
import { BinaryRain } from './BinaryRain'

const PILL_BASE_DELAY = 700
const PILL_STAGGER = 90

/** Glifo de WhatsApp (lucide no incluye marcas) */
function WhatsAppGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

type PillVariant = 'primary' | 'outline' | 'cream'

const PILL_STYLES: Record<PillVariant, string> = {
  primary: 'border-red bg-red text-on-red hover:bg-red-bright hover:border-red-bright',
  outline: 'border-ink/40 text-ink hover:border-ink hover:bg-ink hover:text-paper',
  // crema/hueso cálido con borde para no lavarse sobre el gris
  cream: 'border-ink/30 bg-[#f3efe4] text-ink hover:border-ink hover:bg-[#eae5d6]',
}

export function Hero() {
  const { t } = useLang()
  const { text, done } = useTypewriter(t.hero.typed)

  const pills: { label: string; href: string; variant: PillVariant; external: boolean; glyph?: boolean }[] = [
    { label: t.hero.pills.quote, href: '#contacto', variant: 'primary', external: false },
    { label: t.hero.pills.work, href: '#proyectos', variant: 'outline', external: false },
    { label: t.hero.pills.arenadesk, href: '#arenadesk', variant: 'outline', external: false },
    { label: t.hero.pills.talk, href: '#contacto', variant: 'outline', external: false },
    { label: 'WhatsApp', href: CONTACT.whatsappUrl, variant: 'cream', external: true, glyph: true },
  ]

  return (
    <section id="inicio" className="relative flex min-h-dvh items-center overflow-hidden pt-24 pb-14">
      {/* lluvia binaria: capa atmosférica detrás de todo el contenido */}
      <BinaryRain />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Bloque conversacional */}
        <div>
          {/* cejilla de marca: editorial, no línea de estado de sistema */}
          <p className="blur-in flex items-center gap-2.5 font-display text-sm font-medium tracking-[0.08em] text-ink">
            <span className="inline-block h-2 w-2 bg-red" aria-hidden="true" />
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
                  className={`mono-label inline-flex items-center gap-2 rounded-[2px] border px-5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_-4px_rgba(31,29,26,0.4)] ${PILL_STYLES[pill.variant]}`}
                >
                  {pill.glyph && <WhatsAppGlyph />}
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
