import type { User } from '../types'
import { MOCK_USERS } from '../mocks/users'

/**
 * Phase 1: resolves against the two seeded mock users. Phase 2 replaces the
 * bodies of these functions with real JWT-based calls to the NestJS backend
 * (login, register, THM email verification) — callers do not need to change.
 */

export async function fetchMockUsers(): Promise<User[]> {
  return MOCK_USERS
}
