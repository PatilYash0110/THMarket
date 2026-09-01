import { type FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { MOCK_ADMIN, MOCK_STUDENT } from '../mocks/users'

export function Login() {
  const { currentUser, loginAs } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  if (currentUser) {
    return <Navigate to={from} replace />
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    loginAs(MOCK_STUDENT.id)
    navigate(from, { replace: true })
  }

  function handleDemoLogin(userId: string) {
    loginAs(userId)
    navigate(from, { replace: true })
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Anmelden</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Melde dich mit deiner <span className="font-medium text-foreground">@thm.de</span>-Adresse an.
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
            className="h-11 border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Passwort</span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="h-11 border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <Button type="submit" size="lg" className="mt-2">
          Anmelden
        </Button>
      </form>

      <div className="border-t border-border pt-6">
        <p className="mb-3 text-xs uppercase tracking-wide text-foreground-muted">
          Demo-Zugänge (Phase 1 — Mock)
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={() => handleDemoLogin(MOCK_STUDENT.id)}>
            Als Studentin anmelden — {MOCK_STUDENT.name}
          </Button>
          <Button variant="secondary" onClick={() => handleDemoLogin(MOCK_ADMIN.id)}>
            Als Admin anmelden — {MOCK_ADMIN.name}
          </Button>
        </div>
      </div>
    </div>
  )
}
