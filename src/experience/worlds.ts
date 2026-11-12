import * as THREE from 'three'
import { makeSignCanvas } from './posters'

/**
 * MUNDOS 3D PROCEDURALES
 *
 * Ninguno usa modelos ni fotos: todo son cajas y cilindros colocados por
 * código con InstancedMesh (miles de copias de una misma geometría en una
 * sola llamada de dibujo — por eso corre fluido en un teléfono).
 *
 *   buildTunnel(): pasillo de circuito — rieles, chips con LED verde, disipadores
 *   buildCity():   cañón de bloques azul niebla que termina en el pabellón rojo de TyT
 */

export interface World {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  /** c = avance 0..1 dentro del mundo; t = segundos */
  update(c: number, t: number): void
  dispose(): void
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Acumula instancias y las convierte en un solo InstancedMesh. */
class Batch {
  private m: THREE.Matrix4[] = []
  private c: THREE.Color[] = []
  private static d = new THREE.Object3D()

  add(x: number, y: number, z: number, sx: number, sy: number, sz: number, color: number, rx = 0, ry = 0, rz = 0) {
    const d = Batch.d
    d.position.set(x, y, z)
    d.rotation.set(rx, ry, rz)
    d.scale.set(sx, sy, sz)
    d.updateMatrix()
    this.m.push(d.matrix.clone())
    this.c.push(new THREE.Color(color))
  }

  build(geo: THREE.BufferGeometry, mat: THREE.Material): THREE.InstancedMesh {
    const mesh = new THREE.InstancedMesh(geo, mat, this.m.length)
    this.m.forEach((mm, i) => {
      mesh.setMatrixAt(i, mm)
      mesh.setColorAt(i, this.c[i])
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.frustumCulled = false
    return mesh
  }
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.geometry) m.geometry.dispose()
    const mat = m.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
    else if (mat) {
      const map = (mat as THREE.MeshBasicMaterial).map
      if (map) map.dispose()
      mat.dispose()
    }
  })
}


/**
 * AGENTES — mini robots de TyT (monitor por cabeza, traje, ojos rojos).
 *
 * Cada uno son 12 cajas. Cuando la cámara se acerca giran para mirarla,
 * dan un saltito y levantan el brazo derecho para saludar. Como las cajas
 * son instancias, mover a todos cuesta casi nada: solo se recalculan
 * matrices (posiciones), no se crea geometría nueva.
 */
class Agents {
  private list: Array<{ x: number; y: number; z: number; s: number; ph: number }> = []
  private lit: THREE.InstancedMesh | null = null
  private glow: THREE.InstancedMesh | null = null
  private root = new THREE.Object3D()
  private pivot = new THREE.Object3D()
  private part = new THREE.Object3D()
  private m = new THREE.Matrix4()
  private static LIT = 10
  private static GLOW = 2
  private static SUIT = 0x4b5059
  /** color de cada caja iluminada, en el orden en que se colocan en `pose` */
  private static COLORS = [0x23262a, 0x23262a, Agents.SUIT, 0xe6e2d6, 0xc8190f, 0xcfc4aa, 0xd9d2bd, 0x121110, Agents.SUIT, Agents.SUIT]

  add(x: number, y: number, z: number, scale: number, phase: number) {
    this.list.push({ x, y, z, s: scale, ph: phase })
  }

  build(box: THREE.BufferGeometry, litMat: THREE.Material, glowMat: THREE.Material): THREE.InstancedMesh[] {
    const n = this.list.length
    this.lit = new THREE.InstancedMesh(box, litMat, n * Agents.LIT)
    this.glow = new THREE.InstancedMesh(box, glowMat, n * Agents.GLOW)
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      Agents.COLORS.forEach((hex, k) => this.lit!.setColorAt(i * Agents.LIT + k, c.setHex(hex)))
      for (let k = 0; k < Agents.GLOW; k++) this.glow.setColorAt(i * Agents.GLOW + k, c.setHex(0xff2a12))
    }
    this.lit.frustumCulled = this.glow.frustumCulled = false
    for (let i = 0; i < n; i++) this.pose(i, 0, 0, 0)
    this.flush()
    return [this.lit, this.glow]
  }

  private flush() {
    this.lit!.instanceMatrix.needsUpdate = true
    this.glow!.instanceMatrix.needsUpdate = true
    if (this.lit!.instanceColor) this.lit!.instanceColor.needsUpdate = true
    if (this.glow!.instanceColor) this.glow!.instanceColor.needsUpdate = true
  }

  /** caja fija respecto al cuerpo del agente */
  private put(mesh: THREE.InstancedMesh, idx: number, x: number, y: number, z: number, sx: number, sy: number, sz: number) {
    const p = this.part
    p.position.set(x, y, z)
    p.rotation.set(0, 0, 0)
    p.scale.set(sx, sy, sz)
    p.updateMatrix()
    mesh.setMatrixAt(idx, this.m.multiplyMatrices(this.root.matrix, p.matrix))
  }

  /** brazo: cuelga de un pivote en el hombro que rota en z (ang = 0 abajo, π arriba) */
  private arm(idx: number, x: number, ang: number) {
    this.pivot.position.set(x, 0.62, 0)
    this.pivot.rotation.set(0, 0, ang)
    this.pivot.updateMatrix()
    const p = this.part
    p.position.set(0, -0.16, 0)
    p.rotation.set(0, 0, 0)
    p.scale.set(0.095, 0.32, 0.095)
    p.updateMatrix()
    this.m.multiplyMatrices(this.root.matrix, this.pivot.matrix).multiply(p.matrix)
    this.lit!.setMatrixAt(idx, this.m)
  }

  /** w = cuánto saluda (0 quieto … 1 saludando), yaw = hacia dónde mira */
  private pose(i: number, w: number, yaw: number, t: number) {
    const a = this.list[i]
    const lit = this.lit!
    const glow = this.glow!
    const hop = Math.abs(Math.sin(t * 5.2 + a.ph)) * 0.06 * w
    this.root.position.set(a.x, a.y + hop * a.s, a.z)
    this.root.rotation.set(0, yaw, Math.sin(t * 5.2 + a.ph) * 0.05 * w)
    this.root.scale.setScalar(a.s)
    this.root.updateMatrix()
    const b = i * Agents.LIT
    this.put(lit, b, -0.09, 0.11, 0, 0.1, 0.22, 0.1) // piernas
    this.put(lit, b + 1, 0.09, 0.11, 0, 0.1, 0.22, 0.1)
    this.put(lit, b + 2, 0, 0.43, 0, 0.36, 0.42, 0.2) // saco
    this.put(lit, b + 3, 0, 0.5, 0.102, 0.11, 0.26, 0.012) // camisa
    this.put(lit, b + 4, 0, 0.47, 0.11, 0.045, 0.22, 0.012) // corbata
    this.put(lit, b + 5, 0, 0.67, 0, 0.1, 0.06, 0.1) // cuello
    this.put(lit, b + 6, 0, 0.87, 0, 0.46, 0.37, 0.34) // monitor
    this.put(lit, b + 7, 0, 0.89, 0.172, 0.35, 0.25, 0.012) // pantalla
    this.arm(b + 8, -0.225, -0.12)
    this.arm(b + 9, 0.225, 0.12 + w * (2.5 + Math.sin(t * 8 + a.ph) * 0.42))
    const g = i * Agents.GLOW
    const blink = Math.sin(t * 0.9 + a.ph * 3) > 0.985 ? 0.15 : 1
    this.put(glow, g, -0.08, 0.9, 0.181, 0.07, 0.1 * blink, 0.012) // ojos
    this.put(glow, g + 1, 0.08, 0.9, 0.181, 0.07, 0.1 * blink, 0.012)
  }

  /** cam = posición de la cámara en el mismo espacio que los agentes */
  update(cx: number, cz: number, t: number, reach: number) {
    if (!this.lit) return
    for (let i = 0; i < this.list.length; i++) {
      const a = this.list[i]
      const dz = cz - a.z
      // los que quedaron atrás o muy lejos no se tocan
      if (dz < -4 || dz > reach * 2.4) continue
      const d = Math.hypot(cx - a.x, dz)
      const w = smooth(reach, reach * 0.42, d)
      this.pose(i, w, Math.atan2(cx - a.x, Math.max(0.5, dz)), t)
    }
    this.flush()
  }
}

// ════════════════════════════════════════════════════════════
// TÚNEL — el interior de la máquina
// ════════════════════════════════════════════════════════════
export function buildTunnel(): World {
  const scene = new THREE.Scene()
  const dark = new THREE.Color(0x030304)
  scene.background = dark
  scene.fog = new THREE.Fog(dark, 5, 44)

  scene.add(new THREE.AmbientLight(0xc4d2e8, 0.75))
  const sun = new THREE.DirectionalLight(0xffffff, 2.1)
  sun.position.set(0.5, 3, 2.2)
  scene.add(sun)

  const box = new THREE.BoxGeometry(1, 1, 1)
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 10)
  const lit = new THREE.MeshLambertMaterial({ color: 0xffffff })
  const glow = new THREE.MeshBasicMaterial({ color: 0xffffff })

  const solid = new Batch()
  const led = new Batch()
  const knobs = new Batch()
  const r = rng(4107)

  const Z0 = 8
  const Z1 = -150
  const LEN = Z0 - Z1
  const MID = (Z0 + Z1) / 2

  // piso
  solid.add(0, -0.05, MID, 40, 0.1, LEN, 0x0b0c0e)

  // rieles centrales
  for (const x of [-0.52, 0.52]) solid.add(x, 0.06, MID, 0.075, 0.12, LEN, 0xdfe3e6)
  for (const x of [-0.07, 0.07]) solid.add(x, 0.02, MID, 0.02, 0.04, LEN, 0x8d9498)
  for (const x of [-0.78, 0.78]) solid.add(x, 0.03, MID, 0.03, 0.06, LEN, 0x565b60)

  // durmientes con contacto verde entre los rieles; cada tanto, un agente parado encima
  const crew = new Agents()
  let padN = 0
  for (let z = Z0; z > Z1; z -= 0.44) {
    padN++
    for (const x of [-0.28, 0.28]) {
      solid.add(x, 0.03, z, 0.27, 0.05, 0.15, 0xc8ccd0)
      solid.add(x, 0.04, z, 0.2, 0.05, 0.09, 0x1a1c1e)
      if (r() > 0.25) led.add(x, 0.05, z, 0.11, 0.05, 0.05, r() > 0.2 ? 0x37e06a : 0xdff5e6)
    }
    // en el carril central van al paso de la cámara: son los que se ven en teléfono
    if (padN % 9 === 0 && z < 0) crew.add(padN % 18 === 0 ? 0.28 : -0.28, 0.06, z, 0.5, r() * 6.28)
  }

  // chips en dos carriles a cada lado; sobre algunos se para un agente a saludar
  let rowN = 0
  for (let z = Z0; z > Z1; z -= 2.05) {
    rowN++
    for (const side of [-1, 1]) {
      for (const [lane, off] of [
        [1.55, 0],
        [2.7, 1.02],
      ]) {
        const x = side * lane
        const zz = z - off
        solid.add(x, 0.04, zz, 0.66, 0.08, 0.46, 0xc2c6c6)
        solid.add(x, 0.06, zz, 0.54, 0.08, 0.34, 0x16181a)
        led.add(x, 0.085, zz, 0.36, 0.05, 0.18, 0x33d862)
        led.add(x, 0.09, zz, 0.16, 0.05, 0.07, 0x0c3d1c)
        // patitas del chip
        for (let k = -2; k <= 2; k++) solid.add(x + k * 0.12, 0.02, zz + 0.27, 0.035, 0.03, 0.09, 0x9da2a6)
        // carril interno: uno por fila alternando lado; carril externo: cada tres filas
        const inner = lane < 2
        const stands = inner ? (rowN % 2 === 0) === (side > 0) : rowN % 3 === (side > 0 ? 0 : 1)
        if (stands && zz < 1) crew.add(x, 0.11, zz, inner ? 0.78 : 0.86, r() * 6.28)
      }
    }
  }

  // perillas y tornillos sueltos
  for (let z = Z0; z > Z1; z -= 0.7) {
    const side = r() > 0.5 ? 1 : -1
    const x = side * (1.0 + r() * 2.5)
    const h = 0.18 + r() * 0.26
    knobs.add(x, h / 2, z - r() * 0.5, 0.1, h, 0.1, 0x1d1f22)
    knobs.add(x, h + 0.012, z - r() * 0.5, 0.085, 0.024, 0.085, 0xd9dcde)
  }

  // paredes: disipadores pálidos inclinados y mazos de cable
  const cable = [0xc8261c, 0x2553c9, 0xd9b21f, 0x2a9d4a, 0xc8261c]
  for (let z = Z0; z > Z1; z -= 0.58) {
    for (const side of [-1, 1]) {
      const h = 2.3 + r() * 0.9
      solid.add(side * (4.15 + r() * 0.15), h / 2 - 0.1, z, 0.36, h, 1.45, 0xb9c6d8, 0, 0, side * -0.3)
      if (r() > 0.4) solid.add(side * 5.3, 2.4, z, 0.5, 3.4, 0.5, 0x7d8898, 0, 0, side * -0.18)
      if (r() > 0.35) {
        const c = cable[(r() * cable.length) | 0]
        solid.add(side * (3.35 + r() * 0.35), 0.75 + r() * 0.3, z + r() * 0.3, 0.055, 1.7, 0.055, c, r() * 0.3, 0, side * (-0.35 - r() * 0.3))
      }
    }
  }

  const floorAndParts = solid.build(box, lit)
  const leds = led.build(box, glow)
  const knobMesh = knobs.build(cyl, lit)
  scene.add(floorAndParts, leds, knobMesh, ...crew.build(box, lit, glow))

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80)

  return {
    scene,
    camera,
    update(c, t) {
      const e = smooth(0, 1, c)
      camera.position.set(Math.sin(t * 0.23) * 0.04, lerp(2.55, 1.02, e), lerp(5, -78, c))
      camera.rotation.set(lerp(-0.66, -0.2, e), Math.sin(t * 0.17) * 0.012, 0)
      crew.update(camera.position.x, camera.position.z, t, 15)
    },
    dispose() {
      disposeScene(scene)
    },
  }
}

// ════════════════════════════════════════════════════════════
// CIUDAD — cañón de bloques y, al fondo, el pabellón rojo
// ════════════════════════════════════════════════════════════
export function buildCity(): World {
  const scene = new THREE.Scene()
  const mist = new THREE.Color(0xbfe4e6)
  const night = new THREE.Color(0x060202)
  const bg = mist.clone()
  scene.background = bg
  const fog = new THREE.Fog(bg, 5, 58)
  scene.fog = fog

  const ambient = new THREE.AmbientLight(0x9fc0d6, 1.0)
  scene.add(ambient)
  const sun = new THREE.DirectionalLight(0xe6f6ff, 1.5)
  sun.position.set(0.25, 0.7, 1)
  scene.add(sun)

  const box = new THREE.BoxGeometry(1, 1, 1)
  const lit = new THREE.MeshLambertMaterial({ color: 0xffffff })
  const glow = new THREE.MeshBasicMaterial({ color: 0xffffff })

  const END = -100
  const blocks = new Batch()
  const windows = new Batch()
  const r = rng(90210)
  const slate = new THREE.Color()

  for (let i = 0; i < 3000; i++) {
    const side = r() > 0.5 ? 1 : -1
    const z = 10 - r() * 132
    const y = (r() - 0.5) * 50
    const sx = 0.6 + r() * 2.8
    const sy = 0.5 + r() * 3.4
    const sz = 0.6 + r() * 3.2
    const x = side * (1.75 + sx / 2 + Math.pow(r(), 1.8) * 5.5)
    // hueco alrededor del pabellón
    if (Math.abs(z - END) < 9 && Math.abs(x) < 7.5 && Math.abs(y) < 7) continue
    slate.setHSL(0.565 + r() * 0.03, 0.26 + r() * 0.12, 0.1 + r() * 0.13)
    blocks.add(x, y, z, sx, sy, sz, slate.getHex())

    if (r() < 0.16) {
      const n = 3 + ((r() * 4) | 0)
      const faceX = x - side * (sx / 2 + 0.03)
      const wy = y + (r() - 0.5) * sy * 0.5
      const wz = z - (n * 0.17) / 2
      for (let k = 0; k < n; k++) windows.add(faceX, wy, wz + k * 0.17, 0.05, 0.3, 0.1, 0xe9f6f2)
    }
  }
  scene.add(blocks.build(box, lit), windows.build(box, glow))

  // ── Pabellón rojo: el letrero encendido de TyT al final del cañón ──
  const pav = new THREE.Group()
  pav.position.set(0, -2.15, END)
  scene.add(pav)

  const warm = new THREE.MeshLambertMaterial({ color: 0xffffff, fog: false })
  const hot = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })
  const parts = new Batch()
  const lights = new Batch()

  // base: piso, plataforma de piedra, escalón y juntas de tablón
  parts.add(0, -0.12, 0, 13, 0.24, 11, 0x1a0605)
  parts.add(0, 0.12, 0.2, 9.8, 0.24, 5.4, 0x2b1512)
  parts.add(0, 0.08, 3.1, 3.2, 0.16, 0.6, 0x40201b)
  for (let x = -4.5; x <= 4.5; x += 0.6) parts.add(x, 0.245, 1.7, 0.03, 0.012, 2.3, 0x150807)

  // fondo e interior: anaqueles con frascos encendidos y un mostrador
  parts.add(0, 2.3, -2.4, 9.5, 4.6, 0.3, 0x4a0c08)
  lights.add(0, 1.9, -2.22, 2.1, 3.3, 0.05, 0xff7a1a)
  const jars = [0x37c8f0, 0xffd43a, 0xffffff, 0x7fd6a0, 0xff2a12]
  ;[1.55, 2.2, 2.85].forEach((y, row) => {
    parts.add(0, y, -2.0, 2.0, 0.06, 0.3, 0x2a0706)
    for (let k = 0; k < 8; k++) lights.add(-0.84 + k * 0.24, y + 0.15, -2.0, 0.1, 0.2 + ((k + row) % 3) * 0.04, 0.1, jars[(k * 2 + row) % jars.length])
  })
  parts.add(0, 0.75, -1.1, 2.0, 1.0, 0.5, 0x2a0706)
  parts.add(0, 1.27, -1.1, 2.1, 0.06, 0.6, 0x5c1a12)
  lights.add(0.6, 1.5, -1.1, 0.4, 0.3, 0.04, 0x37c8f0)

  // columnas con basa y capitel
  const POSTS = [-3.3, -1.25, 1.25, 3.3]
  for (const x of POSTS) {
    parts.add(x, 2.05, 0.85, 0.42, 4.1, 0.42, 0xd21c10)
    parts.add(x, 0.35, 0.85, 0.58, 0.22, 0.58, 0x2b1512)
    parts.add(x, 4.02, 0.85, 0.58, 0.16, 0.58, 0xe8301a)
  }

  // vanos laterales: zócalo, ventana de celosía encendida y dintel
  for (const side of [-1, 1]) {
    const x = side * 2.28
    parts.add(x, 0.78, 0.6, 1.65, 1.06, 0.12, 0x6e0f0a)
    lights.add(x, 2.28, 0.55, 1.65, 1.94, 0.05, 0xffa040)
    for (let k = -2; k <= 2; k++) parts.add(x + k * 0.33, 2.28, 0.64, 0.05, 1.94, 0.05, 0x3a0705)
    for (const y of [1.78, 2.78]) parts.add(x, y, 0.64, 1.65, 0.05, 0.05, 0x3a0705)
    parts.add(x, 3.42, 0.6, 1.65, 0.36, 0.12, 0x7a0f0a)
  }

  // cortina de la puerta (noren): cuatro paños añil con un punto claro
  for (const x of [-0.78, -0.26, 0.26, 0.78]) {
    parts.add(x, 3.12, 0.72, 0.48, 0.82, 0.03, 0x1a2452)
    lights.add(x, 3.12, 0.74, 0.15, 0.15, 0.012, 0xf2eee2)
  }

  // vigas y tira de luz
  parts.add(0, 4.25, 0.85, 8.6, 0.42, 0.55, 0xdf2512)
  parts.add(0, 3.58, 0.85, 7.0, 0.12, 0.3, 0x8c110a)
  lights.add(0, 4.0, 1.15, 8.0, 0.06, 0.05, 0xffb347)

  // techo de dos aguas en dos niveles, con tejas y puntas levantadas
  const roof = (y: number, w: number, d: number, z: number, body: number) => {
    parts.add(0, y, z, w, 0.24, d, body)
    parts.add(0, y - 0.14, z + d / 2, w + 0.2, 0.14, 0.14, 0x3a0705)
    for (let x = -w / 2 + 0.3; x < w / 2; x += 0.5) parts.add(x, y + 0.15, z, 0.12, 0.08, d, 0x560a07)
    for (const side of [-1, 1]) parts.add(side * (w / 2 + 0.25), y + 0.22, z, 0.9, 0.22, d, body, 0, 0, side * 0.42)
  }
  roof(4.72, 10.6, 4.6, 0.5, 0x7c100b)
  parts.add(0, 5.2, 0, 6.4, 0.72, 2.4, 0x4a0c08)
  for (let k = -2; k <= 2; k++) lights.add(k * 1.1, 5.2, 1.21, 0.5, 0.3, 0.02, 0xffa040)
  roof(5.68, 8.0, 3.4, 0.1, 0x8c110a)
  parts.add(0, 5.98, 0.1, 8.2, 0.2, 0.3, 0x2a0706)
  for (const side of [-1, 1]) lights.add(side * 4.0, 6.18, 0.1, 0.2, 0.36, 0.2, 0xffb347)

  // faroles colgando del alero
  for (const x of [-4.1, -1.55, 1.55, 4.1]) {
    parts.add(x, 4.3, 2.5, 0.025, 0.5, 0.025, 0x150807)
    parts.add(x, 4.1, 2.5, 0.24, 0.06, 0.24, 0x1a0605)
    lights.add(x, 3.84, 2.5, 0.34, 0.46, 0.34, 0xff3a1a)
    parts.add(x, 3.58, 2.5, 0.2, 0.06, 0.2, 0x1a0605)
  }

  // utilería: macetas, pizarra, máquina, cajas y banca
  for (const x of [-1.6, 1.62]) {
    parts.add(x, 0.44, 2.35, 0.36, 0.4, 0.36, 0x3a1c18)
    parts.add(x, 0.86, 2.35, 0.52, 0.46, 0.52, 0x1f7a3a)
    parts.add(x + 0.05, 1.18, 2.35, 0.3, 0.3, 0.3, 0x2a9d4a)
  }
  parts.add(0.98, 0.72, 2.75, 0.74, 0.96, 0.06, 0x150807, -0.16, -0.25, 0)
  parts.add(3.95, 1.14, 1.2, 0.84, 1.8, 0.6, 0x12262e)
  parts.add(4.5, 0.52, 2.2, 0.8, 0.56, 0.8, 0x5c2a14)
  parts.add(4.62, 1.02, 2.2, 0.5, 0.44, 0.5, 0x6e3418)
  parts.add(-4.2, 0.62, 2.1, 1.7, 0.1, 0.5, 0x5c2a14)
  for (const x of [-4.9, -3.5]) parts.add(x, 0.4, 2.1, 0.1, 0.36, 0.44, 0x2b1512)
  lights.add(-4.6, 0.8, 2.1, 0.22, 0.26, 0.22, 0xffb347)

  pav.add(parts.build(box, warm), lights.build(box, hot))

  // quien atiende: un agente en la puerta y otro en la banca, saludando
  const hosts = new Agents()
  hosts.add(0.2, 0.24, 1.75, 1.5, 0.4)
  hosts.add(-3.1, 0.24, 2.3, 1.05, 2.1)
  pav.add(...hosts.build(box, warm, hot))

  const signTex = (c: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.NoColorSpace
    return t
  }
  const sign = (text: string, vertical: boolean, fg: string, bg: string, w: number, h: number) =>
    new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: signTex(makeSignCanvas(text, vertical, fg, bg)), fog: false }),
    )
  const tall = sign('TYT', true, '#1a0d00', '#ffd43a', 0.56, 1.68)
  tall.position.set(-1.25, 2.3, 1.08)
  const marquee = sign('TYT SOFTWARE', false, '#ffcf6b', '#3a0705', 2.4, 0.6)
  marquee.position.set(0, 3.86, 1.16)
  const open = sign('ABIERTO', false, '#ffb347', '#150807', 0.64, 0.16)
  open.position.set(0.98, 0.9, 2.79)
  open.rotation.set(-0.16, -0.25, 0)
  const hours = sign('24/7', false, '#eaffff', '#150807', 0.5, 0.26)
  hours.position.set(0.98, 0.6, 2.84)
  hours.rotation.set(-0.16, -0.25, 0)
  const screen = sign(':)', false, '#eaffff', '#1fa8d8', 0.62, 0.62)
  screen.position.set(3.95, 1.45, 1.51)
  pav.add(tall, marquee, open, hours, screen)

  const lamp = new THREE.PointLight(0xff5a1e, 26, 22, 1.1)
  lamp.position.set(0, 2.6, 2.4)
  pav.add(lamp)

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 90)

  return {
    scene,
    camera,
    update(c, t) {
      // llega a la casita en c≈0.8; el contacto entra enseguida (ver timeline)
      const travel = Math.pow(smooth(0, 0.8, c), 1.45)
      const z = lerp(9, END + 10.6, travel)
      const turn = smooth(0.4, 0.8, c)
      const roll = Math.sin(Math.PI * turn) * 1.12
      const settle = smooth(0.68, 0.8, c)
      camera.position.set(
        Math.sin(t * 0.15) * 0.08 * (1 - settle),
        Math.sin(c * 6.0) * 0.5 * (1 - settle) + Math.sin(t * 0.21) * 0.05,
        z,
      )
      camera.rotation.set(
        Math.sin(Math.PI * turn) * -0.32,
        Math.sin(c * 4.2) * 0.07 * (1 - settle),
        roll,
      )

      // de la niebla azul a la noche roja
      const k = smooth(0.46, 0.76, c)
      bg.copy(mist).lerp(night, k)
      fog.near = lerp(5, 9, k)
      fog.far = lerp(58, 30, k)
      ambient.intensity = lerp(1.0, 0.3, k)
      sun.intensity = lerp(1.5, 0.15, k)
      pav.visible = c > 0.2
      lamp.intensity = 26 * (0.92 + 0.08 * Math.sin(t * 7.0))
      // los anfitriones viven en el espacio local de la casita
      hosts.update(camera.position.x - pav.position.x, camera.position.z - pav.position.z, t, 26)
    },
    dispose() {
      disposeScene(scene)
    },
  }
}
