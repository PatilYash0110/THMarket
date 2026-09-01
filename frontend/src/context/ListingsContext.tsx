import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Listing } from '../types'
import { INITIAL_LISTINGS } from '../mocks/listings'

interface ListingsContextValue {
  listings: Listing[]
  favoriteIds: string[]
  getListing: (id: string) => Listing | undefined
  addListing: (listing: Listing) => void
  updateListing: (id: string, updates: Partial<Listing>) => void
  markAsSold: (id: string) => void
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
}

const ListingsContext = createContext<ListingsContextValue | undefined>(undefined)

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  function getListing(id: string) {
    return listings.find((listing) => listing.id === id)
  }

  function addListing(listing: Listing) {
    setListings((prev) => [listing, ...prev])
  }

  function updateListing(id: string, updates: Partial<Listing>) {
    setListings((prev) =>
      prev.map((listing) => (listing.id === id ? { ...listing, ...updates } : listing)),
    )
  }

  function markAsSold(id: string) {
    updateListing(id, { status: 'VERKAUFT' })
  }

  function toggleFavorite(id: string) {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((favoriteId) => favoriteId !== id) : [...prev, id],
    )
  }

  function isFavorite(id: string) {
    return favoriteIds.includes(id)
  }

  return (
    <ListingsContext.Provider
      value={{
        listings,
        favoriteIds,
        getListing,
        addListing,
        updateListing,
        markAsSold,
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
