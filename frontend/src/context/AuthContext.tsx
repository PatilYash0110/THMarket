import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchCurrentUser, loginUser } from '../api/auth'
import type { User } from '../types'

const TOKEN_STORAGE_KEY = 'thmarket.token'

interface AuthContextValue {
  currentUser: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  adjustBalance: (deltaCents: number) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) {
      setLoading(false)
      return
    }

    fetchCurrentUser(token)
      .then(setCurrentUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setCurrentUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const { accessToken, user } = await loginUser({ email, password })
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken)
    setCurrentUser(user)
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setCurrentUser(null)
  }

  function adjustBalance(deltaCents: number) {
    setCurrentUser((prev) => (prev ? { ...prev, balanceCents: prev.balanceCents + deltaCents } : prev))
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, adjustBalance }}>
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