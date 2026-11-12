import { PROJECTS } from '../content/projects'

/**
 * LÍNEA DE TIEMPO DEL RECORRIDO
 *
 * Todo el sitio es un solo scroll. La unidad es "u" = un alto de pantalla.
 * `s` = scrollY / u. Tanto el motor WebGL como el DOM leen estas mismas marcas,
 * así el texto y la escena nunca se desincronizan.
 *
 *   0 ─ hero ─ galería ─ portal ─ túnel ─────── ciudad ───── rojo ─ contacto
 *        s=0   first…    portal   tunnel        city               contact
 */
const n = PROJECTS.length

/** separación entre pantallas de la galería */
const GAP = 0.84
/** del holograma a la primera pantalla */
const HERO_SPAN = 1.02

const first = HERO_SPAN
const portal = first + n * GAP
const tunnel = portal + 0.75
const TUNNEL_LEN = 3.4
const city = tunnel + TUNNEL_LEN
const CITY_LEN = 3.7
const contact = city + CITY_LEN

export const TL = {
  n,
  gap: GAP,
  /** s donde queda centrada la pantalla del proyecto i */
  panel: (i: number) => first + i * GAP,
  first,
  /** s donde queda centrada la pantalla-portal (la que se vuelve túnel) */
  portal,
  /** el portal ya llena la pantalla: empieza el túnel */
  tunnel,
  /** duración del barrido túnel → ciudad, termina en `city` */
  wipe: 0.55,
  city,
  /** fundido a negro: empieza justo cuando el contacto asoma por abajo… */
  fadeStart: contact - 1.05,
  /** …y termina antes de que su titular llegue al centro */
  fadeEnd: contact - 0.45,
  contact,
  /** alto total del documento, en u */
  total: contact + 1,

  /** posición (top, en u) de los bloques de texto dentro del recorrido */
  blocks: {
    services: tunnel + 0.95,
    arenadesk: tunnel + 2.25,
    process: city + 0.75,
  },
} as const

/** A dónde salta cada ancla (#hash) del menú, en u */
export const ANCHORS = {
  inicio: 0,
  proyectos: TL.first,
  servicios: TL.blocks.services - 0.38,
  arenadesk: TL.blocks.arenadesk - 0.38,
  proceso: TL.blocks.process - 0.38,
  contacto: TL.contact,
} as const

export type AnchorId = keyof typeof ANCHORS
