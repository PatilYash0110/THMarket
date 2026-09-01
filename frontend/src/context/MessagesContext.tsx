import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Conversation, Message } from '../types'
import { INITIAL_CONVERSATIONS } from '../mocks/conversations'

interface MessagesContextValue {
  conversations: Conversation[]
  getConversation: (id: string) => Conversation | undefined
  sendMessage: (conversationId: string, senderId: string, text: string) => void
}

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined)

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)

  function getConversation(id: string) {
    return conversations.find((conversation) => conversation.id === id)
  }

  function sendMessage(conversationId: string, senderId: string, text: string) {
    const message: Message = {
      id: `message-${Date.now()}`,
      conversationId,
      senderId,
      text,
      sentAt: new Date().toISOString(),
    }
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, messages: [...conversation.messages, message] }
          : conversation,
      ),
    )
  }

  return (
    <MessagesContext.Provider value={{ conversations, getConversation, sendMessage }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages(): MessagesContextValue {
  const context = useContext(MessagesContext)
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider')
  }
  return context
}
