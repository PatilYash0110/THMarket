export type ListingStatus = 'AKTIV' | 'VERKAUFT'

// Kept manually in sync with backend/src/listings/dto/create-listing.dto.ts's
// LISTING_CATEGORIES — no shared package in this monorepo to dedupe it.
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
  // Nullable: a seller's account can be deleted by an admin after their
  // listing sells (VERKAUFT listings survive with sellerId set to null so
  // completed-sale history isn't destroyed — see backend AdminService).
  sellerId: string | null
  seller: { name: string; verified: boolean } | null
  buyerId: string | null
  createdAt: string
}
