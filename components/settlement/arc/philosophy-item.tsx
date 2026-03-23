'use client'

import { SelectAvailablePhilosophy } from '@/components/menu/select-available-philosophy'
import { Button } from '@/components/ui/button'
import { PhilosophyDetail, SettlementDetail } from '@/lib/types'
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/**
 * Philosophy Item Component Properties
 */
export interface PhilosophyItemProps {
  /** Index */
  index: number
  /** On Remove Handler */
  onRemove: (index: number) => void
  /** Philosophy Row */
  philosophy: SettlementDetail['philosophies'][0]
}

/**
 * New Philosophy Item Component Properties
 */
export interface NewPhilosophyItemProps {
  /** Available Philosophies Map */
  availablePhilosophiesMap: { [key: string]: PhilosophyDetail }
  /** Exclude IDs */
  excludeIds: string[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (philosophyId: string | undefined) => void
}

/**
 * Philosophy Item Component
 *
 * Displays a single philosophy linked to a settlement with its name and a
 * remove button.
 *
 * @param props Philosophy Item Component Properties
 * @returns Philosophy Item Component
 */
export const PhilosophyItem = memo(function PhilosophyItem({
  index,
  onRemove,
  philosophy
}: PhilosophyItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Philosophy Name */}
      <span className="text-sm ml-1 flex-grow">
        {philosophy.philosophy_name}
      </span>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => onRemove(index)}
        title="Remove philosophy">
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  )
})

/**
 * New Philosophy Item Component
 *
 * Renders a select dropdown for choosing a philosophy to add to the settlement.
 *
 * @param props New Philosophy Item Component Properties
 * @returns New Philosophy Item Component
 */
export const NewPhilosophyItem = memo(function NewPhilosophyItem({
  availablePhilosophiesMap,
  excludeIds,
  onCancel,
  onSave
}: NewPhilosophyItemProps): ReactElement {
  const [selectedPhilosophyId, setSelectedPhilosophyId] = useState<
    string | undefined
  >(undefined)

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Philosophy Select */}
      <SelectAvailablePhilosophy
        philosophies={availablePhilosophiesMap}
        excludeIds={excludeIds}
        onChange={setSelectedPhilosophyId}
        value={selectedPhilosophyId}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onSave(selectedPhilosophyId)}
          disabled={!selectedPhilosophyId}
          title="Save philosophy">
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onCancel}
          title="Cancel">
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
