export type Role = 'STUDENT' | 'ADMIN'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  verified: boolean
  balanceCents: number
  avatarUrl?: string
}
