'use client'

import { ScoutSelectionCard } from '@/components/survivor/scout-selection/scout-selection-card'
import { SurvivorDetailsPanel } from '@/components/survivor/survivor-details-panel'
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
import { LocalStateType } from '@/contexts/local-context'
import { useIsMobile } from '@/hooks/use-mobile'
import { SurvivorDetail } from '@/lib/types'
import { UserSearchIcon } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Scout Selection Drawer Props
 */
interface ScoutSelectionDrawerProps {
  /** Drawer Description */
  description: string
  /** Local State */
  local: LocalStateType
  /** Callback for Selection Change */
  onSelectionChange: (scoutId: string | null) => void
  /** Currently Selected Scout */
  selectedScout: string | null
  /**
   * Currently Selected Survivors
   *
   * Used to disable survivors who have already been selected for the
   * hunt/showdown.
   */
  selectedSurvivors?: string[]
  /** List of Survivors */
  survivors: SurvivorDetail[]
  /** Drawer Title */
  title: string
}

/**
 * Scout Selection Drawer Component
 *
 * @param props Scout Selection Drawer Props
 * @returns Scout Selection Drawer Component
 */
export function ScoutSelectionDrawer({
  description,
  local,
  onSelectionChange,
  selectedScout,
  selectedSurvivors = [],
  survivors,
  title
}: ScoutSelectionDrawerProps): ReactElement {
  const isMobile = useIsMobile()

  const [tempSelection, setTempSelection] = useState<string | null>(
    selectedScout
  )
  const [hoveredSurvivor, setHoveredSurvivor] = useState<SurvivorDetail | null>(
    null
  )
  const [lastHoveredSurvivor, setLastHoveredSurvivor] =
    useState<SurvivorDetail | null>(null)

  /**
   * Handle Survivor Toggle
   *
   * @param survivorId Survivor ID
   * @returns Void; toggles the scout selection between the given survivor and
   * none
   */
  const handleSurvivorToggle = (survivorId: string) =>
    // If clicking the currently selected scout, deselect them
    // Otherwise, select the clicked survivor as scout
    setTempSelection(tempSelection === survivorId ? null : survivorId)

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
   *
   * @returns Void; commits the temporary selection by invoking the parent callback
   */
  const handleConfirm = () => onSelectionChange(tempSelection)

  /**
   * Handle Cancel Selection
   *
   * @returns Void; reverts the temporary selection back to the originally selected scout
   */
  const handleCancel = () => setTempSelection(selectedScout)

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="justify-start">
          <UserSearchIcon className="h-4 w-4" />
          {selectedScout ? '1 scout' : 'Select scout...'}
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
                <Button onClick={handleConfirm}>Confirm Selection</Button>
              </DrawerClose>
            </div>
          )}
        </DrawerHeader>

        <div className="px-4 pb-4 h-[60vh] flex gap-4">
          <div className="flex flex-wrap gap-2 overflow-y-auto min-w-50">
            {survivors.map((survivor) => (
              <ScoutSelectionCard
                key={survivor.id}
                handleSurvivorToggle={handleSurvivorToggle}
                isCurrentlySelected={tempSelection === survivor.id}
                isSelectedAsSurvivor={selectedSurvivors.includes(survivor.id)}
                onHover={handleSurvivorHover}
                survivor={survivor}
              />
            ))}
          </div>

          {!isMobile && (
            <div className="w-112.5">
              <SurvivorDetailsPanel
                local={local}
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
                <Button onClick={handleConfirm}>Confirm Selection</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
