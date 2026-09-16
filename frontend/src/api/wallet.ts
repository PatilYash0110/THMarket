import { ApiError, parseErrorMessage } from './auth'

const API_URL = import.meta.env.VITE_API_URL as string
const TOKEN_STORAGE_KEY = 'thmarket.token'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function topUpBalance(input: {
  amountCents: number
  card: { number: string; expiry: string; cvc: string }
}): Promise<{ balanceCents: number }> {
  const response = await fetch(`${API_URL}/wallet/topup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}
