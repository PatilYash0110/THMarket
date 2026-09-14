import { ApiError, parseErrorMessage } from './auth'
import type { Listing } from '../types'

const API_URL = import.meta.env.VITE_API_URL as string
const TOKEN_STORAGE_KEY = 'thmarket.token'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchListings(): Promise<Listing[]> {
  const response = await fetch(`${API_URL}/listings`)
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function fetchListingById(id: string): Promise<Listing | undefined> {
  const response = await fetch(`${API_URL}/listings/${id}`)
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
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
  const response = await fetch(`${API_URL}/listings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(updates),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function markListingSold(id: string): Promise<Listing> {
  const response = await fetch(`${API_URL}/listings/${id}/sold`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function addFavorite(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/listings/${id}/favorite`, {
    method: 'POST',
    headers: authHeaders(),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
}

export async function removeFavorite(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/listings/${id}/favorite`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
}

export async function fetchFavoriteListingIds(): Promise<string[]> {
  const response = await fetch(`${API_URL}/listings/favorites`, {
    headers: authHeaders(),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function uploadListingImages(files: File[]): Promise<string[]> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  const response = await fetch(`${API_URL}/listings/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  const { urls } = (await response.json()) as { urls: string[] }
  return urls
}