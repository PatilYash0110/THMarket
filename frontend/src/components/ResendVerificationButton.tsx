import { useEffect, useState } from 'react'
import { ApiError, resendVerificationEmail } from '../api/auth'
import { Button } from './Button'

const COOLDOWN_SECONDS = 60

export function ResendVerificationButton({ email, fullWidth = false }: { email: string; fullWidth?: boolean }) {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const handle = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000)
    return () => clearTimeout(handle)
  }, [secondsLeft])

  async function handleClick() {
    setSending(true)
    setMessage(null)
    try {
      await resendVerificationEmail(email)
      setMessage('Bestätigungslink erneut gesendet.')
      setSecondsLeft(COOLDOWN_SECONDS)
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Senden fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={fullWidth ? 'flex w-full flex-col gap-2' : 'flex flex-col items-center gap-2'}>
      <Button
        variant="secondary"
        size={fullWidth ? 'lg' : 'sm'}
        onClick={handleClick}
        disabled={sending || secondsLeft > 0}
        className={fullWidth ? 'w-full' : undefined}
      >
        {secondsLeft > 0 ? `Erneut senden (${secondsLeft}s)` : 'Bestätigungslink erneut senden'}
      </Button>
      {message && <p className="text-xs text-foreground-muted">{message}</p>}
    </div>
  )
}
