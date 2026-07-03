import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import { CONTACT } from '../i18n/dictionary'

/** Reloj con la hora local de Costa Rica, actualizado cada medio minuto. */
function useCostaRicaTime(locale: string) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Costa_Rica',
  }).format(now)
}

export function Footer() {
  const { t, lang } = useLang()
  const time = useCostaRicaTime(lang === 'es' ? 'es-CR' : 'en-US')

  const links = [
    { href: '/#servicios', label: t.nav.services },
    { href: '/arenadesk', label: 'ArenaDesk' },
    { href: '/#proyectos', label: t.nav.projects },
    { href: '/#proceso', label: t.nav.process },
    { href: '/#contacto', label: t.nav.contact },
  ]

  return (
    <footer className="bg-coal text-coal-text">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="display text-3xl text-paper">
              TyT<span className="text-red-bright">.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-coal-text/70">{t.footer.tagline}</p>
            <p className="mono-label mt-6 text-coal-text/70">
              {t.footer.localTime}: <span className="text-red-soft">{time}</span>
            </p>
          </div>

          <nav aria-label={t.footer.nav}>
            <p className="mono-label text-coal-text/70">{t.footer.nav}</p>
            <ul className="mt-4 space-y-2.5">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="text-sm text-coal-text/80 transition-colors duration-200 hover:text-red-bright"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mono-label text-coal-text/70">{t.footer.reach}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-coal-text/80 transition-colors duration-200 hover:text-red-bright"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-coal-text/80 transition-colors duration-200 hover:text-red-bright"
                >
                  {CONTACT.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={CONTACT.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-coal-text/80 transition-colors duration-200 hover:text-red-bright"
                >
                  {CONTACT.instagramHandle}
                </a>
              </li>
              <li className="pt-1 text-coal-text/60">{t.footer.location}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-coal-line pt-6">
          <p className="text-xs text-coal-text/70">
            © {new Date().getFullYear()} TyT Software & Solutions. {t.footer.rights}
          </p>
          <p className="mono-label text-coal-text/60">{t.footer.location}</p>
        </div>
      </div>
    </footer>
  )
}
