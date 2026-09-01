import { EnvelopeSimple } from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

const THM_EMAIL_PATTERN = /^[^\s@]+@([a-z0-9-]+\.)*thm\.de$/i

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!THM_EMAIL_PATTERN.test(email)) {
      setError('Bitte verwende eine gültige @thm.de-Adresse.')
      return
    }
    setError(null)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <EnvelopeSimple size={40} className="text-accent" aria-hidden />
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Bestätige deine E-Mail-Adresse
        </h1>
        <p className="text-sm text-foreground-muted">
          Wir haben eine Bestätigungs-E-Mail an <span className="font-medium text-foreground">{email}</span> gesendet.
          Bitte bestätige deine Adresse, bevor du dich zum ersten Mal anmeldest.
        </p>
        <p className="text-xs text-foreground-muted">
          (Phase 1 — Mock: kein echter E-Mail-Versand, kommt in Phase 2.)
        </p>
        <Link to="/login" className="text-sm font-medium text-accent underline">
          Zur Anmeldung
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-8 py-8">
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
            placeholder="Mindestens 8 Zeichen"
            className="h-11 border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <Button type="submit" size="lg" className="mt-2">
          Registrieren
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
