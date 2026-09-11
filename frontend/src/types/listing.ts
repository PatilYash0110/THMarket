export type ListingStatus = 'AKTIV' | 'VERKAUFT'

// Manuell synchron gehalten mit backend/src/listings/dto/create-listing.dto.ts's
// LISTING_CATEGORIES — kein gemeinsames Paket in diesem Monorepo, um das zu deduplizieren.
export type ListingCategory =
  | 'Elektronik'
  | 'Bücher & Skripte'
  | 'Möbel'
  | 'Fahrräder'
  | 'Kleidung'
  | 'Sonstiges'

export interface Listing {
  id: string
  title: string
  description: string
  priceCents: number
  category: ListingCategory
  images: string[]
  sofortkaufMoeglich: boolean
  status: ListingStatus
  sellerId: string
  seller: { name: string; verified: boolean }
  createdAt: string
}