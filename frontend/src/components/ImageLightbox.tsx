import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import { useEffect, useRef } from 'react'

interface ImageLightboxProps {
  images: string[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
  alt?: string
}

// Full-screen viewer for a listing's photos — object-contain so the whole
// image is always visible regardless of its aspect ratio, unlike the cropped
// thumbnails and card previews used everywhere else in the app.
export function ImageLightbox({ images, index, onClose, onNavigate, alt }: ImageLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const hasMultiple = images.length > 1

  useEffect(() => {
    closeButtonRef.current?.focus()
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowRight' && hasMultiple) {
        onNavigate((index + 1) % images.length)
      } else if (event.key === 'ArrowLeft' && hasMultiple) {
        onNavigate((index - 1 + images.length) % images.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [index, images.length, hasMultiple, onClose, onNavigate])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bildansicht"
      // Clicking the backdrop closes the viewer; clicking the image itself
      // (which stops propagation below) does not, so a misclick doesn't
      // dismiss it.
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/90 motion-safe:animate-fade-in"
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Schließen"
        className="absolute right-4 top-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-surface/10 text-on-primary transition-colors hover:bg-surface/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X size={22} aria-hidden />
      </button>

      {hasMultiple && (
        <span className="absolute top-5 left-1/2 -translate-x-1/2 text-sm font-medium tabular-nums text-on-primary/80">
          {index + 1} / {images.length}
        </span>
      )}

      {hasMultiple && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onNavigate((index - 1 + images.length) % images.length)
          }}
          aria-label="Vorheriges Bild"
          className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface/10 text-on-primary transition-colors hover:bg-surface/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:left-4"
        >
          <CaretLeft size={22} aria-hidden />
        </button>
      )}

      <img
        src={images[index]}
        alt={alt ?? ''}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] cursor-default select-none object-contain"
      />

      {hasMultiple && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onNavigate((index + 1) % images.length)
          }}
          aria-label="Nächstes Bild"
          className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface/10 text-on-primary transition-colors hover:bg-surface/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-4"
        >
          <CaretRight size={22} aria-hidden />
        </button>
      )}
    </div>
  )
}
