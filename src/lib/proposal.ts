export interface ProposalItem {
  title: string
  detail: string
  amount: number
}

export interface ProposalPayment {
  title: string
  amount: number
}

export type ProposalState = 'draft' | 'sent' | 'expired' | 'accepted' | 'declined'

export interface Proposal {
  state: ProposalState
  business_name: string
  contact_name: string | null
  title: string
  understanding: string
  solution: string
  items: ProposalItem[]
  excluded: string
  currency: 'USD' | 'CRC'
  total: number
  payments: ProposalPayment[]
  delivery: string
  needs: string
  terms: string
  valid_until: string | null
  sent_at: string | null
  answered_at: string | null
  answered_name: string | null
}

export interface ProposalAnswer {
  state: ProposalState
  answered_at: string | null
  answered_name: string | null
}

const TOKEN = /^[A-Za-z0-9_-]{24}$/

function seen(token: string): boolean {
  try {
    const key = `propuesta:${token}`
    if (sessionStorage.getItem(key)) return true
    sessionStorage.setItem(key, '1')
  } catch {
    return false
  }
  return false
}

async function rpc<T>(name: string, body: unknown): Promise<T> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (!url || !key) throw new Error('config')
  const res = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { code?: string; message?: string } | null
    throw new ProposalError(err?.code === 'P0001' || err?.code === 'P0002' ? (err.message ?? null) : null)
  }
  return (await res.json()) as T
}

export class ProposalError extends Error {
  readonly forPerson: string | null

  constructor(forPerson: string | null) {
    super(forPerson ?? 'error')
    this.forPerson = forPerson
  }
}

export async function loadProposal(token: string, team: boolean): Promise<Proposal | null> {
  if (!TOKEN.test(token)) return null
  return rpc<Proposal | null>('public_proposal', { p_token: token, p_count: !team && !seen(token) })
}

export function answerProposal(
  token: string,
  accept: boolean,
  name: string,
  reason: string,
): Promise<ProposalAnswer> {
  return rpc<ProposalAnswer>('answer_proposal', {
    p_token: token,
    p_accept: accept,
    p_name: name.trim() || null,
    p_reason: reason.trim() || null,
  })
}
