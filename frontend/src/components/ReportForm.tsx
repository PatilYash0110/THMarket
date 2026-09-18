import { CheckCircle } from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { createReport } from '../api/admin'
import { ApiError } from '../api/auth'
import { Button } from './Button'

// Mirrors backend/src/admin/report-reasons.ts
const REPORT_REASONS = [
  'Betrug oder Täuschung',
  'Unangemessener Inhalt',
  'Falsche oder irreführende Beschreibung',
  'Spam',
  'Belästigung',
  'Sonstiges',
] as const

interface ReportFormProps {
  targetType: 'LISTING' | 'USER'
  targetId: string
  onCancel: () => void
}

export function ReportForm({ targetType, targetId, onCancel }: ReportFormProps) {
  const [reason, setReason] = useState<string>(REPORT_REASONS[0])
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createReport({
        targetType,
        listingId: targetType === 'LISTING' ? targetId : undefined,
        reportedUserId: targetType === 'USER' ? targetId : undefined,
        reason,
        message: message.trim() || undefined,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Meldung fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center">
        <CheckCircle size={24} className="text-accent" aria-hidden />
        <p className="text-sm text-foreground">Danke, deine Meldung wurde übermittelt.</p>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Schließen
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Grund</span>
        <select
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {REPORT_REASONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Nachricht (optional)</span>
        <textarea
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Beschreibe kurz, worum es geht…"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Wird gesendet…' : 'Melden'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
          Abbrechen
        </Button>
      </div>
    </form>
  )
}
