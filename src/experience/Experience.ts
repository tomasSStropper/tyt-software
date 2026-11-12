import * as THREE from 'three'
import type { Project } from '../content/projects'
import type { Lang } from '../i18n/dictionary'
import { TL } from './timeline'
import { getUnit, onUnitChange } from './unit'
import {
  HERO_FRAG,
  PANEL_MARGIN,
  PANEL_VERT,
  POST_FRAG,
  POST_VERT,
  PROJECT_FRAG,
  ROOM_FRAG,
  ROOM_VERT,
} from './shaders'
import {
  LABEL_H,
  LABEL_W,
  POSTER_H,
  POSTER_W,
  renderPoster,
  fontsReady,
  makeFloorCanvas,
  makeGridCanvas,
  makeLabelCanvas,
} from './posters'
import { buildCity, buildTunnel, type World } from './worlds'

/**
 * MOTOR DE LA EXPERIENCIA
 *
 * Un solo lienzo WebGL fijo detrás del DOM. Cada frame:
 *   1. lee el scroll y lo convierte en `s` (pantallas recorridas)
 *   2. decide qué mundo toca (galería / túnel / ciudad) según timeline.ts
 *   3. dibuja ese mundo en baja resolución (los "píxeles gordos")
 *   4. pasa el resultado por el shader CRT y lo pone en pantalla
 */

export interface ExperienceOptions {
  canvas: HTMLCanvasElement
  projects: Project[]
  lang: Lang
  onProgress?: (p: number) => void
}

interface Panel {
  kind: 'hero' | 'project' | 'portal'
  index: number
  mesh: THREE.Mesh
  mat: THREE.ShaderMaterial
  /** s en el que queda centrado */
  s: number
  side: number
  w: number
  h: number
  x: number
  y: number
  glitch: number
}

const AVATAR = '/characters/tyt-avatar.webp'
/** Posición de los ojos en la imagen del robot (ver HERO_FRAG) */
const EYE_TRAVEL = 0.011

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const bump = (x: number, center: number, width: number) => Math.exp(-(((x - center) / width) ** 2))
const frame = () => new Promise<void>((res) => requestAnimationFrame(() => res()))

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => res(img)
    img.onerror = () => rej(new Error(`no se pudo cargar ${src}`))
    img.src = src
  })
}

export class Experience {
  private renderer: THREE.WebGLRenderer
  private canvas: HTMLCanvasElement
  private projects: Project[]
  private lang: Lang
  private posters: Array<{ canvas: HTMLCanvasElement; tex: THREE.CanvasTexture; project: Project }> = []

  // galería
  private gScene = new THREE.Scene()
  private gCam = new THREE.PerspectiveCamera(45, 1, 0.1, 60)
  private room!: THREE.ShaderMaterial
  private panels: Panel[] = []
  private hero!: Panel
  private portal!: Panel
  private avatarImg!: HTMLImageElement
  private gridTex: THREE.CanvasTexture | null = null
  private readonly D = 6

  // mundos
  private tunnel!: World
  private city!: World

  // post
  private rtA: THREE.WebGLRenderTarget
  private rtB: THREE.WebGLRenderTarget
  private rtPortal: THREE.WebGLRenderTarget
  private postScene = new THREE.Scene()
  private postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private post!: THREE.ShaderMaterial

  // estado
  private w = 1
  private h = 1
  private aspect = 1
  private V = 1
  private s = 0
  private sTarget = 0
  private vel = 0
  private time = 0
  private last = 0
  private raf = 0
  private running = false
  private pointer = new THREE.Vector2(0, 0)
  private pointerSmooth = new THREE.Vector2(0, 0)
  private hasPointer = false
  private hover = -1
  private dim = 1
  private dimTarget = 1
  private boot = 0
  private barrel = 0.2
  private burst = 0
  private nextBurst = 3
  private layoutKey = ''
  private paused = false
  private pauseTimer = 0
  // calidad adaptativa: si el equipo no llega a ~30 fps se baja la resolución interna
  private quality = 1
  private frameAvg = 0.016
  private frameCount = 0
  private raycaster = new THREE.Raycaster()
  private cleanup: Array<() => void> = []

  static async create(opts: ExperienceOptions): Promise<Experience> {
    const exp = new Experience(opts)
    await exp.build(opts.onProgress ?? (() => {}))
    return exp
  }

  private constructor(opts: ExperienceOptions) {
    this.canvas = opts.canvas
    this.projects = opts.projects
    this.lang = opts.lang
    // Los colores se escriben tal cual se ven (sin conversión de espacio de color):
    // es una imagen estilizada, no una simulación física de luz.
    THREE.ColorManagement.enabled = false
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace
    this.renderer.setClearColor(0x050505, 1)

    const rt = (w: number, h: number) => {
      const t = new THREE.WebGLRenderTarget(w, h, { depthBuffer: true })
      t.texture.minFilter = THREE.NearestFilter
      t.texture.magFilter = THREE.NearestFilter
      t.texture.colorSpace = THREE.NoColorSpace
      return t
    }
    this.rtA = rt(4, 4)
    this.rtB = rt(4, 4)
    this.rtPortal = rt(560, 336)
    this.rtPortal.texture.minFilter = THREE.LinearFilter
    this.rtPortal.texture.magFilter = THREE.LinearFilter
  }

  // ── Construcción ──────────────────────────────────────────
  private async build(progress: (p: number) => void) {
    progress(0.05)
    const [img] = await Promise.all([loadImage(AVATAR), fontsReady()])
    this.avatarImg = img
    progress(0.3)
    await frame()

    this.buildGallery()
    progress(0.45)
    // las portadas se componen con su foto antes de quitar el loader
    await this.paintPosters()
    progress(0.6)
    await frame()

    this.tunnel = buildTunnel()
    progress(0.75)
    await frame()

    this.city = buildCity()
    progress(0.9)
    await frame()

    this.post = new THREE.ShaderMaterial({
      vertexShader: POST_VERT,
      fragmentShader: POST_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tA: { value: this.rtA.texture },
        tB: { value: this.rtB.texture },
        uMix: { value: 0 },
        uBarrel: { value: 0.2 },
        uGlitch: { value: 0 },
        uWater: { value: 0 },
        uFade: { value: 1 },
        uTime: { value: 0 },
        uLow: { value: new THREE.Vector2(1, 1) },
      },
    })
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.post)
    quad.frustumCulled = false
    this.postScene.add(quad)

    this.resize()
    this.bind()

    // primer frame completo: compila todos los shaders antes de quitar el loader
    this.s = this.sTarget = window.scrollY / getUnit()
    this.renderer.compile(this.tunnel.scene, this.tunnel.camera)
    this.renderer.compile(this.city.scene, this.city.camera)
    this.render(0)
    progress(1)
  }

  private texFromCanvas(c: HTMLCanvasElement): THREE.CanvasTexture {
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.NoColorSpace
    t.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy())
    t.generateMipmaps = true
    t.minFilter = THREE.LinearMipmapLinearFilter
    return t
  }

  private buildGallery() {
    // fondo de la sala: un triángulo a pantalla completa dibujado primero
    const floor = this.texFromCanvas(makeFloorCanvas())
    floor.wrapS = floor.wrapT = THREE.RepeatWrapping
    this.room = new THREE.ShaderMaterial({
      vertexShader: ROOM_VERT,
      fragmentShader: ROOM_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uFloor: { value: floor },
        uRes: { value: new THREE.Vector2(1, 1) },
        uScroll: { value: 0 },
        uTime: { value: 0 },
      },
    })
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.room)
    bg.frustumCulled = false
    bg.renderOrder = -10
    this.gScene.add(bg)

    const geo = new THREE.PlaneGeometry(1, 1, 28, 14)
    const shared = () => ({
      uTime: { value: 0 },
      uGlitch: { value: 0 },
      uRipple: { value: 0 },
      uBend: { value: 0 },
    })

    // 1) holograma
    const avatar = new THREE.Texture(this.avatarImg)
    avatar.colorSpace = THREE.NoColorSpace
    avatar.minFilter = THREE.LinearFilter
    avatar.magFilter = THREE.LinearFilter
    avatar.generateMipmaps = false
    avatar.needsUpdate = true
    const heroMat = new THREE.ShaderMaterial({
      vertexShader: PANEL_VERT,
      fragmentShader: HERO_FRAG,
      uniforms: {
        ...shared(),
        uImg: { value: avatar },
        uGrid: { value: null },
        uRect: { value: new THREE.Vector4(0, 0, 1, 1) },
        uAspect: { value: 1 },
        uEye: { value: new THREE.Vector2(0, 0) },
        uBoot: { value: 0 },
      },
    })
    this.hero = this.addPanel('hero', -1, geo, heroMat, 0, 0)

    // 2) proyectos
    this.projects.forEach((p, i) => {
      let tex: THREE.Texture
      let texAspect = POSTER_W / POSTER_H
      if (p.shots.length > 0) {
        tex = new THREE.TextureLoader().load(p.shots[0], (t) => {
          const im = t.image as HTMLImageElement
          texAspect = im.width / im.height
          this.fitTexture(panel, texAspect)
        })
        tex.colorSpace = THREE.NoColorSpace
      } else {
        const c = document.createElement('canvas')
        c.width = POSTER_W
        c.height = POSTER_H
        const ct = this.texFromCanvas(c)
        this.posters.push({ canvas: c, tex: ct, project: p })
        tex = ct
      }
      const label = this.texFromCanvas(makeLabelCanvas(p.name.toUpperCase()))
      const mat = new THREE.ShaderMaterial({
        vertexShader: PANEL_VERT,
        fragmentShader: PROJECT_FRAG,
        uniforms: {
          ...shared(),
          uTex: { value: tex },
          uLabel: { value: label },
          uTexScale: { value: new THREE.Vector2(1, 1) },
          uLabelA: { value: 0 },
          uLabelH: { value: 0.2 },
          uHover: { value: 0 },
          uFlipY: { value: 0 },
        },
      })
      const panel = this.addPanel('project', i, geo, mat, TL.panel(i), i % 2 === 0 ? 1 : -1)
      panel.mesh.userData.texAspect = texAspect
    })

    // 3) portal: una pantalla que muestra el túnel en vivo y termina tragándose la cámara
    const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1)
    blank.needsUpdate = true
    const portalMat = new THREE.ShaderMaterial({
      vertexShader: PANEL_VERT,
      fragmentShader: PROJECT_FRAG,
      uniforms: {
        ...shared(),
        uTex: { value: this.rtPortal.texture },
        uLabel: { value: blank },
        uTexScale: { value: new THREE.Vector2(1, 1) },
        uLabelA: { value: 0 },
        uLabelH: { value: 0.2 },
        uHover: { value: 0 },
        uFlipY: { value: 0 },
      },
    })
    this.portal = this.addPanel('portal', -1, geo, portalMat, TL.portal, TL.n % 2 === 0 ? 1 : -1)
  }

  private async paintPosters() {
    await Promise.all(
      this.posters.map(async (po) => {
        await renderPoster(po.canvas, po.project, 0, this.lang)
        po.tex.needsUpdate = true
      }),
    )
  }

  /** Al cambiar de idioma se vuelven a componer los titulares de las portadas. */
  setLang(lang: Lang) {
    if (lang === this.lang) return
    this.lang = lang
    void this.paintPosters()
  }

  private addPanel(
    kind: Panel['kind'],
    index: number,
    geo: THREE.BufferGeometry,
    mat: THREE.ShaderMaterial,
    s: number,
    side: number,
  ): Panel {
    const mesh = new THREE.Mesh(geo, mat)
    mesh.frustumCulled = false
    this.gScene.add(mesh)
    const p: Panel = { kind, index, mesh, mat, s, side, w: 1, h: 1, x: 0, y: 0, glitch: 0 }
    this.panels.push(p)
    return p
  }

  private fitTexture(p: Panel, texAspect: number) {
    const pa = p.w / p.h
    const sc = p.mat.uniforms.uTexScale.value as THREE.Vector2
    if (texAspect > pa) sc.set(pa / texAspect, 1)
    else sc.set(1, texAspect / pa)
  }

  // ── Tamaño y distribución ────────────────────────────────
  private resize = () => {
    const w = window.innerWidth
    const h = Math.max(window.innerHeight, getUnit())
    this.w = w
    this.h = h
    this.aspect = w / h
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(w, h, false)

    // resolución interna: ~60% de los píxeles reales, entre 600 y 1000 filas
    const lh = Math.round(Math.max(340, clamp(h * dpr * 0.6, 600, 1000) * this.quality))
    const lw = Math.max(2, Math.round(lh * this.aspect))
    this.rtA.setSize(lw, lh)
    this.rtB.setSize(lw, lh)
    ;(this.post.uniforms.uLow.value as THREE.Vector2).set(lw, lh)
    ;(this.room.uniforms.uRes.value as THREE.Vector2).set(lw, lh)

    this.gCam.aspect = this.aspect
    this.gCam.updateProjectionMatrix()
    this.V = 2 * this.D * Math.tan(THREE.MathUtils.degToRad(this.gCam.fov / 2))
    // la distribución (y la rejilla del holograma) solo se rehace si cambia el ancho
    // o la orientación: la barra del navegador móvil cambia el alto a cada rato
    const key = `${w}x${getUnit()}`
    if (key !== this.layoutKey) {
      this.layoutKey = key
      this.layout()
    }
  }

  private layout() {
    const V = this.V
    const visW = V * this.aspect
    const portrait = this.aspect < 0.8

    // holograma: en vertical llena el ancho; en horizontal es un monitor centrado
    const hero = this.hero
    hero.h = portrait ? V * 0.84 : V * 0.8
    hero.w = portrait ? visW * 1.04 : Math.min(visW * 0.62, hero.h * 1.28)
    hero.x = 0
    hero.y = portrait ? V * 0.075 : V * 0.02
    const ha = hero.w / hero.h
    hero.mat.uniforms.uAspect.value = ha
    // el robot (imagen cuadrada) ocupa algo más que el alto del panel, cabeza arriba
    const imgH = portrait ? 0.9 : 1.02
    const imgW = imgH / ha
    // 0.487 = centro de la cabeza en la imagen: así el monitor queda al medio del panel
    const rect = { x: 0.5 - 0.487 * imgW, y: 0.865 - imgH, w: imgW, h: imgH }
    ;(hero.mat.uniforms.uRect.value as THREE.Vector4).set(rect.x, rect.y, rect.w, rect.h)
    this.gridTex?.dispose()
    this.gridTex = this.texFromCanvas(makeGridCanvas(this.avatarImg, ha, rect))
    hero.mat.uniforms.uGrid.value = this.gridTex

    // pantallas de proyecto en zigzag
    const pw = portrait ? visW * 0.94 : Math.min(visW * 0.47, V * 0.98)
    const ph = pw * 0.6
    const off = portrait ? visW * 0.02 : visW * 0.2
    for (const p of this.panels) {
      if (p.kind === 'hero') {
        p.mesh.scale.set(p.w * PANEL_MARGIN, p.h * PANEL_MARGIN, 1)
        continue
      }
      p.w = pw
      p.h = ph
      p.x = p.kind === 'portal' ? p.side * off * 0.35 : p.side * off
      p.y = -p.s * V
      p.mesh.scale.set(pw * PANEL_MARGIN, ph * PANEL_MARGIN, 1)
      p.mat.uniforms.uLabelH.value = (0.84 * (LABEL_H / LABEL_W)) / (ph / pw)
      if (p.kind === 'project') this.fitTexture(p, (p.mesh.userData.texAspect as number) ?? POSTER_W / POSTER_H)
    }
  }

  // ── Eventos ───────────────────────────────────────────────
  private bind() {
    const onMove = (e: PointerEvent) => {
      this.pointer.set((e.clientX / this.w) * 2 - 1, -((e.clientY / this.h) * 2 - 1))
      this.hasPointer = true
      if (e.pointerType === 'mouse') this.hover = this.pick(e.clientX, e.clientY) ?? -1
    }
    const onVis = () => (document.hidden ? this.stop() : !this.paused && this.start())
    // En móviles el sistema puede quitarle el contexto gráfico a una pestaña en
    // segundo plano. preventDefault() pide que lo devuelva; three.js vuelve a
    // subir texturas y shaders solo cuando regresa.
    const onLost = (e: Event) => {
      e.preventDefault()
      this.stop()
    }
    const onRestored = () => {
      if (!this.paused && !document.hidden) this.start()
    }
    this.canvas.addEventListener('webglcontextlost', onLost)
    this.canvas.addEventListener('webglcontextrestored', onRestored)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    window.addEventListener('resize', this.resize)
    document.addEventListener('visibilitychange', onVis)
    const offUnit = onUnitChange(this.resize)
    this.cleanup.push(
      () => window.removeEventListener('pointermove', onMove),
      () => window.removeEventListener('pointerdown', onMove),
      () => window.removeEventListener('resize', this.resize),
      () => document.removeEventListener('visibilitychange', onVis),
      () => this.canvas.removeEventListener('webglcontextlost', onLost),
      () => this.canvas.removeEventListener('webglcontextrestored', onRestored),
      offUnit,
    )
  }

  /** ¿Sobre qué proyecto está este punto de la pantalla? (null = ninguno) */
  pick(clientX: number, clientY: number): number | null {
    if (this.s > TL.portal - 0.1) return null
    // el tubo curva la imagen: hay que curvar igual el punto antes de lanzar el rayo
    const ux = clientX / this.w - 0.5
    const uy = 1 - clientY / this.h - 0.5
    const k = this.barrel
    const f = (1 + k * (ux * ux + uy * uy)) / (1 + k * 0.5)
    const ndc = new THREE.Vector2(ux * f * 2, uy * f * 2)
    this.raycaster.setFromCamera(ndc, this.gCam)
    const meshes = this.panels.filter((p) => p.kind === 'project').map((p) => p.mesh)
    const hit = this.raycaster.intersectObjects(meshes, false)[0]
    if (!hit || !hit.uv) return null
    const cx = (hit.uv.x - 0.5) * PANEL_MARGIN + 0.5
    const cy = (hit.uv.y - 0.5) * PANEL_MARGIN + 0.5
    if (cx < 0 || cx > 1 || cy < 0 || cy > 1) return null
    return this.panels.find((p) => p.mesh === hit.object)?.index ?? null
  }

  /** índice del proyecto bajo el cursor, o -1 */
  get hovered(): number {
    return this.hover
  }

  /** Atenúa la escena cuando hay una capa abierta encima (0..1). */
  setDim(v: number) {
    this.dimTarget = v
  }

  /** Con una capa abierta encima, tras el fundido se detiene el dibujo. */
  setPaused(paused: boolean) {
    this.paused = paused
    window.clearTimeout(this.pauseTimer)
    if (paused) this.pauseTimer = window.setTimeout(() => this.paused && this.stop(), 600)
    else if (!document.hidden) this.start()
  }

  // ── Bucle ─────────────────────────────────────────────────
  start() {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    const tick = (now: number) => {
      if (!this.running) return
      const dt = Math.min(0.05, (now - this.last) / 1000)
      this.last = now
      this.render(dt)
      this.raf = requestAnimationFrame(tick)
    }
    this.raf = requestAnimationFrame(tick)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  private render(dt: number) {
    this.time += dt
    if (dt > 0) {
      this.frameAvg += (dt - this.frameAvg) * 0.06
      if (++this.frameCount > 100 && this.frameAvg > 0.032 && this.quality > 0.55) {
        this.quality *= 0.8
        this.frameCount = 0
        this.resize()
      }
    }
    const t = this.time
    const u = getUnit()

    // scroll suavizado: la cámara persigue al dedo en vez de pegarse a él
    const target = window.scrollY / u
    const dv = dt > 0 ? (target - this.sTarget) / dt : 0
    this.sTarget = target
    this.vel += (dv - this.vel) * clamp(dt * 8)
    this.s += (this.sTarget - this.s) * (dt > 0 ? 1 - Math.exp(-dt * 9) : 1)
    const s = this.s
    const speed = clamp(Math.abs(this.vel) * 0.45)

    this.pointerSmooth.lerp(this.pointer, clamp(dt * 5))
    this.dim += (this.dimTarget - this.dim) * clamp(dt * 6)
    this.boot = clamp(this.boot + dt * 0.9)

    // ráfagas espontáneas de interferencia
    this.nextBurst -= dt
    if (this.nextBurst <= 0) {
      this.burst = 1
      this.nextBurst = 2.5 + Math.random() * 5
    }
    this.burst = Math.max(0, this.burst - dt * 5)

    const P = this.post.uniforms
    P.uTime.value = t
    let glitch = speed * 0.35 + this.burst * 0.35
    let water = 0
    let fade = 1
    let mix = 0
    let barrel = 0.2
    const r = this.renderer

    if (s < TL.tunnel) {
      // ── Galería ──
      const zoom = smooth(TL.portal - 0.04, TL.tunnel, s)
      barrel = lerp(0.2, 0, zoom)
      glitch += bump(s, TL.tunnel, 0.09) * 0.9
      this.updateGallery(s, t, speed, zoom)

      if (s > TL.portal - 1.3) {
        this.tunnel.camera.fov = this.tunnelFov()
        this.tunnel.camera.aspect = this.portal.w / this.portal.h
        this.tunnel.camera.updateProjectionMatrix()
        this.tunnel.update(0, t)
        r.setRenderTarget(this.rtPortal)
        r.render(this.tunnel.scene, this.tunnel.camera)
      }
      r.setRenderTarget(this.rtA)
      r.render(this.gScene, this.gCam)
    } else if (s < TL.city) {
      // ── Túnel ──
      const c = (s - TL.tunnel) / (TL.city - TL.tunnel)
      barrel = 0.07 * smooth(TL.tunnel, TL.tunnel + 0.35, s)
      glitch += bump(s, TL.tunnel, 0.09) * 0.9 + bump(s, TL.city, 0.12) * 0.5
      this.tunnel.camera.fov = this.tunnelFov()
      this.tunnel.camera.aspect = this.aspect
      this.tunnel.camera.updateProjectionMatrix()
      this.tunnel.update(c, t)
      r.setRenderTarget(this.rtA)
      r.render(this.tunnel.scene, this.tunnel.camera)

      const w0 = TL.city - TL.wipe
      if (s > w0) {
        mix = (s - w0) / TL.wipe
        this.renderCity(s, t, this.rtB)
        water = 0.3 * mix
      }
    } else {
      // ── Ciudad → pabellón rojo → negro ──
      barrel = 0.07
      water = 0.3
      this.renderCity(s, t, this.rtA)
      glitch += bump(s, TL.city, 0.12) * 0.5 + bump(s, TL.fadeStart + 0.3, 0.2) * 0.8
      fade = 1 - smooth(TL.fadeStart, TL.fadeEnd, s)
      if (s > TL.fadeEnd) {
        // detrás del contacto el pabellón "respira": aparece y se apaga despacio
        const breath = 0.5 - 0.5 * Math.cos(t * 0.42)
        fade = (0.1 + 0.2 * breath * breath) * smooth(TL.fadeEnd, TL.contact - 0.05, s)
        glitch *= 0.4
      }
    }

    this.barrel = barrel
    P.uBarrel.value = barrel
    P.uGlitch.value = clamp(glitch)
    P.uWater.value = water
    P.uMix.value = mix
    P.uFade.value = fade * this.dim
    r.setRenderTarget(null)
    r.render(this.postScene, this.postCam)
  }

  /** en vertical el túnel abre más el ángulo para que se vean los costados */
  private tunnelFov(): number {
    return this.aspect < 0.8 ? 66 : 52
  }

  private renderCity(s: number, t: number, target: THREE.WebGLRenderTarget) {
    const c0 = TL.city - TL.wipe
    const c = clamp((s - c0) / (TL.contact - c0))
    this.city.camera.aspect = this.aspect
    this.city.camera.updateProjectionMatrix()
    this.city.update(c, t)
    this.renderer.setRenderTarget(target)
    this.renderer.render(this.city.scene, this.city.camera)
  }

  private updateGallery(s: number, t: number, speed: number, zoom: number) {
    const V = this.V
    const sg = Math.min(s, TL.portal)
    const camY = -sg * V
    const portal = this.portal
    const px = this.pointerSmooth.x
    const py = this.pointerSmooth.y

    // al llegar al portal la cámara deja de bajar y se mete en la pantalla
    const fovT = Math.tan(THREE.MathUtils.degToRad(this.gCam.fov / 2))
    const fill = Math.min(portal.h / (2 * fovT), portal.w / (2 * fovT * this.aspect)) * 0.985
    const e = zoom * zoom * (3 - 2 * zoom)
    this.gCam.position.set(lerp(px * 0.12, portal.x, e), camY + py * 0.08 * (1 - e), lerp(this.D, fill, e))
    this.gCam.rotation.set(0, 0, 0)

    this.room.uniforms.uScroll.value = sg
    this.room.uniforms.uTime.value = t

    for (const p of this.panels) {
      const ny = (p.y - camY) / V
      const visible = Math.abs(ny) < 1.25
      p.mesh.visible = visible
      if (!visible) continue
      const U = p.mat.uniforms
      U.uTime.value = t

      // cada pantalla se sacude al cruzar el borde de la pantalla y con la velocidad
      const crossing = bump(Math.abs(ny), 0.62, 0.16)
      const targetGlitch = clamp(speed * 0.9 + crossing * speed * 1.5 + this.burst * (p.kind === 'hero' ? 0.25 : 0.12))
      p.glitch += (targetGlitch - p.glitch) * 0.2
      U.uGlitch.value = p.glitch
      U.uRipple.value = smooth(-0.22, -0.55, ny) * 0.9 + smooth(0.3, 0.6, ny) * 0.5 * speed

      if (p.kind === 'hero') {
        p.mesh.position.set(p.x, p.y, 0)
        p.mesh.rotation.set(ny * 0.5 - py * 0.03, px * 0.05, ny * 0.1)
        U.uBend.value = 0.1
        U.uBoot.value = this.boot
        // las pupilas siguen al cursor; sin cursor, miran alrededor por su cuenta
        const ex = this.hasPointer ? px : Math.sin(t * 0.7) * 0.7
        const ey = this.hasPointer ? py - ny * 2 : Math.sin(t * 0.45) * 0.4 - s * 1.5
        ;(U.uEye.value as THREE.Vector2).set(clamp(ex, -1, 1) * EYE_TRAVEL, clamp(ey, -1, 1) * EYE_TRAVEL * 0.8)
        continue
      }

      const flat = p.kind === 'portal' ? 1 - e : 1
      p.mesh.position.set(p.x, p.y, 0)
      p.mesh.rotation.set(
        ny * 0.62 * flat,
        p.side * (-0.2 - ny * 0.34) * flat,
        p.side * (0.05 - ny * 0.3) * flat,
      )
      U.uBend.value = 0.12 * flat
      if (p.kind === 'project') {
        U.uLabelA.value = smooth(0.5, 0.2, Math.abs(ny))
        const h = this.hover === p.index ? 1 : 0
        U.uHover.value += (h - U.uHover.value) * 0.18
      }
    }
  }

  dispose() {
    this.stop()
    window.clearTimeout(this.pauseTimer)
    this.cleanup.forEach((fn) => fn())
    this.panels.forEach((p) => {
      Object.values(p.mat.uniforms).forEach((un) => {
        const v = un.value as THREE.Texture | undefined
        if (v && (v as THREE.Texture).isTexture && v !== this.rtPortal.texture) v.dispose()
      })
      p.mat.dispose()
    })
    this.panels[0]?.mesh.geometry.dispose()
    this.tunnel?.dispose()
    this.city?.dispose()
    this.rtA.dispose()
    this.rtB.dispose()
    this.rtPortal.dispose()
    this.post?.dispose()
    this.room?.dispose()
    this.renderer.dispose()
  }
}
