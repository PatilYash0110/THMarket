import { Flag, PaperPlaneRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { ReportForm } from '../components/ReportForm'
import { useAuth } from '../context/AuthContext'
import { useMessages } from '../context/MessagesContext'
import { formatDate } from '../lib/format'

// Once `listing` goes null (deleted by its seller or by admin action), fall
// back to the one-time title snapshot instead of the generic "Inserat" —
// and flag it as removed so the UI can say so, rather than silently
// presenting a stale title as if the listing still existed.
function listingDisplay(conversation: { listing: { title: string } | null; listingTitle: string | null }): {
  title: string
  removed: boolean
} {
  if (conversation.listing) return { title: conversation.listing.title, removed: false }
  if (conversation.listingTitle) return { title: conversation.listingTitle, removed: true }
  return { title: 'Inserat', removed: true }
}

function sendErrorMessage(reason: string): string {
  switch (reason) {
    case 'too_long':
      return 'Nachricht ist zu lang (max. 2000 Zeichen).'
    case 'rate_limited':
      return 'Zu viele Nachrichten — bitte warte kurz und versuche es erneut.'
    case 'timeout':
      return 'Keine Antwort vom Server. Bitte versuche es erneut.'
    default:
      return 'Nachricht konnte nicht gesendet werden.'
  }
}

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
  const [sendError, setSendError] = useState<string | null>(null)
  const [reporting, setReporting] = useState(false)

  const activeConversation = conversationId
    ? conversations.find((conversation) => conversation.id === conversationId)
    : undefined
  const activeMessages = activeConversation ? getMessages(activeConversation.id) : []
  const messageListRef = useRef<HTMLDivElement>(null)

  // Lazily fetches the full history and joins the socket room only once a
  // thread is actually opened — the list view only ever carries a preview.
  // Cleanup clears the "currently open" marker on unmount/thread switch —
  // without it, a thread visited once would keep being treated as active
  // forever, and its unread badge would never increment again.
  useEffect(() => {
    setSendError(null)
    setReporting(false)
    if (activeConversation) {
      openConversation(activeConversation.id)
    }
    return () => {
      clearActiveConversation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id])

  // A thread previously always opened scrolled to the top — the newest
  // messages (what anyone opening a chat actually wants to see) were below
  // the fold. Re-runs whenever the message count changes too, so a live
  // incoming message while the thread is open also stays pinned to the
  // bottom.
  //
  // Sets scrollTop directly on the message list itself rather than calling
  // scrollIntoView() on a bottom anchor — scrollIntoView() walks up EVERY
  // scrollable ancestor to bring the target into view, so on a page whose
  // outer layout is even a few pixels taller than the viewport it scrolls
  // the whole page instead of (or as well as) this inner panel. Setting
  // scrollTop touches only this one element.
  useEffect(() => {
    const list = messageListRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [activeConversation?.id, activeMessages.length])

  if (!currentUser) return null

  // The draft is kept (not cleared) until the server actually acks the
  // send — previously cleared immediately on emit, so a message rejected
  // server-side (rate limit, over length, no longer a participant) just
  // silently disappeared with no error and no way to retry (B-05).
  async function handleSend(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!activeConversation || !text) return
    setSendError(null)
    const result = await sendMessage(activeConversation.id, text)
    if (result.ok) {
      setDraft('')
    } else {
      setSendError(sendErrorMessage(result.reason))
    }
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
  const activeListing = activeConversation ? listingDisplay(activeConversation) : null

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
          const { title: listingTitle, removed: listingRemoved } = listingDisplay(conversation)

          return (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              className={clsx(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors',
                (sold || listingRemoved) && 'opacity-60',
                isActive ? 'bg-accent-soft' : 'hover:bg-surface-muted',
              )}
            >
              <Avatar name={other?.name ?? '?'} className={clsx('h-11 w-11', (sold || listingRemoved) && 'grayscale')} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p
                    className={clsx(
                      'truncate text-sm text-foreground',
                      unread ? 'font-semibold' : 'font-medium',
                    )}
                  >
                    {listingTitle}
                  </p>
                  {listingRemoved ? (
                    <span className="shrink-0">
                      <Badge tone="neutral">Entfernt</Badge>
                    </span>
                  ) : (
                    sold && (
                      <span className="shrink-0">
                        <Badge tone="neutral">Verkauft</Badge>
                      </span>
                    )
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
            <header className={clsx('flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4', (activeSold || activeListing?.removed) && 'opacity-60')}>
              <div className="flex items-center gap-3">
                <Avatar name={activeOther?.name ?? '?'} className={clsx('h-10 w-10', (activeSold || activeListing?.removed) && 'grayscale')} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-display text-base font-semibold text-foreground">{activeListing?.title}</p>
                    {activeListing?.removed ? (
                      <Badge tone="neutral">Entfernt</Badge>
                    ) : (
                      activeSold && <Badge tone="neutral">Verkauft</Badge>
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted">
                    {activeListing?.removed
                      ? 'Dieses Inserat wurde entfernt — '
                      : ''}
                    mit {activeOther?.name ?? 'Gelöschter Nutzer'}
                  </p>
                </div>
              </div>
              {activeOther && (
                <button
                  type="button"
                  onClick={() => setReporting((prev) => !prev)}
                  aria-label="Nutzer melden"
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 px-2 text-xs text-foreground-muted hover:text-destructive"
                >
                  <Flag size={14} aria-hidden />
                  Melden
                </button>
              )}
            </header>

            {reporting && activeOther && activeConversation && (
              <div className="border-b border-border p-4">
                <ReportForm
                  targetType="USER"
                  targetId={activeOther.id}
                  contextListingId={activeConversation.listing?.id}
                  contextConversationId={activeConversation.id}
                  onCancel={() => setReporting(false)}
                />
              </div>
            )}

            <div ref={messageListRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5">
              {activeMessages.map((message) => {
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

            {sendError && (
              <p role="alert" className="shrink-0 px-4 pt-2 text-xs text-destructive">
                {sendError}
              </p>
            )}
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
