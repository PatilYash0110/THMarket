import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchCurrentUser, loginUser, logoutUser } from '../api/auth'
import type { User } from '../types'

interface AuthContextValue {
  currentUser: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setBalance: (balanceCents: number) => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // The access token now lives only in an httpOnly cookie the browser
  // attaches automatically — there's nothing in JS to read on mount any
  // more, so "am I logged in" is answered by asking the server directly. A
  // 401 here just means no valid session cookie, not a real error.
  useEffect(() => {
    fetchCurrentUser()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const { user } = await loginUser({ email, password })
    setCurrentUser(user)
  }

  async function logout() {
    // Await the cookie-clearing request before updating local state —
    // fire-and-forget let a fast reload right after clicking "Abmelden"
    // (e.g. on a shared campus PC) race ahead of the request and log the
    // same session back in via the still-valid cookie.
    await logoutUser().catch(() => {})
    setCurrentUser(null)
  }

  function setBalance(balanceCents: number) {
    setCurrentUser((prev) => (prev ? { ...prev, balanceCents } : prev))
  }

  // General-purpose "trust this server response" setter — used after
  // profile updates (name/password change) where the endpoint's own
  // response already carries the authoritative, current user record.
  function updateUser(user: User) {
    setCurrentUser(user)
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, setBalance, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
