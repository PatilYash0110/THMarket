import { ChatCircle, Heart, MagnifyingGlass, Plus, ShieldCheck, User } from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './Button'

export function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    navigate(`/?${params.toString()}`)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 text-lg font-semibold tracking-tight text-foreground">
          THM<span className="text-accent">market</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 items-center md:flex">
          <div className="flex w-full max-w-md items-center gap-2 border border-border px-3 focus-within:ring-2 focus-within:ring-ring">
            <MagnifyingGlass size={18} className="text-foreground-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Inserate durchsuchen…"
              aria-label="Inserate durchsuchen"
              className="h-10 w-full bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
            />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-2">
          {currentUser?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium uppercase tracking-wide text-foreground hover:text-accent"
            >
              <ShieldCheck size={18} aria-hidden />
              Admin
            </Link>
          )}

          {currentUser?.role === 'STUDENT' && (
            <>
              <Link
                to="/favorites"
                aria-label="Favoriten"
                className="flex h-10 w-10 items-center justify-center text-foreground hover:text-accent"
              >
                <Heart size={20} aria-hidden />
              </Link>
              <Link
                to="/messages"
                aria-label="Nachrichten"
                className="flex h-10 w-10 items-center justify-center text-foreground hover:text-accent"
              >
                <ChatCircle size={20} aria-hidden />
              </Link>
              <Link to="/listing/new" className="hidden sm:block">
                <Button size="sm" variant="primary">
                  <Plus size={16} aria-hidden />
                  Verkaufen
                </Button>
              </Link>
            </>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
              >
                <User size={20} aria-hidden />
                <span className="hidden lg:inline">{currentUser.name}</span>
              </Link>
              <Button size="sm" variant="ghost" onClick={logout}>
                Abmelden
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <Link to="/login">
                <Button size="sm" variant="ghost">
                  Anmelden
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="primary">
                  Registrieren
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
