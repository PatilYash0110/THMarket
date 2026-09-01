import clsx from 'clsx'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { ListingCard } from '../components/ListingCard'
import { useListings } from '../context/ListingsContext'
import type { ListingCategory } from '../types'

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
  const { listings } = useListings()
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('category') as ListingCategory | null
  const sort = (searchParams.get('sort') as SortOption | null) ?? 'neueste'

  const filtered = useMemo(() => {
    let result = listings.filter((listing) => listing.status === 'AKTIV')

    if (query) {
      const lower = query.toLowerCase()
      result = result.filter((listing) => listing.title.toLowerCase().includes(lower))
    }

    if (category) {
      result = result.filter((listing) => listing.category === category)
    }

    result = [...result].sort((a, b) => {
      if (sort === 'preis-auf') return a.priceCents - b.priceCents
      if (sort === 'preis-ab') return b.priceCents - a.priceCents
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return result
  }, [listings, query, category, sort])

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

  const showHero = !query && !category

  return (
    <div className="flex flex-col gap-10">
      {showHero && (
        <section className="border-b border-border pb-10">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Kaufen und verkaufen, exklusiv für THM-Studierende.
          </h1>
          <p className="mt-4 max-w-xl text-base text-foreground-muted">
            Verifiziert mit deiner @thm.de-Adresse. Elektronik, Bücher, Möbel und mehr — direkt
            von Kommiliton:innen.
          </p>
        </section>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={clsx(
              'cursor-pointer border px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors',
              !category
                ? 'border-primary bg-primary text-on-primary'
                : 'border-border text-foreground-muted hover:border-foreground hover:text-foreground',
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
                'cursor-pointer border px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors',
                category === cat
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-border text-foreground-muted hover:border-foreground hover:text-foreground',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-foreground-muted">
          Sortieren
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="border border-border bg-background px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="neueste">Neueste zuerst</option>
            <option value="preis-auf">Preis aufsteigend</option>
            <option value="preis-ab">Preis absteigend</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Keine Inserate gefunden"
          description="Versuche eine andere Suche oder Kategorie."
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}

