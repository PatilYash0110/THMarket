import { useState } from 'react'
import { Badge } from '../components/Badge'
import { formatDate } from '../lib/format'
import { MOCK_AUDIT_LOG, MOCK_REPORTS } from '../mocks/admin'
import { MOCK_USERS } from '../mocks/users'

type Tab = 'reports' | 'users' | 'audit'

const TABS: { id: Tab; label: string }[] = [
  { id: 'reports', label: 'Meldungen' },
  { id: 'users', label: 'Nutzer' },
  { id: 'audit', label: 'Audit-Log' },
]

export function Admin() {
  const [tab, setTab] = useState<Tab>('reports')

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admin-Bereich</h1>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium ${
              tab === item.id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'reports' && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-muted">
                <th className="py-2 pr-4">Ziel</th>
                <th className="py-2 pr-4">Grund</th>
                <th className="py-2 pr-4">Gemeldet von</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Datum</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REPORTS.map((report) => (
                <tr key={report.id} className="border-b border-border">
                  <td className="py-3 pr-4 text-foreground">{report.targetLabel}</td>
                  <td className="py-3 pr-4 text-foreground-muted">{report.reason}</td>
                  <td className="py-3 pr-4 text-foreground-muted">{report.reportedBy}</td>
                  <td className="py-3 pr-4">
                    <Badge tone={report.status === 'OFFEN' ? 'destructive' : 'accent'}>
                      {report.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-foreground-muted">{formatDate(report.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-muted">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">E-Mail</th>
                <th className="py-2 pr-4">Rolle</th>
                <th className="py-2">Verifiziert</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="border-b border-border">
                  <td className="py-3 pr-4 text-foreground">{user.name}</td>
                  <td className="py-3 pr-4 text-foreground-muted">{user.email}</td>
                  <td className="py-3 pr-4">
                    <Badge tone="neutral">{user.role}</Badge>
                  </td>
                  <td className="py-3 text-foreground-muted">{user.verified ? 'Ja' : 'Nein'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'audit' && (
        <ul className="flex flex-col gap-3">
          {MOCK_AUDIT_LOG.map((entry) => (
            <li key={entry.id} className="border border-border px-4 py-3 text-sm">
              <p className="text-foreground">{entry.action}</p>
              <p className="mt-1 text-xs text-foreground-muted">
                {entry.actor} · {formatDate(entry.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
