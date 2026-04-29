import { LanternMark } from '@/components/generic/lantern-mark'
import { Castle, Skull, Swords } from 'lucide-react'
import { ReactElement } from 'react'

/**
 * Auth Hero
 *
 * Marketing/value-proposition panel shown alongside authentication forms
 * (login, sign-up, etc.). Communicates what the application is and why a
 * visitor should bother creating an account.
 *
 * Designed to live in the left column of a two-column auth layout on
 * desktop, and stack above the form on mobile.
 *
 * @returns Auth Hero Component
 */
export function AuthHero(): ReactElement {
  const features = [
    {
      icon: Castle,
      title: 'Settlements',
      description:
        'Track timelines, principles, innovations, and locations across every Lantern Year.'
    },
    {
      icon: Skull,
      title: 'Survivors',
      description:
        'Manage attributes, gear grids, fighting arts, disorders, and the scars they carry.'
    },
    {
      icon: Swords,
      title: 'Hunts & Showdowns',
      description:
        'Phase-aware tools that surface only the rules and stats the moment demands.'
    }
  ]

  return (
    <div className="lantern-fade-in flex flex-col justify-center gap-10 max-w-xl">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-amber-400/90">
          <LanternMark className="h-5 w-5" />
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            KD:M Archivist
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Carry the lantern.
          <br />
          <span className="text-muted-foreground">Track the struggle.</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          A companion for{' '}
          <span className="text-foreground font-medium">
            Kingdom Death: Monster
          </span>
          . Manage settlements, survivors, and the brutal hunts between them —
          so the table stays clear for the story.
        </p>
      </div>

      <ul className="flex flex-col gap-5">
        {features.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/40">
              <Icon className="h-5 w-5 text-foreground/80" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="font-medium leading-none">{title}</p>
              <p className="text-sm text-muted-foreground leading-snug">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground/70 leading-relaxed">
        Free, unofficial fan project. Not affiliated with, endorsed by, or
        sponsored by Adam Poots Games.
      </p>
    </div>
  )
}
