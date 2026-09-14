import { EnvelopeSimple } from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, registerUser } from '../api/auth'
import { Button } from '../components/Button'
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter'

const THM_EMAIL_PATTERN = /^[^\s@]+@([a-z0-9-]+\.)*thm\.de$/i
// At least one lowercase letter, one uppercase letter, and one digit — mirrors backend/src/auth/dto/register.dto.ts
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
const PASSWORD_REQUIREMENTS_TEXT =
  'Mindestens 8 Zeichen, mit Groß- und Kleinbuchstaben sowie einer Zahl.'

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!THM_EMAIL_PATTERN.test(email)) {
      setError('Bitte verwende eine gültige @thm.de-Adresse (auch Subdomains wie @mnd.thm.de).')
      return
    }
    setError(null)

    if (password.length < 8 || !STRONG_PASSWORD_PATTERN.test(password)) {
      setPasswordError(PASSWORD_REQUIREMENTS_TEXT)
      return
    }
    setPasswordError(null)

    setSubmitting(true)
    try {
      await registerUser({ name, email, password })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registrierung fehlgeschlagen.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 py-10 text-center">
        <EnvelopeSimple size={40} className="text-accent" aria-hidden />
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Bestätige deine E-Mail-Adresse
        </h1>
        <p className="text-sm text-foreground-muted">
          Wir haben eine Bestätigungs-E-Mail an <span className="font-medium text-foreground">{email}</span> gesendet.
          Bitte bestätige deine Adresse, bevor du dich zum ersten Mal anmeldest.
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Registrieren</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Nur mit einer verifizierten <span className="font-medium text-foreground">@thm.de</span>-Adresse möglich.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Max Mustermann"
            className="h-11 border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">THM E-Mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="max.mustermann@thm.de"
            aria-describedby={error ? 'email-error' : undefined}
            className="h-11 border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {error && (
            <span id="email-error" role="alert" className="text-xs text-destructive">
              {error}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Passwort</span>
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
        <Button type="submit" size="lg" className="mt-1" disabled={submitting}>
          {submitting ? 'Registrieren…' : 'Registrieren'}
        </Button>
      </form>
      <p className="text-center text-sm text-foreground-muted">
        Bereits registriert?{' '}
        <Link to="/login" className="font-medium text-accent underline">
          Anmelden
        </Link>
      </p>
    </div>
  )
}