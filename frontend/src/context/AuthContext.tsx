import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchCurrentUser, loginUser, logoutUser } from '../api/auth'
import type { User } from '../types'

interface AuthContextValue {
  currentUser: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
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

  function logout() {
    setCurrentUser(null)
    // Fire-and-forget: the cookie-clearing round trip doesn't need to block
    // the UI from reflecting "logged out" immediately.
    void logoutUser()
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
