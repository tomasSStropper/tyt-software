import { useState, type FormEvent } from 'react'
import { Mail, MessageCircle } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { CONTACT } from '../i18n/dictionary'
import { submitLead } from '../lib/submitLead'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'

type Status = 'idle' | 'sending' | 'success' | 'mailto' | 'error'

export function Contact() {
  const { t } = useLang()
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sending') return
    const form = e.currentTarget
    const data = new FormData(form)
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
    } else if ('fallback' in result) {
      setStatus('mailto')
    } else {
      setStatus('error')
    }
  }

  return (
    <section id="contacto" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            index="05"
            label={t.contact.label}
            title={t.contact.title}
            intro={t.contact.pitch}
          />
          <Reveal delay={150}>
            <ul className="mt-10 space-y-4">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="group inline-flex items-center gap-3 text-ink transition-colors duration-200 hover:text-red"
                >
                  <Mail size={18} className="text-mist transition-colors duration-200 group-hover:text-red" aria-hidden="true" />
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 text-ink transition-colors duration-200 hover:text-red"
                >
                  <MessageCircle size={18} className="text-mist transition-colors duration-200 group-hover:text-red" aria-hidden="true" />
                  {CONTACT.whatsapp}
                  <span className="mono-label text-mist">WhatsApp</span>
                </a>
              </li>
            </ul>
          </Reveal>
        </div>

        <Reveal delay={100}>
          {status === 'success' ? (
            <div className="flex h-full min-h-72 flex-col items-start justify-center gap-4" role="status">
              <span className="stamp stamp-pop text-xl">{t.contact.success}</span>
              <p className="text-ink-soft">{t.contact.successNote}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-7">
              <div>
                <label htmlFor="lead-name" className="mono-label text-ink-soft">
                  {t.contact.name}
                </label>
                <input
                  id="lead-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder={t.contact.namePh}
                  className="field mt-2"
                />
              </div>
              <div>
                <label htmlFor="lead-reach" className="mono-label text-ink-soft">
                  {t.contact.reach}
                </label>
                <input
                  id="lead-reach"
                  name="reach"
                  type="text"
                  required
                  autoComplete="email"
                  placeholder={t.contact.reachPh}
                  className="field mt-2"
                />
              </div>
              <div>
                <label htmlFor="lead-message" className="mono-label text-ink-soft">
                  {t.contact.message}
                </label>
                <textarea
                  id="lead-message"
                  name="message"
                  required
                  rows={4}
                  placeholder={t.contact.messagePh}
                  className="field mt-2 resize-y"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mono-label cursor-pointer border border-red bg-red px-7 py-3.5 text-paper-lift transition-colors duration-200 hover:border-red-bright hover:bg-red-bright disabled:cursor-wait disabled:opacity-60"
                >
                  {status === 'sending' ? t.contact.sending : t.contact.send}
                </button>
                {status === 'mailto' && (
                  <p className="text-sm text-ink-soft" role="status">
                    {t.contact.mailtoNote}
                  </p>
                )}
                {status === 'error' && (
                  <p className="text-sm text-red" role="alert">
                    {t.contact.error}{' '}
                    <a href={`mailto:${CONTACT.email}`} className="underline">
                      {CONTACT.email}
                    </a>
                  </p>
                )}
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
