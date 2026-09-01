import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-6xl font-semibold tracking-tight text-foreground">404</p>
      <p className="text-sm text-foreground-muted">Diese Seite existiert nicht.</p>
      <Link to="/">
        <Button variant="secondary">Zur Startseite</Button>
      </Link>
    </div>
  )
}
