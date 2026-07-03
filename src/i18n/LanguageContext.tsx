import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { dictionaries, type Dict, type Lang } from './dictionary'

interface LanguageValue {
  lang: Lang
  t: Dict
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageValue | null>(null)

function initialLang(): Lang {
  const stored = localStorage.getItem('tyt-lang')
  if (stored === 'es' || stored === 'en') return stored
  return navigator.language.startsWith('en') ? 'en' : 'es'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    localStorage.setItem('tyt-lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, t: dictionaries[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang(): LanguageValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
