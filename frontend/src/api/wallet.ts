import { ApiError, parseErrorMessage } from './auth'

const API_URL = import.meta.env.VITE_API_URL as string

export async function topUpBalance(input: {
  amountCents: number
  card: { number: string; expiry: string; cvc: string }
}): Promise<{ balanceCents: number }> {
  const response = await fetch(`${API_URL}/wallet/topup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}

export async function withdrawBalance(input: {
  amountCents: number
  card: { number: string; expiry: string; cvc: string }
}): Promise<{ balanceCents: number }> {
  const response = await fetch(`${API_URL}/wallet/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response))
  return response.json()
}
