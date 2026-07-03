import { useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Escribe `text` carácter por carácter (~35ms). Con prefers-reduced-motion
 * el texto aparece completo de inmediato. Se reinicia si `text` cambia
 * (por ejemplo, al cambiar de idioma).
 */
export function useTypewriter(text: string, speed = 35, startDelay = 250) {
  const reduced = useReducedMotion()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (reduced) {
      setCount(text.length)
      return
    }
    setCount(0)
    let i = 0
    let interval: ReturnType<typeof setInterval> | undefined
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1
        setCount(i)
        if (i >= text.length && interval) clearInterval(interval)
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(start)
      if (interval) clearInterval(interval)
    }
  }, [text, speed, startDelay, reduced])

  return { text: text.slice(0, count), done: count >= text.length }
}
