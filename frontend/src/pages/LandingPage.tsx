import { ChatCircle, GraduationCap, ShieldCheck } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import startpageImage from '../../media/startpage_image_non_register.png'
import { Button } from '../components/Button'
import { TypingHeadline } from '../components/TypingHeadline'

const HEADLINES = [
  'Dein Campus Marktplatz.',
  'Kaufen, verkaufen, vernetzen.',
  'Von Studierenden, für Studierende.',
]

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
    <div className="flex min-h-[calc(100dvh-8rem)] items-center">
      <div className="grid w-full grid-cols-1 items-stretch gap-16 py-8 md:grid-cols-2">
        <div className="flex flex-col justify-center gap-14">
          <div className="flex flex-col gap-7">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent-strong">
              <GraduationCap size={14} weight="fill" aria-hidden />
              Exklusiv für THM-Studierende
            </span>
            <h1 className="font-display text-6xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-7xl">
              <TypingHeadline sentences={HEADLINES} />
            </h1>
            <p className="max-w-md text-lg text-foreground-muted">
              THMarket ist der Marktplatz exklusiv für Studierende der THM. Verkaufe, was du
              nicht mehr brauchst, finde günstige Angebote in deiner Nähe.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="px-8 text-base">
                  Registrieren
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="secondary" className="px-8 text-base">
                  Anmelden
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-8 border-t border-border pt-12">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
                  <feature.icon size={24} aria-hidden />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-display text-base font-semibold tracking-tight text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-base text-foreground-muted">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden items-center justify-center md:flex">
          <div
            aria-hidden
            className="absolute inset-8 -z-10 rounded-full bg-accent/25 blur-[80px]"
          />
          <img src={startpageImage} alt="" aria-hidden className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  )
}
