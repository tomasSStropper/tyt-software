// Después de `vite build`: escribe un HTML por ruta con SU título, descripción
// y URL canónica, y un 404.html que no se indexa.
//
// Por qué: el sitio es una SPA y todas las rutas servían el index.html de la
// portada. Google recibía /arenadesk con el título y la canónica de «/», o
// sea, como un duplicado de la portada; y una dirección inexistente respondía
// 200 en vez de 404. React sigue corrigiendo los metadatos al cargar
// (usePageMeta); esto hace que el HTML inicial ya llegue bien.
//
// Si se agrega una ruta en src/App.tsx, se agrega acá, en vercel.json
// (rewrites) y en public/sitemap.xml.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const ORIGIN = 'https://www.tytsoftware.com'

/** El título de un documento legal es su primer encabezado, igual que en LegalPage. */
function legalTitle(id) {
  const source = readFileSync(join(root, 'src', 'content', 'legal', `${id}.md`), 'utf8')
  const heading = /^#\s+(.+)$/m.exec(source)
  if (!heading) throw new Error(`El documento legal ${id} no tiene título.`)
  return `${heading[1].trim()} | TyT`
}

// Mismos textos (en español) que cada página le pasa a usePageMeta.
const ROUTES = [
  {
    // Mismos textos que TURISMO_META en src/pages/TurismoPage.tsx.
    path: '/sitios-web-turismo',
    title: 'Sitios web para tours y hospedajes en Costa Rica | TyT',
    description:
      'Diseño de sitios web para tours, cabinas y hoteles en Costa Rica: rápidos en el celular, con reservas directas y contacto por WhatsApp. TyT Software & Solutions.',
    // Texto de arranque propio: lo que lee quien no ejecuta JavaScript. Resume
    // la página con sus mismas palabras; si la página cambia, cambia acá.
    body: `
        <p>TyT Software &amp; Solutions — San Vito, Costa Rica</p>
        <h1>Sitios web para tours y hospedajes en Costa Rica.</h1>
        <p>Un sitio propio, rápido en el celular y con reservas directas. Para que tu negocio no dependa solo de los intermediarios.</p>

        <h2>Lo que más vemos en sitios de turismo</h2>
        <ul>
          <li>El sitio no se ve bien en el celular.</li>
          <li>Las reservas dependen de terceros.</li>
          <li>Las consultas se responden a mano.</li>
        </ul>

        <h2>Qué entregamos</h2>
        <ul>
          <li>Un sitio propio, con tu dominio y tu marca, pensado primero para el celular.</li>
          <li>Catálogo de tours o habitaciones que podés actualizar sin depender de nadie.</li>
          <li>Reserva o consulta directa, y un botón de WhatsApp.</li>
          <li>Español e inglés.</li>
        </ul>

        <h2>Un proyecto nuestro</h2>
        <p><a href="https://jctourscr.com">JC Tours</a> — catálogo de tours con reservas directas, sin intermediarios.</p>

        <h2>Contacto</h2>
        <ul>
          <li><a href="https://agenda.tytsoftware.com/">Agendar una llamada</a></li>
          <li><a href="https://wa.me/50670427226">WhatsApp +506 7042 7226</a></li>
          <li><a href="/">Volver al inicio</a></li>
        </ul>
      `,
  },
  {
    path: '/arenadesk',
    title: 'ArenaDesk — Software white-label para academias | TyT',
    description:
      'ArenaDesk: software de gestión white-label para gimnasios y academias deportivas, con IA integrada. Un producto de TyT Software & Solutions.',
  },
  {
    path: '/privacidad-agenda',
    title: legalTitle('privacidad-agenda'),
    description:
      'Política de Privacidad de TyT Agenda: qué datos se recopilan al solicitar una reunión con TyT Software & Solutions, para qué se usan y cómo ejercer sus derechos (Ley 8968).',
  },
  {
    path: '/condiciones-agenda',
    title: legalTitle('condiciones-agenda'),
    description:
      'Condiciones del Servicio de TyT Agenda: cómo funcionan las solicitudes de reunión con TyT Software & Solutions.',
  },
]

const NOT_FOUND = {
  title: 'Página no encontrada | TyT',
  description: 'Esta página no existe.',
}

const attr = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Cambia el atributo `name` de la etiqueta que calza con `selector`. Falla si no la encuentra. */
function setAttr(html, selector, name, value) {
  const tag = new RegExp(`<(?:meta|link)\\b[^>]*${selector}[^>]*>`, 'i')
  const found = tag.exec(html)
  if (!found) throw new Error(`No se encontró la etiqueta ${selector} en index.html.`)
  const updated = found[0].replace(new RegExp(`(\\b${name}=")[^"]*(")`), `$1${attr(value)}$2`)
  if (updated === found[0] && !found[0].includes(`${name}="${attr(value)}"`)) {
    throw new Error(`La etiqueta ${selector} no tiene el atributo ${name}.`)
  }
  return html.replace(found[0], updated)
}

/** Reemplaza el contenido de arranque (div.prerender) por el propio de la ruta. */
function setBody(html, body) {
  const block = /(<div class="prerender">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/body>)/
  if (!block.test(html)) throw new Error('No se encontró el bloque prerender en index.html.')
  return html.replace(block, (_, open, close) => `${open}${body}${close}`)
}

function render(base, { title, description, url, body, noindex = false }) {
  let html = base.replace(/<title>[^<]*<\/title>/i, `<title>${attr(title)}</title>`)
  html = setAttr(html, 'name="description"', 'content', description)
  html = setAttr(html, 'property="og:title"', 'content', title)
  html = setAttr(html, 'property="og:description"', 'content', description)
  html = setAttr(html, 'name="twitter:title"', 'content', title)
  html = setAttr(html, 'name="twitter:description"', 'content', description)
  if (url) {
    html = setAttr(html, 'rel="canonical"', 'href', url)
    html = setAttr(html, 'property="og:url"', 'content', url)
  }
  if (noindex) html = setAttr(html, 'name="robots"', 'content', 'noindex, follow')
  if (body) html = setBody(html, body)
  return html
}

const base = readFileSync(join(dist, 'index.html'), 'utf8')

for (const route of ROUTES) {
  const dir = join(dist, route.path)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), render(base, { ...route, url: ORIGIN + route.path }))
}
writeFileSync(join(dist, '404.html'), render(base, { ...NOT_FOUND, noindex: true }))

console.log(`Metadatos por ruta: ${ROUTES.map((r) => r.path).join(', ')} y 404.html`)
