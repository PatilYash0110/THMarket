import { Plus, X } from '@phosphor-icons/react'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import { placeholderImage } from '../lib/placeholder'
import type { Listing, ListingCategory } from '../types'

const CATEGORIES: ListingCategory[] = [
  'Elektronik',
  'Bücher & Skripte',
  'Möbel',
  'Fahrräder',
  'Kleidung',
  'Sonstiges',
]

const MAX_IMAGES = 6

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
  const [images, setImages] = useState<string[]>(existing?.images ?? [])
  const objectUrlsRef = useRef(new Set<string>())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const urls = objectUrlsRef.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return
    const files = Array.from(fileList).slice(0, MAX_IMAGES - images.length)
    const newUrls = files.map((file) => {
      const url = URL.createObjectURL(file)
      objectUrlsRef.current.add(url)
      return url
    })
    setImages((prev) => [...prev, ...newUrls])
  }

  function removeImage(url: string) {
    if (objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url)
      objectUrlsRef.current.delete(url)
    }
    setImages((prev) => prev.filter((image) => image !== url))
  }

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
    const finalImages = images.length > 0 ? images : [placeholderImage(title)]

    if (isEditing && existing) {
      updateListing(existing.id, {
        title,
        category,
        priceCents,
        description,
        sofortkaufMoeglich: sofortkauf,
        images: finalImages,
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
      images: finalImages,
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

        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Fotos (optional)</span>
          <div className="flex flex-wrap gap-3">
            {images.map((image) => (
              <div key={image} className="group relative h-24 w-24 shrink-0 overflow-hidden border border-border">
                <img src={image} alt="" className="h-full w-full object-cover" aria-hidden />
                <button
                  type="button"
                  onClick={() => removeImage(image)}
                  aria-label="Bild entfernen"
                  className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center bg-background/90 text-foreground hover:text-destructive"
                >
                  <X size={14} aria-hidden />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-border text-foreground-muted hover:border-foreground hover:text-foreground"
              >
                <Plus size={20} aria-hidden />
                <span className="text-xs">Hinzufügen</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              handleFilesSelected(event.target.files)
              event.target.value = ''
            }}
            className="hidden"
          />
          <span className="text-xs text-foreground-muted">
            Wähle Fotos von deinem Gerät — bis zu {MAX_IMAGES}. Ohne Angabe wird ein Platzhalter
            verwendet. Dauerhafte Speicherung (Cloudinary) folgt in Phase 3.
          </span>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={sofortkauf}
            onChange={(event) => setSofortkauf(event.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Sofortkauf ermöglichen (sonst nur „Anbieter kontaktieren“)
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
