import { Flag, Heart, MagnifyingGlassPlus, PencilSimple, ShieldCheck, SmileySad } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/auth'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { ImageLightbox } from '../components/ImageLightbox'
import { ReportForm } from '../components/ReportForm'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import { useMessages } from '../context/MessagesContext'
import { formatDate, formatPrice } from '../lib/format'

type ReportTarget = 'LISTING' | 'USER' | null

export function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const { getListing, refreshListing, isFavorite, toggleFavorite, loading } = useListings()
  const { currentUser } = useAuth()
  const { startConversation } = useMessages()
  const navigate = useNavigate()
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [reporting, setReporting] = useState<ReportTarget>(null)
  const [contacting, setContacting] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)

  const listing = id ? getListing(id) : undefined

  // The shared `listings` list is only fetched once per session — without
  // this, a listing sold (or edited) by someone else while this page was
  // cached still shows its old status/price/Kaufen button until a full
  // reload.
  useEffect(() => {
    if (id) refreshListing(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Wait for the listings list to finish its initial fetch before deciding
  // "not found" — on a fresh page load (e.g. a hard reload of this URL),
  // `listings` is still empty for a moment and `getListing` would otherwise
  // return undefined for a listing that does in fact exist.
  if (loading) {
    return null
  }

  if (!listing) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <SmileySad size={40} className="text-foreground-muted" aria-hidden />
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">Inserat nicht gefunden</h1>
        <p className="text-sm text-foreground-muted">
          Dieses Inserat existiert nicht mehr oder wurde entfernt.
        </p>
        <Link to="/" className="text-sm font-medium text-accent underline">
          Zurück zur Startseite
        </Link>
      </div>
    )
  }

  const seller = listing.seller
  const sold = listing.status === 'VERKAUFT'
  const isOwner = currentUser?.id === listing.sellerId
  const isAdmin = currentUser?.role === 'ADMIN'
  const favorite = isFavorite(listing.id)

  const handleContactSeller = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    setContactError(null)
    setContacting(true)
    try {
      const conversation = await startConversation(listing.id)
      navigate(`/messages/${conversation.id}`)
    } catch (err) {
      setContactError(err instanceof ApiError ? err.message : 'Kontakt fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setContacting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Bild vergrößern"
          className="group relative flex h-80 w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl bg-surface-muted shadow-sm sm:h-[28rem]"
        >
          <img
            src={listing.images[activeImage]}
            alt={listing.title}
            className="h-full w-full object-contain"
          />
          <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-foreground opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
            <MagnifyingGlassPlus size={18} aria-hidden />
          </span>
        </button>
        {listing.images.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {listing.images.map((image, index) => (
              <button
                key={`${listing.id}-image-${index}`}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`Bild ${index + 1} anzeigen`}
                className={`h-16 w-16 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors ${
                  index === activeImage ? 'border-accent' : 'border-transparent hover:border-border-strong'
                }`}
              >
                <img src={image} alt="" className="h-full w-full object-cover" aria-hidden />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={listing.images}
          index={activeImage}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setActiveImage}
          alt={listing.title}
        />
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge tone="accent">{listing.category}</Badge>
            {sold && <Badge tone="neutral">Verkauft</Badge>}
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {listing.title}
          </h1>
          <p className="text-2xl font-semibold tabular-nums text-coral">{formatPrice(listing.priceCents)}</p>
          <p className="text-xs text-foreground-muted">Eingestellt am {formatDate(listing.createdAt)}</p>
        </div>

        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground-muted">
          {listing.description}
        </p>

        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">{seller?.name ?? 'Gelöschter Nutzer'}</p>
            {seller?.email && <p className="text-xs text-foreground-muted">{seller.email}</p>}
            {seller?.verified && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-accent-strong">
                <ShieldCheck size={14} weight="fill" aria-hidden />
                Verifizierte THM-Adresse
              </p>
            )}
          </div>
          {!isAdmin && !isOwner && seller && (
            <button
              type="button"
              onClick={() => setReporting(reporting === 'USER' ? null : 'USER')}
              className="flex cursor-pointer items-center gap-1 text-xs text-foreground-muted hover:text-destructive"
            >
              <Flag size={14} aria-hidden />
              Nutzer melden
            </button>
          )}
        </div>

        {reporting === 'USER' && listing.sellerId && (
          <ReportForm
            targetType="USER"
            targetId={listing.sellerId}
            contextListingId={listing.id}
            onCancel={() => setReporting(null)}
          />
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
              <Button variant="secondary" size="lg" disabled={contacting} onClick={handleContactSeller}>
                {contacting ? 'Wird geöffnet…' : 'Anbieter kontaktieren'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="lg"
              onClick={() => toggleFavorite(listing.id)}
              aria-pressed={favorite}
            >
              <Heart size={18} weight={favorite ? 'fill' : 'regular'} className={favorite ? 'text-coral' : undefined} aria-hidden />
              {favorite ? 'Gemerkt' : 'Merken'}
            </Button>
            <button
              type="button"
              onClick={() => setReporting(reporting === 'LISTING' ? null : 'LISTING')}
              aria-label="Inserat melden"
              className="flex cursor-pointer items-center gap-1.5 px-2 text-sm text-foreground-muted hover:text-destructive"
            >
              <Flag size={16} aria-hidden />
              Inserat melden
            </button>
          </div>
        )}

        {contactError && (
          <p role="alert" className="text-sm text-destructive">
            {contactError}
          </p>
        )}

        {reporting === 'LISTING' && (
          <ReportForm targetType="LISTING" targetId={listing.id} onCancel={() => setReporting(null)} />
        )}
      </div>
    </div>
  )
}
