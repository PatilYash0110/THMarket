import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '../types'
import { findUserById } from '../mocks/users'

const STORAGE_KEY = 'thmarket.currentUserId'

interface AuthContextValue {
  currentUser: User | null
  loginAs: (userId: string) => void
  logout: () => void
  adjustBalance: (deltaCents: number) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedId = localStorage.getItem(STORAGE_KEY)
    return storedId ? (findUserById(storedId) ?? null) : null
  })

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY, currentUser.id)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [currentUser])

  function loginAs(userId: string) {
    const user = findUserById(userId)
    setCurrentUser(user ?? null)
  }

  function logout() {
    setCurrentUser(null)
  }

  function adjustBalance(deltaCents: number) {
    setCurrentUser((prev) => (prev ? { ...prev, balanceCents: prev.balanceCents + deltaCents } : prev))
  }

  return (
    <AuthContext.Provider value={{ currentUser, loginAs, logout, adjustBalance }}>
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
