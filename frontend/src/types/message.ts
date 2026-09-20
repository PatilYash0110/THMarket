import type { ListingStatus } from './listing'

export interface Message {
  id: string
  conversationId: string
  senderId: string | null
  text: string
  createdAt: string
}

// The list view (fetchConversations) only ever carries a preview — the full
// message history for one thread is fetched separately, lazily, once opened.
export interface Conversation {
  id: string
  listing: { id: string; title: string; status: ListingStatus } | null
  // One-time snapshot of the listing's title, taken when the conversation
  // was created — the only way to still show what a thread was about once
  // `listing` goes null (the listing was deleted). Null on threads created
  // before this snapshot existed.
  listingTitle: string | null
  buyer: { id: string; name: string } | null
  seller: { id: string; name: string } | null
  messages: Message[]
  // Messages from the other party sent after my own last-read timestamp —
  // computed server-side (see backend/src/chat/chat.service.ts's
  // countUnread), not something the client can derive on its own.
  unreadCount: number
}
