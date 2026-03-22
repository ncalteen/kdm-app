'use client'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SurvivorDetail } from '@/lib/types'
import { AvatarFallback } from '@radix-ui/react-avatar'
import { UserCheckIcon, UserSearchIcon } from 'lucide-react'
import { ReactElement } from 'react'

/**
 * Survivor Selection Card Props
 */
interface SurvivorSelectionCardProps {
  /** Handle Toggle Function */
  handleSurvivorToggle: (survivorId: string) => void
  /** Survivor is Disabled */
  isDisabled: boolean
  /** Survivor Selected as Scout */
  isSelectedAsScout: boolean
  /** Handle Hover Function */
  onHover?: (survivor: SurvivorDetail | null) => void
  /** Survivor */
  survivor: SurvivorDetail
  /** Temporary Selection State */
  tempSelection: string[]
}

/**
 * Survivor Selection Card Component
 *
 * This component is used to display a survivor for selection during a hunt.
 *
 * @param props Survivor Selection Card Props
 * @returns Survivor Selection Card Component
 */
export function SurvivorSelectionCard({
  handleSurvivorToggle,
  isDisabled,
  isSelectedAsScout,
  onHover,
  survivor,
  tempSelection
}: SurvivorSelectionCardProps): ReactElement {
  return (
    <div className="w-[200px] h-[280px] border-4 rounded-xl border-border/20 hover:border-border/50 transition-all duration-200">
      <Button
        variant={tempSelection.includes(survivor.id) ? 'default' : 'outline'}
        className="justify-start flex flex-col p-0 w-full h-full items-stretch relative overflow-hidden"
        onClick={() => handleSurvivorToggle(survivor.id)}
        onMouseEnter={() => onHover?.(survivor)}
        onMouseLeave={() => onHover?.(null)}
        disabled={isDisabled}>
        {/* Header with Avatar and Name */}
        <div className="bg-muted/20 p-3 border-b border-border/20">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-1 border-background items-center justify-center">
              <AvatarFallback className="font-bold text-lg">
                {survivor.survivor_name
                  ? survivor.survivor_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                  : '??'}
              </AvatarFallback>
            </Avatar>

            <div className="text-left flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {survivor.survivor_name}
              </div>
              <div className="text-xs text-muted-foreground">
                {survivor.gender}
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="flex-1 p-3 space-y-3">
          {/* Primary Stats */}
          <div className="grid grid-cols-1 text-xs">
            <div className="bg-background/60 rounded px-2 py-1 text-center">
              <div>Hunt XP</div>
              <div className="font-bold text-lg">{survivor.hunt_xp}</div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-background/40 rounded px-2 py-1 text-center">
              <div>Survival</div>
              <div className="font-bold text-lg">{survivor.survival}</div>
            </div>

            <div className="bg-background/40 rounded px-2 py-1 text-center">
              <div>Insanity</div>
              <div className="font-bold text-lg">{survivor.insanity}</div>
            </div>
          </div>

          {/* Tertiary Stats */}
          {survivor.weapon_type_id && (
            <div className="grid grid-cols-1 text-xs">
              <div className="bg-background/20 rounded px-2 py-1 text-center">
                <div>Weapon Prof.</div>
                <div className="font-semibold">
                  {survivor.weapon_proficiency}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selection Indicators */}
        {isSelectedAsScout && (
          <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
            <UserSearchIcon className="h-3 w-3" />
          </div>
        )}

        {tempSelection.includes(survivor.id) && !isSelectedAsScout && (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
            <UserCheckIcon className="h-3 w-3" />
          </div>
        )}
      </Button>
    </div>
  )
}
