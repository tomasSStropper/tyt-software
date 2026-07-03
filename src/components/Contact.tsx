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
      <SectionHeading
        index="05"
        label={t.contact.label}
        title={t.contact.title}
        intro={t.contact.pitch}
        center
      />

      {/* El teléfono rojo: la línea directa, al centro de la sección */}
      <Reveal delay={120}>
        <div className="mt-10 flex justify-center">
          <img
            src="/characters/tyt-phone.webp"
            alt={t.contact.phoneAlt}
            width={711}
            height={472}
            loading="lazy"
            decoding="async"
            className="h-44 w-auto drop-shadow-[0_16px_26px_rgba(42,36,27,0.32)] transition-transform duration-300 hover:-rotate-2 sm:h-56"
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`mailto:${CONTACT.email}`}
            className="mono-label inline-flex items-center gap-2.5 border border-red bg-red px-6 py-3.5 text-paper-lift transition-all duration-200 hover:-translate-y-0.5 hover:border-red-bright hover:bg-red-bright"
          >
            <Mail size={15} aria-hidden="true" />
            {CONTACT.email}
          </a>
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mono-label inline-flex items-center gap-2.5 border border-ink px-6 py-3.5 text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink hover:text-paper"
          >
            <MessageCircle size={15} aria-hidden="true" />
            WhatsApp {CONTACT.whatsapp}
          </a>
        </div>
      </Reveal>

      {/* El formulario sigue siendo la vía formal */}
      <Reveal delay={200}>
        <div className="mx-auto mt-16 max-w-xl">
          {status === 'success' ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4" role="status">
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
        </div>
      </Reveal>
    </section>
  )
}
