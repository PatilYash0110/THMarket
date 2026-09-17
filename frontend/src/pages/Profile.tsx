import { Gear, ShieldCheck, Wallet } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { ListingCard } from '../components/ListingCard'
import { Button } from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import { formatPrice } from '../lib/format'
import type { Listing } from '../types'

function ListingSection({
  title,
  listings,
  emptyTitle,
  emptyDescription,
  action,
}: {
  title: string
  listings: Listing[]
  emptyTitle: string
  emptyDescription: string
  action?: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {action}
      </div>

      {listings.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  )
}

export function Profile() {
  const { currentUser } = useAuth()
  const { listings } = useListings()

  if (!currentUser) return null

  const activeListings = listings.filter(
    (listing) => listing.sellerId === currentUser.id && listing.status === 'AKTIV',
  )
  const soldListings = listings.filter(
    (listing) => listing.sellerId === currentUser.id && listing.status === 'VERKAUFT',
  )
  const purchasedListings = listings.filter((listing) => listing.buyerId === currentUser.id)

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6 border border-border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center bg-surface-muted text-lg font-semibold text-foreground">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{currentUser.name}</p>
            <p className="text-sm text-foreground-muted">{currentUser.email}</p>
            {currentUser.verified && (
              <p className="mt-1 flex items-center gap-1 text-xs text-accent">
                <ShieldCheck size={14} weight="fill" aria-hidden />
                Verifizierte THM-Adresse
              </p>
            )}
          </div>
          <Link
            to="/settings"
            aria-label="Kontoeinstellungen"
            className="flex h-9 w-9 items-center justify-center text-foreground-muted hover:text-foreground"
          >
            <Gear size={20} aria-hidden />
          </Link>
        </div>

        <div className="flex items-center gap-3 border border-border px-4 py-3">
          <Wallet size={20} className="text-accent" aria-hidden />
          <div>
            <p className="text-xs uppercase tracking-wide text-foreground-muted">Guthaben</p>
            <p className="text-lg font-semibold text-foreground">
              {formatPrice(currentUser.balanceCents)}
            </p>
          </div>
          <Link to="/topup">
            <Button size="sm" variant="secondary">
              Aufladen
            </Button>
          </Link>
          <Link to="/withdraw">
            <Button size="sm" variant="ghost">
              Auszahlen
            </Button>
          </Link>
        </div>
      </div>

      <ListingSection
        title="Aktive Inserate"
        listings={activeListings}
        emptyTitle="Noch keine aktiven Inserate"
        emptyDescription="Erstelle dein erstes Inserat, um es hier zu sehen."
        action={
          <Link to="/listing/new">
            <Button size="sm" variant="secondary">
              Neues Inserat
            </Button>
          </Link>
        }
      />

      <ListingSection
        title="Verkaufte Inserate"
        listings={soldListings}
        emptyTitle="Noch keine verkauften Inserate"
        emptyDescription="Sobald du ein Inserat verkaufst, erscheint es hier."
      />

      <ListingSection
        title="Meine Käufe"
        listings={purchasedListings}
        emptyTitle="Noch keine Käufe"
        emptyDescription="Sobald du etwas kaufst, erscheint es hier."
      />
    </div>
  )
}
