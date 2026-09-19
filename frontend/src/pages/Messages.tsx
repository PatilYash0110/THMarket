import { PaperPlaneRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useMessages } from '../context/MessagesContext'
import { formatDate } from '../lib/format'

// A small colored "squircle" standing in for a profile photo, since listings
// carry photos but student accounts don't.
function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-sm font-semibold text-accent-strong',
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export function Messages() {
  const { currentUser } = useAuth()
  const { conversationId } = useParams<{ conversationId?: string }>()
  const { conversations, getMessages, openConversation, clearActiveConversation, sendMessage } = useMessages()
  const [draft, setDraft] = useState('')

  const activeConversation = conversationId
    ? conversations.find((conversation) => conversation.id === conversationId)
    : undefined

  // Lazily fetches the full history and joins the socket room only once a
  // thread is actually opened — the list view only ever carries a preview.
  // Cleanup clears the "currently open" marker on unmount/thread switch —
  // without it, a thread visited once would keep being treated as active
  // forever, and its unread badge would never increment again.
  useEffect(() => {
    if (activeConversation) {
      openConversation(activeConversation.id)
    }
    return () => {
      clearActiveConversation()
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

  const activeOther = activeConversation
    ? activeConversation.buyer?.id === currentUser.id
      ? activeConversation.seller
      : activeConversation.buyer
    : undefined
  const activeSold = activeConversation?.listing?.status === 'VERKAUFT'

  return (
    <div className="grid h-[calc(100dvh-8rem)] grid-cols-1 overflow-hidden rounded-3xl border border-border bg-surface shadow-sm md:grid-cols-[300px_1fr]">
      <aside className="flex min-h-0 flex-col gap-1 overflow-y-auto border-b border-border p-2 md:border-b-0 md:border-r">
        {conversations.map((conversation) => {
          const isBuyer = conversation.buyer?.id === currentUser.id
          const other = isBuyer ? conversation.seller : conversation.buyer
          const lastMessage = conversation.messages[0]
          const isActive = conversation.id === activeConversation?.id
          const unread = conversation.unreadCount > 0
          const sold = conversation.listing?.status === 'VERKAUFT'

          return (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              className={clsx(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors',
                sold && 'opacity-60',
                isActive ? 'bg-accent-soft' : 'hover:bg-surface-muted',
              )}
            >
              <Avatar name={other?.name ?? '?'} className={clsx('h-11 w-11', sold && 'grayscale')} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p
                    className={clsx(
                      'truncate text-sm text-foreground',
                      unread ? 'font-semibold' : 'font-medium',
                    )}
                  >
                    {conversation.listing?.title ?? 'Inserat'}
                  </p>
                  {sold && (
                    <span className="shrink-0">
                      <Badge tone="neutral">Verkauft</Badge>
                    </span>
                  )}
                </div>
                <p
                  className={clsx(
                    'truncate text-xs',
                    unread ? 'font-medium text-foreground' : 'text-foreground-muted',
                  )}
                >
                  {lastMessage ? lastMessage.text : `mit ${other?.name ?? 'Gelöschter Nutzer'}`}
                </p>
              </div>
              {unread && (
                <span
                  aria-label={`${conversation.unreadCount} ungelesene Nachrichten`}
                  className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-semibold leading-none text-on-primary"
                >
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </aside>

      <section className="flex min-h-0 flex-col">
        {!activeConversation ? (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-foreground-muted">
            Wähle eine Unterhaltung aus.
          </div>
        ) : (
          <>
            <header className={clsx('flex shrink-0 items-center gap-3 border-b border-border px-5 py-4', activeSold && 'opacity-60')}>
              <Avatar name={activeOther?.name ?? '?'} className={clsx('h-10 w-10', activeSold && 'grayscale')} />
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-display text-base font-semibold text-foreground">
                    {activeConversation.listing?.title ?? 'Inserat'}
                  </p>
                  {activeSold && <Badge tone="neutral">Verkauft</Badge>}
                </div>
                <p className="text-xs text-foreground-muted">mit {activeOther?.name ?? 'Gelöschter Nutzer'}</p>
              </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5">
              {getMessages(activeConversation.id).map((message) => {
                const isMine = message.senderId === currentUser.id
                return (
                  <div
                    key={message.id}
                    className={clsx('flex items-end gap-2', isMine ? 'flex-row-reverse' : 'flex-row')}
                  >
                    {!isMine && <Avatar name={activeOther?.name ?? '?'} className="h-7 w-7 text-xs" />}
                    <div className={clsx('flex max-w-xs flex-col', isMine ? 'items-end' : 'items-start')}>
                      <div
                        className={clsx(
                          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                          isMine
                            ? 'rounded-br-md bg-accent text-on-accent'
                            : 'rounded-bl-md bg-accent-soft text-foreground',
                        )}
                      >
                        {message.text}
                      </div>
                      <span className="mt-1 text-[10px] text-foreground-muted">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleSend} className="flex shrink-0 items-center gap-2 border-t border-border p-4">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Nachricht schreiben…"
                aria-label="Nachricht schreiben"
                className="h-12 flex-1 rounded-full border border-border bg-surface-muted/60 px-5 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                aria-label="Senden"
                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-on-accent shadow-sm transition-all motion-safe:active:scale-90 hover:bg-accent-strong hover:text-on-primary disabled:opacity-50"
                disabled={!draft.trim()}
              >
                <PaperPlaneRight size={18} weight="fill" aria-hidden />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
