import clsx from 'clsx'
import type { ReactNode } from 'react'

type Tone = 'accent' | 'neutral' | 'destructive' | 'coral'

const toneClasses: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent-strong',
  neutral: 'bg-surface-muted text-foreground-muted',
  destructive: 'bg-destructive/10 text-destructive',
  coral: 'bg-coral-soft text-coral',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide',
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  )
}
