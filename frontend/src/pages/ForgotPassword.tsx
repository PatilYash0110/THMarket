import { EnvelopeSimple } from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, forgotPassword } from '../api/auth'
import { Button } from '../components/Button'
import { ResendVerificationButton } from '../components/ResendVerificationButton'

// Matches the backend's exact message for an unverified account (see
// AuthService.forgotPassword) — a reset link would be a dead end for this
// account anyway, so offer the actual fix instead.
const UNVERIFIED_MESSAGE = 'Bitte bestätige zuerst deine E-Mail-Adresse.'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await forgotPassword(email)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Etwas ist schiefgelaufen. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 py-10 text-center">
        <EnvelopeSimple size={40} className="text-accent" aria-hidden />
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">E-Mail gesendet</h1>
        <p className="text-sm text-foreground-muted">
          Falls ein Konto mit dieser E-Mail existiert, haben wir einen Link zum Zurücksetzen des
          Passworts gesendet.
        </p>
        <Link to="/login" className="text-sm font-medium text-accent underline">
          Zur Anmeldung
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Passwort vergessen</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Gib deine THM E-Mail-Adresse ein, um einen Link zum Zurücksetzen zu erhalten.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">E-Mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="max.mustermann@thm.de"
            className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        {error && (
          <div className="flex flex-col gap-2">
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
            {error === UNVERIFIED_MESSAGE && email && <ResendVerificationButton email={email} fullWidth />}
          </div>
        )}
        <Button type="submit" size="lg" className="mt-1" disabled={submitting}>
          {submitting ? 'Wird gesendet…' : 'Link anfordern'}
        </Button>
      </form>

      <p className="text-center text-sm text-foreground-muted">
        <Link to="/login" className="font-medium text-accent underline">
          Zurück zur Anmeldung
        </Link>
      </p>
    </div>
  )
}
