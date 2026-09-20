import { useEffect, useState } from 'react'
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

type Tab = 'reports' | 'users' | 'listings' | 'audit'

const TABS: { id: Tab; label: string }[] = [
  { id: 'reports', label: 'Meldungen' },
  { id: 'users', label: 'Nutzer' },
  { id: 'listings', label: 'Inserate' },
  { id: 'audit', label: 'Audit-Log' },
]

// A short justification is required for every action except dismissing a
// report with no action taken — the backend enforces this too; the prompt
// is what actually captures it, since a plain confirm() has no text input.
function promptForNote(message: string): string | null {
  const note = window.prompt(message)
  if (note === null) return null
  const trimmed = note.trim()
  return trimmed.length > 0 ? trimmed : null
}

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

function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pending, setPending] = useState<{ report: Report; action: ResolveReportAction } | null>(null)

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
      {reports.length === 0 && <p className="text-sm text-foreground-muted">Keine Meldungen vorhanden.</p>}
      {reports.map((report) => (
        <div key={report.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 text-sm shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-foreground">
              {report.targetType === 'LISTING' ? 'Inserat: ' : 'Nutzer: '}
              {report.listing?.title ?? report.reportedUser?.name ?? report.targetLabel}
            </p>
            <Badge tone={report.status === 'OFFEN' ? 'destructive' : 'accent'}>{report.status}</Badge>
          </div>
          <p className="text-foreground-muted">Grund: {report.reason}</p>
          {report.message && <p className="text-foreground-muted">„{report.message}"</p>}
          <p className="text-xs text-foreground-muted">
            Gemeldet von {report.reporter ? `${report.reporter.name} (${report.reporter.email})` : 'unbekannt'} ·{' '}
            {formatDate(report.createdAt)}
          </p>
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

  async function handleDelete(user: AdminUser) {
    const note = promptForNote(`Begründung für die Löschung von "${user.name}":`)
    if (!note) return
    if (!window.confirm(`"${user.name}" wirklich endgültig löschen?`)) return
    try {
      await deleteAdminUser(user.id, note)
      await load()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Löschen fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  if (loading) return <p className="text-sm text-foreground-muted">Wird geladen…</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
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
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border transition-colors hover:bg-surface-muted/40">
              <td className="py-3 pr-4 text-foreground">{user.name}</td>
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
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(user)}>
                    Löschen
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ListingsTab() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  async function handleDelete(listing: Listing) {
    const note = promptForNote(`Begründung für die Löschung von "${listing.title}" (optional):`) ?? undefined
    if (!window.confirm(`"${listing.title}" wirklich endgültig löschen?`)) return
    try {
      await deleteAdminListing(listing.id, note)
      await load()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Löschen fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  if (loading) return <p className="text-sm text-foreground-muted">Wird geladen…</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
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
                <Button size="sm" variant="destructive" onClick={() => handleDelete(listing)}>
                  Löschen
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

export function Admin() {
  const [tab, setTab] = useState<Tab>('reports')

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Admin-Bereich</h1>

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
