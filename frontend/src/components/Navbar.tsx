import {
  ChatCircle,
  Heart,
  MagnifyingGlass,
  Plus,
  ShieldCheck,
  SignOut,
  User,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../../media/thm_market_logo.jpg'
import { useAuth } from '../context/AuthContext'
import { Button } from './Button'

const SEARCH_DEBOUNCE_MS = 300

function SearchBar({ className }: { className?: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(currentQuery)

  // Keep the input in sync if `q` changes from elsewhere (browser
  // back/forward, a manually edited URL), without fighting the debounce
  // below while the user is actively typing.
  useEffect(() => {
    setQuery(currentQuery)
  }, [currentQuery])

  useEffect(() => {
    if (query === currentQuery) return
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (query.trim()) params.set('q', query.trim())
      else params.delete('q')
      // `replace: true` is required here — without it, every debounce tick
      // while typing pushes a new history entry, and the back button turns
      // into "undo one keystroke at a time" instead of leaving the page.
      setSearchParams(params, { replace: true })
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <div className={`flex w-full items-center gap-2 border border-border px-3 focus-within:ring-2 focus-within:ring-ring ${className ?? ''}`}>
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
  )
}

export function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex h-10 items-center gap-6">
          <Link to="/" className="flex shrink-0 items-center">
            <img src={logo} alt="THMarket" className="h-12 w-auto" />
          </Link>

          {currentUser && <SearchBar className="hidden md:flex md:max-w-md" />}

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
                <Link
                  to="/listing/new"
                  aria-label="Verkaufen"
                  className="flex h-10 w-10 items-center justify-center bg-primary text-on-primary sm:hidden"
                >
                  <Plus size={20} aria-hidden />
                </Link>
              </>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2 border-l border-border pl-3">
                {currentUser.role === 'STUDENT' && (
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
                  >
                    <User size={20} aria-hidden />
                    <span className="hidden lg:inline">{currentUser.name}</span>
                  </Link>
                )}
                <span className="hidden sm:inline-block">
                  <Button size="sm" variant="ghost" onClick={handleLogout}>
                    Abmelden
                  </Button>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Abmelden"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center text-foreground hover:text-accent sm:hidden"
                >
                  <SignOut size={20} aria-hidden />
                </button>
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

        {currentUser && <SearchBar className="md:hidden" />}
      </div>
    </header>
  )
}
