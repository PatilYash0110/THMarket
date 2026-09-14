import clsx from 'clsx'
import { getPasswordStrength, type PasswordStrengthLevel } from '../lib/passwordStrength'

const LEVEL_CONFIG: Record<PasswordStrengthLevel, { label: string; barColor: string; segments: number }> = {
  schwach: { label: 'Schwach', barColor: 'bg-destructive', segments: 1 },
  mittel: { label: 'Mittel', barColor: 'bg-warning', segments: 2 },
  stark: { label: 'Stark', barColor: 'bg-accent', segments: 3 },
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  if (!strength) return null

  const config = LEVEL_CONFIG[strength.level]

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((segmentIndex) => (
          <div
            key={segmentIndex}
            className={clsx(
              'h-1 flex-1 transition-colors duration-200 ease-out',
              segmentIndex < config.segments ? config.barColor : 'bg-border',
            )}
          />
        ))}
      </div>
      <p className="text-xs text-foreground-muted">
        Passwortstärke: <span className="font-medium text-foreground">{config.label}</span>
      </p>
    </div>
  )
}