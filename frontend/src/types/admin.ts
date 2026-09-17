import type { Role } from './user'

export type ReportTargetType = 'LISTING' | 'USER'
export type ReportStatus = 'OFFEN' | 'GESCHLOSSEN'
export type ResolveReportAction = 'NO_ACTION' | 'USER_WARNED' | 'USER_DELETED' | 'LISTING_DELETED'

export interface Report {
  id: string
  targetType: ReportTargetType
  reason: string
  message: string | null
  status: ReportStatus
  targetLabel: string
  reporter: { id: string; name: string; email: string; role: Role } | null
  listing: { id: string; title: string; status: 'AKTIV' | 'VERKAUFT' } | null
  reportedUser: { id: string; name: string; email: string; role: Role } | null
  createdAt: string
  resolvedAt: string | null
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: Role
  verified: boolean
  balanceCents: number
  createdAt: string
  reportsReceivedCount: number
}

export interface AuditLogEntry {
  id: string
  actor: { name: string } | null
  action: string
  targetType: string | null
  targetId: string | null
  createdAt: string
}
