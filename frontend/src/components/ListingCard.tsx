import { Heart } from '@phosphor-icons/react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useListings } from '../context/ListingsContext'
import { formatPrice } from '../lib/format'
import type { Listing } from '../types'
import { Badge } from './Badge'

export function ListingCard({ listing }: { listing: Listing }) {
  const { isFavorite, toggleFavorite } = useListings()
  const favorite = isFavorite(listing.id)
  const sold = listing.status === 'VERKAUFT'

  return (
    <div className="group relative flex flex-col">
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-surface-muted">
          <img
            src={listing.images[0]}
            alt={listing.title}
            loading="lazy"
            className={clsx(
              'h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105',
              sold && 'opacity-50 grayscale',
            )}
          />
          {sold && (
            <span className="absolute left-3 top-3">
              <Badge tone="neutral">Verkauft</Badge>
            </span>
          )}
        </div>
      </Link>

      <button
        type="button"
        aria-label={favorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
        aria-pressed={favorite}
        onClick={() => toggleFavorite(listing.id)}
        className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center bg-background/90 text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Heart size={18} weight={favorite ? 'fill' : 'regular'} className={favorite ? 'text-accent' : undefined} aria-hidden />
      </button>

      <div className="mt-3 flex flex-col gap-1">
        <Link to={`/listing/${listing.id}`} className="text-sm font-medium text-foreground hover:underline">
          {listing.title}
        </Link>
        <p className="text-sm font-semibold text-foreground">{formatPrice(listing.priceCents)}</p>
        <p className="text-xs text-foreground-muted">{listing.category}</p>
      </div>
    </div>
  )
}
