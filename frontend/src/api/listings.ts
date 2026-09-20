import { ApiError, parseErrorMessage } from './auth'
import type { Listing } from '../types'

const API_URL = import.meta.env.VITE_API_URL as string

export async function fetchListings(): Promise<Listing[]> {
  // Both routes require auth now (see backend S-01) — without
  // `credentials: 'include'` the httpOnly auth cookie never gets sent and
  // every call here 401s, even for a logged-in user.
  const response = await fetch(`${API_URL}/listings`, { credentials: 'include' })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function fetchListingById(id: string): Promise<Listing | undefined> {
  const response = await fetch(`${API_URL}/listings/${id}`, { credentials: 'include' })
  if (response.status === 404) return undefined
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function createListing(input: {
  title: string
  description: string
  priceCents: number
  category: string
  images: string[]
  sofortkaufMoeglich: boolean
}): Promise<Listing> {
  const response = await fetch(`${API_URL}/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
  const response = await fetch(`${API_URL}/listings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function markListingSold(id: string): Promise<Listing> {
  const response = await fetch(`${API_URL}/listings/${id}/sold`, {
    method: 'PATCH',
    credentials: 'include',
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function purchaseListing(
  id: string,
  input: {
    paymentMethod: 'simulation' | 'guthaben'
    card?: { number: string; expiry: string; cvc: string }
  },
): Promise<Listing & { buyerBalanceCents?: number }> {
  const response = await fetch(`${API_URL}/listings/${id}/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function deleteListing(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/listings/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
}

export async function addFavorite(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/listings/${id}/favorite`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
}

export async function removeFavorite(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/listings/${id}/favorite`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
}

export async function fetchFavoriteListingIds(): Promise<string[]> {
  const response = await fetch(`${API_URL}/listings/favorites`, {
    credentials: 'include',
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function uploadListingImages(files: File[]): Promise<string[]> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  const response = await fetch(`${API_URL}/listings/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  const { urls } = (await response.json()) as { urls: string[] }
  return urls
}

export async function generateListingDescription(
  images: File[],
  hint?: string,
  title?: string,
  category?: string,
): Promise<string> {
  const formData = new FormData()
  images.forEach((file) => formData.append('files', file))
  if (hint) formData.append('hint', hint)
  if (title) formData.append('title', title)
  if (category) formData.append('category', category)
  const response = await fetch(`${API_URL}/listings/generate-description`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  const { description } = (await response.json()) as { description: string }
  return description
}
