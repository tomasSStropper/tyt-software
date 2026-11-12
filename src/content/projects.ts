import type { Lang } from '../i18n/dictionary'

/**
 * PROYECTOS — única fuente de verdad de la galería.
 *
 * Cada proyecto es una pantalla en la sala blanca y una ficha al abrirla.
 *
 * DOS NIVELES DE IMAGEN
 *   `photos` — fotos de banco relacionadas con el rubro (public/stock/).
 *              Con ellas se compone una maqueta de sitio: foto + titular +
 *              barra de navegador, dibujada por src/experience/posters.ts.
 *   `shots`  — capturas REALES del proyecto. Si existen, mandan: se muestran
 *              tal cual, sin composición.
 *
 * CÓMO PONER CAPTURAS REALES
 *   1. Guarda las imágenes en public/projects/ (ideal: .webp, 1600×960, 5:3).
 *   2. Lista sus rutas en `shots`, la primera es la portada de la galería:
 *        shots: ['/projects/savia-1.webp', '/projects/savia-2.webp']
 */

export type PosterStyle = 'dark' | 'green' | 'yellow' | 'blue' | 'grey'

type Localized<T> = Record<Lang, T>

export interface Project {
  id: string
  name: string
  style: PosterStyle
  /** Sitio en producción; null = todavía no se publica */
  url: string | null
  /** Ruta interna con más detalle (solo ArenaDesk) */
  route?: string
  tag: Localized<string>
  info: Localized<string>
  roles: Localized<string[]>
  /** frase corta que encabeza la maqueta (como el titular de su sitio) */
  headline: Localized<string>
  photos: string[]
  shots: string[]
}

export const PROJECTS: Project[] = [
  {
    id: 'arenadesk',
    name: 'ArenaDesk',
    style: 'dark',
    url: null,
    route: '/arenadesk',
    tag: { es: 'Producto propio', en: 'Own product' },
    info: {
      es: 'Gestión white-label para gimnasios y academias deportivas, con IA integrada. Todo bajo la marca de la academia: miembros, pagos, asistencia y clases. En producción con academias reales.',
      en: 'White-label management for gyms and sports academies, with built-in AI. Everything under the academy’s brand: members, payments, attendance and classes. In production with real academies.',
    },
    roles: {
      es: ['Producto', 'Diseño', 'Desarrollo', 'IA'],
      en: ['Product', 'Design', 'Development', 'AI'],
    },
    headline: { es: 'Tu academia manda.', en: 'Your academy calls the shots.' },
    photos: ['/stock/arenadesk-1.webp', '/stock/arenadesk-2.webp', '/stock/arenadesk-3.webp'],
    shots: [],
  },
  {
    id: 'savia',
    name: 'Savia',
    style: 'green',
    url: 'https://saviasacr.com',
    tag: { es: 'Web corporativa', en: 'Corporate site' },
    info: {
      es: 'Presencia digital para asesores en sostenibilidad. Un sitio rápido y claro que explica servicios complejos y convierte visitas en reuniones.',
      en: 'Digital presence for sustainability advisors. A fast, clear site that explains complex services and turns visits into meetings.',
    },
    roles: { es: ['Diseño', 'Desarrollo'], en: ['Design', 'Development'] },
    headline: { es: 'Soluciones basadas en naturaleza.', en: 'Nature-based solutions.' },
    photos: ['/stock/savia-1.webp', '/stock/savia-2.webp', '/stock/savia-3.webp'],
    shots: [],
  },
  {
    id: 'jctours',
    name: 'JC Tours',
    style: 'yellow',
    url: 'https://jctourscr.com',
    tag: { es: 'Turismo', en: 'Tourism' },
    info: {
      es: 'Catálogo de tours con reservas directas, sin intermediarios. El guía es dueño de su canal de ventas y de la relación con cada viajero.',
      en: 'Tour catalog with direct bookings, no middlemen. The guide owns the sales channel and the relationship with every traveler.',
    },
    roles: { es: ['Diseño', 'Desarrollo', 'Reservas'], en: ['Design', 'Development', 'Bookings'] },
    headline: { es: 'Explorá Monteverde.', en: 'Explore Monteverde.' },
    photos: ['/stock/jctours-1.webp', '/stock/jctours-2.webp', '/stock/jctours-3.webp'],
    shots: [],
  },
  {
    id: 'az-inmuebles',
    name: 'AZ Inmuebles',
    style: 'blue',
    url: null,
    tag: { es: 'Plataforma inmobiliaria', en: 'Real estate platform' },
    info: {
      es: 'Catálogo de propiedades autoadministrable en Coto Brus. El dueño publica, edita y da de baja sin depender de nadie.',
      en: 'Self-managed property catalog in Coto Brus. The owner publishes, edits and unlists without depending on anyone.',
    },
    roles: { es: ['Diseño', 'Desarrollo', 'Panel admin'], en: ['Design', 'Development', 'Admin panel'] },
    headline: { es: 'Tu próxima propiedad está en Coto Brus.', en: 'Your next property is in Coto Brus.' },
    photos: ['/stock/az-inmuebles-1.webp', '/stock/az-inmuebles-2.webp', '/stock/az-inmuebles-3.webp'],
    shots: [],
  },
  {
    id: 'humanamente',
    name: 'HumanaMente',
    style: 'grey',
    url: null,
    tag: { es: 'Presencia digital', en: 'Digital presence' },
    info: {
      es: 'Sitio profesional para un consultorio psicológico: cálido, sobrio y pensado para que pedir una cita sea fácil.',
      en: 'Professional site for a psychology practice: warm, sober and built so that booking a session is easy.',
    },
    roles: { es: ['Diseño', 'Desarrollo'], en: ['Design', 'Development'] },
    headline: { es: 'Un espacio para vos.', en: 'A space for you.' },
    photos: ['/stock/humanamente-1.webp', '/stock/humanamente-2.webp', '/stock/humanamente-3.webp'],
    shots: [],
  },
]
