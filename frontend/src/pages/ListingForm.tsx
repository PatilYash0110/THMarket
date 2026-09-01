import { type FormEvent, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import type { Listing, ListingCategory } from '../types'
import { placeholderImage } from '../lib/placeholder'

const CATEGORIES: ListingCategory[] = [
  'Elektronik',
  'Bücher & Skripte',
  'Möbel',
  'Fahrräder',
  'Kleidung',
  'Sonstiges',
]

export function ListingForm() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const { currentUser } = useAuth()
  const { getListing, addListing, updateListing, markAsSold } = useListings()
  const navigate = useNavigate()

  const existing = id ? getListing(id) : undefined

  const [title, setTitle] = useState(existing?.title ?? '')
  const [category, setCategory] = useState<ListingCategory>(existing?.category ?? CATEGORIES[0])
  const [price, setPrice] = useState(existing ? String(existing.priceCents / 100) : '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [sofortkauf, setSofortkauf] = useState(existing?.sofortkaufMoeglich ?? true)
  const [imageUrl, setImageUrl] = useState(existing?.images[0] ?? '')

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (currentUser.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  if (isEditing && (!existing || existing.sellerId !== currentUser.id)) {
    return <Navigate to="/" replace />
  }

  const seller = currentUser

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const priceCents = Math.round(Number.parseFloat(price.replace(',', '.')) * 100)
    const images = [imageUrl.trim() || placeholderImage(title)]

    if (isEditing && existing) {
      updateListing(existing.id, {
        title,
        category,
        priceCents,
        description,
        sofortkaufMoeglich: sofortkauf,
        images,
      })
      navigate(`/listing/${existing.id}`)
      return
    }

    const newListing: Listing = {
      id: `listing-${Date.now()}`,
      title,
      category,
      priceCents,
      description,
      sofortkaufMoeglich: sofortkauf,
      images,
      status: 'AKTIV',
      sellerId: seller.id,
      createdAt: new Date().toISOString(),
    }
    addListing(newListing)
    navigate(`/listing/${newListing.id}`)
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {isEditing ? 'Inserat bearbeiten' : 'Inserat erstellen'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Titel</span>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="z. B. MacBook Air M1, 256GB"
            className="h-11 border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Kategorie</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ListingCategory)}
              className="h-11 border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Preis (€)</span>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0,00"
              className="h-11 border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Beschreibung</span>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Zustand, Details, Abholung…"
            className="border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-xs text-foreground-muted">
            Manuelle Eingabe — automatische Beschreibung per KI folgt in einer späteren Phase.
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Bild-URL (optional)</span>
          <input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://…"
            className="h-11 border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-xs text-foreground-muted">
            Bild-Upload folgt in Phase 3 — hier wird ohne Angabe ein Platzhalter verwendet.
          </span>
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={sofortkauf}
            onChange={(event) => setSofortkauf(event.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Sofortkauf ermöglichen (sonst nur „Anbieter kontaktieren")
        </label>

        <div className="mt-2 flex flex-wrap gap-3">
          <Button type="submit" size="lg">
            {isEditing ? 'Änderungen speichern' : 'Inserat veröffentlichen'}
          </Button>
          {isEditing && existing && existing.status === 'AKTIV' && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                markAsSold(existing.id)
                navigate(`/listing/${existing.id}`)
              }}
            >
              Als verkauft markieren
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
