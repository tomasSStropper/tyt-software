import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CalendarCheck, CircleAlert, CircleCheck, Sparkles } from 'lucide-react'
import { loadDiagnosis, type Diagnosis } from '../lib/diagnosis'
import { usePageMeta } from '../lib/usePageMeta'

type State = { status: 'loading' } | { status: 'missing' } | { status: 'error' } | { status: 'ready'; data: Diagnosis }

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function day(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Logo() {
  return <img src="/icon-192.png" alt="" width="36" height="36" className="h-9 w-9 shrink-0 rounded-lg" />
}

function Header() {
  return (
    <header className="flex items-center gap-3">
      <Logo />
      <div className="leading-tight">
        <p className="text-sm font-bold text-slate-900">TyT Software & Solutions</p>
        <p className="text-xs text-slate-500">San Vito, Costa Rica</p>
      </div>
    </header>
  )
}

function Message({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-16">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-3 text-base text-slate-600">{text}</p>
      <a href="https://www.tytsoftware.com/" className="mt-6 inline-block font-semibold text-[#3b5bff] underline">
        Ir a tytsoftware.com
      </a>
    </div>
  )
}

function Report({ data }: { data: Diagnosis }) {
  const problems = data.findings.filter((f) => !f.ok)
  const fine = data.findings.filter((f) => f.ok)
  return (
    <>
      <div className="mt-10">
        <p className="text-sm font-semibold text-[#3b5bff]">Diagnóstico gratuito</p>
        <h1 className="mt-2 text-[1.7rem] leading-tight font-bold text-balance text-slate-900 sm:text-4xl">
          {data.business_name}
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Revisé la portada de <span className="font-semibold text-slate-800">{host(data.site_url)}</span> el{' '}
          {day(data.checked_at)}. Acá está solo lo que se puede comprobar desde afuera, sin suposiciones.
        </p>
      </div>

      {problems.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">Lo que te puede estar costando clientes</h2>
          <ul className="mt-4 space-y-3">
            {problems.map((f) => (
              <li key={f.id} className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-slate-900">{f.title}</p>
                  <p className="mt-1 text-sm text-slate-700">{f.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {fine.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">Lo que ya está bien</h2>
          <ul className="mt-4 space-y-3">
            {fine.map((f) => (
              <li key={f.id} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-slate-900">{f.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{f.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.ideas.length > 0 && (
        <section className="mt-10 rounded-2xl bg-[#3b5bff]/[0.06] p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-[#3b5bff]" aria-hidden="true" />
            Lo que se podría automatizar
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-slate-700">
            {data.ideas.map((idea) => (
              <li key={idea}>{idea}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10 rounded-2xl bg-[#3b5bff] p-6 text-white">
        <h2 className="text-xl font-bold">¿Lo vemos juntos?</h2>
        <p className="mt-2 text-base text-white/90">
          En 20 minutos te muestro qué haría yo en tu caso. Sin compromiso.
        </p>
        <a
          href={data.agenda_url}
          className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-base font-bold text-[#3b5bff] transition hover:bg-slate-100"
        >
          <CalendarCheck className="h-5 w-5" aria-hidden="true" />
          Agendar una llamada
        </a>
        <p className="mt-4 text-sm text-white/80">Tomás Tropper, TyT Software & Solutions</p>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-slate-500">
        Este diagnóstico es privado: solo lo ve quien tiene el enlace y no aparece en buscadores. Usa solo información
        pública de tu sitio. Si preferís que lo borremos, respondé el correo y listo.
      </p>
    </>
  )
}

export function DiagnosisPage() {
  const { token = '' } = useParams()
  const [state, setState] = useState<State>({ status: 'loading' })
  const asked = useRef(false)

  usePageMeta('Diagnóstico de tu sitio | TyT', 'Diagnóstico privado de TyT Software & Solutions.', { noindex: true })

  useEffect(() => {
    const root = document.documentElement
    const before = [root.style.background, document.body.style.background, document.body.style.color]
    root.style.background = '#f8fafc'
    document.body.style.background = '#f8fafc'
    document.body.style.color = '#0f172a'
    return () => {
      ;[root.style.background, document.body.style.background, document.body.style.color] = before
    }
  }, [])

  useEffect(() => {
    if (asked.current) return
    asked.current = true
    loadDiagnosis(token, window.location.hash === '#equipo')
      .then((data) => setState(data ? { status: 'ready', data } : { status: 'missing' }))
      .catch(() => setState({ status: 'error' }))
  }, [token])

  return (
    <div className="min-h-svh bg-slate-50 text-slate-900 normal-case">
      <div className="mx-auto max-w-xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
        <Header />
        {state.status === 'loading' && <p className="mt-16 text-base text-slate-500">Cargando el diagnóstico…</p>}
        {state.status === 'missing' && (
          <Message title="Este diagnóstico no está disponible" text="Puede que el enlace esté incompleto o que ya lo hayamos borrado." />
        )}
        {state.status === 'error' && (
          <Message title="No se pudo cargar el diagnóstico" text="Probá de nuevo en un minuto. Si sigue igual, escribinos a tomas@tytsoftware.com." />
        )}
        {state.status === 'ready' && <Report data={state.data} />}
      </div>
    </div>
  )
}
