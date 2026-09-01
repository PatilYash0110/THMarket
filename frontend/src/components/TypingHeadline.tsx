import { useEffect, useState } from 'react'

const TYPE_SPEED_MS = 55
const DELETE_SPEED_MS = 28
const PAUSE_AFTER_TYPE_MS = 1800
const PAUSE_AFTER_DELETE_MS = 300

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return reduced
}

export function TypingHeadline({ sentences }: { sentences: string[] }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<'typing' | 'deleting'>('typing')

  useEffect(() => {
    if (prefersReducedMotion) return

    const current = sentences[sentenceIndex]

    if (phase === 'typing') {
      if (text.length < current.length) {
        const timeout = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          TYPE_SPEED_MS,
        )
        return () => clearTimeout(timeout)
      }
      const timeout = setTimeout(() => setPhase('deleting'), PAUSE_AFTER_TYPE_MS)
      return () => clearTimeout(timeout)
    }

    if (text.length > 0) {
      const timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), DELETE_SPEED_MS)
      return () => clearTimeout(timeout)
    }
    const timeout = setTimeout(() => {
      setSentenceIndex((prev) => (prev + 1) % sentences.length)
      setPhase('typing')
    }, PAUSE_AFTER_DELETE_MS)
    return () => clearTimeout(timeout)
  }, [text, phase, sentenceIndex, sentences, prefersReducedMotion])

  const visibleText = prefersReducedMotion ? sentences[0] : text

  return (
    <span aria-label={sentences.join(' ')} className="grid">
      {/* Invisible stack, one per sentence: sizes the grid cell to the tallest
          sentence at the current viewport width, so the typing/deleting cycle
          never changes this element's height and nothing below it shifts. */}
      {sentences.map((sentence) => (
        <span key={sentence} className="invisible [grid-area:1/1]" aria-hidden="true">
          {sentence}
        </span>
      ))}
      <span className="[grid-area:1/1]" aria-hidden="true">
        {visibleText}
        {!prefersReducedMotion && (
          <span className="motion-safe:animate-pulse text-accent">|</span>
        )}
      </span>
    </span>
  )
}
