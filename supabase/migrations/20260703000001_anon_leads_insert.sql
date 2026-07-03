-- Public contact form: anonymous visitors may insert a lead only.
-- El rol anon puede INSERT en public.leads y nada más: sin SELECT, UPDATE
-- ni DELETE sobre leads ni sobre ninguna otra tabla.

-- RLS ya viene habilitado desde la migración 001; se reafirma de forma idempotente.
alter table public.leads enable row level security;

create policy "leads: anon insert only (public contact form)"
  on public.leads
  for insert
  to anon
  with check (true);
