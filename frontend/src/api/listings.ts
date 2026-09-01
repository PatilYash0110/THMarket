import type { Listing } from '../types'
import { INITIAL_LISTINGS } from '../mocks/listings'

/**
 * Phase 1: resolves against static mock data. Phase 3 replaces the bodies of
 * these functions with real HTTP calls to the NestJS backend — callers
 * (pages/components) do not need to change.
 */

export async function fetchListings(): Promise<Listing[]> {
  return INITIAL_LISTINGS
}

export async function fetchListingById(id: string): Promise<Listing | undefined> {
  return INITIAL_LISTINGS.find((listing) => listing.id === id)
}
