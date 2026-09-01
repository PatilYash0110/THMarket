import { Heart, PencilSimple, ShieldCheck } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import { formatDate, formatPrice } from '../lib/format'
import { findUserById } from '../mocks/users'

export function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const { getListing, isFavorite, toggleFavorite } = useListings()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [activeImage, setActiveImage] = useState(0)

  const listing = id ? getListing(id) : undefined

  if (!listing) {
    return <Navigate to="/" replace />
  }

  const seller = findUserById(listing.sellerId)
  const sold = listing.status === 'VERKAUFT'
  const isOwner = currentUser?.id === listing.sellerId
  const isAdmin = currentUser?.role === 'ADMIN'
  const favorite = isFavorite(listing.id)

  function handleContactSeller() {
    if (!currentUser) {
      navigate('/login')
      return
    }
    navigate('/messages')
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="aspect-square overflow-hidden bg-surface-muted">
          <img
            src={listing.images[activeImage]}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        </div>
        {listing.images.length > 1 && (
          <div className="flex gap-2">
            {listing.images.map((image, index) => (
              <button
                key={`${listing.id}-image-${index}`}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`Bild ${index + 1} anzeigen`}
                className={`h-16 w-16 cursor-pointer overflow-hidden border ${
                  index === activeImage ? 'border-foreground' : 'border-border'
                }`}
              >
                <img src={image} alt="" className="h-full w-full object-cover" aria-hidden />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{listing.category}</Badge>
            {sold && <Badge tone="neutral">Verkauft</Badge>}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {listing.title}
          </h1>
          <p className="text-2xl font-semibold text-foreground">{formatPrice(listing.priceCents)}</p>
          <p className="text-xs text-foreground-muted">Eingestellt am {formatDate(listing.createdAt)}</p>
        </div>

        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground-muted">
          {listing.description}
        </p>

        {seller && (
          <div className="flex items-center justify-between border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{seller.name}</p>
              {seller.verified && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-accent">
                  <ShieldCheck size={14} weight="fill" aria-hidden />
                  Verifizierte THM-Adresse
                </p>
              )}
            </div>
          </div>
        )}

        {isAdmin ? (
          <p className="text-xs uppercase tracking-wide text-foreground-muted">
            Admin-Ansicht — Kauf, Kontakt und Merken sind für Admin-Konten nicht verfügbar.
          </p>
        ) : isOwner ? (
          <div className="flex flex-wrap gap-3">
            <Link to={`/listing/${listing.id}/edit`}>
              <Button variant="secondary">
                <PencilSimple size={16} aria-hidden />
                Bearbeiten
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {!sold && listing.sofortkaufMoeglich && (
              <Link to={`/checkout/${listing.id}`}>
                <Button variant="primary" size="lg">
                  Kaufen
                </Button>
              </Link>
            )}
            {!sold && (
              <Button variant="secondary" size="lg" onClick={handleContactSeller}>
                Anbieter kontaktieren
              </Button>
            )}
            <Button
              variant="ghost"
              size="lg"
              onClick={() => toggleFavorite(listing.id)}
              aria-pressed={favorite}
            >
              <Heart size={18} weight={favorite ? 'fill' : 'regular'} className={favorite ? 'text-accent' : undefined} aria-hidden />
              {favorite ? 'Gemerkt' : 'Merken'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
