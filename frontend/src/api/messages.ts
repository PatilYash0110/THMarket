import type { Conversation } from '../types'
import { INITIAL_CONVERSATIONS } from '../mocks/conversations'

/**
 * Phase 1: resolves against static mock data. Phase 4 replaces the bodies of
 * these functions with real Socket.io-backed calls — callers do not need to
 * change.
 */

export async function fetchConversations(): Promise<Conversation[]> {
  return INITIAL_CONVERSATIONS
}

export async function fetchConversationById(id: string): Promise<Conversation | undefined> {
  return INITIAL_CONVERSATIONS.find((conversation) => conversation.id === id)
}
