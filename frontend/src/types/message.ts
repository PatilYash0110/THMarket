export interface Message {
    id: string
    conversationId: string
    senderId: string
    text: string
    sentAt: string
  }
  
  export interface Conversation {
    id: string
    listingId: string
    participantIds: string[]
    messages: Message[]
  }
  