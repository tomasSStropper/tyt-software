import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/usePageMeta'
import { Reveal } from '../components/Reveal'
import niches from '../content/niches.json'

/**
 * Páginas de nicho (turismo, bienes raíces…). Existen para que alguien que
 * busca «página web para tours en Costa Rica» encuentre una página que
 * responde a eso, y no solo la portada. Se publican solo en español, como las
 * legales.
 *
 * Todo el texto vive en src/content/niches.json. Ese mismo archivo lo lee
 * scripts/prerender-meta.mjs para los metadatos y el contenido de arranque,
 * así que la página y lo que ve Google no se pueden desincronizar.
 *
 * Para agregar un nicho: una entrada en niches.json, su rewrite en
 * vercel.json y su línea en public/sitemap.xml. La ruta y el enlace del pie
 * salen solos.
 *
 * Reglas del texto (Oficina de Marca): voseo, sin precios, sin promesas de
 * resultados y sin cifras. Los proyectos que se nombran son los que ya están
 * publicados en la portada, con las mismas palabras.
 */

export type Niche = (typeof niches)[number]

export const NICHES: Niche[] = niches

/** Igual para todos los nichos: es cómo trabaja TyT, no depende del rubro. */
const STEPS = [
  {
    name: 'Llamada de diagnóstico',
    desc: 'Nos contás cómo trabaja hoy tu negocio y de dónde llegan tus clientes. Te decimos con franqueza si te podemos ayudar.',
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

export function NichePage({ niche }: { niche: Niche }) {
  usePageMeta(niche.metaTitle, niche.metaDescription)
  const { project } = niche

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
            <p className="mono-label mt-10 text-coal-text/70">{niche.label}</p>
            <h1 className="display mt-5 max-w-[20ch] text-4xl text-ink sm:text-5xl lg:text-6xl">{niche.title}</h1>
            <p className="mt-6 max-w-xl text-lg text-coal-text/80">{niche.sub}</p>
            <div className="mt-8">
              <TalkCta />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <h2 className="display max-w-[18ch] text-3xl text-ink sm:text-4xl lg:text-5xl">{niche.problemsTitle}</h2>
        </Reveal>
        <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-3">
          {niche.problems.map((item, i) => (
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
              {niche.deliverablesTitle}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <ul className="space-y-6 lg:pt-12">
              {niche.deliverables.map((item) => (
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
          <h2 className="display mt-4 text-3xl text-ink sm:text-4xl lg:text-5xl">{project.name}</h2>
          <p className="mt-6 max-w-2xl text-lg text-ink-soft">{project.desc}</p>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="mono-label mt-6 inline-flex items-center gap-2 text-red-ink transition-colors duration-200 hover:text-ink"
            >
              {project.urlLabel}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
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
          {niche.faq.map((item, i) => (
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
              {niche.finalTitle}
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
