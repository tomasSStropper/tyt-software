export interface Finding {
  id: string
  ok: boolean
  title: string
  detail: string
}

export interface Diagnosis {
  business_name: string
  category: string | null
  zone: string | null
  site_url: string
  findings: Finding[]
  ideas: string[]
  checked_at: string
  agenda_url: string
}

const TOKEN = /^[A-Za-z0-9_-]{24}$/

function seen(token: string): boolean {
  try {
    const key = `diagnostico:${token}`
    if (sessionStorage.getItem(key)) return true
    sessionStorage.setItem(key, '1')
  } catch {
    return false
  }
  return false
}

export async function loadDiagnosis(token: string, team: boolean): Promise<Diagnosis | null> {
  if (!TOKEN.test(token)) return null
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (!url || !key) throw new Error('config')
  const res = await fetch(`${url}/rest/v1/rpc/public_diagnosis`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_token: token, p_count: !team && !seen(token) }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as Diagnosis | null
}
