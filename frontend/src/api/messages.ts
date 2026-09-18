import { ApiError, parseErrorMessage } from './auth'
import type { Conversation, Message } from '../types'

const API_URL = import.meta.env.VITE_API_URL as string

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_URL}/conversations`, { credentials: 'include' })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function fetchConversationMessages(id: string): Promise<Message[]> {
  const response = await fetch(`${API_URL}/conversations/${id}/messages`, { credentials: 'include' })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function startConversation(listingId: string): Promise<Conversation> {
  const response = await fetch(`${API_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ listingId }),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}
