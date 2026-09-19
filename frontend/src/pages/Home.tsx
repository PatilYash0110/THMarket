import clsx from 'clsx'
import { useMemo } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { ListingCard } from '../components/ListingCard'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import type { ListingCategory } from '../types'
import { LandingPage } from './LandingPage'

const CATEGORIES: ListingCategory[] = [
  'Elektronik',
  'Bücher & Skripte',
  'Möbel',
  'Fahrräder',
  'Kleidung',
  'Sonstiges',
]

type SortOption = 'neueste' | 'preis-auf' | 'preis-ab'

export function Home() {
  const { currentUser, loading } = useAuth()
  const { listings, loading: listingsLoading, error: listingsError, retry } = useListings()
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('category') as ListingCategory | null
  const sort = (searchParams.get('sort') as SortOption | null) ?? 'neueste'
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''

  const filtered = useMemo(() => {
    let result = listings.filter((listing) => listing.status === 'AKTIV')

    if (query) {
      const lower = query.toLowerCase()
      // Matches the description too, not just the title — a search for
      // "Kratzer" or a brand name mentioned only in the body text used to
      // come back empty even when a listing plainly said so.
      result = result.filter(
        (listing) =>
          listing.title.toLowerCase().includes(lower) || listing.description.toLowerCase().includes(lower),
      )
    }

    if (category) {
      result = result.filter((listing) => listing.category === category)
    }

    const minCents = minPrice ? Math.round(Number.parseFloat(minPrice) * 100) : null
    const maxCents = maxPrice ? Math.round(Number.parseFloat(maxPrice) * 100) : null
    if (minCents !== null && Number.isFinite(minCents)) {
      result = result.filter((listing) => listing.priceCents >= minCents)
    }
    if (maxCents !== null && Number.isFinite(maxCents)) {
      result = result.filter((listing) => listing.priceCents <= maxCents)
    }

    result = [...result].sort((a, b) => {
      if (sort === 'preis-auf') return a.priceCents - b.priceCents
      if (sort === 'preis-ab') return b.priceCents - a.priceCents
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return result
  }, [listings, query, category, sort, minPrice, maxPrice])

  function setCategory(next: ListingCategory | null) {
    const params = new URLSearchParams(searchParams)
    if (next) params.set('category', next)
    else params.delete('category')
    setSearchParams(params)
  }

  function setSort(next: SortOption) {
    const params = new URLSearchParams(searchParams)
    params.set('sort', next)
    setSearchParams(params)
  }

  function setPriceBound(key: 'minPrice' | 'maxPrice', value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params, { replace: true })
  }

  if (loading) return null

  if (!currentUser) {
    return <LandingPage />
  }

  if (currentUser.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={clsx(
              'cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide transition-all motion-safe:active:scale-95',
              !category
                ? 'border-primary bg-primary text-on-primary shadow-sm'
                : 'border-border bg-surface text-foreground-muted hover:border-border-strong hover:text-foreground',
            )}
          >
            Alle
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={clsx(
                'cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide transition-all motion-safe:active:scale-95',
                category === cat
                  ? 'border-accent bg-accent text-on-accent shadow-sm'
                  : 'border-border bg-surface text-foreground-muted hover:border-border-strong hover:text-foreground',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <span>Preis</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={minPrice}
              onChange={(event) => setPriceBound('minPrice', event.target.value)}
              placeholder="Von €"
              aria-label="Mindestpreis in Euro"
              className="h-9 w-24 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span aria-hidden>–</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={maxPrice}
              onChange={(event) => setPriceBound('maxPrice', event.target.value)}
              placeholder="Bis €"
              aria-label="Höchstpreis in Euro"
              className="h-9 w-24 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-foreground-muted">
            Sortieren
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="neueste">Neueste zuerst</option>
              <option value="preis-auf">Preis aufsteigend</option>
              <option value="preis-ab">Preis absteigend</option>
            </select>
          </label>
        </div>
      </div>

      {listingsLoading ? (
        // Placeholder cards instead of "Keine Inserate gefunden" flashing
        // while the real fetch is still in flight — that empty-state text
        // used to render for a moment on every load, not just when there
        // genuinely are no results.
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex flex-col gap-2 motion-safe:animate-pulse">
              <div className="aspect-square rounded-2xl bg-surface-muted" />
              <div className="h-3.5 w-3/4 rounded-full bg-surface-muted" />
              <div className="h-3.5 w-1/3 rounded-full bg-surface-muted" />
            </div>
          ))}
        </div>
      ) : listingsError ? (
        <EmptyState
          title="Inserate konnten nicht geladen werden"
          description={listingsError}
          action={
            <Button variant="secondary" size="sm" onClick={retry}>
              Erneut versuchen
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Keine Inserate gefunden"
          description="Versuche eine andere Suche, Kategorie oder Preisspanne."
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((listing, index) => (
            <div
              key={listing.id}
              className="motion-safe:animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
            >
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
