import { PaperPlaneRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useMessages } from '../context/MessagesContext'
import { formatDate } from '../lib/format'

export function Messages() {
  const { currentUser } = useAuth()
  const { conversationId } = useParams<{ conversationId?: string }>()
  const { conversations, getMessages, openConversation, sendMessage } = useMessages()
  const [draft, setDraft] = useState('')

  const activeConversation = conversationId
    ? conversations.find((conversation) => conversation.id === conversationId)
    : undefined

  // Lazily fetches the full history and joins the socket room only once a
  // thread is actually opened — the list view only ever carries a preview.
  useEffect(() => {
    if (activeConversation) {
      openConversation(activeConversation.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id])

  if (!currentUser) return null

  function handleSend(event: FormEvent) {
    event.preventDefault()
    if (!activeConversation || !draft.trim()) return
    sendMessage(activeConversation.id, draft.trim())
    setDraft('')
  }

  if (conversations.length === 0) {
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
        {conversations.map((conversation) => {
          const isBuyer = conversation.buyer?.id === currentUser.id
          const other = isBuyer ? conversation.seller : conversation.buyer
          const lastMessage = conversation.messages[0]

          return (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              className={clsx(
                'block border-b border-border px-4 py-3 hover:bg-surface-muted',
                conversation.id === activeConversation?.id && 'bg-surface-muted',
              )}
            >
              <p className="text-sm font-medium text-foreground">{conversation.listing?.title ?? 'Inserat'}</p>
              <p className="text-xs text-foreground-muted">mit {other?.name ?? 'Gelöschter Nutzer'}</p>
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
                {activeConversation.listing?.title ?? 'Inserat'}
              </p>
            </header>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {getMessages(activeConversation.id).map((message) => {
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
                      {formatDate(message.createdAt)}
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
