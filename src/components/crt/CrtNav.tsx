import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CONTACT, type Lang } from '../../i18n/dictionary'
import { useLang } from '../../i18n/LanguageContext'
import { Sheet } from './Sheet'

const SECTIONS = [
  { hash: 'proyectos', key: 'projects' },
  { hash: 'servicios', key: 'services' },
  { hash: 'arenadesk', key: 'arenadesk' },
  { hash: 'proceso', key: 'process' },
  { hash: 'contacto', key: 'contact' },
] as const

/**
 * Barra superior del sitio: marca a la izquierda, HABLEMOS + MENÚ a la derecha.
 * Usa mix-blend-mode: difference para leerse sobre la sala blanca y sobre negro;
 * por eso el LED verde va aparte (el blend le cambiaría el color).
 */
export function CrtNav() {
  const { t, lang, setLang } = useLang()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const talkRef = useRef<HTMLAnchorElement>(null)
  const ledRef = useRef<HTMLSpanElement>(null)

  // el LED se pega al final de la palabra HABLEMOS
  useLayoutEffect(() => {
    const place = () => {
      const a = talkRef.current
      const led = ledRef.current
      if (!a || !led) return
      const r = a.getBoundingClientRect()
      led.style.left = `${r.right + 4}px`
      led.style.top = `${r.top + r.height / 2 - 1}px`
    }
    place()
    window.addEventListener('resize', place)
    document.fonts?.ready.then(place)
    return () => window.removeEventListener('resize', place)
  }, [lang, pathname])

  // al navegar se cierra el menú
  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <header className="crt-nav">
        <Link to="/" aria-label={`${t.nav.brand} — inicio`}>
          {t.nav.brand}
        </Link>
        <nav className="crt-nav__right" aria-label="principal">
          <Link to="/#contacto" ref={talkRef}>
            {t.nav.talk}
          </Link>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={t.nav.menuOpen}
            onClick={() => setOpen(true)}
          >
            {t.nav.menu}
            <span aria-hidden="true"> ≡</span>
          </button>
        </nav>
      </header>
      <span className="crt-led" ref={ledRef} aria-hidden="true" />

      {open && (
        <Sheet label={t.nav.menu} onClose={() => setOpen(false)} className="menu">
          <div className="sheet__meta mono">
            <span>{t.nav.menu}</span>
            <button type="button" className="tlink tlink--both" onClick={() => setOpen(false)}>
              {t.nav.close}
            </button>
            <span />
          </div>

          <ul className="menu__list">
            {SECTIONS.map(({ hash, key }, i) => (
              <li key={hash}>
                <Link to={`/#${hash}`} className="menu__item" onClick={() => setOpen(false)}>
                  <span className="mono">0{i + 1}</span>
                  <span className="display">{t.nav[key]}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="menu__foot mono">
            <div role="group" aria-label={t.nav.langLabel} style={{ display: 'flex', gap: '0.9rem' }}>
              {(['es', 'en'] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  className="tlink"
                  aria-pressed={lang === l}
                  onClick={() => setLang(l)}
                  style={{ opacity: lang === l ? 1 : 0.45 }}
                >
                  {l}
                </button>
              ))}
            </div>
            <a className="tlink" href={CONTACT.agendaUrl('nav')}>
              {t.nav.cta}
            </a>
            <a className="tlink" href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </Sheet>
      )}
    </>
  )
}
