import { Plus, Sparkle, X } from '@phosphor-icons/react'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/auth'
import { generateListingDescription, uploadListingImages } from '../api/listings'
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

// Existing photos already have a real (Cloudinary) URL; new picks are raw
// Files that only get uploaded on submit — until then they're previewed via
// a local object URL. Both render through the same thumbnail grid.
type ImageItem = { kind: 'existing'; url: string } | { kind: 'new'; file: File; previewUrl: string }

export function ListingForm() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const { currentUser, loading: authLoading } = useAuth()
  const { getListing, loading: listingsLoading } = useListings()
  const [deleted, setDeleted] = useState(false)

  // Unlike routes wrapped in <RequireStudent> (which already gate on this),
  // /listing/new and /listing/:id/edit are bare routes that do their own
  // auth check inline — so on a fresh direct load of either URL, AuthContext
  // briefly has currentUser === null while it resolves the stored token.
  // Deciding "not logged in" during that window redirected to /login, and
  // since that redirect carried no `state.from`, Login then bounced on to
  // "/" once the real (logged-in) user resolved a moment later — a logged-in
  // user landing on either URL never actually saw the form. Same class of
  // bug as the listings-loading race below, just on the auth side.
  if (authLoading) {
    return null
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (currentUser.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  // Wait for the listings fetch before resolving `existing`. Mounting the
  // real field-editing form below before this resolves would seed its
  // useState calls from an empty `existing` — and since useState initializers
  // only run once on mount, the form would never pick up the real values
  // once the listing does load, silently turning "edit" into "blank form
  // that overwrites the listing on submit" on a fresh page reload.
  if (isEditing && listingsLoading) {
    return null
  }

  const existing = id ? getListing(id) : undefined

  // Deleting the listing (below) removes it from the shared listings array,
  // which would otherwise make this exact "not found" check fire on the
  // very next render — racing the child's own post-delete navigation and
  // sometimes winning, landing on "/" instead of "/profile". `deleted` is
  // set by the child right before that race could happen, so this
  // wrapper-owned redirect always takes precedence once we know the vanished
  // listing is our own doing, not a genuine not-found/not-owner case.
  if (deleted) {
    return <Navigate to="/profile" replace />
  }

  if (isEditing && (!existing || existing.sellerId !== currentUser.id)) {
    return <Navigate to="/" replace />
  }

  // Mounted with a key so React creates a fresh instance — re-seeding every
  // useState from `existing` — whenever the edited listing's identity
  // changes, instead of reusing a stale instance across listings.
  return (
    <ListingFormFields
      key={existing?.id ?? 'new'}
      existing={existing}
      isEditing={isEditing}
      onDeleted={() => setDeleted(true)}
    />
  )
}

function ListingFormFields({
  existing,
  isEditing,
  onDeleted,
}: {
  existing: Listing | undefined
  isEditing: boolean
  onDeleted: () => void
}) {
  const { addListing, updateListing, markAsSold, removeListing } = useListings()
  const navigate = useNavigate()

  const [title, setTitle] = useState(existing?.title ?? '')
  const [category, setCategory] = useState<ListingCategory>(existing?.category ?? CATEGORIES[0])
  const [price, setPrice] = useState(existing ? String(existing.priceCents / 100) : '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [aiHint, setAiHint] = useState('')
  const [generating, setGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [sofortkauf, setSofortkauf] = useState(existing?.sofortkaufMoeglich ?? true)
  const [images, setImages] = useState<ImageItem[]>(
    (existing?.images ?? []).map((url) => ({ kind: 'existing', url })),
  )
  const [imageError, setImageError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
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
    const available = MAX_IMAGES - images.length
    const files = Array.from(fileList)

    if (files.length > available) {
      setImageError(
        `Du kannst maximal ${MAX_IMAGES} Fotos hochladen. Es wurden nur die ersten ${available} ausgewählt.`,
      )
    } else {
      setImageError(null)
    }

    const newItems: ImageItem[] = files.slice(0, available).map((file) => {
      const previewUrl = URL.createObjectURL(file)
      objectUrlsRef.current.add(previewUrl)
      return { kind: 'new', file, previewUrl }
    })
    setImages((prev) => [...prev, ...newItems])
  }

  function removeImage(item: ImageItem) {
    if (item.kind === 'new') {
      URL.revokeObjectURL(item.previewUrl)
      objectUrlsRef.current.delete(item.previewUrl)
    }
    setImageError(null)
    setImages((prev) =>
      prev.filter((image) => (item.kind === 'existing' ? !(image.kind === 'existing' && image.url === item.url) : !(image.kind === 'new' && image.file === item.file))),
    )
  }

  // Only newly-picked, not-yet-uploaded photos are sent to Gemini — an
  // existing edit's already-Cloudinary-hosted images aren't re-fetched and
  // re-sent for this. Regenerating on an edit with only old photos and no
  // hint needs at least a hint typed in first.
  async function handleGenerateDescription() {
    const newImages = images.filter((item): item is Extract<ImageItem, { kind: 'new' }> => item.kind === 'new')
    if (newImages.length === 0 && !aiHint.trim()) {
      setAiError('Wähle mindestens ein Foto oder gib einen Hinweis ein.')
      return
    }
    if (description.trim() && !window.confirm('Die vorhandene Beschreibung durch einen KI-Vorschlag ersetzen?')) {
      return
    }
    setAiError(null)
    setGenerating(true)
    try {
      const result = await generateListingDescription(
        newImages.map((item) => item.file),
        aiHint.trim() || undefined,
        title || undefined,
        category,
      )
      setDescription(result)
    } catch (err) {
      setAiError(
        err instanceof ApiError
          ? err.message
          : 'Beschreibung konnte nicht generiert werden. Bitte manuell eingeben.',
      )
    } finally {
      setGenerating(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const priceCents = Math.round(Number.parseFloat(price.replace(',', '.')) * 100)

      const newFiles = images.filter((item): item is Extract<ImageItem, { kind: 'new' }> => item.kind === 'new')
      const uploadedUrls = newFiles.length > 0 ? await uploadListingImages(newFiles.map((item) => item.file)) : []
      let uploadIndex = 0
      const resolvedImages = images.map((item) =>
        item.kind === 'existing' ? item.url : uploadedUrls[uploadIndex++],
      )
      const finalImages = resolvedImages.length > 0 ? resolvedImages : [placeholderImage(title)]

      if (isEditing && existing) {
        await updateListing(existing.id, {
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

      const newListing = await addListing({
        title,
        category,
        priceCents,
        description,
        sofortkaufMoeglich: sofortkauf,
        images: finalImages,
      })
      navigate(`/listing/${newListing.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMarkAsSold() {
    if (!existing || submitting) return
    if (!window.confirm('Bist du sicher, dass du dieses Inserat als verkauft markieren möchtest?')) {
      return
    }
    setSubmitting(true)
    try {
      await markAsSold(existing.id)
      navigate(`/listing/${existing.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!existing || submitting) return
    if (!window.confirm('Bist du sicher, dass du dieses Inserat endgültig löschen möchtest?')) {
      return
    }
    setSubmitting(true)
    try {
      await removeListing(existing.id)
      // Not navigate('/profile') directly: removing the listing from the
      // shared ListingsContext array makes the parent wrapper's "not found"
      // check see `existing` vanish on its next render, which can otherwise
      // race this navigation and win, landing on "/" instead of "/profile".
      // onDeleted() tells the wrapper this is an expected deletion so it
      // redirects to /profile itself, with no ambiguity to race.
      onDeleted()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
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
            className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Kategorie</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ListingCategory)}
              className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-foreground">Beschreibung</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={generating}
              onClick={handleGenerateDescription}
            >
              <Sparkle size={14} aria-hidden />
              {generating ? 'Wird generiert…' : 'Mit KI generieren'}
            </Button>
          </div>
          <input
            value={aiHint}
            onChange={(event) => setAiHint(event.target.value)}
            placeholder="Hinweis für die KI (optional), z. B. kleiner Kratzer am Rahmen"
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <textarea
            required
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Zustand, Details, Abholung…"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {aiError ? (
            <p role="alert" className="text-xs text-destructive">
              {aiError}
            </p>
          ) : (
            <span className="text-xs text-foreground-muted">
              Manuelle Eingabe, oder Foto(s)/Hinweis oben angeben und auf „Mit KI generieren" klicken —
              der Vorschlag bleibt danach frei bearbeitbar.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Fotos (optional)</span>
          <div className="flex flex-wrap gap-3">
            {images.map((image) => {
              const src = image.kind === 'existing' ? image.url : image.previewUrl
              return (
                <div key={src} className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border">
                  <img src={src} alt="" className="h-full w-full object-cover" aria-hidden />
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    aria-label="Bild entfernen"
                    className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-surface/90 text-foreground shadow-sm hover:text-destructive"
                  >
                    <X size={14} aria-hidden />
                  </button>
                </div>
              )
            })}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-strong text-foreground-muted transition-colors hover:border-accent hover:text-accent-strong"
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
          {imageError && (
            <p role="alert" className="text-xs text-destructive">
              {imageError}
            </p>
          )}
          <span className="text-xs text-foreground-muted">
            Wähle Fotos von deinem Gerät — bis zu {MAX_IMAGES}. Ohne Angabe wird ein Platzhalter
            verwendet.
          </span>
        </div>

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
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? 'Wird gespeichert…' : isEditing ? 'Änderungen speichern' : 'Inserat veröffentlichen'}
          </Button>
          {isEditing && existing && existing.status === 'AKTIV' && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                disabled={submitting}
                onClick={handleMarkAsSold}
              >
                Als verkauft markieren
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="lg"
                disabled={submitting}
                onClick={handleDelete}
              >
                Inserat löschen
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
