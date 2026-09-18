import { CheckCircle } from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError } from '../api/auth'
import { topUpBalance } from '../api/wallet'
import { Button } from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../lib/format'

const PRESET_AMOUNTS_EUR = [10, 25, 50]

export function TopUp() {
  const { currentUser, setBalance } = useAuth()
  const [amount, setAmount] = useState('25')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (completed) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <CheckCircle size={40} className="text-accent" aria-hidden />
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">Guthaben aufgeladen</h1>
        <p className="text-sm text-foreground-muted">
          Dein neues Guthaben: <span className="font-medium text-foreground">{formatPrice(currentUser.balanceCents)}</span>
        </p>
        <Link to="/profile" className="text-sm font-medium text-accent underline">
          Zurück zum Profil
        </Link>
      </div>
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return

    const amountCents = Math.round(Number.parseFloat(amount.replace(',', '.')) * 100)
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError('Bitte gib einen gültigen Betrag ein.')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      const result = await topUpBalance({
        amountCents,
        card: { number: cardNumber, expiry: cardExpiry, cvc: cardCvc },
      })
      setBalance(result.balanceCents)
      setCompleted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Aufladen fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Guthaben aufladen</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Betrag (€)</span>
          <input
            required
            type="number"
            min="5"
            max="500"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex gap-2">
            {PRESET_AMOUNTS_EUR.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className="cursor-pointer rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground-muted transition-colors hover:border-accent hover:text-accent-strong"
              >
                {preset} €
              </button>
            ))}
          </div>
        </label>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium text-foreground">Kreditkarte</legend>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-foreground-muted">Kartennummer</span>
            <input
              required
              value={cardNumber}
              onChange={(event) => setCardNumber(event.target.value)}
              placeholder="4242 4242 4242 4242"
              className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-foreground-muted">Ablaufdatum</span>
              <input
                required
                value={cardExpiry}
                onChange={(event) => setCardExpiry(event.target.value)}
                placeholder="12/29"
                className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-foreground-muted">CVC</span>
              <input
                required
                value={cardCvc}
                onChange={(event) => setCardCvc(event.target.value)}
                placeholder="123"
                className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>
          <p className="text-xs text-foreground-muted">
            Nur die Testkarte 4242 4242 4242 4242 (12/29, CVC 123) wird akzeptiert — es findet
            keine echte Zahlung statt.
          </p>
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Wird verarbeitet…' : 'Guthaben aufladen'}
        </Button>
      </form>
    </div>
  )
}
