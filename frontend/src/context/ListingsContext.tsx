import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  addFavorite,
  createListing,
  deleteListing as deleteListingRequest,
  fetchFavoriteListingIds,
  fetchListingById,
  fetchListings,
  markListingSold,
  purchaseListing as purchaseListingRequest,
  removeFavorite,
  updateListing as updateListingRequest,
} from '../api/listings'
import type { Listing } from '../types'
import { useAuth } from './AuthContext'

interface CreateListingInput {
  title: string
  description: string
  priceCents: number
  category: string
  images: string[]
  sofortkaufMoeglich: boolean
}

interface PurchaseInput {
  paymentMethod: 'simulation' | 'guthaben'
  card?: { number: string; expiry: string; cvc: string }
}

interface ListingsContextValue {
  listings: Listing[]
  favoriteIds: string[]
  loading: boolean
  error: string | null
  retry: () => void
  getListing: (id: string) => Listing | undefined
  refreshListing: (id: string) => Promise<void>
  addListing: (input: CreateListingInput) => Promise<Listing>
  updateListing: (id: string, updates: Partial<Listing>) => Promise<Listing>
  markAsSold: (id: string) => Promise<Listing>
  purchaseListing: (id: string, input: PurchaseInput) => Promise<Listing & { buyerBalanceCents?: number }>
  removeListing: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  isFavorite: (id: string) => boolean
}

const ListingsContext = createContext<ListingsContextValue | undefined>(undefined)

export function ListingsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  // Previously had no .catch at all — an API outage left `listings` at its
  // initial [], which the Home page can't distinguish from "genuinely no
  // results", plus an unhandled promise rejection in the console.
  //
  // Also re-runs when a guest logs in (currentUser?.id going from
  // undefined to set): GET /listings now requires auth (S-01), so a guest
  // redirected to a listing by RequireStudent, who then logs in, would
  // otherwise be stuck with the failed/empty fetch from before they were
  // authenticated — the exact listing they were sent to view would show
  // as "not found". Keyed on the id, not the whole `currentUser` object,
  // so an unrelated update (balance, profile) doesn't also refetch.
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchListings()
      .then(setListings)
      .catch(() => setError('Inserate konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [retryToken, currentUser?.id])

  useEffect(() => {
    if (!currentUser) {
      setFavoriteIds([])
      return
    }
    // Favorites are a secondary affordance shown as filled hearts on cards
    // that already loaded some other way — silently keeping the existing
    // (possibly empty) list on failure is enough here, no dedicated error UI.
    fetchFavoriteListingIds()
      .then(setFavoriteIds)
      .catch(() => {})
  }, [currentUser])

  function retry() {
    setRetryToken((prev) => prev + 1)
  }

  function getListing(id: string) {
    return listings.find((listing) => listing.id === id)
  }

  // The main `listings` fetch only happens once per session/login — a
  // listing sold by someone else in the meantime still shows "Kaufen" and
  // 409s at checkout until a full reload. Detail/checkout pages call this
  // on mount to get that one listing's current state without refetching
  // the whole list. Silently keeps the existing (possibly stale) entry on
  // failure rather than erroring the whole page over one listing.
  async function refreshListing(id: string): Promise<void> {
    try {
      const fresh = await fetchListingById(id)
      setListings((prev) => {
        if (!fresh) return prev.filter((listing) => listing.id !== id)
        return prev.some((listing) => listing.id === id)
          ? prev.map((listing) => (listing.id === id ? fresh : listing))
          : [...prev, fresh]
      })
    } catch {
      // keep whatever was already loaded
    }
  }

  async function addListing(input: CreateListingInput) {
    const listing = await createListing(input)
    setListings((prev) => [listing, ...prev])
    return listing
  }

  async function updateListing(id: string, updates: Partial<Listing>) {
    const listing = await updateListingRequest(id, updates)
    setListings((prev) => prev.map((existing) => (existing.id === id ? listing : existing)))
    return listing
  }

  async function markAsSold(id: string) {
    const listing = await markListingSold(id)
    setListings((prev) => prev.map((existing) => (existing.id === id ? listing : existing)))
    return listing
  }

  async function purchaseListing(id: string, input: PurchaseInput) {
    const result = await purchaseListingRequest(id, input)
    setListings((prev) => prev.map((existing) => (existing.id === id ? result : existing)))
    return result
  }

  async function removeListing(id: string) {
    await deleteListingRequest(id)
    setListings((prev) => prev.filter((listing) => listing.id !== id))
  }

  async function toggleFavorite(id: string) {
    if (favoriteIds.includes(id)) {
      await removeFavorite(id)
      setFavoriteIds((prev) => prev.filter((favoriteId) => favoriteId !== id))
    } else {
      if (currentUser && currentUser.id === getListing(id)?.sellerId) return
      await addFavorite(id)
      setFavoriteIds((prev) => [...prev, id])
    }
  }

  function isFavorite(id: string) {
    return favoriteIds.includes(id)
  }

  return (
    <ListingsContext.Provider
      value={{
        listings,
        favoriteIds,
        loading,
        error,
        retry,
        getListing,
        refreshListing,
        addListing,
        updateListing,
        markAsSold,
        purchaseListing,
        removeListing,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </ListingsContext.Provider>
  )
}

export function useListings(): ListingsContextValue {
  const context = useContext(ListingsContext)
  if (!context) {
    throw new Error('useListings must be used within a ListingsProvider')
  }
  return context
}
