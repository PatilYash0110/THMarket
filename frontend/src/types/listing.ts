export type ListingStatus = 'AKTIV' | 'VERKAUFT'

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
  createdAt: string
}
