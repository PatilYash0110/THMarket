import { useEffect, useRef, useState } from 'react'
import { Button } from './Button'

interface ConfirmDialogProps {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  // When set, shows a textarea and disables the confirm button until it has
  // non-whitespace content — the in-app replacement for window.prompt().
  noteLabel?: string
  notePlaceholder?: string
  onConfirm: (note?: string) => void
  onCancel: () => void
}

// In-app replacement for window.confirm()/window.prompt() — those render as
// the browser's own unstyled dialog, which looks like a foreign object next
// to the rest of the app's design. Same overlay/focus/Escape pattern as
// ImageLightbox for consistency with the one other full-screen dialog here.
export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Bestätigen',
  cancelLabel = 'Abbrechen',
  destructive = false,
  noteLabel,
  notePlaceholder,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [note, setNote] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Focus target when there's no textarea — Button isn't a forwardRef
  // component, so the panel itself (tabIndex -1) is what receives focus
  // instead of trying to ref into the confirm button.
  const panelRef = useRef<HTMLDivElement>(null)
  const needsNote = noteLabel !== undefined
  const canConfirm = !needsNote || note.trim().length > 0

  useEffect(() => {
    if (needsNote) {
      textareaRef.current?.focus()
    } else {
      panelRef.current?.focus()
    }
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  function handleConfirm() {
    if (!canConfirm) return
    onConfirm(needsNote ? note.trim() : undefined)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4 motion-safe:animate-fade-in"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-lg focus-visible:outline-none"
      >
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
          {description && <p className="text-sm text-foreground-muted">{description}</p>}
        </div>

        {needsNote && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">{noteLabel}</span>
            <textarea
              ref={textareaRef}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={notePlaceholder}
              rows={3}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'destructive' : 'primary'} size="sm" onClick={handleConfirm} disabled={!canConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
