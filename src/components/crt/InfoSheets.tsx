import { useState, type FormEvent } from 'react'
import { CONTACT } from '../../i18n/dictionary'
import { useLang } from '../../i18n/LanguageContext'
import { submitLead } from '../../lib/submitLead'
import { Sheet } from './Sheet'

const pad = (n: number) => String(n).padStart(2, '0')
/** El copy de servicios marca énfasis con **doble asterisco**; aquí va en texto plano. */
const plain = (s: string) => s.replace(/\*\*/g, '')

function Head({ label, title, onClose }: { label: string; title: string; onClose: () => void }) {
  const { t } = useLang()
  return (
    <>
      <div className="sheet__meta mono">
        <span>{label}</span>
        <button type="button" className="tlink tlink--both" onClick={onClose}>
          {t.sheet.close}
        </button>
        <span />
      </div>
      <h2 className="display sheet__title">{title}</h2>
    </>
  )
}

/** Los cuatro servicios: problema tachado, qué se construye y qué resulta. */
export function ServicesSheet({ onClose, onQuote }: { onClose: () => void; onQuote: () => void }) {
  const { t } = useLang()
  const s = t.services
  return (
    <Sheet label={s.label} onClose={onClose}>
      <Head label={s.label} title={s.title} onClose={onClose} />
      <ol className="rows">
        {s.items.map((item, i) => (
          <li className="row" key={item.name}>
            <span className="mono row__n">{pad(i + 1)}</span>
            <h3 className="display row__name">{item.name}</h3>
            <dl className="mono row__body">
              <dt className="sr-only">Problema</dt>
              <dd className="row__strike">{item.problem}</dd>
              <dt>{s.buildLabel}</dt>
              <dd>{item.build}</dd>
              <dt>{s.resultLabel}</dt>
              <dd>{item.result}</dd>
              <dd>
                <details>
                  <summary className="tlink">{t.sheet.details}</summary>
                  <p style={{ marginTop: '0.6rem' }}>{item.hook}</p>
                  <p style={{ marginTop: '0.6rem' }}>{plain(item.body)}</p>
                  <p style={{ marginTop: '0.6rem', color: '#8f8d89' }}>{t.sheet.how}</p>
                  <p>{item.how}</p>
                </details>
              </dd>
            </dl>
          </li>
        ))}
      </ol>
      <div style={{ marginTop: '2rem' }}>
        <button type="button" className="tbtn tbtn--red" onClick={onQuote}>
          {t.sheet.quote}
        </button>
      </div>
    </Sheet>
  )
}

/** Los cinco pasos del proceso. */
export function ProcessSheet({ onClose, onQuote }: { onClose: () => void; onQuote: () => void }) {
  const { t } = useLang()
  const p = t.process
  return (
    <Sheet label={p.label} onClose={onClose}>
      <Head label={p.label} title={p.title} onClose={onClose} />
      <p className="mono sheet__text" style={{ marginTop: '1rem' }}>
        {p.manifesto}
      </p>
      <ol className="rows">
        {p.steps.map((step, i) => (
          <li className="row" key={step.name}>
            <span className="mono row__n">{pad(i + 1)}</span>
            <h3 className="display row__name">{step.name}</h3>
            <p className="mono row__body">{step.desc}</p>
          </li>
        ))}
      </ol>
      <div style={{ marginTop: '2rem' }}>
        <button type="button" className="tbtn tbtn--red" onClick={onQuote}>
          {t.sheet.quote}
        </button>
      </div>
    </Sheet>
  )
}

type Status = 'idle' | 'sending' | 'success' | 'mailto' | 'error'

/** Formulario de leads: inserta en Supabase (public.leads) o degrada a mailto. */
export function FormSheet({ onClose }: { onClose: () => void }) {
  const { t } = useLang()
  const c = t.contact
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sending') return
    const form = e.currentTarget
    const data = new FormData(form)
    // Trampa para bots: un campo que las personas no ven. Si llega lleno, se
    // responde "recibido" sin guardar nada, para no darle pistas al bot.
    if (String(data.get('company') ?? '') !== '') {
      setStatus('success')
      return
    }
    const reach = String(data.get('reach') ?? '').trim()
    const isEmail = reach.includes('@')

    setStatus('sending')
    const result = await submitLead({
      full_name: String(data.get('name') ?? '').trim(),
      email: isEmail ? reach : null,
      phone: isEmail ? null : reach,
      message: String(data.get('message') ?? '').trim(),
    })
    if (result.ok) {
      setStatus('success')
      form.reset()
    } else if ('fallback' in result) setStatus('mailto')
    else setStatus('error')
  }

  return (
    <Sheet label={c.label} onClose={onClose}>
      <Head label={c.label} title={c.title} onClose={onClose} />
      <p className="mono sheet__text" style={{ marginTop: '1rem' }}>
        {c.pitch}
      </p>

      {status === 'success' ? (
        <div className="tform" role="status">
          <p className="display" style={{ fontSize: '2rem', color: 'var(--color-red-soft)' }}>
            {c.success}
          </p>
          <p className="mono sheet__text">{c.successNote}</p>
        </div>
      ) : (
        <form className="tform mono" onSubmit={onSubmit}>
          <div className="hp" aria-hidden="true">
            <label htmlFor="lead-company">Empresa (no llenar)</label>
            <input id="lead-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="lead-name">{c.name}</label>
            <input id="lead-name" name="name" type="text" required maxLength={120} autoComplete="name" placeholder={c.namePh} className="field" />
          </div>
          <div>
            <label htmlFor="lead-reach">{c.reach}</label>
            <input id="lead-reach" name="reach" type="text" required maxLength={160} autoComplete="email" placeholder={c.reachPh} className="field" />
          </div>
          <div>
            <label htmlFor="lead-message">{c.message}</label>
            <textarea id="lead-message" name="message" required maxLength={2000} rows={3} placeholder={c.messagePh} className="field" style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center' }}>
            <button type="submit" className="tbtn tbtn--red" disabled={status === 'sending'}>
              {status === 'sending' ? c.sending : c.send}
            </button>
            <a className="tbtn" href={CONTACT.agendaUrl('contact')}>
              {c.agenda}
            </a>
          </div>
          {status === 'mailto' && (
            <p className="sheet__text" role="status">
              {c.mailtoNote}
            </p>
          )}
          {status === 'error' && (
            <p className="sheet__text" role="alert" style={{ color: 'var(--color-red-soft)' }}>
              {c.error}{' '}
              <a href={`mailto:${CONTACT.email}`} style={{ textDecoration: 'underline' }}>
                {CONTACT.email}
              </a>
            </p>
          )}
        </form>
      )}

      <div className="mono sheet__tags" style={{ marginTop: '2rem', columnGap: '1.8rem' }}>
        <a className="tlink" href={`mailto:${CONTACT.email}`}>
          {CONTACT.email}
        </a>
        <a className="tlink" href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
          WhatsApp {CONTACT.whatsapp}
        </a>
      </div>
    </Sheet>
  )
}
