import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/usePageMeta'
import { Reveal } from '../components/Reveal'

/**
 * Página de nicho: sitios web para turismo. Existe para que alguien que busca
 * «página web para tours en Costa Rica» encuentre una página que responde a
 * eso, y no solo la portada. Se publica solo en español, como las legales.
 *
 * Reglas del texto (Oficina de Marca): voseo, sin precios, sin promesas de
 * resultados y sin cifras. El único proyecto que se nombra es uno que ya está
 * publicado en la portada, con las mismas palabras.
 *
 * Si cambian el título o la descripción, cambian también en
 * scripts/prerender-meta.mjs.
 */

export const TURISMO_META = {
  title: 'Sitios web para tours y hospedajes en Costa Rica | TyT',
  description:
    'Diseño de sitios web para tours, cabinas y hoteles en Costa Rica: rápidos en el celular, con reservas directas y contacto por WhatsApp. TyT Software & Solutions.',
}

const PROBLEMS = [
  {
    name: 'El sitio no se ve bien en el celular',
    desc: 'La mayoría de los viajeros busca desde el teléfono. Si el sitio carga lento o hay que hacer zoom para leerlo, se van antes de ver el tour.',
  },
  {
    name: 'Las reservas dependen de terceros',
    desc: 'Los intermediarios traen visitas, pero la relación con el viajero queda del lado de ellos. Un sitio propio con reserva directa te devuelve ese canal.',
  },
  {
    name: 'Las consultas se responden a mano',
    desc: 'Horarios, disponibilidad, cómo llegar. Las mismas preguntas todos los días. Se pueden responder solas y dejarte libre para atender.',
  },
]

const DELIVERABLES = [
  'Un sitio propio, con tu dominio y tu marca, pensado primero para el celular.',
  'Catálogo de tours o habitaciones que podés actualizar sin depender de nadie.',
  'Reserva o consulta directa, y un botón de WhatsApp que abre la conversación con el dato del tour.',
  'Español e inglés, para el viajero que todavía no llegó al país.',
  'Lo básico para que Google te encuentre: títulos claros, datos del negocio y un mapa del sitio.',
]

const STEPS = [
  {
    name: 'Llamada de diagnóstico',
    desc: 'Nos contás cómo trabaja hoy tu negocio y de dónde llegan tus reservas. Te decimos con franqueza si te podemos ayudar.',
  },
  {
    name: 'Propuesta con alcance',
    desc: 'Recibís por escrito qué se va a construir, qué necesitamos de vos y en qué orden. Sin sorpresas después.',
  },
  {
    name: 'Construcción con avances',
    desc: 'Ves el sitio crecer cada semana y corregís a tiempo. Al entregar, te queda todo a tu nombre.',
  },
]

const FAQ = [
  {
    q: '¿Puedo seguir usando Airbnb, Booking o Viator?',
    a: 'Sí. El sitio propio no los reemplaza: se suma. La diferencia es que quien ya te conoce puede reservar directo con vos.',
  },
  {
    q: '¿Quién actualiza el sitio después?',
    a: 'Vos, si querés: queda listo para que cambiés tours, fotos y textos. Y si preferís no tocarlo, lo conversamos en la llamada.',
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'Depende de lo que haga falta, y por eso no hay una lista de precios acá. Después de la llamada de diagnóstico recibís una propuesta con el alcance y el monto.',
  },
  {
    q: '¿Trabajan con negocios fuera de la zona sur?',
    a: 'Sí. Estamos en San Vito, Coto Brus, y trabajamos en línea con negocios de todo Costa Rica.',
  },
]

function TalkCta() {
  return (
    <Link
      to="/#contacto"
      className="group mono-label inline-flex items-center gap-2 border border-red bg-red px-6 py-3.5 text-on-red transition-colors duration-200 hover:border-red-bright hover:bg-red-bright"
    >
      Agendar una llamada
      <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
    </Link>
  )
}

export function TurismoPage() {
  usePageMeta(TURISMO_META.title, TURISMO_META.description)

  return (
    <div lang="es">
      <section className="bg-coal pt-24 pb-16 lg:pt-32 lg:pb-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <Link
              to="/"
              className="mono-label inline-flex items-center gap-2 text-coal-text/70 transition-colors duration-200 hover:text-red-soft"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Volver al inicio
            </Link>
          </Reveal>
          <Reveal delay={80}>
            <p className="mono-label mt-10 text-coal-text/70">Turismo · Costa Rica</p>
            <h1 className="display mt-5 max-w-[20ch] text-4xl text-ink sm:text-5xl lg:text-6xl">
              Sitios web para tours y hospedajes en Costa Rica.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-coal-text/80">
              Un sitio propio, rápido en el celular y con reservas directas. Para que tu negocio no dependa solo de
              los intermediarios.
            </p>
            <div className="mt-8">
              <TalkCta />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <h2 className="display max-w-[18ch] text-3xl text-ink sm:text-4xl lg:text-5xl">
            Lo que más vemos en sitios de turismo.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-3">
          {PROBLEMS.map((item, i) => (
            <Reveal key={item.name} delay={i * 90}>
              <article className="border-t-2 border-ink/70 pt-5">
                <span className="mono-label text-red-ink">0{i + 1}</span>
                <h3 className="display mt-3 text-2xl text-ink">{item.name}</h3>
                <p className="mt-3 text-ink-soft">{item.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-paper-deep py-20 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="mono-label text-mist">Qué entregamos</p>
            <h2 className="display mt-4 max-w-[14ch] text-3xl text-ink sm:text-4xl lg:text-5xl">
              Un sitio que trabaja para tu negocio.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <ul className="space-y-6 lg:pt-12">
              {DELIVERABLES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <ArrowRight size={18} className="mt-1 shrink-0 text-red" aria-hidden="true" />
                  <span className="text-ink-soft">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <p className="mono-label text-mist">Un proyecto nuestro</p>
          <h2 className="display mt-4 text-3xl text-ink sm:text-4xl lg:text-5xl">JC Tours</h2>
          <p className="mt-6 max-w-2xl text-lg text-ink-soft">
            Catálogo de tours con reservas directas, sin intermediarios. El guía es dueño de su canal de ventas y de
            la relación con cada viajero.
          </p>
          <a
            href="https://jctourscr.com"
            target="_blank"
            rel="noreferrer"
            className="mono-label mt-6 inline-flex items-center gap-2 text-red-ink transition-colors duration-200 hover:text-ink"
          >
            Ver jctourscr.com
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </Reveal>
      </section>

      <section className="bg-paper-deep py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <h2 className="display text-3xl text-ink sm:text-4xl lg:text-5xl">Cómo trabajamos.</h2>
          </Reveal>
          <ol className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.name}>
                <Reveal delay={i * 90}>
                  <div className="border-t-2 border-ink/70 pt-5">
                    <span className="mono-label text-red-ink">Paso {i + 1}</span>
                    <h3 className="display mt-3 text-2xl text-ink">{step.name}</h3>
                    <p className="mt-3 text-ink-soft">{step.desc}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <h2 className="display text-3xl text-ink sm:text-4xl">Preguntas frecuentes.</h2>
        </Reveal>
        <dl className="mt-10 space-y-8">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 60}>
              <div className="border-t border-ink/25 pt-5">
                <dt className="display text-xl text-ink">{item.q}</dt>
                <dd className="mt-3 text-ink-soft">{item.a}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      <section className="bg-coal py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
          <Reveal>
            <h2 className="display mx-auto max-w-[18ch] text-3xl text-ink sm:text-4xl lg:text-5xl">
              Contanos cómo llegan hoy tus reservas.
            </h2>
            <div className="mt-8">
              <TalkCta />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
