import { CheckCircle } from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError, updateProfile } from '../api/auth'
import { Button } from '../components/Button'
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter'
import { useAuth } from '../context/AuthContext'

// Mirrors backend/src/auth/password-strength.ts
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
const PASSWORD_REQUIREMENTS_TEXT =
  'Mindestens 8 Zeichen, mit Groß- und Kleinbuchstaben sowie einer Zahl.'

export function AccountSettings() {
  const { currentUser, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(currentUser?.name ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  async function handleNameSubmit(event: FormEvent) {
    event.preventDefault()
    setNameError(null)
    setNameSuccess(false)
    setSavingName(true)
    try {
      const updated = await updateProfile({ name })
      updateUser(updated)
      setNameSuccess(true)
    } catch (err) {
      setNameError(err instanceof ApiError ? err.message : 'Speichern fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setSavingName(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault()
    setPasswordError(null)

    if (newPassword.length < 8 || !STRONG_PASSWORD_PATTERN.test(newPassword)) {
      setPasswordError(PASSWORD_REQUIREMENTS_TEXT)
      return
    }

    setSavingPassword(true)
    try {
      await updateProfile({ currentPassword, newPassword })
      // Changing the password invalidates the current JWT server-side (see
      // jwt.strategy.ts's passwordChangedAt check), so the existing token in
      // localStorage would otherwise start failing on the very next request.
      // Log out proactively and send the user to log back in with the new
      // password, rather than leaving a session that silently 401s next.
      logout()
      navigate('/login')
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'Speichern fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-10 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kontoeinstellungen</h1>

      <form onSubmit={handleNameSubmit} className="flex flex-col gap-4 border border-border p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Name</h2>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        {nameError && (
          <p role="alert" className="text-sm text-destructive">
            {nameError}
          </p>
        )}
        {nameSuccess && (
          <p className="flex items-center gap-1.5 text-sm text-accent">
            <CheckCircle size={16} weight="fill" aria-hidden />
            Name gespeichert.
          </p>
        )}
        <Button type="submit" size="md" disabled={savingName}>
          {savingName ? 'Wird gespeichert…' : 'Name speichern'}
        </Button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 border border-border p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Passwort ändern</h2>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Aktuelles Passwort</span>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="h-11 border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Neues Passwort</span>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="h-11 border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-xs text-foreground-muted">{PASSWORD_REQUIREMENTS_TEXT}</span>
          {newPassword && <PasswordStrengthMeter password={newPassword} />}
        </label>
        {passwordError && (
          <p role="alert" className="text-sm text-destructive">
            {passwordError}
          </p>
        )}
        <Button type="submit" size="md" disabled={savingPassword}>
          {savingPassword ? 'Wird gespeichert…' : 'Passwort ändern'}
        </Button>
      </form>
    </div>
  )
}
