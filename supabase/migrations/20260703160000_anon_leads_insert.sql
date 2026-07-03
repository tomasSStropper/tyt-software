-- Migración 002: política de inserción pública para el formulario de contacto.
-- Permite que el visitante anónimo de tytsoftware.com deje un lead en public.leads.
-- El rol anon SOLO puede insertar: no recibe SELECT, UPDATE ni DELETE sobre leads
-- ni sobre ninguna otra tabla. Todo lo demás queda protegido por las políticas
-- existentes; los leads solo se leen con service role.

create policy "leads: insert publico desde la web"
  on public.leads
  for insert
  to anon
  with check (true);
