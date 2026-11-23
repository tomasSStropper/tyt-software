const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const
const STORE = 'tyt:origen'

export type Origin = Partial<Record<(typeof KEYS)[number], string>>

export function rememberOrigin(): void {
  try {
    const params = new URLSearchParams(window.location.search)
    const found: Origin = {}
    for (const key of KEYS) {
      const value = params.get(key)?.trim()
      if (value) found[key] = value.slice(0, 80)
    }
    if (Object.keys(found).length > 0) sessionStorage.setItem(STORE, JSON.stringify(found))
  } catch {
    return
  }
}

export function readOrigin(): Origin {
  try {
    const raw = sessionStorage.getItem(STORE)
    const value: unknown = raw ? JSON.parse(raw) : null
    return value && typeof value === 'object' ? (value as Origin) : {}
  } catch {
    return {}
  }
}

export function campaignParam(): string {
  const campaign = readOrigin().utm_campaign
  return campaign ? `&utm_campaign=${encodeURIComponent(campaign)}` : ''
}
