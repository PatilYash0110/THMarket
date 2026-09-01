import { PaperPlaneRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { type FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import { useMessages } from '../context/MessagesContext'
import { formatDate } from '../lib/format'
import { findUserById } from '../mocks/users'

export function Messages() {
  const { currentUser } = useAuth()
  const { conversationId } = useParams<{ conversationId?: string }>()
  const { conversations, sendMessage } = useMessages()
  const { getListing } = useListings()
  const [draft, setDraft] = useState('')

  if (!currentUser) return null

  const myConversations = conversations.filter((conversation) =>
    conversation.participantIds.includes(currentUser.id),
  )
  const activeConversation = conversationId
    ? myConversations.find((conversation) => conversation.id === conversationId)
    : undefined

  function handleSend(event: FormEvent) {
    event.preventDefault()
    if (!activeConversation || !draft.trim() || !currentUser) return
    sendMessage(activeConversation.id, currentUser.id, draft.trim())
    setDraft('')
  }

  if (myConversations.length === 0) {
    return (
      <EmptyState
        title="Noch keine Unterhaltungen"
        description="Kontaktiere einen Verkäufer über ein Inserat, um hier zu chatten."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 border border-border md:grid-cols-[280px_1fr]">
      <aside className="border-b border-border md:border-b-0 md:border-r">
        {myConversations.map((conversation) => {
          const listing = getListing(conversation.listingId)
          const otherId = conversation.participantIds.find((id) => id !== currentUser.id)
          const other = otherId ? findUserById(otherId) : undefined
          const lastMessage = conversation.messages[conversation.messages.length - 1]

          return (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              className={clsx(
                'block border-b border-border px-4 py-3 hover:bg-surface-muted',
                conversation.id === activeConversation?.id && 'bg-surface-muted',
              )}
            >
              <p className="text-sm font-medium text-foreground">{listing?.title ?? 'Inserat'}</p>
              <p className="text-xs text-foreground-muted">mit {other?.name ?? 'Nutzer'}</p>
              {lastMessage && (
                <p className="mt-1 truncate text-xs text-foreground-muted">{lastMessage.text}</p>
              )}
            </Link>
          )
        })}
      </aside>

      <section className="flex min-h-[24rem] flex-col">
        {!activeConversation ? (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-foreground-muted">
            Wähle eine Unterhaltung aus.
          </div>
        ) : (
          <>
            <header className="border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                {getListing(activeConversation.listingId)?.title ?? 'Inserat'}
              </p>
            </header>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {activeConversation.messages.map((message) => {
                const isMine = message.senderId === currentUser.id
                return (
                  <div
                    key={message.id}
                    className={clsx('flex flex-col', isMine ? 'items-end' : 'items-start')}
                  >
                    <div
                      className={clsx(
                        'max-w-xs px-3 py-2 text-sm',
                        isMine ? 'bg-primary text-on-primary' : 'bg-surface-muted text-foreground',
                      )}
                    >
                      {message.text}
                    </div>
                    <span className="mt-1 text-[10px] text-foreground-muted">
                      {formatDate(message.sentAt)}
                    </span>
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Nachricht schreiben…"
                aria-label="Nachricht schreiben"
                className="h-11 flex-1 border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                aria-label="Senden"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
                disabled={!draft.trim()}
              >
                <PaperPlaneRight size={18} aria-hidden />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
