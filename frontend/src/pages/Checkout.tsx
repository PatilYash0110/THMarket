import { CheckCircle } from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/auth'
import { Button } from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import { formatPrice } from '../lib/format'

type PaymentMode = 'simulation' | 'guthaben'

export function Checkout() {
  const { listingId } = useParams<{ listingId: string }>()
  const { currentUser, setBalance } = useAuth()
  const { getListing, purchaseListing, loading } = useListings()
  const [mode, setMode] = useState<PaymentMode>('simulation')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const listing = listingId ? getListing(listingId) : undefined

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Wait for the initial listings fetch before deciding "not purchasable" —
  // on a fresh page load, `listings` is still empty for a moment and the
  // guard below would otherwise redirect away from a perfectly valid
  // checkout page.
  if (loading) {
    return null
  }

  // Checked before the "still purchasable" guard below: once purchaseListing()
  // flips the listing to VERKAUFT inside handleSubmit, that guard would otherwise
  // fire on the resulting re-render and redirect away before the success screen shows.
  if (completed && listing) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <CheckCircle size={40} className="text-accent" aria-hidden />
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">Kauf abgeschlossen</h1>
        <p className="text-sm text-foreground-muted">
          Du hast <span className="font-medium text-foreground">{listing.title}</span> erfolgreich gekauft.
        </p>
        <Link to={`/listing/${listing.id}`} className="text-sm font-medium text-accent underline">
          Zurück zum Inserat
        </Link>
      </div>
    )
  }

  if (!listing || listing.status === 'VERKAUFT' || !listing.sofortkaufMoeglich) {
    return <Navigate to="/" replace />
  }

  const buyer = currentUser

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!listing || submitting) return

    if (mode === 'guthaben' && buyer.balanceCents < listing.priceCents) {
      setError('Nicht genügend Guthaben für diesen Kauf.')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      const result = await purchaseListing(
        listing.id,
        mode === 'simulation'
          ? { paymentMethod: 'simulation', card: { number: cardNumber, expiry: cardExpiry, cvc: cardCvc } }
          : { paymentMethod: 'guthaben' },
      )
      if (result.buyerBalanceCents !== undefined) {
        setBalance(result.buyerBalanceCents)
      }
      setCompleted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kauf fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Kauf abschließen</h1>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div>
          <p className="text-sm font-medium text-foreground">{listing.title}</p>
          <p className="text-xs text-foreground-muted">{listing.category}</p>
        </div>
        <p className="text-lg font-semibold tabular-nums text-coral">{formatPrice(listing.priceCents)}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-foreground">Zahlungsart</legend>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
            <input
              type="radio"
              name="mode"
              checked={mode === 'simulation'}
              onChange={() => setMode('simulation')}
              className="accent-accent"
            />
            Simulation (kein echtes Geld)
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
            <input
              type="radio"
              name="mode"
              checked={mode === 'guthaben'}
              onChange={() => setMode('guthaben')}
              className="accent-accent"
            />
            In-App-Guthaben ({formatPrice(currentUser.balanceCents)} verfügbar)
          </label>
        </fieldset>

        {mode === 'simulation' && (
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
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Wird verarbeitet…' : `Jetzt kaufen — ${formatPrice(listing.priceCents)}`}
        </Button>
      </form>
    </div>
  )
}
