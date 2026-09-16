import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  addFavorite,
  createListing,
  fetchFavoriteListingIds,
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
  getListing: (id: string) => Listing | undefined
  addListing: (input: CreateListingInput) => Promise<Listing>
  updateListing: (id: string, updates: Partial<Listing>) => Promise<Listing>
  markAsSold: (id: string) => Promise<Listing>
  purchaseListing: (id: string, input: PurchaseInput) => Promise<Listing & { buyerBalanceCents?: number }>
  toggleFavorite: (id: string) => Promise<void>
  isFavorite: (id: string) => boolean
}

const ListingsContext = createContext<ListingsContextValue | undefined>(undefined)

export function ListingsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListings()
      .then(setListings)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!currentUser) {
      setFavoriteIds([])
      return
    }
    fetchFavoriteListingIds().then(setFavoriteIds)
  }, [currentUser])

  function getListing(id: string) {
    return listings.find((listing) => listing.id === id)
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

  async function toggleFavorite(id: string) {
    if (favoriteIds.includes(id)) {
      await removeFavorite(id)
      setFavoriteIds((prev) => prev.filter((favoriteId) => favoriteId !== id))
    } else {
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
        getListing,
        addListing,
        updateListing,
        markAsSold,
        purchaseListing,
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
