import { CONTACT } from '../i18n/dictionary'

export interface Lead {
  full_name: string
  email: string | null
  phone: string | null
  message: string
}

export type SubmitResult = { ok: true } | { ok: false; fallback: 'mailto' } | { ok: false; error: string }

/**
 * Inserta el lead en public.leads vía la API REST de Supabase.
 * Sin variables de entorno degrada a mailto: — nunca claves en el código.
 */
export async function submitLead(lead: Lead): Promise<SubmitResult> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  if (!url || !key) {
    openMailto(lead)
    return { ok: false, fallback: 'mailto' }
  }

  try {
    const res = await fetch(`${url}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ ...lead, source: 'web' }),
    })
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network' }
  }
}

function openMailto(lead: Lead) {
  const subject = encodeURIComponent(`Consulta de ${lead.full_name} — tytsoftware.com`)
  const body = encodeURIComponent(
    `${lead.message}\n\n—\n${lead.full_name}\n${lead.email ?? lead.phone ?? ''}`,
  )
  window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`
}
