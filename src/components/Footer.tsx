import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import { CONTACT } from '../i18n/dictionary'
import niches from '../content/niches.json'

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

/** Pie de las subpáginas (en la portada el pie va dentro del contacto). */
export function Footer() {
  const { t, lang } = useLang()
  const time = useCostaRicaTime(lang === 'es' ? 'es-CR' : 'en-US')

  return (
    <footer className="border-t border-dashed border-line">
      <div className="mono-label mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-8 text-mist sm:px-8">
        <p>
          ©{new Date().getFullYear()} TyT Software &amp; Solutions — {t.footer.rights}
        </p>
        <nav aria-label={t.legal.label} className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/#contacto" className="transition-colors duration-200 hover:text-ink">
            {t.nav.contact}
          </Link>
          {niches.map((niche) => (
            <Link key={niche.path} to={niche.path} className="transition-colors duration-200 hover:text-ink">
              {niche.footerLabel}
            </Link>
          ))}
          <a href={`mailto:${CONTACT.email}`} className="transition-colors duration-200 hover:text-ink">
            {CONTACT.email}
          </a>
          <Link to="/privacidad-agenda" className="transition-colors duration-200 hover:text-ink">
            {t.home.privacy}
          </Link>
          <Link to="/condiciones-agenda" className="transition-colors duration-200 hover:text-ink">
            {t.home.terms}
          </Link>
        </nav>
        <p>
          {t.footer.location} · {t.footer.localTime} <span className="text-red-soft">{time}</span>
        </p>
      </div>
    </footer>
  )
}
