import { useEffect, useRef, useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Users,
} from 'lucide-react'

/** Tamaño de diseño fijo; se escala al contenedor con ResizeObserver. */
const DESIGN = { width: 1060, height: 640 }

const STATS = [
  { label: 'Miembros activos', value: '342', delta: '+12 este mes', red: false },
  { label: 'Ingresos del mes', value: '₡ 4,18 M', delta: '+8% vs. mayo', red: false },
  { label: 'Asistencia hoy', value: '87', delta: 'pico 6:00 pm', red: false },
  { label: 'Pagos pendientes', value: '9', delta: 'recordatorio enviado', red: true },
]

const WEEK = [
  { day: 'L', v: 62 },
  { day: 'K', v: 78 },
  { day: 'M', v: 71 },
  { day: 'J', v: 90 },
  { day: 'V', v: 84 },
  { day: 'S', v: 55 },
  { day: 'D', v: 30 },
]

const MEMBERS = [
  { name: 'Daniela R.', plan: 'Anual', time: '6:12 pm' },
  { name: 'Marco V.', plan: 'Mensual', time: '6:04 pm' },
  { name: 'Sofía C.', plan: 'Trimestral', time: '5:58 pm' },
  { name: 'Andrés M.', plan: 'Mensual', time: '5:51 pm' },
]

const NAV = [
  { icon: LayoutDashboard, label: 'Panel', active: true },
  { icon: Users, label: 'Miembros', active: false },
  { icon: CreditCard, label: 'Pagos', active: false },
  { icon: CalendarDays, label: 'Clases', active: false },
  { icon: BarChart3, label: 'Reportes', active: false },
]

export function DashboardMockup({ ariaLabel }: { ariaLabel: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / DESIGN.width)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={wrapRef} role="img" aria-label={ariaLabel} className="w-full">
      {/* aspect-ratio fija el alto desde el primer paint: sin saltos de layout */}
      <div style={{ aspectRatio: `${DESIGN.width} / ${DESIGN.height}` }}>
        <div
          className="origin-top-left overflow-hidden rounded-lg border border-coal-line shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]"
          style={{ width: DESIGN.width, transform: `scale(${scale})` }}
          aria-hidden="true"
        >
          {/* Barra de navegador */}
          <div className="flex items-center gap-4 border-b border-coal-line bg-coal-lift px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-bright/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-coal-text/25" />
              <span className="h-2.5 w-2.5 rounded-full bg-coal-text/25" />
            </div>
            <div className="mono-label flex-1 rounded-sm bg-coal px-3 py-1 text-center text-coal-text/70 normal-case tracking-normal">
              app.arenadesk.io
            </div>
            <span className="mono-label text-coal-text/70">v2.4</span>
          </div>

          <div className="flex bg-coal" style={{ height: DESIGN.height - 42 }}>
            {/* Sidebar */}
            <aside className="flex w-48 shrink-0 flex-col border-r border-coal-line px-4 py-5">
              <p className="display text-lg text-paper">
                Arena<span className="text-red-soft">Desk</span>
              </p>
              <nav className="mt-6 space-y-1">
                {NAV.map(({ icon: Icon, label, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm ${
                      active
                        ? 'bg-coal-lift text-paper shadow-[inset_2px_0_0_0_var(--color-red-bright)]'
                        : 'text-coal-text/70'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </div>
                ))}
              </nav>
              <div className="mono-label mt-auto text-coal-text/70">
                Gimnasio Atlas — Escazú
              </div>
            </aside>

            {/* Contenido */}
            <main className="flex-1 space-y-5 overflow-hidden p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="display text-2xl text-paper">Buenos días, Andrés</h3>
                <span className="mono-label text-coal-text/65">MIÉ 03 JUL — 6:14 PM</span>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {STATS.map((s) => (
                  <div key={s.label} className="rounded-md border border-coal-line bg-coal-lift p-4">
                    <p className="mono-label text-coal-text/70">{s.label}</p>
                    <p className={`display mt-2 text-3xl whitespace-nowrap ${s.red ? 'text-red-bright' : 'text-paper'}`}>
                      {s.value}
                    </p>
                    <p className="mt-1 text-xs text-coal-text/70">{s.delta}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-4">
                {/* Asistencia semanal */}
                <div className="col-span-3 rounded-md border border-coal-line bg-coal-lift p-4">
                  <p className="mono-label text-coal-text/70">Asistencia esta semana</p>
                  <div className="mt-4 flex h-36 items-end gap-3">
                    {WEEK.map((d) => (
                      <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className={`w-full rounded-sm ${d.v >= 90 ? 'bg-red-bright' : 'bg-coal-text/30'}`}
                          style={{ height: `${d.v}%` }}
                        />
                        <span className="mono-label text-coal-text/65">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Últimos check-ins */}
                <div className="col-span-2 rounded-md border border-coal-line bg-coal-lift p-4">
                  <p className="mono-label text-coal-text/70">Últimos check-ins</p>
                  <ul className="mt-3 divide-y divide-coal-line">
                    {MEMBERS.map((m) => (
                      <li key={m.name} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="text-paper">{m.name}</span>
                        <span className="text-coal-text/70">{m.plan}</span>
                        <span className="mono-label text-coal-text/65">{m.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
