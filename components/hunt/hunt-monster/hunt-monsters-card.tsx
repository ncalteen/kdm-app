'use client'

import { HuntMonsterCard } from '@/components/hunt/hunt-monster/hunt-monster-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { HuntDetail } from '@/lib/types'
import { ArrowLeftIcon, ArrowRightIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useMemo } from 'react'

/**
 * Hunt Monsters Card Properties
 */
interface HuntMonstersCardProps {
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
  /** Set Selected Hunt */
  setSelectedHunt: (hunt: HuntDetail | null) => void
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number) => void
}

/**
 * Hunt Monsters Card Component
 *
 * Wraps the monster card with carousel controls for multi-monster encounters.
 *
 * @param props Hunt Monsters Card Properties
 * @returns Hunt Monsters Card Component
 */
export function HuntMonstersCard({
  selectedHunt,
  selectedHuntMonsterIndex,
  setSelectedHunt,
  setSelectedHuntMonsterIndex
}: HuntMonstersCardProps): ReactElement {
  /** Monster IDs as an ordered array */
  const monsterIds = useMemo(
    () => Object.keys(selectedHunt?.hunt_monsters ?? {}),
    [selectedHunt]
  )

  /**
   * Handle Previous Monster
   */
  const handlePrevious = () => {
    if (monsterIds.length === 0) return
    const newIndex =
      (selectedHuntMonsterIndex - 1 + monsterIds.length) % monsterIds.length
    setSelectedHuntMonsterIndex(newIndex)
  }

  /**
   * Handle Next Monster
   */
  const handleNext = () => {
    if (monsterIds.length === 0) return
    const newIndex = (selectedHuntMonsterIndex + 1) % monsterIds.length
    setSelectedHuntMonsterIndex(newIndex)
  }

  /**
   * Handle Monster Dot Click
   *
   * @param index Dot Index
   */
  const handleDotClick = (index: number) => {
    if (!monsterIds[index]) return
    setSelectedHuntMonsterIndex(index)
  }

  return (
    <div className="p-0">
      {selectedHunt && monsterIds.length > 1 && (
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
              const isSelected = index === selectedHuntMonsterIndex

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

      <HuntMonsterCard
        selectedHunt={selectedHunt}
        selectedHuntMonsterIndex={selectedHuntMonsterIndex}
        setSelectedHunt={setSelectedHunt}
      />
    </div>
  )
}
