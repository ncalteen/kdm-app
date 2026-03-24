'use client'

import { HuntSurvivorCard } from '@/components/hunt/hunt-survivors/hunt-survivor-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { HuntDetail, SettlementDetail, SurvivorDetail } from '@/lib/types'
import { ArrowLeftIcon, ArrowRightIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useEffect, useMemo, useState } from 'react'

/**
 * Hunt Survivors Card Properties
 */
interface HuntSurvivorsCardProps {
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Hunt */
  setSelectedHunt: (hunt: HuntDetail | null) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: (survivor: SurvivorDetail | null) => void
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Hunt Survivors Card Component
 *
 * Displays a carousel of survivors participating in the hunt with navigation
 * controls and individual survivor detail cards.
 *
 * @param props Hunt Survivors Card Properties
 * @returns Hunt Survivors Card Component
 */
export function HuntSurvivorsCard({
  selectedHunt,
  selectedSettlement,
  selectedSurvivor,
  setSelectedHunt,
  setSelectedSurvivor,
  setSurvivors,
  survivors
}: HuntSurvivorsCardProps): ReactElement {
  /** Hunt survivor IDs (from hunt_survivors map) */
  const huntSurvivorIds = useMemo(() => {
    if (!selectedHunt?.hunt_survivors) return []
    return Object.values(selectedHunt.hunt_survivors).map(
      (hs) => hs.survivor_id
    )
  }, [selectedHunt])

  /** Filtered survivors that are part of the hunt */
  const filteredSurvivors = useMemo(
    () => survivors.filter((s) => huntSurvivorIds.includes(s.id)),
    [survivors, huntSurvivorIds]
  )

  // Track current survivor index locally
  const [currentIndex, setCurrentIndex] = useState(0)

  // Select the displayed survivor
  const displayedSurvivor = filteredSurvivors[currentIndex] ?? null

  // Sync with parent when displayed survivor changes
  useEffect(() => {
    if (displayedSurvivor && displayedSurvivor.id !== selectedSurvivor?.id)
      setSelectedSurvivor(displayedSurvivor)
  }, [displayedSurvivor, selectedSurvivor?.id, setSelectedSurvivor])

  /**
   * Handle Previous Survivor
   */
  const handlePrevious = () => {
    if (filteredSurvivors.length === 0) return
    const newIndex =
      (currentIndex - 1 + filteredSurvivors.length) % filteredSurvivors.length
    setCurrentIndex(newIndex)
    setSelectedSurvivor(filteredSurvivors[newIndex])
  }

  /**
   * Handle Next Survivor
   */
  const handleNext = () => {
    if (filteredSurvivors.length === 0) return
    const newIndex = (currentIndex + 1) % filteredSurvivors.length
    setCurrentIndex(newIndex)
    setSelectedSurvivor(filteredSurvivors[newIndex])
  }

  /**
   * Handle Survivor Dot Click
   *
   * @param index Dot Index
   */
  const handleDotClick = (index: number) => {
    if (!filteredSurvivors[index]) return
    setCurrentIndex(index)
    setSelectedSurvivor(filteredSurvivors[index])
  }

  if (huntSurvivorIds.length === 0 || !selectedSettlement) return <></>

  return (
    <div className="p-0">
      <div className="survivor_carousel_controls min-w-[430px]">
        <div className="survivor_carousel_buttons">
          <Button
            className="h-12 w-12"
            variant="ghost"
            size="icon"
            onClick={handlePrevious}>
            <ArrowLeftIcon className="size-8" />
          </Button>

          <Button
            className="h-12 w-12"
            variant="ghost"
            size="icon"
            onClick={handleNext}>
            <ArrowRightIcon className="size-8" />
          </Button>
        </div>

        <div className="survivor_carousel_dots">
          {filteredSurvivors.map((survivor, index) => {
            const isSelected = index === currentIndex

            return (
              <Avatar
                key={survivor.id}
                className={`survivor_carousel_dot${isSelected ? ' survivor_carousel_dot--selected' : ''} bg-blue-500 items-center justify-center cursor-pointer`}
                style={{
                  ['--dot-color' as string]: isSelected
                    ? 'hsl(var(--foreground))'
                    : 'transparent',
                  ['--dot-bg' as string]: 'var(--color-blue-500)'
                }}
                onClick={() => handleDotClick(index)}>
                <AvatarFallback className="font-bold text-lg text-white bg-transparent">
                  {(survivor?.dead && <SkullIcon className="h-4 w-4" />) ||
                    (survivor.survivor_name &&
                      survivor.survivor_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)) ||
                    '??'}
                </AvatarFallback>
              </Avatar>
            )
          })}
        </div>
      </div>

      <HuntSurvivorCard
        selectedHunt={selectedHunt}
        selectedSettlement={selectedSettlement}
        selectedSurvivor={displayedSurvivor}
        setSelectedHunt={setSelectedHunt}
        setSurvivors={setSurvivors}
        survivors={survivors}
      />
    </div>
  )
}
