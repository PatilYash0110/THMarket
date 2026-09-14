export type PasswordStrengthLevel = 'schwach' | 'mittel' | 'stark'

export interface PasswordStrength {
  score: number
  maxScore: number
  level: PasswordStrengthLevel
}

const MAX_SCORE = 6

/**
 * Scores beyond the hard minimum (8+ chars, upper/lower/digit — enforced
 * separately in Register.tsx and backend/src/auth/dto/register.dto.ts) so a
 * password that merely satisfies the requirement lands at "mittel", not
 * "stark" — reaching "stark" needs real length or a special character too.
 */
export function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  const level: PasswordStrengthLevel = score <= 2 ? 'schwach' : score <= 4 ? 'mittel' : 'stark'

  return { score, maxScore: MAX_SCORE, level }
}