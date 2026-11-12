import { Link } from 'react-router-dom'
import { CONTACT } from '../../i18n/dictionary'
import { useLang } from '../../i18n/LanguageContext'
import niches from '../../content/niches.json'

/** Carita en círculo punteado: el guiño humano al final del recorrido. */
function Smiley() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <circle cx="17" cy="17" r="15.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2.6 2.2" />
      <circle cx="12.4" cy="13.6" r="1.25" fill="currentColor" />
      <circle cx="21.6" cy="13.6" r="1.25" fill="currentColor" />
      <path d="M11.5 19.4c1.5 2.4 3.3 3.5 5.5 3.5s4-1.1 5.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/** Última pantalla: titular grande, canales directos y el pie legal. */
export function ContactScreen({ onForm, onBack }: { onForm: () => void; onBack: () => void }) {
  const { t } = useLang()
  const h = t.home
  return (
    <section className="contact" aria-labelledby="contact-title">
      <div className="contact__core">
        <span className="contact__cross" style={{ left: 0, top: '2.3rem' }} aria-hidden="true" />
        <span className="contact__cross" style={{ right: 0, top: '2.3rem' }} aria-hidden="true" />
        <span className="contact__cross" style={{ left: 0, bottom: 0 }} aria-hidden="true" />
        <span className="contact__cross" style={{ right: 0, bottom: 0 }} aria-hidden="true" />
        <Smiley />
        <h2 id="contact-title">
          <button type="button" className="display contact__title" onClick={onForm}>
            {h.contactTitle[0]}
            <br />
            {h.contactTitle[1]}
          </button>
        </h2>
        <p className="mono contact__sub">{h.contactSub}</p>
      </div>

      <nav className="mono contact__links" aria-label={t.nav.contact}>
        <a className="tlink" href={CONTACT.agendaUrl('contact')}>
          {h.links.agenda}
        </a>
        <a className="tlink" href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
          {h.links.whatsapp}
        </a>
        <a className="tlink" href={`mailto:${CONTACT.email}`}>
          {h.links.mail}
        </a>
        <a className="tlink" href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">
          {h.links.instagram}
        </a>
      </nav>

      <button type="button" className="tlink tlink--both mono" style={{ fontSize: '0.8rem', margin: 0 }} onClick={onBack}>
        {h.back}
      </button>

      <footer className="mono contact__legal">
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.9rem' }}>
          {/* Enlaces a las páginas de nicho: sin esto solo el sitemap las anuncia. */}
          {niches.map((niche) => (
            <Link key={niche.path} to={niche.path}>
              {niche.footerLabel}
            </Link>
          ))}
          <Link to="/privacidad-agenda">{h.privacy}</Link>
          <Link to="/condiciones-agenda">{h.terms}</Link>
        </span>
        <span>
          TyT Software &amp; Solutions — {h.rights}
        </span>
        <span>©{new Date().getFullYear()}</span>
      </footer>
    </section>
  )
}
