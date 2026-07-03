# tytsoftware.com

Sitio de TyT Software & Solutions. Vite + React + TypeScript + Tailwind CSS 4.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # typecheck + build a dist/
```

Deploy: Vercel conectado a `main` (`vercel.json` define build y `dist`).

## Imagen del héroe

La imagen del personaje vive en `public/hero-computer.jpg` (1:1).
Si falta, el sitio usa un placeholder con la misma proporción. La posición de
los ojos se ajusta en las constantes `EYES` de `src/components/hero/Avatar.tsx`.

## Formulario de leads

`submitLead()` inserta en `public.leads` de Supabase usando variables de
entorno (ver `.env.example`). Sin variables, degrada a
`mailto:tomas@tytsoftware.com`. Tabla esperada:

```sql
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text,
  phone text,
  message text not null,
  source text not null default 'web'
);

alter table public.leads enable row level security;

create policy "leads: insert publico" on public.leads
  for insert to anon with check (true);
-- sin política de select para anon: los leads solo se leen con service role
```

## Idiomas

Español primario, inglés secundario. Todo el copy vive en
`src/i18n/dictionary.ts` con claves tipadas; el toggle está en el nav.
