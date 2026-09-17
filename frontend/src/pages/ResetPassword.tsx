import { CheckCircle, XCircle } from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError, resetPassword } from '../api/auth'
import { Button } from '../components/Button'
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter'

// Mirrors backend/src/auth/password-strength.ts
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
const PASSWORD_REQUIREMENTS_TEXT =
  'Mindestens 8 Zeichen, mit Groß- und Kleinbuchstaben sowie einer Zahl.'

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  if (!token) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <XCircle size={40} className="text-destructive" aria-hidden />
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Ungültiger Link</h1>
        <p className="text-sm text-foreground-muted">Kein Reset-Code gefunden.</p>
        <Link to="/forgot-password" className="text-sm font-medium text-accent underline">
          Neuen Link anfordern
        </Link>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <CheckCircle size={40} className="text-accent" aria-hidden />
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Passwort zurückgesetzt</h1>
        <p className="text-sm text-foreground-muted">Du kannst dich jetzt mit deinem neuen Passwort anmelden.</p>
        <Link to="/login" className="text-sm font-medium text-accent underline">
          Zur Anmeldung
        </Link>
      </div>
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (password.length < 8 || !STRONG_PASSWORD_PATTERN.test(password)) {
      setPasswordError(PASSWORD_REQUIREMENTS_TEXT)
      return
    }
    setPasswordError(null)
    setError(null)
    setSubmitting(true)
    try {
      await resetPassword(token!, password)
      setCompleted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Zurücksetzen fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Neues Passwort</h1>
        <p className="mt-2 text-sm text-foreground-muted">Wähle ein neues Passwort für dein Konto.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Neues Passwort</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Sicheres Passwort"
            aria-describedby={passwordError ? 'password-error password-requirements' : 'password-requirements'}
            className="h-11 border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {passwordError && (
            <span id="password-error" role="alert" className="text-xs text-destructive">
              {passwordError}
            </span>
          )}
          <div id="password-requirements" className="flex flex-col gap-1.5">
            <span className="text-xs text-foreground-muted">{PASSWORD_REQUIREMENTS_TEXT}</span>
            {password && <PasswordStrengthMeter password={password} />}
          </div>
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="mt-1" disabled={submitting}>
          {submitting ? 'Wird gespeichert…' : 'Passwort zurücksetzen'}
        </Button>
      </form>
    </div>
  )
}
