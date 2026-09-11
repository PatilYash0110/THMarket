import type { User } from '../types'

const API_URL = import.meta.env.VITE_API_URL as string

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json()
    if (typeof body.message === 'string') return body.message
    if (Array.isArray(body.message)) return body.message.join(' ')
  } catch {
    // Antwort war kein JSON — Standardmeldung verwenden
  }
  return 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'
}

export async function registerUser(input: {
  name: string
  email: string
  password: string
}): Promise<{ email: string }> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function verifyEmail(token: string): Promise<{ email: string }> {
  const response = await fetch(`${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`)
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function loginUser(input: {
  email: string
  password: string
}): Promise<{ accessToken: string; user: User }> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function fetchCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}