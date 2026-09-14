import { CheckCircle, XCircle } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError, verifyEmail } from '../api/auth'

type Status = 'verifying' | 'success' | 'error'

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>('verifying')
  const [message, setMessage] = useState<string | null>(null)

  // The backend clears the token after a successful verify, so calling this
  // twice for the same token would make the second call fail. StrictMode
  // deliberately double-invokes effects in development, so without this
  // guard the (harmless) first call succeeds server-side while the page
  // still ends up showing the second call's failure.
  const requestedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Kein Bestätigungscode gefunden.')
      return
    }

    if (requestedFor.current === token) return
    requestedFor.current = token

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        setMessage(err instanceof ApiError ? err.message : 'Bestätigung fehlgeschlagen.')
      })
  }, [token])

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
      {status === 'verifying' && (
        <p className="text-sm text-foreground-muted">E-Mail-Adresse wird bestätigt…</p>
      )}
      {status === 'success' && (
        <>
          <CheckCircle size={40} className="text-accent" aria-hidden />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            E-Mail-Adresse bestätigt
          </h1>
          <p className="text-sm text-foreground-muted">
            Dein Konto ist jetzt aktiv. Du kannst dich anmelden.
          </p>
          <Link to="/login" className="text-sm font-medium text-accent underline">
            Zur Anmeldung
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle size={40} className="text-destructive" aria-hidden />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Bestätigung fehlgeschlagen
          </h1>
          <p className="text-sm text-foreground-muted">{message}</p>
          <Link to="/register" className="text-sm font-medium text-accent underline">
            Erneut registrieren
          </Link>
        </>
      )}
    </div>
  )
}