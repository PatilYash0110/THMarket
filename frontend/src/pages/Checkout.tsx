import { CheckCircle } from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import { formatPrice } from '../lib/format'

type PaymentMode = 'simulation' | 'guthaben'

export function Checkout() {
  const { listingId } = useParams<{ listingId: string }>()
  const { currentUser, adjustBalance } = useAuth()
  const { getListing, markAsSold } = useListings()
  const [mode, setMode] = useState<PaymentMode>('simulation')
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  const listing = listingId ? getListing(listingId) : undefined

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Checked before the "still purchasable" guard below: once markAsSold() flips
  // the listing to VERKAUFT inside handleSubmit, that guard would otherwise fire
  // on the resulting re-render and redirect away before the success screen shows.
  if (completed && listing) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <CheckCircle size={40} className="text-accent" aria-hidden />
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Kauf abgeschlossen</h1>
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

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!listing) return

    if (mode === 'guthaben' && buyer.balanceCents < listing.priceCents) {
      setError('Nicht genügend Guthaben für diesen Kauf.')
      return
    }

    setError(null)
    if (mode === 'guthaben') {
      adjustBalance(-listing.priceCents)
    }
    markAsSold(listing.id)
    setCompleted(true)
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kauf abschließen</h1>

      <div className="flex items-center justify-between border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">{listing.title}</p>
          <p className="text-xs text-foreground-muted">{listing.category}</p>
        </div>
        <p className="text-lg font-semibold text-foreground">{formatPrice(listing.priceCents)}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-foreground">Zahlungsart</legend>
          <label className="flex items-center gap-2 border border-border px-3 py-2.5 text-sm text-foreground has-[:checked]:border-foreground">
            <input
              type="radio"
              name="mode"
              checked={mode === 'simulation'}
              onChange={() => setMode('simulation')}
              className="accent-accent"
            />
            Simulation (kein echtes Geld)
          </label>
          <label className="flex items-center gap-2 border border-border px-3 py-2.5 text-sm text-foreground has-[:checked]:border-foreground">
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
            <legend className="mb-1 text-sm font-medium text-foreground">Testkarte</legend>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-foreground-muted">Kartennummer</span>
              <input
                readOnly
                value="4242 4242 4242 4242"
                className="h-11 border border-border bg-surface-muted px-3 text-sm text-foreground"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-foreground-muted">Ablaufdatum</span>
                <input
                  readOnly
                  value="12/29"
                  className="h-11 border border-border bg-surface-muted px-3 text-sm text-foreground"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-foreground-muted">CVC</span>
                <input
                  readOnly
                  value="123"
                  className="h-11 border border-border bg-surface-muted px-3 text-sm text-foreground"
                />
              </label>
            </div>
            <p className="text-xs text-foreground-muted">
              Feste Testkartendaten — Phase 1/5 Mock, es findet keine echte Zahlung statt.
            </p>
          </fieldset>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg">
          Jetzt kaufen — {formatPrice(listing.priceCents)}
        </Button>
      </form>
    </div>
  )
}
