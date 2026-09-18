import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  fetchConversationMessages,
  fetchConversations,
  markConversationRead,
  startConversation as startConversationApi,
} from '../api/messages'
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket'
import type { Conversation, Message } from '../types'
import { useAuth } from './AuthContext'

interface MessagesContextValue {
  conversations: Conversation[]
  unreadTotal: number
  getMessages: (conversationId: string) => Message[]
  openConversation: (conversationId: string) => Promise<void>
  sendMessage: (conversationId: string, text: string) => void
  startConversation: (listingId: string) => Promise<Conversation>
}

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined)

// Newest-activity-first, same rule as the backend's own listConversations()
// sort — re-applied here since a live 'message' event updates one
// conversation's preview in place rather than refetching the whole list.
function byActivity(a: Conversation, b: Conversation): number {
  const timeOf = (c: Conversation) => new Date(c.messages[0]?.createdAt ?? 0).getTime()
  return timeOf(b) - timeOf(a)
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>({})
  const messagesByConversationRef = useRef(messagesByConversation)
  messagesByConversationRef.current = messagesByConversation
  // Which thread the user currently has open — a live message for that
  // thread gets marked read immediately instead of bumping its badge, since
  // they're already looking at it.
  const activeConversationIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!currentUser) {
      disconnectSocket()
      setConversations([])
      setMessagesByConversation({})
      activeConversationIdRef.current = null
      return
    }

    fetchConversations().then(setConversations).catch(() => setConversations([]))
    connectSocket()

    const socket = getSocket()
    function handleIncoming(message: Message) {
      const isActive = message.conversationId === activeConversationIdRef.current
      const isMine = message.senderId === currentUser!.id
      setConversations((prev) =>
        prev
          .map((conversation) =>
            conversation.id === message.conversationId
              ? {
                  ...conversation,
                  messages: [message],
                  unreadCount: isActive || isMine ? 0 : conversation.unreadCount + 1,
                }
              : conversation,
          )
          .sort(byActivity),
      )
      if (isActive && !isMine) {
        markConversationRead(message.conversationId).catch(() => {})
      }
      if (messagesByConversationRef.current[message.conversationId]) {
        setMessagesByConversation((prev) => ({
          ...prev,
          [message.conversationId]: [...prev[message.conversationId], message],
        }))
      }
    }
    socket.on('message', handleIncoming)

    return () => {
      socket.off('message', handleIncoming)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  function getMessages(conversationId: string): Message[] {
    return messagesByConversation[conversationId] ?? []
  }

  async function openConversation(conversationId: string): Promise<void> {
    activeConversationIdRef.current = conversationId
    const messages = await fetchConversationMessages(conversationId)
    setMessagesByConversation((prev) => ({ ...prev, [conversationId]: messages }))
    getSocket().emit('joinConversation', conversationId)
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    )
    markConversationRead(conversationId).catch(() => {})
  }

  function sendMessage(conversationId: string, text: string): void {
    getSocket().emit('sendMessage', { conversationId, text })
  }

  async function startConversation(listingId: string): Promise<Conversation> {
    const conversation = await startConversationApi(listingId)
    setConversations((prev) => {
      const withoutExisting = prev.filter((existing) => existing.id !== conversation.id)
      return [conversation, ...withoutExisting].sort(byActivity)
    })
    return conversation
  }

  const unreadTotal = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0)

  return (
    <MessagesContext.Provider
      value={{ conversations, unreadTotal, getMessages, openConversation, sendMessage, startConversation }}
    >
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
