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
  clearActiveConversation: () => void
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
  const conversationsRef = useRef(conversations)
  conversationsRef.current = conversations
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

    const socket = getSocket()
    // Join every conversation's room up front, not just whichever one gets
    // opened — otherwise a live 'message' event for a thread the user
    // hasn't visited this session never reaches this socket at all (the
    // server only broadcasts to clients that joined that room), so the
    // unread badge would silently miss it until the next full page load.
    fetchConversations()
      .then((fetched) => {
        setConversations(fetched)
        fetched.forEach((conversation) => socket.emit('joinConversation', conversation.id))
      })
      .catch(() => setConversations([]))
    connectSocket()

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

    // A brand-new conversation the seller had no reason to have joined the
    // room for yet (it didn't exist at connect time) — the server emits
    // this to the user's own 'user:<id>' room. Joining its conversation
    // room here means the seller's next live 'message' in it also arrives
    // without needing a page reload first.
    function handleConversationStarted(conversation: Conversation) {
      setConversations((prev) => {
        const withoutExisting = prev.filter((existing) => existing.id !== conversation.id)
        return [conversation, ...withoutExisting].sort(byActivity)
      })
      socket.emit('joinConversation', conversation.id)
    }
    socket.on('conversationStarted', handleConversationStarted)

    // Re-join every conversation's room after a reconnect (sleep, Wi-Fi
    // blip, server restart) — socket.io drops all room membership on
    // disconnect, so without this a client that reconnects silently stops
    // receiving 'message' events for every thread until a full page reload.
    // Reads conversationsRef rather than closing over `conversations`
    // directly, since this listener is registered once per currentUser
    // change and would otherwise always re-join the room list from the
    // moment it was attached.
    function handleReconnect() {
      conversationsRef.current.forEach((conversation) => socket.emit('joinConversation', conversation.id))
    }
    socket.on('connect', handleReconnect)

    return () => {
      socket.off('message', handleIncoming)
      socket.off('conversationStarted', handleConversationStarted)
      socket.off('connect', handleReconnect)
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

  // Called when the message thread view unmounts/switches threads, so a
  // conversation viewed once doesn't permanently stay "active" — without
  // this, handleIncoming above would keep treating every later message on
  // that thread as already-read (isActive stays true forever) and its
  // unread badge would never increment again.
  function clearActiveConversation(): void {
    activeConversationIdRef.current = null
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
    getSocket().emit('joinConversation', conversation.id)
    return conversation
  }

  const unreadTotal = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0)

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        unreadTotal,
        getMessages,
        openConversation,
        clearActiveConversation,
        sendMessage,
        startConversation,
      }}
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
