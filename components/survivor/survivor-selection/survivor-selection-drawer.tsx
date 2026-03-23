'use client'

import { SurvivorDetailsPanel } from '@/components/survivor/survivor-details-panel'
import { SurvivorSelectionCard } from '@/components/survivor/survivor-selection/survivor-selection-card'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { SurvivorDetail } from '@/lib/types'
import { UsersIcon } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Survivor Selection Drawer Props
 */
interface SurvivorSelectionDrawerProps {
  /** Drawer Description */
  description: string
  /** Maximum Survivors */
  maxSelection: number
  /** Callback for Selection Change */
  onSelectionChange: (survivorIds: string[]) => void
  /** Currently Selected Scout ID (to disable in survivor list) */
  selectedScout?: string | null
  /** Currently Selected Survivors */
  selectedSurvivors: string[]
  /** List of Survivors */
  survivors: SurvivorDetail[]
  /** Drawer Title */
  title: string
}

/**
 * Survivor Selection Drawer Component
 */
export function SurvivorSelectionDrawer({
  description,
  maxSelection,
  onSelectionChange,
  selectedScout,
  selectedSurvivors,
  survivors,
  title
}: SurvivorSelectionDrawerProps): ReactElement {
  const isMobile = useIsMobile()

  const [tempSelection, setTempSelection] =
    useState<string[]>(selectedSurvivors)
  const [hoveredSurvivor, setHoveredSurvivor] = useState<SurvivorDetail | null>(
    null
  )
  const [lastHoveredSurvivor, setLastHoveredSurvivor] =
    useState<SurvivorDetail | null>(null)

  /**
   * Handle Survivor Toggle
   *
   * @param survivorId Survivor ID to Toggle Selection
   */
  const handleSurvivorToggle = (survivorId: string) =>
    setTempSelection((prev) => {
      if (prev.includes(survivorId))
        return prev.filter((id) => id !== survivorId)
      else if (prev.length < maxSelection) return [...prev, survivorId]
      return prev
    })

  /**
   * Handle Survivor Hover
   *
   * @param survivor Survivor Being Hovered
   */
  const handleSurvivorHover = (survivor: SurvivorDetail | null) => {
    setHoveredSurvivor(survivor)

    if (survivor) setLastHoveredSurvivor(survivor)
  }

  /**
   * Handle Confirm Selection
   */
  const handleConfirm = () => onSelectionChange(tempSelection)

  /**
   * Handle Cancel Selection
   */
  const handleCancel = () => setTempSelection(selectedSurvivors)

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="justify-start">
          <UsersIcon className="h-4 w-4" />
          {selectedSurvivors.length > 0
            ? `${selectedSurvivors.length} survivor(s)`
            : 'Select survivors...'}
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>

          {isMobile && (
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button onClick={handleConfirm}>
                  Confirm Selection ({tempSelection.length}/{maxSelection})
                </Button>
              </DrawerClose>
            </div>
          )}
        </DrawerHeader>

        <div className="px-4 pb-4 h-[60vh] flex gap-4">
          <div className="flex flex-wrap gap-2 overflow-y-auto min-w-[200px]">
            {survivors.map((survivor) => (
              <SurvivorSelectionCard
                key={survivor.id}
                isSelectedAsScout={selectedScout === survivor.id}
                isDisabled={
                  selectedScout === survivor.id ||
                  (!tempSelection.includes(survivor.id) &&
                    tempSelection.length >= maxSelection)
                }
                handleSurvivorToggle={handleSurvivorToggle}
                tempSelection={tempSelection}
                onHover={handleSurvivorHover}
                survivor={survivor}
              />
            ))}
          </div>

          {!isMobile && (
            <div className="w-[450px]">
              <SurvivorDetailsPanel
                survivor={hoveredSurvivor ?? lastHoveredSurvivor}
                survivors={survivors}
              />
            </div>
          )}
        </div>

        {!isMobile && (
          <DrawerFooter>
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button onClick={handleConfirm}>
                  Confirm Selection ({tempSelection.length}/{maxSelection})
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
