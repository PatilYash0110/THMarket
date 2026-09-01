import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-24 bg-slate text-on-slate">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-sm tracking-tight">
          THM<span className="text-accent">market</span>
        </p>
        <div className="flex items-center gap-4 text-xs text-on-slate/70">
          <span>© {new Date().getFullYear()} THMarket</span>
          <Link to="/impressum" className="hover:text-on-slate hover:underline">
            Impressum
          </Link>
        </div>
      </div>
    </footer>
  )
}
