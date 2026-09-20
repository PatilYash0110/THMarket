import { ImageBroken } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteAdminListing,
  deleteAdminUser,
  fetchAdminUsers,
  fetchAuditLog,
  fetchReports,
  resolveReport,
} from '../api/admin'
import { ApiError } from '../api/auth'
import { fetchListings } from '../api/listings'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import { formatDate, formatPrice } from '../lib/format'
import type { AdminUser, AuditLogEntry, Listing, Report, ResolveReportAction } from '../types'

// Same colored-squircle-initial pattern as the chat's Avatar (Messages.tsx)
// — student accounts don't carry a profile photo, so this is the one
// consistent "who is this" visual across the app.
function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-xs font-semibold text-accent-strong">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// Small thumbnail for a reported listing — same broken-image fallback as
// ListingCard, so a dead URL still reads as "no photo" rather than a
// visibly broken <img>.
function ReportThumbnail({ src }: { src?: string }) {
  const [broken, setBroken] = useState(false)
  if (!src || broken) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
        <ImageBroken size={20} aria-hidden />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt=""
      onError={() => setBroken(true)}
      className="h-14 w-14 shrink-0 rounded-xl object-cover"
    />
  )
}

type Tab = 'reports' | 'users' | 'listings' | 'audit'

const TABS: { id: Tab; label: string }[] = [
  { id: 'reports', label: 'Meldungen' },
  { id: 'users', label: 'Nutzer' },
  { id: 'listings', label: 'Inserate' },
  { id: 'audit', label: 'Audit-Log' },
]

// Per-action dialog copy — one config function instead of scattered
// prompt()/confirm() strings, so ReportsTab's render logic only has to pick
// an action and hand it to <ConfirmDialog>.
function reportDialogConfig(action: ResolveReportAction) {
  switch (action) {
    case 'NO_ACTION':
      return {
        title: 'Ohne Maßnahme schließen?',
        description: 'Die Meldung wird als geschlossen markiert, ohne dass etwas am Inserat oder Nutzer geändert wird.',
        confirmLabel: 'Schließen',
        destructive: false,
      }
    case 'USER_WARNED':
      return {
        title: 'Nutzer verwarnen',
        noteLabel: 'Verwarnungstext (wird dem Nutzer angezeigt)',
        confirmLabel: 'Verwarnen',
        destructive: false,
      }
    case 'USER_DELETED':
      return {
        title: 'Nutzer endgültig löschen?',
        description: 'Das kann nicht rückgängig gemacht werden.',
        noteLabel: 'Begründung',
        confirmLabel: 'Endgültig löschen',
        destructive: true,
      }
    case 'LISTING_DELETED':
      return {
        title: 'Inserat endgültig löschen?',
        description: 'Das kann nicht rückgängig gemacht werden.',
        noteLabel: 'Begründung',
        confirmLabel: 'Endgültig löschen',
        destructive: true,
      }
  }
}

type ReportFilter = 'OFFEN' | 'ALLE'

function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pending, setPending] = useState<{ report: Report; action: ResolveReportAction } | null>(null)
  // Defaults to only open reports — closed ones otherwise pile up and bury
  // the ones that actually need attention.
  const [filter, setFilter] = useState<ReportFilter>('OFFEN')
  const openCount = reports.filter((report) => report.status === 'OFFEN').length
  const visibleReports = filter === 'OFFEN' ? reports.filter((report) => report.status === 'OFFEN') : reports

  async function load() {
    setLoading(true)
    try {
      setReports(await fetchReports())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Meldungen konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleConfirm(note?: string) {
    if (!pending) return
    const { report, action } = pending
    setPending(null)
    setActionError(null)
    try {
      await resolveReport(report.id, { action, note })
      await load()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Aktion fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  if (loading) return <p className="text-sm text-foreground-muted">Wird geladen…</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
    <div className="flex flex-col gap-3">
      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setFilter('OFFEN')}
          className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            filter === 'OFFEN' ? 'bg-accent-soft text-accent-strong' : 'text-foreground-muted hover:bg-surface-muted'
          }`}
        >
          Offen{reports.length > 0 && ` (${openCount})`}
        </button>
        <button
          type="button"
          onClick={() => setFilter('ALLE')}
          className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            filter === 'ALLE' ? 'bg-accent-soft text-accent-strong' : 'text-foreground-muted hover:bg-surface-muted'
          }`}
        >
          Alle{reports.length > 0 && ` (${reports.length})`}
        </button>
      </div>
      {visibleReports.length === 0 && (
        <p className="text-sm text-foreground-muted">
          {filter === 'OFFEN' ? 'Keine offenen Meldungen.' : 'Keine Meldungen vorhanden.'}
        </p>
      )}
      {visibleReports.map((report) => (
        <div key={report.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 text-sm shadow-sm">
          <div className="flex items-start gap-3">
            {report.targetType === 'LISTING' && <ReportThumbnail src={report.listing?.images[0]} />}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {report.targetType === 'LISTING' && report.listing ? (
                  <Link
                    to={`/listing/${report.listing.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground underline-offset-2 hover:text-accent-strong hover:underline"
                  >
                    {report.listing.title}
                  </Link>
                ) : (
                  <p className="font-medium text-foreground">
                    {report.targetType === 'LISTING' ? 'Inserat: ' : 'Nutzer: '}
                    {report.reportedUser?.name ?? report.targetLabel}
                    {report.targetType === 'LISTING' && ' (entfernt)'}
                  </p>
                )}
                <Badge tone={report.status === 'OFFEN' ? 'destructive' : 'accent'}>{report.status}</Badge>
              </div>
              {report.targetType === 'USER' && report.reportedUser && (
                <p className="text-xs text-foreground-muted">{report.reportedUser.email}</p>
              )}
              <p className="text-foreground-muted">Grund: {report.reason}</p>
              {report.message && <p className="text-foreground-muted">„{report.message}"</p>}
              <p className="text-xs text-foreground-muted">
                Gemeldet von {report.reporter ? `${report.reporter.name} (${report.reporter.email})` : 'unbekannt'} ·{' '}
                {formatDate(report.createdAt)}
              </p>
            </div>
          </div>
          {report.status === 'OFFEN' && (
            <div className="mt-1 flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" onClick={() => setPending({ report, action: 'NO_ACTION' })}>
                Ohne Maßnahme schließen
              </Button>
              {report.targetType === 'USER' && (
                <>
                  <Button size="sm" variant="secondary" onClick={() => setPending({ report, action: 'USER_WARNED' })}>
                    Nutzer verwarnen
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setPending({ report, action: 'USER_DELETED' })}>
                    Nutzer löschen
                  </Button>
                </>
              )}
              {report.targetType === 'LISTING' && (
                <Button size="sm" variant="destructive" onClick={() => setPending({ report, action: 'LISTING_DELETED' })}>
                  Inserat löschen
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      {pending && (
        <ConfirmDialog
          {...reportDialogConfig(pending.action)}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  )
}

function UsersTab() {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null)
  const [query, setQuery] = useState('')
  const visibleUsers = query.trim()
    ? users.filter((user) => {
        const q = query.trim().toLowerCase()
        return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
      })
    : users

  async function load() {
    setLoading(true)
    try {
      setUsers(await fetchAdminUsers())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nutzer konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleDelete(note?: string) {
    if (!pendingDelete || !note) return
    const user = pendingDelete
    setPendingDelete(null)
    setActionError(null)
    try {
      await deleteAdminUser(user.id, note)
      await load()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Löschen fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  if (loading) return <p className="text-sm text-foreground-muted">Wird geladen…</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
    <div className="flex flex-col gap-3">
      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Name oder E-Mail durchsuchen…"
        aria-label="Nutzer durchsuchen"
        className="h-10 w-full max-w-xs rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {visibleUsers.length === 0 && (
        <p className="text-sm text-foreground-muted">Keine Nutzer gefunden.</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-muted">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">E-Mail</th>
              <th className="py-2 pr-4">Rolle</th>
              <th className="py-2 pr-4">Verifiziert</th>
              <th className="py-2 pr-4">Meldungen</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user) => (
              <tr key={user.id} className="border-b border-border transition-colors hover:bg-surface-muted/40">
                <td className="py-3 pr-4 text-foreground">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name} />
                    {user.name}
                  </div>
                </td>
                <td className="py-3 pr-4 text-foreground-muted">{user.email}</td>
                <td className="py-3 pr-4">
                  <Badge tone="neutral">{user.role}</Badge>
                </td>
                <td className="py-3 pr-4 text-foreground-muted">{user.verified ? 'Ja' : 'Nein'}</td>
                <td className="py-3 pr-4 text-foreground-muted">
                  {user.reportsReceivedCount > 0 ? (
                    <Badge tone="destructive">{user.reportsReceivedCount}</Badge>
                  ) : (
                    '–'
                  )}
                </td>
                <td className="py-3">
                  {user.role === 'STUDENT' && user.id !== currentUser?.id && (
                    <Button size="sm" variant="destructive" onClick={() => setPendingDelete(user)}>
                      Löschen
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title={`"${pendingDelete.name}" endgültig löschen?`}
          description="Das kann nicht rückgängig gemacht werden."
          noteLabel="Begründung"
          confirmLabel="Endgültig löschen"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}

function ListingsTab() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Listing | null>(null)

  async function load() {
    setLoading(true)
    try {
      setListings(await fetchListings())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Inserate konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleDelete(note?: string) {
    if (!pendingDelete || !note) return
    const listing = pendingDelete
    setPendingDelete(null)
    setActionError(null)
    try {
      await deleteAdminListing(listing.id, note)
      await load()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Löschen fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  if (loading) return <p className="text-sm text-foreground-muted">Wird geladen…</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
    <div className="flex flex-col gap-3">
      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-muted">
              <th className="py-2 pr-4">Titel</th>
              <th className="py-2 pr-4">Verkäufer</th>
              <th className="py-2 pr-4">Preis</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-b border-border transition-colors hover:bg-surface-muted/40">
                <td className="py-3 pr-4 text-foreground">{listing.title}</td>
                <td className="py-3 pr-4 text-foreground-muted">{listing.seller?.name ?? 'Gelöschter Nutzer'}</td>
                <td className="py-3 pr-4 text-foreground-muted">{formatPrice(listing.priceCents)}</td>
                <td className="py-3 pr-4">
                  <Badge tone={listing.status === 'AKTIV' ? 'accent' : 'neutral'}>{listing.status}</Badge>
                </td>
                <td className="py-3">
                  <Button size="sm" variant="destructive" onClick={() => setPendingDelete(listing)}>
                    Löschen
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title={`"${pendingDelete.title}" endgültig löschen?`}
          description="Das kann nicht rückgängig gemacht werden."
          noteLabel="Begründung"
          confirmLabel="Endgültig löschen"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}

function AuditLogTab() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAuditLog()
      .then(setEntries)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Audit-Log konnte nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-foreground-muted">Wird geladen…</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
    <ul className="flex flex-col gap-3">
      {entries.length === 0 && <p className="text-sm text-foreground-muted">Noch keine Einträge.</p>}
      {entries.map((entry) => (
        <li key={entry.id} className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm shadow-sm">
          <p className="text-foreground">{entry.action}</p>
          <p className="mt-1 text-xs text-foreground-muted">
            {entry.actor?.name ?? 'Unbekannt'} · {formatDate(entry.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  )
}

interface Summary {
  openReports: number
  users: number
  listings: number
  lastActivity: AuditLogEntry | null
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <span className="font-display text-2xl font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-xs uppercase tracking-wide text-foreground-muted">{label}</span>
    </div>
  )
}

// A quick-glance summary above the tabs — previously there was nothing
// here at all, just straight into whichever tab was selected, with no
// sense of overall state without clicking through each one.
function DashboardOverview() {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    Promise.all([fetchReports('OFFEN'), fetchAdminUsers(), fetchListings(), fetchAuditLog()])
      .then(([openReports, users, listings, auditLog]) => {
        setSummary({
          openReports: openReports.length,
          users: users.length,
          listings: listings.length,
          lastActivity: auditLog[0] ?? null,
        })
      })
      .catch(() => setSummary(null))
  }, [])

  if (!summary) return null

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile label="Offene Meldungen" value={String(summary.openReports)} />
      <StatTile label="Nutzer" value={String(summary.users)} />
      <StatTile label="Inserate" value={String(summary.listings)} />
      <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <span className="truncate text-sm font-medium text-foreground">
          {summary.lastActivity?.action ?? 'Noch keine Aktivität'}
        </span>
        <span className="text-xs uppercase tracking-wide text-foreground-muted">
          {summary.lastActivity ? `Letzte Aktion · ${formatDate(summary.lastActivity.createdAt)}` : 'Audit-Log'}
        </span>
      </div>
    </div>
  )
}

export function Admin() {
  const [tab, setTab] = useState<Tab>('reports')

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Admin-Bereich</h1>

      <DashboardOverview />

      <div className="flex gap-1 border-b border-border">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === item.id
                ? 'border-accent text-accent-strong'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'reports' && <ReportsTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'listings' && <ListingsTab />}
      {tab === 'audit' && <AuditLogTab />}
    </div>
  )
}
