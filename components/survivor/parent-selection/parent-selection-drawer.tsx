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
import { LocalStateType } from '@/contexts/local-context'
import { useIsMobile } from '@/hooks/use-mobile'
import { SurvivorDetail } from '@/lib/types'
import { UserIcon, UserXIcon } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Parent Selection Drawer Props
 */
interface ParentSelectionDrawerProps {
  /** Drawer Description */
  description?: string
  /**
   * Disabled Survivor IDs
   *
   * E.g. Already chosen as the other parent.
   */
  disabledSurvivorIds?: string[]
  /**
   * Trigger Button Label
   *
   * Shown when no parent is selected.
   */
  emptyLabel?: string
  /** Local State */
  local: LocalStateType
  /** Callback for Selection Change */
  onSelectionChange: (survivorId: string | null) => void
  /** Currently Selected Parent ID */
  selectedSurvivorId: string | null
  /** Available Survivors */
  survivors: SurvivorDetail[]
  /** Drawer Title */
  title: string
}

/**
 * Parent Selection Drawer Component
 *
 * Allows the user to pick a single survivor from the settlement to act as a
 * parent of a new survivor. Mirrors {@link SurvivorSelectionDrawer} but is
 * single-select and supports clearing the selection via a "No Parent" action.
 *
 * @param props Parent Selection Drawer Properties
 * @returns Parent Selection Drawer Component
 */
export function ParentSelectionDrawer({
  description,
  disabledSurvivorIds = [],
  emptyLabel = 'Select parent...',
  local,
  onSelectionChange,
  selectedSurvivorId,
  survivors,
  title
}: ParentSelectionDrawerProps): ReactElement {
  const isMobile = useIsMobile()

  const [tempSelection, setTempSelection] = useState<string | null>(
    selectedSurvivorId
  )
  const [hoveredSurvivor, setHoveredSurvivor] = useState<SurvivorDetail | null>(
    null
  )
  const [lastHoveredSurvivor, setLastHoveredSurvivor] =
    useState<SurvivorDetail | null>(null)

  const selectedSurvivor =
    survivors.find((s) => s.id === selectedSurvivorId) ?? null

  /**
   * Handle Survivor Toggle
   *
   * Toggles single-select state — selecting an already-selected survivor clears
   * the selection.
   *
   * @param survivorId Survivor ID to Toggle
   * @returns void
   */
  const handleSurvivorToggle = (survivorId: string) =>
    setTempSelection((prev) => (prev === survivorId ? null : survivorId))

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
   * Commits the temporary selection by invoking the parent callback.
   *
   * @returns void
   */
  const handleConfirm = () => onSelectionChange(tempSelection)

  /**
   * Handle Cancel Selection
   *
   * Reverts the temporary selection back to the originally selected parent.
   *
   * @returns Void
   */
  const handleCancel = () => setTempSelection(selectedSurvivorId)

  /**
   * Handle Clear Selection
   *
   * Stages an empty selection so confirming will remove the parent link.
   *
   * @returns Void
   */
  const handleClear = () => setTempSelection(null)

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="justify-start w-full">
          <UserIcon className="h-4 w-4" />
          {selectedSurvivor
            ? (selectedSurvivor.survivor_name ?? 'Unnamed survivor')
            : emptyLabel}
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}

          {isMobile && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={tempSelection === null}>
                <UserXIcon className="h-4 w-4" />
                No Parent
              </Button>
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
          <div className="flex flex-wrap gap-2 overflow-y-auto min-w-[200px]">
            {survivors.map((survivor) => (
              <SurvivorSelectionCard
                key={survivor.id}
                isSelectedAsScout={false}
                isDisabled={disabledSurvivorIds.includes(survivor.id)}
                handleSurvivorToggle={handleSurvivorToggle}
                tempSelection={tempSelection ? [tempSelection] : []}
                onHover={handleSurvivorHover}
                survivor={survivor}
              />
            ))}
          </div>

          {!isMobile && (
            <div className="w-[450px]">
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
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={tempSelection === null}>
                <UserXIcon className="h-4 w-4" />
                No Parent
              </Button>
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
