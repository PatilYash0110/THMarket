import { ApiError, parseErrorMessage } from './auth'
import type { AdminUser, AuditLogEntry, Message, ReportStatus, ResolveReportAction, Report } from '../types'

const API_URL = import.meta.env.VITE_API_URL as string

export async function createReport(input: {
  targetType: 'LISTING' | 'USER'
  listingId?: string
  reportedUserId?: string
  // Context only for a USER report — which listing/conversation the
  // reported behavior happened around, so an admin can review it later.
  conversationId?: string
  reason: string
  message?: string
}): Promise<Report> {
  const response = await fetch(`${API_URL}/admin/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function fetchReports(status?: ReportStatus): Promise<Report[]> {
  const query = status ? `?status=${status}` : ''
  const response = await fetch(`${API_URL}/admin/reports${query}`, { credentials: 'include' })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function resolveReport(
  id: string,
  input: { action: ResolveReportAction; note?: string },
): Promise<Report> {
  const response = await fetch(`${API_URL}/admin/reports/${id}/resolve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await fetch(`${API_URL}/admin/users`, { credentials: 'include' })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function deleteAdminUser(id: string, note: string): Promise<void> {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ note }),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
}

export async function deleteAdminListing(id: string, note?: string): Promise<void> {
  const response = await fetch(`${API_URL}/admin/listings/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ note }),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
}

export async function fetchAuditLog(): Promise<AuditLogEntry[]> {
  const response = await fetch(`${API_URL}/admin/audit-log`, { credentials: 'include' })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

// Admin-only, read-only — bypasses the normal buyer/seller participant
// check on purpose (see backend ChatService.getMessagesForAdmin), only for
// a conversation a report has actually linked.
export async function fetchAdminConversationMessages(conversationId: string): Promise<Message[]> {
  const response = await fetch(`${API_URL}/admin/conversations/${conversationId}/messages`, {
    credentials: 'include',
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}
