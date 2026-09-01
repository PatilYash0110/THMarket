import type { User } from '../types'

export const MOCK_STUDENT: User = {
  id: 'user-student-1',
  email: 'lena.becker@mnd.thm.de',
  name: 'Lena Becker',
  role: 'STUDENT',
  verified: true,
  balanceCents: 4250,
}

export const MOCK_ADMIN: User = {
  id: 'user-admin-1',
  email: 'admin@thm.de',
  name: 'THM Administration',
  role: 'ADMIN',
  verified: true,
  balanceCents: 0,
}

export const MOCK_USERS: User[] = [MOCK_STUDENT, MOCK_ADMIN]

export function findUserById(id: string): User | undefined {
  return MOCK_USERS.find((user) => user.id === id)
}

