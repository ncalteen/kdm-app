'use client'

import { ShowdownSurvivorCard } from '@/components/showdown/showdown-survivors/showdown-survivor-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SettlementDetail, ShowdownDetail, SurvivorDetail } from '@/lib/types'
import { ArrowLeftIcon, ArrowRightIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useEffect, useMemo, useState } from 'react'

/**
 * Showdown Survivors Card Properties
 */
interface ShowdownSurvivorsCardProps {
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Showdown */
  setSelectedShowdown: (showdown: ShowdownDetail | null) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: (survivor: SurvivorDetail | null) => void
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Showdown Survivors Card Component
 *
 * Displays a carousel of survivors participating in the showdown.
 *
 * @param props Showdown Survivors Card Properties
 * @returns Showdown Survivors Card Component
 */
export function ShowdownSurvivorsCard({
  selectedShowdown,
  selectedSettlement,
  selectedSurvivor,
  setSelectedShowdown,
  setSelectedSurvivor,
  setSurvivors,
  survivors
}: ShowdownSurvivorsCardProps): ReactElement {
  const showdownSurvivorIds = useMemo(() => {
    if (!selectedShowdown?.showdown_survivors) return []
    return Object.values(selectedShowdown.showdown_survivors).map(
      (ss) => ss.survivor_id
    )
  }, [selectedShowdown])

  const filteredSurvivors = useMemo(
    () => survivors.filter((s) => showdownSurvivorIds.includes(s.id)),
    [survivors, showdownSurvivorIds]
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const displayedSurvivor = filteredSurvivors[currentIndex] ?? null

  useEffect(() => {
    if (displayedSurvivor && displayedSurvivor.id !== selectedSurvivor?.id)
      setSelectedSurvivor(displayedSurvivor)
  }, [displayedSurvivor, selectedSurvivor?.id, setSelectedSurvivor])

  const handlePrevious = () => {
    if (filteredSurvivors.length === 0) return
    const newIndex =
      (currentIndex - 1 + filteredSurvivors.length) % filteredSurvivors.length
    setCurrentIndex(newIndex)
    setSelectedSurvivor(filteredSurvivors[newIndex])
  }

  const handleNext = () => {
    if (filteredSurvivors.length === 0) return
    const newIndex = (currentIndex + 1) % filteredSurvivors.length
    setCurrentIndex(newIndex)
    setSelectedSurvivor(filteredSurvivors[newIndex])
  }

  const handleDotClick = (index: number) => {
    if (!filteredSurvivors[index]) return
    setCurrentIndex(index)
    setSelectedSurvivor(filteredSurvivors[index])
  }

  if (showdownSurvivorIds.length === 0 || !selectedSettlement) return <></>

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
      <ShowdownSurvivorCard
        selectedShowdown={selectedShowdown}
        selectedSettlement={selectedSettlement}
        selectedSurvivor={displayedSurvivor}
        setSelectedShowdown={setSelectedShowdown}
        setSurvivors={setSurvivors}
        survivors={survivors}
      />
    </div>
  )
}
