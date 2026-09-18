import { ApiError, parseErrorMessage } from './auth'
import type { Conversation, Message } from '../types'

const API_URL = import.meta.env.VITE_API_URL as string
const TOKEN_STORAGE_KEY = 'thmarket.token'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_URL}/conversations`, {
    headers: authHeaders(),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function fetchConversationMessages(id: string): Promise<Message[]> {
  const response = await fetch(`${API_URL}/conversations/${id}/messages`, {
    headers: authHeaders(),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function startConversation(listingId: string): Promise<Conversation> {
  const response = await fetch(`${API_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ listingId }),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}
