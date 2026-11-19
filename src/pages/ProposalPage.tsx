import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { CircleCheck, CircleX, Clock } from 'lucide-react'
import {
  ProposalError,
  answerProposal,
  loadProposal,
  type Proposal,
  type ProposalState,
} from '../lib/proposal'
import { usePageMeta } from '../lib/usePageMeta'

type State =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error' }
  | { status: 'ready'; data: Proposal }

function day(iso: string): string {
  const value = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso
  return new Date(value).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function money(amount: number, currency: Proposal['currency']): string {
  return `${currency === 'USD' ? 'US$' : '₡'}${Number(amount).toLocaleString('es-CR', { maximumFractionDigits: 2 })}`
}

function Logo() {
  return (
    <svg viewBox="0 0 512 512" className="h-9 w-9 shrink-0 rounded-lg" aria-hidden="true">
      <rect width="512" height="512" fill="#050505" />
      <g fill="none" stroke="#f0f0ed" strokeWidth="38" strokeLinejoin="miter" strokeMiterlimit="10">
        <path d="M92 162 H202 L256 250 L310 162 H420" />
        <path d="M147 162 V364" />
        <path d="M365 162 V364" />
        <path d="M256 250 V364" />
      </g>
      <circle cx="256" cy="250" r="27" fill="#3b5bff" />
    </svg>
  )
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

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-3 text-base leading-relaxed text-slate-700">{children}</div>
    </section>
  )
}

function Text({ value }: { value: string }) {
  return <p className="break-words whitespace-pre-line">{value.trim()}</p>
}

function Banner({ data }: { data: Proposal }) {
  if (data.state === 'draft') {
    return (
      <p className="mt-8 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-800">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
        Esta propuesta es un borrador. Todavía no se envió y puede cambiar.
      </p>
    )
  }
  if (data.state === 'expired') {
    return (
      <p className="mt-8 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-800">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
        Esta propuesta venció{data.valid_until ? ` el ${day(data.valid_until)}` : ''}. Escribinos a tomas@tytsoftware.com y
        la actualizamos.
      </p>
    )
  }
  if (data.state === 'accepted') {
    return (
      <p className="mt-8 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-800">
        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
        <span>
          Propuesta aceptada{data.answered_name ? ` por ${data.answered_name}` : ''}
          {data.answered_at ? ` el ${day(data.answered_at)}` : ''}. Esta página queda como constancia de lo acordado.
        </span>
      </p>
    )
  }
  if (data.state === 'declined') {
    return (
      <p className="mt-8 flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
        <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
        Nos dijiste que así no te sirve. Gracias por avisar. Si querés retomarla, escribinos a tomas@tytsoftware.com.
      </p>
    )
  }
  return null
}

function AnswerBox({ token, onAnswered }: { token: string; onAnswered: (state: ProposalState, name: string | null) => void }) {
  const [name, setName] = useState('')
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send(accept: boolean) {
    if (busy) return
    if (accept && name.trim().length < 3) {
      setError('Escribí tu nombre completo para aceptar.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const answer = await answerProposal(token, accept, name, reason)
      onAnswered(answer.state, answer.answered_name)
    } catch (err) {
      setError(
        err instanceof ProposalError && err.forPerson
          ? err.forPerson
          : 'No se pudo guardar tu respuesta. Probá de nuevo en un minuto.',
      )
      setBusy(false)
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    void send(!declining)
  }

  return (
    <form onSubmit={submit} className="mt-10 rounded-2xl bg-[#3b5bff] p-6 text-white">
      <h2 className="text-xl font-bold">{declining ? 'Contanos qué cambiarías' : '¿Arrancamos?'}</h2>
      {declining ? (
        <>
          <p className="mt-2 text-base text-white/90">
            Con una línea alcanza. Así sabemos si se puede ajustar.
          </p>
          <label className="mt-4 block text-sm font-semibold" htmlFor="motivo">
            Qué no te cierra
          </label>
          <textarea
            id="motivo"
            rows={3}
            maxLength={1000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-xl border-0 bg-white px-4 py-3 text-base text-slate-900"
          />
        </>
      ) : (
        <>
          <p className="mt-2 text-base text-white/90">
            Al aceptar confirmás que leíste el alcance, el precio y las condiciones de esta página. Tomás te escribe para
            coordinar el arranque y el primer pago.
          </p>
          <label className="mt-4 block text-sm font-semibold" htmlFor="nombre">
            Tu nombre completo
          </label>
          <input
            id="nombre"
            type="text"
            autoComplete="name"
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 min-h-12 w-full rounded-xl border-0 bg-white px-4 text-base text-slate-900"
          />
        </>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-white/15 px-3 py-2 text-sm">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-5 text-base font-bold text-[#3b5bff] transition hover:bg-slate-100 disabled:opacity-70"
      >
        {busy ? 'Guardando…' : declining ? 'Enviar mi respuesta' : 'Aceptar la propuesta'}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setDeclining((v) => !v)
          setError(null)
        }}
        className="mt-2 min-h-11 w-full text-sm font-semibold text-white/90 underline underline-offset-2"
      >
        {declining ? 'Volver a la propuesta' : 'Así no me sirve'}
      </button>
    </form>
  )
}

function Document({ data, token, onAnswered }: { data: Proposal; token: string; onAnswered: (state: ProposalState, name: string | null) => void }) {
  return (
    <>
      <div className="mt-10">
        <p className="text-sm font-semibold text-[#3b5bff]">Propuesta para {data.business_name}</p>
        <h1 className="mt-2 text-[1.7rem] leading-tight font-bold text-balance text-slate-900 sm:text-4xl">
          {data.title}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          {data.sent_at ? `Enviada el ${day(data.sent_at)}` : 'Sin enviar'}
          {data.valid_until && data.state !== 'accepted' ? ` · Vigente hasta el ${day(data.valid_until)}` : ''}
        </p>
      </div>

      <Banner data={data} />

      {data.understanding.trim() && (
        <Block title="Lo que entendimos">
          <Text value={data.understanding} />
        </Block>
      )}

      {data.solution.trim() && (
        <Block title="Lo que proponemos">
          <Text value={data.solution} />
        </Block>
      )}

      <Block title="Qué incluye">
        <ul className="space-y-3">
          {data.items.map((item) => (
            <li key={item.title} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-semibold break-words text-slate-900">{item.title}</p>
                <p className="shrink-0 font-semibold text-slate-900">{money(item.amount, data.currency)}</p>
              </div>
              {item.detail && <p className="mt-1 text-sm break-words whitespace-pre-line text-slate-600">{item.detail}</p>}
            </li>
          ))}
        </ul>
      </Block>

      {data.excluded.trim() && (
        <Block title="Qué no incluye">
          <Text value={data.excluded} />
        </Block>
      )}

      <section className="mt-10 rounded-2xl bg-[#3b5bff]/[0.06] p-5">
        <h2 className="text-lg font-bold text-slate-900">Inversión</h2>
        <p className="mt-2 text-3xl font-bold text-slate-900">{money(data.total, data.currency)}</p>
        {data.payments.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-200 border-t border-slate-200">
            {data.payments.map((payment) => (
              <li key={payment.title} className="flex items-start justify-between gap-3 py-3 text-base">
                <span className="min-w-0 break-words text-slate-700">{payment.title}</span>
                <span className="shrink-0 font-semibold text-slate-900">{money(payment.amount, data.currency)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.delivery.trim() && (
        <Block title="Plazo">
          <Text value={data.delivery} />
        </Block>
      )}

      {data.needs.trim() && (
        <Block title="Lo que necesitamos de vos">
          <Text value={data.needs} />
        </Block>
      )}

      {data.terms.trim() && (
        <Block title="Condiciones">
          <div className="text-sm text-slate-600">
            <Text value={data.terms} />
          </div>
        </Block>
      )}

      {data.state === 'sent' && <AnswerBox token={token} onAnswered={onAnswered} />}

      <p className="mt-8 text-xs leading-relaxed text-slate-500">
        Esta propuesta es privada: solo la ve quien tiene el enlace y no aparece en buscadores. Si tenés una duda antes de
        decidir, escribile a Tomás Tropper a tomas@tytsoftware.com.
      </p>
    </>
  )
}

export function ProposalPage() {
  const { token = '' } = useParams()
  const [state, setState] = useState<State>({ status: 'loading' })
  const asked = useRef(false)

  usePageMeta('Tu propuesta | TyT', 'Propuesta privada de TyT Software & Solutions.', { noindex: true })

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
    loadProposal(token, window.location.hash === '#equipo')
      .then((data) => setState(data ? { status: 'ready', data } : { status: 'missing' }))
      .catch(() => setState({ status: 'error' }))
  }, [token])

  function handleAnswered(next: ProposalState, name: string | null) {
    setState((prev) =>
      prev.status === 'ready'
        ? { status: 'ready', data: { ...prev.data, state: next, answered_name: name, answered_at: new Date().toISOString() } }
        : prev,
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-svh bg-slate-50 text-slate-900 normal-case">
      <div className="mx-auto max-w-xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
        <Header />
        {state.status === 'loading' && <p className="mt-16 text-base text-slate-500">Cargando la propuesta…</p>}
        {state.status === 'missing' && (
          <Message title="Esta propuesta no está disponible" text="Puede que el enlace esté incompleto. Pedinos que te lo mandemos de nuevo." />
        )}
        {state.status === 'error' && (
          <Message title="No se pudo cargar la propuesta" text="Probá de nuevo en un minuto. Si sigue igual, escribinos a tomas@tytsoftware.com." />
        )}
        {state.status === 'ready' && <Document data={state.data} token={token} onAnswered={handleAnswered} />}
      </div>
    </div>
  )
}
