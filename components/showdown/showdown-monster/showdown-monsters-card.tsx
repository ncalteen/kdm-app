'use client'

import { ShowdownMonsterCard } from '@/components/showdown/showdown-monster/showdown-monster-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ShowdownDetail } from '@/lib/types'
import { ArrowLeftIcon, ArrowRightIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useMemo } from 'react'

/**
 * Showdown Monsters Card Component Properties
 */
interface ShowdownMonstersCardProps {
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Set Selected Showdown */
  setSelectedShowdown: (showdown: ShowdownDetail | null) => void
  /** Set Selected Showdown Monster Index */
  setSelectedShowdownMonsterIndex: (index: number) => void
}

/**
 * Showdown Monsters Card Component
 *
 * Wraps the monster card with carousel controls for multi-monster encounters.
 *
 * @param props Showdown Monsters Card Properties
 * @returns Showdown Monsters Card Component
 */
export function ShowdownMonstersCard({
  selectedShowdown,
  selectedShowdownMonsterIndex,
  setSelectedShowdown,
  setSelectedShowdownMonsterIndex
}: ShowdownMonstersCardProps): ReactElement {
  const monsterIds = useMemo(
    () => Object.keys(selectedShowdown?.showdown_monsters ?? {}),
    [selectedShowdown]
  )

  const handlePrevious = () => {
    if (monsterIds.length === 0) return
    setSelectedShowdownMonsterIndex(
      (selectedShowdownMonsterIndex - 1 + monsterIds.length) % monsterIds.length
    )
  }

  const handleNext = () => {
    if (monsterIds.length === 0) return
    setSelectedShowdownMonsterIndex(
      (selectedShowdownMonsterIndex + 1) % monsterIds.length
    )
  }

  const handleDotClick = (index: number) => {
    if (!monsterIds[index]) return
    setSelectedShowdownMonsterIndex(index)
  }

  return (
    <div className="p-0 w-full">
      {selectedShowdown && monsterIds.length > 1 && (
        <div className="monster_carousel_controls pb-2">
          <div className="monster_carousel_buttons">
            <Button
              className="h-8 w-8"
              variant="ghost"
              size="icon"
              onClick={handlePrevious}>
              <ArrowLeftIcon className="size-8" />
            </Button>
            <Button
              className="h-8 w-8"
              variant="ghost"
              size="icon"
              onClick={handleNext}>
              <ArrowRightIcon className="size-8" />
            </Button>
          </div>
          <div className="monster_carousel_dots">
            {monsterIds.map((_, index) => {
              const isSelected = index === selectedShowdownMonsterIndex
              return (
                <Avatar
                  key={index}
                  className={`monster_carousel_dot${isSelected ? ' monster_carousel_dot--selected' : ''} bg-red-500 items-center justify-center cursor-pointer`}
                  style={{
                    ['--dot-color' as string]: isSelected
                      ? 'hsl(var(--foreground))'
                      : 'transparent',
                    ['--dot-bg' as string]: 'hsl(var(--destructive))'
                  }}
                  onClick={() => handleDotClick(index)}>
                  <AvatarFallback className="bg-transparent">
                    <SkullIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )
            })}
          </div>
        </div>
      )}
      <ShowdownMonsterCard
        selectedShowdown={selectedShowdown}
        selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
        setSelectedShowdown={setSelectedShowdown}
      />
    </div>
  )
}
