import { ChatCircle, GraduationCap, ShieldCheck } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Verifiziert',
    description: 'Jede Anzeige stammt von einer bestätigten @thm.de-Adresse.',
  },
  {
    icon: GraduationCap,
    title: 'Nur THM',
    description: 'Kein offener Marktplatz — ausschließlich für deine Hochschule.',
  },
  {
    icon: ChatCircle,
    title: 'Direkter Kontakt',
    description: 'Chatte direkt mit Kommiliton:innen, ohne Umwege.',
  },
]

export function LandingPage() {
  return (
    <div className="flex flex-col gap-24 py-8">
      <section className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Nur für THM.
            <br />
            Nur echte Studierende.
          </h1>
          <p className="max-w-md text-base text-foreground-muted">
            Jede Anzeige kommt von einer verifizierten @thm.de-Adresse. Kein Fremdmarkt, kein
            Spam — nur dein Campus.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register">
              <Button size="lg">Registrieren</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Anmelden
              </Button>
            </Link>
          </div>
        </div>

      </section>

      <section className="grid grid-cols-1 gap-10 border-t border-border pt-16 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex flex-col gap-3">
            <feature.icon size={24} className="text-accent" aria-hidden />
            <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
              {feature.title}
            </p>
            <p className="text-sm text-foreground-muted">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

