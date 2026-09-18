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
  listing: { id: string; title: string } | null
  buyer: { id: string; name: string } | null
  seller: { id: string; name: string } | null
  messages: Message[]
}
