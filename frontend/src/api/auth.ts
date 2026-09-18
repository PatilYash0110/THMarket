import type { User } from '../types'

const API_URL = import.meta.env.VITE_API_URL as string

export class ApiError extends Error {
  retryAfterSeconds?: number

  constructor(message: string, retryAfterSeconds?: number) {
    super(message)
    this.name = 'ApiError'
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export async function parseErrorMessage(response: Response): Promise<string> {
  // A 429 from ThrottlerGuard carries a `Retry-After` header (seconds) —
  // surfacing that as a concrete wait time is friendlier than the generic
  // fallback below, which is all a raw "ThrottlerException" message would
  // otherwise read as.
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('Retry-After'))
    if (Number.isFinite(retryAfter) && retryAfter > 0) {
      return `Zu viele Versuche. Bitte warte ${retryAfter} Sekunden und versuche es erneut.`
    }
    return 'Zu viele Versuche. Bitte warte kurz und versuche es erneut.'
  }
  try {
    const body = await response.json()
    if (typeof body.message === 'string') return body.message
    if (Array.isArray(body.message)) return body.message.join(' ')
  } catch {
    // response wasn't JSON — fall through to the generic message
  }
  return 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'
}

async function throwApiError(response: Response): Promise<never> {
  const retryAfter = response.status === 429 ? Number(response.headers.get('Retry-After')) : undefined
  throw new ApiError(await parseErrorMessage(response), Number.isFinite(retryAfter) ? retryAfter : undefined)
}

export async function registerUser(input: {
  name: string
  email: string
  password: string
}): Promise<{ email: string }> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })
  if (!response.ok) return throwApiError(response)
  return response.json()
}

export async function verifyEmail(token: string): Promise<{ email: string }> {
  const response = await fetch(`${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`, {
    credentials: 'include',
  })
  if (!response.ok) return throwApiError(response)
  return response.json()
}

// The access token itself never appears here any more — login sets it as an
// httpOnly cookie server-side (see backend/src/auth/auth.controller.ts), so
// page JS (including an XSS payload, unlike the old localStorage approach)
// has no way to read it. Every subsequent authenticated call below relies on
// `credentials: 'include'` to send that cookie automatically instead of an
// Authorization header.
export async function loginUser(input: { email: string; password: string }): Promise<{ user: User }> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })
  if (!response.ok) return throwApiError(response)
  return response.json()
}

export async function logoutUser(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, { credentials: 'include' })
  if (!response.ok) return throwApiError(response)
  return response.json()
}

export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  })
  if (!response.ok) return throwApiError(response)
  return response.json()
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  })
  if (!response.ok) return throwApiError(response)
  return response.json()
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token, newPassword }),
  })
  if (!response.ok) return throwApiError(response)
  return response.json()
}

export async function updateProfile(input: {
  name?: string
  currentPassword?: string
  newPassword?: string
}): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })
  if (!response.ok) return throwApiError(response)
  return response.json()
}

export async function dismissWarning(): Promise<User> {
  const response = await fetch(`${API_URL}/auth/dismiss-warning`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) return throwApiError(response)
  return response.json()
}
