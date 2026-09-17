export type Role = 'STUDENT' | 'ADMIN'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  verified: boolean
  balanceCents: number
  // Set by an admin resolving a report with the "warn" action; shown as a
  // dismissible banner on the user's own Profile page — the only place it
  // ever surfaces, since there's no notifications system.
  warningMessage: string | null
  avatarUrl?: string
}
