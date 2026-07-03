import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import type { Lang } from '../i18n/dictionary'

const LINKS = [
  { href: '#servicios', key: 'services' },
  { href: '#arenadesk', key: 'arenadesk' },
  { href: '#proyectos', key: 'projects' },
  { href: '#proceso', key: 'process' },
  { href: '#contacto', key: 'contact' },
] as const

function LangToggle() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="mono-label flex items-center gap-1" role="group" aria-label={t.nav.langLabel}>
      {(['es', 'en'] as Lang[]).map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-line" aria-hidden="true">/</span>}
          <button
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`cursor-pointer px-1 py-1 uppercase transition-colors duration-200 ${
              lang === l ? 'text-red' : 'text-mist hover:text-ink'
            }`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  )
}

export function Nav() {
  const { t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // scroll-spy: la sección visible marca su enlace en rojo
  useEffect(() => {
    const sections = LINKS.map(({ href }) => document.getElementById(href.slice(1))).filter(
      (el): el is HTMLElement => el !== null,
    )
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`)
        }
      },
      { rootMargin: '-35% 0px -55% 0px' },
    )
    sections.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-90 transition-all duration-300 ${
        scrolled ? 'border-b border-line/70 bg-paper/85 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8"
        aria-label="principal"
      >
        <a href="#inicio" className="display text-xl text-ink" onClick={() => setOpen(false)}>
          TyT<span className="text-red">.</span>
        </a>

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map(({ href, key }) => (
            <li key={key}>
              <a
                href={href}
                aria-current={active === href ? 'true' : undefined}
                className={`mono-label nav-link transition-colors duration-200 hover:text-red ${
                  active === href ? 'text-red' : 'text-ink-soft'
                }`}
              >
                {t.nav[key]}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <LangToggle />
          <a
            href="#contacto"
            className="mono-label hidden border border-ink px-4 py-2 text-ink transition-colors duration-200 hover:border-red hover:bg-red hover:text-paper-lift lg:inline-block"
          >
            {t.nav.cta}
          </a>
          <button
            type="button"
            className="cursor-pointer p-1 text-ink lg:hidden"
            aria-expanded={open}
            aria-label={open ? t.nav.menuClose : t.nav.menuOpen}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line bg-paper lg:hidden">
          <ul className="flex flex-col px-5 py-4">
            {LINKS.map(({ href, key }, i) => (
              <li key={key} className="border-b border-line/60 last:border-0">
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  className="display flex items-baseline gap-4 py-4 text-2xl text-ink transition-colors duration-200 hover:text-red"
                >
                  <span className="mono-label text-red">0{i + 1}</span>
                  {t.nav[key]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
